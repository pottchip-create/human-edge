// api/evaluate.js — src/evaluate.js와 동일 로직 유지

function evaluatePlan(currentPlan) {
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
// 이수진 과장이 포함된 이동그룹만 판정 — 다른 그룹 휴식은 무관
// ITX/기차 키워드만으로 자동 PASS하지 않음 (연속 이동시간이 90분 미만임이 확인돼야 함)

// 휴식·정차·쉬기·휴게소와 직접 연결된 숫자만 duration으로 추출
function extractRestMinutes(text) {
  const results = []
  // 정방향: "15분 휴식", "15분간 휴식", "15분 정도 쉬기"
  const fwdRe = /(?<![\d])(\d{1,3})\s*분(?:간|정도)?\s*(?:휴식|정차|쉬기|휴게소)/g
  for (const m of text.matchAll(fwdRe)) results.push(Number(m[1]))
  // 역방향: "휴식 15분", "휴게소에서 15분", "휴식 (15분)"
  // 역방향: 공백·괄호·조사만 허용 — 쉼표 뒤 '다시 N분'을 잡지 않음
  const bwdRe = /(?:휴식|정차|쉬기|휴게소)(?:\s*\(|에서|하며|하고|하기)?\s*(?:약\s*)?(\d{1,3})\s*분/g
  for (const m of text.matchAll(bwdRe)) results.push(Number(m[1]))
  return results.length > 0 ? results : null
}

// transport 문자열에서 연속 이동시간 숫자 추출 (독립 숫자만)
function extractTravelMinutes(transport) {
  const matches = [...transport.matchAll(/(?<![\d])(\d{1,3})\s*분/g)]
  const nums = matches.map(m => Number(m[1]))
  return nums.length > 0 ? Math.max(...nums) : null
}

function evaluateC2(plan) {
  const notes = plan.program_notes || ''
  const transport = plan.transport || ''
  const day1 = plan.day1 || []
  const day2 = plan.day2 || []

  // ── 단일 이동구간 판정 헬퍼 ───────────────────────────────
  // breakMin: 구조화된 휴식(분) / dayItems: 해당 날 일정 / dayNotes: 해당 날만의 메모
  // dayNotes에는 program_notes 전체가 아닌, 해당 이동구간과 연결된 정보만 전달
  function judgeSegment(breakMin, dayItems) {
    // ① 구조화된 break.duration_min 최우선 (이동 구조에 명시된 휴식)
    if (breakMin != null) {
      const min = Number(breakMin)
      if (min >= 15) return { status: 'PASS', reason: `${min}분 이동 중 휴식 — 조건 충족` }
      if (min >= 1)  return { status: 'PARTIAL', reason: `${min}분 이동 중 휴식 — 15분 미만` }
      return { status: 'FAIL', reason: '구조화된 이동 휴식 없음' }
    }

    // ② day 일정에서 이동 중 휴식만 추출
    //    조건 A: '이동 중 휴식 / 차량 이동 중 휴식 / 휴게소 정차 / 이동 중 정차'처럼 이동과 직접 연결
    //    조건 B: 출발시간과 도착시간 사이에 위치한 휴식 항목
    const items = dayItems || []

    // 출발·도착 시간 찾기
    const departItem = items.find(e => /출발/.test(e.activity || ''))
    const arriveItem = items.find(e => /도착|체크인/.test(e.activity || ''))
    const departTime = departItem?.time || null
    const arriveTime  = arriveItem?.time  || null

    // 이동 맥락 휴식 필터
    const travelRestItems = items.filter(e => {
      const act = e.activity || ''
      // 반드시 휴식/정차/휴게소 키워드 포함
      if (!/휴식|정차|휴게소/.test(act)) return false
      // 조건 A: 이동과 직접 연결된 표현
      const isTravelLinked = /이동\s*중\s*휴식|차량\s*이동\s*중|휴게소\s*정차|이동\s*중\s*정차|휴게소/.test(act)
      if (isTravelLinked) return true
      // 조건 B: 출발-도착 시간 사이에 위치
      if (departTime && arriveTime && e.time) {
        return e.time > departTime && e.time < arriveTime
      }
      // 시간 정보 없고 이동 직접 연결 표현도 없으면 보수적으로 제외
      return false
    })

    if (travelRestItems.length === 0) return null  // 이동 중 휴식 없음

    const restText = travelRestItems.map(e => e.activity).join(' ')
    const nums = extractRestMinutes(restText)
    if (nums) {
      const maxMin = Math.max(...nums)
      if (maxMin >= 15) return { status: 'PASS', reason: `이동 중 ${maxMin}분 휴식 — 조건 충족` }
      return { status: 'PARTIAL', reason: `이동 중 ${maxMin}분 휴식 — 15분 미만` }
    }
    // 이동 중 휴식 언급은 있지만 시간 불명확
    return { status: 'PARTIAL', reason: '이동 중 휴식 언급 있으나 시간 불명확' }
  }

  // ── 구간 결과 종합 ─────────────────────────────────────────
  function combine(outbound, ret) {
    if (outbound.status === 'FAIL' || (ret && ret.status === 'FAIL')) {
      return { status: 'FAIL', reason: outbound.status === 'FAIL' ? outbound.reason : ret.reason }
    }
    if (outbound.status === 'PARTIAL' || (ret && ret.status === 'PARTIAL')) {
      return { status: 'PARTIAL', reason: outbound.status === 'PARTIAL' ? outbound.reason : ret.reason }
    }
    if (outbound.status === 'PASS' && (!ret || ret.status === 'PASS')) {
      return { status: 'PASS', reason: '왕복 이동 모두 조건 충족' }
    }
    return { status: 'UNKNOWN', reason: '이동 조건 판단 불가' }
  }

  // ── transport_groups 기반 판정 ────────────────────────────
  if (plan.transport_groups && plan.transport_groups.length > 0) {
    const leeGroups = plan.transport_groups.filter(g =>
      (g.participants || g.members || []).some(m => m.includes('이수진'))
    )
    if (leeGroups.length === 0) {
      return { status: 'UNKNOWN', reason: '이수진 과장의 이동그룹을 확인하지 못했습니다.' }
    }

    // 이수진이 포함된 그룹이 여럿일 수 있음(금/토 분리 표현 등)
    // depart_time 기준으로 금요일(13:00~16:00)과 토요일(복귀 방향) 구분
    const outboundGroup = leeGroups.find(g => {
      const dep = g.depart_time || g.departure || ''
      return dep < '17:00'  // 금요일 출발 그룹 (16:30 이전 또는 전원후발 13:00)
    }) || leeGroups[0]

    const returnGroup = leeGroups.length > 1
      ? leeGroups.find(g => g !== outboundGroup)
      : null  // 별도 복귀 그룹이 없으면 day2로 판정

    // 출발 판정
    const outboundSeg = judgeSegment(outboundGroup.break?.duration_min, day1)
    const outboundResult = outboundSeg || (() => {
      // judgeSegment가 null(휴식 정보 없음)이면 이동시간 기준으로 판정
      const depT = outboundGroup.depart_time || ''
      const arrT = outboundGroup.arrival_time || ''
      if (depT && arrT) {
        const depMin = parseInt(depT.split(':')[0])*60 + parseInt(depT.split(':')[1])
        const arrMin = parseInt(arrT.split(':')[0])*60 + parseInt(arrT.split(':')[1])
        const segMin = arrMin - depMin
        if (segMin < 90) return { status: 'PASS', reason: `출발 이동 약 ${segMin}분 — 90분 미만` }
        return { status: 'FAIL', reason: `출발 이동 약 ${segMin}분 — 휴식 없음` }
      }
      return { status: 'FAIL', reason: '출발 이동에 휴식 없음 (90분 이상 연속 이동)' }
    })()

    // 복귀 판정 — day2에서만 정보 읽음 (day1/notes 재사용 금지)
    let returnResult = null
    if (returnGroup) {
      const retSeg = judgeSegment(returnGroup.break?.duration_min, day2)
      if (retSeg) {
        returnResult = retSeg
      } else {
        const depT = returnGroup.depart_time || ''
        const arrT = returnGroup.arrival_time || ''
        if (depT && arrT) {
          const depMin = parseInt(depT.split(':')[0])*60 + parseInt(depT.split(':')[1])
          const arrMin = parseInt(arrT.split(':')[0])*60 + parseInt(arrT.split(':')[1])
          const segMin = arrMin - depMin
          returnResult = segMin < 90
            ? { status: 'PASS', reason: `복귀 이동 약 ${segMin}분 — 90분 미만` }
            : { status: 'FAIL', reason: `복귀 이동 약 ${segMin}분 — 휴식 없음` }
        } else {
          returnResult = { status: 'FAIL', reason: '복귀 이동에 휴식 없음 (90분 이상 연속 이동)' }
        }
      }
    } else {
      // 복귀 그룹이 transport_groups에 없으면 day2 일정으로 판정
      const day2HasTravel = day2.some(e => /출발|이동/.test(e.activity || ''))
      if (day2HasTravel) {
        const retSeg = judgeSegment(null, day2)
        if (retSeg) {
          returnResult = retSeg
        } else {
          // day2에 복귀 이동이 있지만 휴식 없음
          if (/90분|전세버스/.test(transport) || (extractTravelMinutes(transport) || 0) >= 90) {
            returnResult = { status: 'FAIL', reason: '토요일 복귀 이동에 휴식 없음 (90분 이상 연속 이동)' }
          } else {
            returnResult = { status: 'UNKNOWN', reason: '토요일 복귀 이동 조건 확인 불가' }
          }
        }
      }
    }

    // prefix 추가하여 출처 명확화
    const prefixed = (r, pre) => r ? { ...r, reason: `${pre}: ${r.reason}` } : null
    return combine(
      { ...outboundResult, reason: `출발 이동 — ${outboundResult.reason}` },
      returnResult ? { ...returnResult, reason: `복귀 이동 — ${returnResult.reason}` } : null
    )
  }

  // ── transport_groups 없음 — 텍스트 기반 판정 ──────────────

  // ② 기차·ITX·KTX
  if (/ITX|기차|KTX/.test(transport)) {
    const tMins = extractTravelMinutes(transport)
    if (tMins !== null && tMins < 90) {
      return { status: 'PASS', reason: `연속 이동시간 ${tMins}분(기차) — 90분 미만` }
    }
    return { status: 'PARTIAL', reason: '기차 이용 — 실제 소요시간 확인 필요' }
  }

  // ③ transport에서 연속 이동시간
  const travelMins = extractTravelMinutes(transport)
  if (travelMins !== null && !transport.includes('휴식') && !transport.includes('휴게소')) {
    if (travelMins < 90) return { status: 'PASS', reason: `연속 이동시간 약 ${travelMins}분 — 90분 미만` }
  }

  // ④ 금요일(day1)과 토요일(day2)을 각각 독립 판정
  //    토요일 판정에 program_notes 사용 금지 — day2 일정에서만 읽음
  const outSeg = judgeSegment(null, day1)
  const hasDay2Travel = day2.some(e => /출발|이동/.test(e.activity || ''))
  const retSeg = hasDay2Travel ? judgeSegment(null, day2) : null

  // 출발 결과 결정
  let outboundResult
  if (outSeg) {
    outboundResult = outSeg
  } else {
    // day1에 휴식 정보 없음
    if (travelMins !== null && travelMins >= 90) {
      outboundResult = { status: 'FAIL', reason: '출발 이동 90분 이상, 휴식 없음' }
    } else if (/90분|전세버스/.test(transport)) {
      outboundResult = { status: 'FAIL', reason: '출발 이동 90분 이상, 휴식 없음' }
    } else {
      outboundResult = { status: 'UNKNOWN', reason: '출발 이동 조건 판단 불가' }
    }
  }

  // 복귀 결과 결정
  let returnResult = null
  if (hasDay2Travel) {
    if (retSeg) {
      returnResult = retSeg
    } else {
      // day2에 복귀 이동이 있지만 day2 일정에 휴식 없음
      if (/90분|전세버스/.test(transport) || (travelMins !== null && travelMins >= 90)) {
        returnResult = { status: 'FAIL', reason: '복귀 이동 90분 이상, 휴식 없음' }
      } else {
        returnResult = { status: 'UNKNOWN', reason: '복귀 이동 조건 판단 불가' }
      }
    }
  }

  return combine(outboundResult, returnResult)

}

// ── C3: 박준혁 물레 필수 참여 강제 없음 ────────────────────
const POSITIVE_ADJUSTMENT = /관찰|방식\s*조정|별도\s*참여|선택\s*참여|제외\s*허용|참여\s*방식|손목\s*부담\s*없|비손목|비\s*부담|부담.{0,4}없는\s*방식|부담\s*없이/
const NEGATION = /하지\s*않음|안\s*함|미조정|조정\s*없음|불가|못\s*함/
const WHOLE_TEAM_SKIP = /전체\s*미사용|팀\s*전체.*포기|도자기.*미사용|물레.*미사용|포기.*도자기|포기.*물레|도자기\s*사용하지\s*않/
const PENDING = /예정|논의|검토|추후\s*결정|추후\s*확인|미정|확인\s*필요|결정\s*예정/
// ── 도자기 사용/미사용 판별 (공통 함수) ──────────────────────
// 실제 도자기 사용 일정:
//   도자기/물레 키워드 존재 AND 미사용/포기/사용하지않음 표현 없음
// 도자기 미사용 일정:
//   도자기/물레 키워드가 있더라도 미사용/포기/사용하지않음이 함께 명시
const NoPotteryWords = /미사용|포기|사용하지\s*않/

function isPotteryItem(activityText) {
  if (!/도자기|물레/.test(activityText)) return false
  // 같은 줄에 미사용 표현 있으면 실제 사용 아님
  if (NoPotteryWords.test(activityText)) return false
  return true
}

// day1 배열에서 실제 도자기 참여 일정만 반환
function findPotteryActivity(day1) {
  return (day1 || []).find(e => isPotteryItem(e.activity || ''))
}

// day1에 실제 도자기 사용 일정이 존재하는지 여부
function hasPotteryUsage(day1) {
  return !!(findPotteryActivity(day1))
}



function evaluateC3(plan) {
  const notes = plan.program_notes || ''
  const day1 = plan.day1 || []

  const allDay1Text = (day1 || []).map(e => e.activity || '').join(' ')

  // PENDING은 박준혁·물레·도자기 참여방식 관련 문장에만 적용
  // 다른 인물(김민준 등)의 '확인 필요'는 C3에 영향 없음
  const parkRelated = notes.split(/[.。\n]/)
    .filter(s => /박준혁|물레|도자기\s*참여|손목|참여\s*방식/.test(s))
    .join(' ')
  const notesPending = PENDING.test(parkRelated)

  // 실제 도자기 사용 일정 여부 (의미 기반 판별)
  // '도자기 프로그램 미사용 — 자유시간' 같은 미사용 표기는 사용 일정으로 보지 않음
  const pottery = findPotteryActivity(day1)  // 실제 사용 일정만 반환
  const hasNoPotteryNote = NoPotteryWords.test(notes)

  // 모순 감지: 실제 도자기 사용 일정이 있는데 notes에 미사용 표기 → PARTIAL
  if (pottery && hasNoPotteryNote) {
    return { status: 'PARTIAL', reason: '도자기 일정과 미사용 표기가 서로 일치하지 않습니다. 운영안을 한 가지 상태로 정리해주세요.' }
  }

  // 미사용 확인: day1에 실제 사용 일정 없고 미사용 명시 (또는 day1에 미사용 문구)
  // allDay1Text에 미사용 표현이 있으면 → 미사용으로 처리
  const allDay1NoPottery = NoPotteryWords.test(allDay1Text) || hasNoPotteryNote
  if (!notesPending && !pottery && (allDay1NoPottery || WHOLE_TEAM_SKIP.test(notes) || WHOLE_TEAM_SKIP.test(allDay1Text))) {
    return { status: 'PASS', reason: '팀 전체 도자기 프로그램 포기 명시 — 박준혁 강제 참여 없음' }
  }

  if (!pottery) {
    return { status: 'UNKNOWN', reason: '도자기 일정 정보 없음 — 전체 미사용 여부 불명확' }
  }

  const combinedText = pottery.activity + ' ' + notes

  // 부정+관찰/대안 조합 먼저 탐지: "물레 작업 안 함, 대신 관찰 참여" → PASS
  const OPT_OUT_PLUS_ALT = /(물레|도자기).{0,20}(안\s*함|하지\s*않|불참|제외|불가|못\s*함).{0,30}(관찰|방식\s*조정|별도\s*참여)|(관찰|방식\s*조정|별도\s*참여).{0,30}(물레|도자기).{0,20}(안\s*함|하지\s*않|불참|제외|불가|못\s*함)/
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
  //    단, 박준혁·물레·도자기 참여방식 관련 문장에서만 PENDING 인정
  //    다른 인물(김민준 등)의 '확인 필요'는 C3에 영향 없음
  if (PENDING.test(parkRelated) || PENDING.test(pottery.activity + ' ' + parkRelated)) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { currentPlan } = req.body
  if (!currentPlan) return res.status(400).json({ error: 'currentPlan이 없습니다.' })
  return res.status(200).json(evaluatePlan(currentPlan))
}
