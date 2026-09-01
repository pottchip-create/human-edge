export function evaluatePlan(currentPlan) {
  const results = {
    C1: evaluateC1(currentPlan),
    C2: evaluateC2(currentPlan),
    C3: evaluateC3(currentPlan),
    C4: evaluateC4(currentPlan),
  }
  const allPass = Object.values(results).every(r => r.status === 'PASS')
  const unreflected = Object.entries(results)
    .filter(([, r]) => r.status === 'FAIL' || r.status === 'UNKNOWN' || r.status === 'PARTIAL')
    .map(([key]) => key)
  return {
    overall: allPass ? 'PASS' : 'RETRY',
    conditions: results,
    unreflected
  }
}

// ── C1: 김민준 16:30 이후 출발 ──────────────────────────
function evaluateC1(plan) {
  const groups = plan.transport_groups
  if (groups) {
    const kimGroup = groups.find(g => {
      const members = g.members || g.participants || []
      return members.some(m => m.includes('김민준'))
    })
    if (kimGroup) {
      // members/departure 또는 participants/depart_time 둘 다 지원
      const dep = kimGroup.departure || kimGroup.depart_time
      if (dep && dep >= '16:30') return { status: 'PASS', reason: `김민준 대리 출발 ${dep} — 조건 충족` }
      if (dep && dep < '16:30') return { status: 'FAIL', reason: `김민준 대리 출발 ${dep} — 16:30 이전` }
      return { status: 'PARTIAL', reason: '후합류 언급 있으나 시간 불명확' }
    }
  }

  const day1 = plan.day1 || []
  const kimDep = day1.find(e => e.activity?.includes('김민준') && e.activity?.includes('출발'))
  if (kimDep) {
    const time = kimDep.time
    if (time >= '16:30') return { status: 'PASS', reason: `김민준 대리 ${time} 출발 — 조건 충족` }
    return { status: 'FAIL', reason: `김민준 대리 ${time} 출발 — 16:30 이전` }
  }

  const allDep = day1.find(e => e.activity?.includes('출발') && !e.activity?.includes('양평'))
  if (!allDep) return { status: 'UNKNOWN', reason: '출발 시간 정보 없음' }
  const time = allDep.time
  if (time >= '16:30') return { status: 'PASS', reason: `전원 ${time} 출발 — 조건 충족` }
  return { status: 'FAIL', reason: `${time} 출발 — 16:30 이전` }
}

// ── C2: 이수진 90분 연속 이동 없음 ────────────────────────
// 우선순위: transport_groups[].break.duration_min → 연속이동시간 숫자 → 자유텍스트 키워드
// substring 방식('60분' 포함 등) 미사용 — 160분 오인 방지

// 텍스트에서 숫자 추출 (앞에 다른 숫자가 붙지 않는 독립 숫자만)
function extractMinutes(text) {
  // 예: "15분", "15 분" — 단, "160분"의 60은 잡지 않음
  const matches = [...text.matchAll(/(?<![\d])(\d{1,3})\s*분/g)]
  const nums = matches.map(m => Number(m[1]))
  return nums.length > 0 ? nums : null
}

// transport 문자열에서 연속 이동시간 숫자 추출 (90, 85 등)
function extractTravelMinutes(transport) {
  const matches = [...transport.matchAll(/(?<![\d])(\d{1,3})\s*분/g)]
  const nums = matches.map(m => Number(m[1]))
  return nums.length > 0 ? Math.max(...nums) : null
}

function evaluateC2(plan) {
  const notes = plan.program_notes || ''
  const transport = plan.transport || ''
  const day1 = plan.day1 || []

  // ① transport_groups에 구조화된 break.duration_min이 있으면 최우선 사용
  if (plan.transport_groups && plan.transport_groups.length > 0) {
    for (const g of plan.transport_groups) {
      const breakMin = g.break?.duration_min
      if (breakMin != null) {
        const min = Number(breakMin)
        if (min >= 15) return { status: 'PASS', reason: `이동 그룹 중간 휴식 ${min}분 — 조건 충족` }
        if (min >= 1)  return { status: 'PARTIAL', reason: `이동 그룹 중간 휴식 ${min}분 — 15분 미만` }
      }
    }
    // break가 없으면 그룹별 depart/arrival 차이로 연속 이동 추정 생략(자유텍스트로 폴백)
  }

  // ② ITX / 기차 키워드 → 교통수단 자체가 짧은 이동이므로 PASS
  if (/ITX|기차|KTX/.test(transport)) {
    return { status: 'PASS', reason: '90분 미만 이동 수단 (기차) 반영됨' }
  }

  // ③ transport 문자열에서 연속 이동시간 숫자를 추출해 비교
  //    "약 85분", "89분" → PASS / "90분", "160분" → FAIL 후보
  const travelMins = extractTravelMinutes(transport)
  if (travelMins !== null && !transport.includes('휴식') && !transport.includes('휴게소')) {
    if (travelMins < 90) return { status: 'PASS', reason: `연속 이동시간 약 ${travelMins}분 — 90분 미만` }
    // 90분 이상이면 day1 휴식 체크로 넘어감 (휴식 추가 가능성)
  }

  // ④ day1에서 휴식 항목 추출
  const restActivities = day1
    .filter(e => /휴식|휴게소|정차/.test(e.activity || ''))
    .map(e => e.activity)

  // program_notes에서 휴식 관련 문장만
  const restNotes = notes.split(/[.。\n]/)
    .filter(s => /휴식|정차|휴게소/.test(s))
    .join(' ')

  const restText = [...restActivities, restNotes].join(' ').trim()

  if (restText.length > 0) {
    const nums = extractMinutes(restText)
    if (nums !== null) {
      const maxMin = Math.max(...nums)
      if (maxMin >= 15) return { status: 'PASS', reason: `중간 ${maxMin}분 휴식 반영됨 — 조건 충족` }
      return { status: 'PARTIAL', reason: `중간 ${maxMin}분 휴식 — 15분 미만으로 조건 미충족` }
    }
    // 숫자 없는 휴식 언급 → PARTIAL
    return { status: 'PARTIAL', reason: '휴식 언급 있으나 시간 불명확 (15분 이상 필요)' }
  }

  // ⑤ transport에 90분 이상 + 휴식 없음 → FAIL
  if (travelMins !== null && travelMins >= 90) {
    return { status: 'FAIL', reason: `연속 이동 약 ${travelMins}분 — 90분 이상, 휴식 없음` }
  }
  if (/90분|전세버스/.test(transport) && restText.length === 0) {
    return { status: 'FAIL', reason: '90분 연속 이동 유지됨' }
  }

  return { status: 'UNKNOWN', reason: '이동 조건 판단 불가' }
}

// ── C3: 박준혁 물레 필수 참여 강제 없음 ────────────────────
const POSITIVE_ADJUSTMENT = /관찰|방식\s*조정|별도\s*참여|선택\s*참여|제외\s*허용|참여\s*방식|손목\s*부담\s*없|비손목|비\s*부담|부담.{0,4}없는\s*방식|부담\s*없이/
const NEGATION = /하지\s*않음|안\s*함|미조정|조정\s*없음|불가|못\s*함/
const WHOLE_TEAM_SKIP = /전체\s*미사용|팀\s*전체.*포기|도자기.*미사용|물레.*미사용|포기.*도자기|포기.*물레/

function evaluateC3(plan) {
  const notes = plan.program_notes || ''
  const day1 = plan.day1 || []

  // WHOLE_TEAM_SKIP: notes 또는 day1 항목 전체 텍스트에서 먼저 판정
  const allDay1Text = (day1 || []).map(e => e.activity || '').join(' ')
  if (WHOLE_TEAM_SKIP.test(notes) || WHOLE_TEAM_SKIP.test(allDay1Text)) {
    return { status: 'PASS', reason: '팀 전체 도자기 프로그램 포기 명시 — 박준혁 강제 참여 없음' }
  }

  const pottery = day1.find(e => e.activity?.includes('도자기') || e.activity?.includes('물레'))

  if (!pottery) {
    return { status: 'UNKNOWN', reason: '도자기 일정 정보 없음 — 전체 미사용 여부 불명확' }
  }

  const combinedText = pottery.activity + ' ' + notes

  // 부정+관찰/대안 조합 먼저 탐지: "물레 작업 안 함, 대신 관찰 참여" → PASS
  const OPT_OUT_PLUS_ALT = /(물레|도자기).{0,20}(안\s*함|하지\s*않|불참|제외).{0,30}(관찰|방식\s*조정|별도\s*참여)|(관찰|방식\s*조정|별도\s*참여).{0,30}(물레|도자기).{0,20}(안\s*함|하지\s*않|불참|제외)/
  if (OPT_OUT_PLUS_ALT.test(combinedText)) {
    return { status: 'PASS', reason: '물레 미참여 + 관찰/대안 참여 조합 반영됨' }
  }

  // 부정문 → UNKNOWN (단, 전원 필수는 FAIL)
  if (NEGATION.test(combinedText)) {
    if (combinedText.includes('전원') && combinedText.includes('필수')) {
      return { status: 'FAIL', reason: '전원 필수 참여 유지됨' }
    }
    return { status: 'UNKNOWN', reason: '부정적 표현 감지 — 조정 여부 불명확' }
  }

  // ⚠️ 미확정 표현은 POSITIVE_ADJUSTMENT보다 먼저 탐지 → PARTIAL
  const PENDING = /예정|논의|검토|추후\s*결정|추후\s*확인|미정|확인\s*필요|결정\s*예정/
  if (PENDING.test(combinedText)) {
    return { status: 'PARTIAL', reason: '조정 예정/논의 중 언급 — 구체적 방식 미확정' }
  }

  // 긍정 조정 표현
  if (POSITIVE_ADJUSTMENT.test(combinedText)) {
    return { status: 'PASS', reason: '참여 방식 조정 반영됨' }
  }

  // 박준혁 언급만
  if (notes.includes('박준혁')) {
    return { status: 'PARTIAL', reason: '박준혁 언급 있으나 조정 방식 불명확' }
  }

  // 전원 필수
  if (combinedText.includes('전원') && combinedText.includes('필수')) {
    return { status: 'FAIL', reason: '전원 필수 참여 유지됨' }
  }

  return { status: 'UNKNOWN', reason: '프로그램 조정 여부 판단 불가' }
}

// ── C4: 최지원 ≠ 이수진 ──────────────────────────────────
function evaluateC4(plan) {
  const rooms = plan.rooms || []
  for (const room of rooms) {
    const members = room.members || []
    const hasLee = members.some(m => m.includes('이수진'))
    const hasChoi = members.some(m => m.includes('최지원'))
    if (hasLee && hasChoi) return { status: 'FAIL', reason: '이수진·최지원 같은 방' }
  }
  const leeRoom = rooms.find(r => r.members?.some(m => m.includes('이수진')))
  const choiRoom = rooms.find(r => r.members?.some(m => m.includes('최지원')))
  if (!leeRoom || !choiRoom) return { status: 'UNKNOWN', reason: '숙박 배정 정보 없음' }
  return { status: 'PASS', reason: '이수진·최지원 다른 방 배정됨' }
}
