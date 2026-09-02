// approvedPlan에서 판단에 영향을 준 핵심 요소만 추출
// 출발 방식 / 이동 중 휴식 / 도자기 프로그램 / 객실 배정 / 미확정
export function summarizePlan(plan) {
  if (!plan) return []
  const items = []
  const day1 = plan.day1 || []
  const groups = plan.transport_groups || []
  const notes = plan.program_notes || ''

  // 1. 출발 방식
  if (groups.length > 1) {
    const parts = groups.map(g => {
      const members = g.participants || g.members || []
      const dep = g.depart_time || g.departure || ''
      return `${members.length}명 ${dep}`
    })
    items.push({ label: '출발 방식', value: parts.join(' · ') + ' 분리 출발' })
  } else if (groups.length === 1) {
    const g = groups[0]
    const members = g.participants || g.members || []
    const dep = g.depart_time || g.departure || ''
    items.push({ label: '출발 방식', value: `전원 ${members.length}명 ${dep} 동일 출발` })
  } else {
    const dep = day1.find(e => /출발/.test(e.activity || ''))
    items.push({ label: '출발 방식', value: dep ? `${dep.time} 출발` : '초안 유지' })
  }

  // 2. 이동 중 휴식
  const groupBreak = groups.find(g => g.break?.duration_min != null)
  const restItem = day1.find(e => /휴식|휴게소|정차/.test(e.activity || ''))
  if (groupBreak) {
    items.push({ label: '이동 중 휴식', value: `${groupBreak.break.duration_min}분 확보` })
  } else if (restItem) {
    items.push({ label: '이동 중 휴식', value: restItem.activity })
  } else {
    items.push({ label: '이동 중 휴식', value: '별도 휴식 없음' })
  }

  // 3. 도자기 프로그램 — 의미 기반 판별
  //    '도자기 프로그램 미사용 — 자유시간' 같은 미사용 문구는 사용 일정으로 보지 않음
  const NoPotteryWords = /미사용|포기|사용하지\s*않/
  const potteryInDay1 = day1.find(e => /도자기|물레/.test(e.activity || ''))
  // 실제 사용 일정: 도자기/물레 키워드 있고 미사용 표현 없음
  const realPotteryItem = potteryInDay1 && !NoPotteryWords.test(potteryInDay1.activity || '')
    ? potteryInDay1
    : null
  // 미사용 여부: notes 또는 day1 activity에 미사용 표현
  const isNoUse = NoPotteryWords.test(notes)
    || (potteryInDay1 && NoPotteryWords.test(potteryInDay1.activity || ''))
    || !potteryInDay1

  if (!realPotteryItem || isNoUse) {
    items.push({ label: '도자기 프로그램', value: '미사용 — 기지출 비용의 활용 포기' })
  } else if (/관찰|조정|부담/.test(notes) || /관찰|조정/.test(realPotteryItem.activity || '')) {
    items.push({ label: '도자기 프로그램', value: '진행 · 참여 방식 조정 반영' })
  } else {
    items.push({ label: '도자기 프로그램', value: '진행' })
  }

  // 4. 객실 배정
  const rooms = plan.rooms || []
  if (rooms.length > 0) {
    items.push({
      label: '객실 배정',
      value: rooms.map(r => (r.members || []).map(m => m.replace(/\s(팀장|과장|대리|주임)$/, '')).join('·')).join(' / ')
    })
  }

  // 5. 미확정 (있을 때만)
  const unconfirmed = (plan.unconfirmed || []).map(u =>
    typeof u === 'string' ? u : (u.item || u.description || '')
  ).filter(Boolean)
  if (unconfirmed.length > 0) {
    items.push({ label: '남은 확인 사항', value: unconfirmed.join(', ') })
  }

  return items
}
