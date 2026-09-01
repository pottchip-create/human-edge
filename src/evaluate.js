export function evaluatePlan(currentPlan) {
  const results = {
    C1: evaluateC1(currentPlan),
    C2: evaluateC2(currentPlan),
    C3: evaluateC3(currentPlan),
    C4: evaluateC4(currentPlan),
  }
  const allPass = Object.values(results).every(r => r.status === 'PASS')
  // P1-7: PARTIAL도 미반영으로 포함
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
    const kimGroup = groups.find(g => g.members?.some(m => m.includes('김민준')))
    if (kimGroup) {
      const dep = kimGroup.departure
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
// P1-5: 15분 이상 숫자를 파싱해야 PASS. 단순 '휴식' 키워드는 PARTIAL
function parseRestMinutes(text) {
  // "15분", "20 분", "30분간" 등에서 숫자 추출
  const m = text.match(/(\d+)\s*분/)
  return m ? parseInt(m[1], 10) : null
}

function evaluateC2(plan) {
  const notes = plan.program_notes || ''
  const transport = plan.transport || ''
  const day1 = plan.day1 || []

  // ITX / 기차 → 연속 90분 미만으로 간주 → PASS
  if (transport.includes('ITX') || transport.includes('기차') ||
      transport.includes('60분') || transport.includes('70분') || transport.includes('80분')) {
    return { status: 'PASS', reason: '90분 미만 이동 수단 반영됨' }
  }

  // 휴식 관련 텍스트 수집
  const restTexts = [
    notes,
    transport,
    ...day1.filter(e => e.activity?.includes('휴식') || e.activity?.includes('휴게소') || e.activity?.includes('정차'))
         .map(e => e.activity)
  ].join(' ')

  const hasRestKeyword = /휴식|정차|휴게소/.test(restTexts)

  if (hasRestKeyword) {
    const mins = parseRestMinutes(restTexts)
    if (mins !== null) {
      if (mins >= 15) return { status: 'PASS', reason: `중간 ${mins}분 휴식 반영됨 — 조건 충족` }
      return { status: 'PARTIAL', reason: `중간 ${mins}분 휴식 — 15분 미만으로 조건 미충족` }
    }
    // 숫자 없는 '잠깐 휴식' 등
    return { status: 'PARTIAL', reason: '휴식 언급 있으나 시간 불명확 (15분 이상 필요)' }
  }

  if (transport.includes('90분') || transport.includes('전세버스')) {
    return { status: 'FAIL', reason: '90분 연속 이동 유지됨' }
  }

  return { status: 'UNKNOWN', reason: '이동 조건 판단 불가' }
}

// ── C3: 박준혁 물레 필수 참여 강제 없음 ────────────────────
// P1-6: 부정문·막연한 '예정'은 제외, 팀 전체 도자기 미사용은 PASS
const POSITIVE_ADJUSTMENT = /관찰|방식\s*조정|별도\s*참여|선택\s*참여|제외\s*허용|참여\s*방식/
const NEGATION = /하지\s*않음|안\s*함|미조정|조정\s*없음|불가|못\s*함/

function evaluateC3(plan) {
  const notes = plan.program_notes || ''
  const day1 = plan.day1 || []

  // 도자기 일정 자체가 없으면 → 팀 전체가 미사용(P3) → 박준혁도 강제 참여 없으므로 PASS
  const pottery = day1.find(e => e.activity?.includes('도자기') || e.activity?.includes('물레'))
  if (!pottery) {
    // program_notes에 명시적으로 '미사용' 또는 '포기' 언급이 있거나 일정 자체 없음
    return { status: 'PASS', reason: '도자기 프로그램 미포함 — 박준혁 강제 참여 없음' }
  }

  const combinedText = pottery.activity + ' ' + notes

  // 부정문이 있으면 FAIL 또는 UNKNOWN
  if (NEGATION.test(combinedText)) {
    if (combinedText.includes('전원') && combinedText.includes('필수')) {
      return { status: 'FAIL', reason: '전원 필수 참여 유지됨' }
    }
    return { status: 'UNKNOWN', reason: '부정적 표현 감지 — 조정 여부 불명확' }
  }

  // 명확한 긍정 조정 표현
  if (POSITIVE_ADJUSTMENT.test(combinedText)) {
    return { status: 'PASS', reason: '참여 방식 조정 반영됨' }
  }

  // '예정'만 있는 경우 → PARTIAL
  if (combinedText.includes('예정') || combinedText.includes('논의')) {
    return { status: 'PARTIAL', reason: '조정 예정 언급 — 구체적 방식 불명확' }
  }

  // 박준혁 언급만 있고 조정 내용 불명확
  if (notes.includes('박준혁')) {
    return { status: 'PARTIAL', reason: '박준혁 언급 있으나 조정 방식 불명확' }
  }

  // 전원 필수 참여
  if (combinedText.includes('전원') && combinedText.includes('필수')) {
    return { status: 'FAIL', reason: '전원 필수 참여 유지됨' }
  }

  return { status: 'UNKNOWN', reason: '프로그램 조정 여부 판단 불가' }
}

// ── C4: 최지원 ≠ 이수진 (같은 방 금지) ────────────────────
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
