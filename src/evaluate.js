export function evaluatePlan(currentPlan) {
  const results = {
    C1: evaluateC1(currentPlan),
    C2: evaluateC2(currentPlan),
    C3: evaluateC3(currentPlan),
    C4: evaluateC4(currentPlan),
  }
  const allPass = Object.values(results).every(r => r.status === 'PASS')
  const unreflected = Object.entries(results)
    .filter(([, r]) => r.status === 'FAIL' || r.status === 'UNKNOWN')
    .map(([key]) => key)
  return {
    overall: allPass ? 'PASS' : 'RETRY',
    conditions: results,
    unreflected
  }
}

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

  // 김민준 전용 출발 항목 먼저 탐색
  const kimDep = day1.find(e =>
    e.activity?.includes('김민준') && e.activity?.includes('출발')
  )
  if (kimDep) {
    const time = kimDep.time
    if (time >= '16:30') return { status: 'PASS', reason: `김민준 대리 ${time} 출발 — 조건 충족` }
    return { status: 'FAIL', reason: `김민준 대리 ${time} 출발 — 16:30 이전` }
  }

  // 전원 출발 항목 탐색
  const allDep = day1.find(e =>
    e.activity?.includes('출발') && !e.activity?.includes('양평')
  )
  if (!allDep) return { status: 'UNKNOWN', reason: '출발 시간 정보 없음' }

  const time = allDep.time
  if (time >= '16:30') return { status: 'PASS', reason: `전원 ${time} 출발 — 조건 충족` }
  return { status: 'FAIL', reason: `${time} 출발 — 16:30 이전` }
}

function evaluateC2(plan) {
  const notes = plan.program_notes || ''
  const transport = plan.transport || ''
  const day1 = plan.day1 || []
  const hasRest = notes.includes('휴식') || notes.includes('정차') ||
    transport.includes('휴식') || transport.includes('정차') ||
    day1.some(e => e.activity?.includes('휴게소') || e.activity?.includes('휴식'))
  if (hasRest) return { status: 'PASS', reason: '중간 휴식 반영됨' }
  const hasShort = transport.includes('60분') || transport.includes('70분') ||
    transport.includes('80분') || transport.includes('ITX') || transport.includes('기차')
  if (hasShort) return { status: 'PASS', reason: '90분 미만 이동 수단 반영됨' }
  if (transport.includes('90분') || transport.includes('전세버스'))
    return { status: 'FAIL', reason: '90분 연속 이동 유지됨' }
  return { status: 'UNKNOWN', reason: '이동 조건 판단 불가' }
}

function evaluateC3(plan) {
  const notes = plan.program_notes || ''
  const day1 = plan.day1 || []
  const pottery = day1.find(e => e.activity?.includes('도자기') || e.activity?.includes('물레'))
  if (!pottery) return { status: 'UNKNOWN', reason: '프로그램 정보 없음' }
  const text = pottery.activity + ' ' + notes
  if (text.includes('관찰') || text.includes('조정') || text.includes('선택') || text.includes('방식'))
    return { status: 'PASS', reason: '참여 방식 조정 반영됨' }
  if (text.includes('전원') && text.includes('필수'))
    return { status: 'FAIL', reason: '전원 필수 참여 유지됨' }
  if (notes.includes('박준혁'))
    return { status: 'PARTIAL', reason: '조정 의사 있으나 방식 불명확' }
  return { status: 'UNKNOWN', reason: '프로그램 조정 여부 판단 불가' }
}

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