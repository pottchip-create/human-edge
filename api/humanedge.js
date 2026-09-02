import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── 도자기 사용/미사용 판별 (src/evaluate.js와 동일 기준) ───────
const NoPotteryWords = /미사용|포기|사용하지\s*않/
function isPotteryItem(activityText) {
  if (!/도자기|물레/.test(activityText)) return false
  if (NoPotteryWords.test(activityText)) return false
  return true
}
function hasPotteryUsage(day1) {
  return (day1 || []).some(e => isPotteryItem(e.activity || ''))
}



// ── 검증된 정적 기준안 (P2 없음) ──────────────────────────
const P1_PLAN = {
  day1: [
    { time: '13:00', activity: '서울 공덕 출발 (선발 5명, 전세버스)' },
    { time: '13:50', activity: '이동 중 휴식 (15분)' },
    { time: '14:45', activity: '양평 도착·체크인' },
    { time: '16:00', activity: '물레 도자기 원데이 클래스 (박준혁 주임은 관찰 또는 부담 없는 방식으로 참여)' },
    { time: '16:30', activity: '김민준 대리 서울 출발 (별도 합류)' },
    { time: '18:00', activity: '클래스 종료' },
    { time: '19:00', activity: '저녁 식사 (김민준 대리 합류)' },
    { time: '21:00', activity: '자유 시간' }
  ],
  day2: [
    { time: '08:00', activity: '기상 및 조식' },
    { time: '09:30', activity: '팀 워크숍 세션' },
    { time: '12:00', activity: '중식' },
    { time: '13:30', activity: '마무리 및 체크아웃' },
    { time: '14:45', activity: '양평 출발' },
    { time: '15:35', activity: '이동 중 휴식 (15분)' },
    { time: '16:30', activity: '서울 공덕 도착' }
  ],
  rooms: [
    { room: 1, members: ['김민준 대리', '박준혁 주임'] },
    { room: 2, members: ['이수진 과장', '장미래 대리'] },
    { room: 3, members: ['윤서현 팀장', '최지원 대리'] }
  ],
  transport: '전세버스 (선발) + 김민준 대리 별도 이동',
  transport_groups: [
    { id: 'G1', participants: ['윤서현 팀장', '이수진 과장', '장미래 대리', '최지원 대리', '박준혁 주임'],
      depart_time: '13:00', arrival_time: '14:45', break: { duration_min: 15 },
      transport_method: '전세버스', status: 'confirmed' },
    { id: 'G2', participants: ['김민준 대리'],
      depart_time: '16:30', arrival_time: '18:00', transport_method: '개별 이동', status: 'needs_confirmation' }
  ],
  program_notes: '박준혁 주임은 물레 작업을 강제하지 않고 관찰 또는 손목 부담이 없는 방식으로 참여',
  unconfirmed: ['김민준 대리 이동수단 미확정']
}

const P3_PLAN = {
  day1: [
    { time: '16:30', activity: '서울 공덕 출발 (전원 6명, 전세버스)' },
    { time: '17:20', activity: '이동 중 휴식 (15분)' },
    { time: '18:15', activity: '양평 도착·체크인' },
    { time: '19:00', activity: '저녁 식사 (전원)' },
    { time: '20:30', activity: '팀 세션' },
    { time: '22:00', activity: '자유 시간' }
  ],
  day2: [
    { time: '08:00', activity: '기상 및 조식' },
    { time: '09:30', activity: '팀 워크숍 세션' },
    { time: '12:00', activity: '중식' },
    { time: '13:30', activity: '마무리 및 체크아웃' },
    { time: '14:45', activity: '양평 출발' },
    { time: '15:35', activity: '이동 중 휴식 (15분)' },
    { time: '16:30', activity: '서울 공덕 도착' }
  ],
  rooms: [
    { room: 1, members: ['김민준 대리', '박준혁 주임'] },
    { room: 2, members: ['이수진 과장', '장미래 대리'] },
    { room: 3, members: ['윤서현 팀장', '최지원 대리'] }
  ],
  transport: '전세버스 (전원 동일 출발)',
  transport_groups: [
    { id: 'G1', participants: ['윤서현 팀장', '이수진 과장', '장미래 대리', '김민준 대리', '최지원 대리', '박준혁 주임'],
      depart_time: '16:30', arrival_time: '18:15', break: { duration_min: 15 },
      transport_method: '전세버스', status: 'confirmed' }
  ],
  program_notes: '물레 도자기 프로그램 미사용 — 기지출된 프로그램 비용의 활용을 포기',
  unconfirmed: []
}

// ── 검증된 정적 기준안 (P2 없음) ──────────────────────────
const STATIC_P1 = {
  id: 'P1',
  label: '기존 일정과 예약을 더 활용한다면',
  plan_summary: '선발 5명 13:00 출발 (이동 중 15분 휴식) → 16:00 도자기 프로그램 진행. 박준혁 주임은 관찰 또는 부담 없는 방식으로 참여. 김민준 대리는 16:30 이후 별도 합류.',
  priority: '기존 일정과 예약의 활용',
  gain: '대다수 팀원이 예약된 프로그램과 기존 일정을 활용',
  tradeoff: '김민준 대리가 핵심 프로그램을 함께하지 못하고 별도 이동',
  needs_confirmation: ['김민준 대리 별도 이동수단 미확정'],
  plan: P1_PLAN
}

const STATIC_P3 = {
  id: 'P3',
  label: '모두 함께 출발하는 것을 더 우선한다면',
  plan_summary: '6명 모두 16:30 이후 함께 출발 (이동 중 15분 휴식). 도자기 프로그램은 사용하지 않음.',
  priority: '전원이 함께 출발하고 경험하는 것',
  gain: '김민준 대리를 포함한 6명이 동일한 출발 경험을 공유',
  tradeoff: '이미 예약·청구되는 도자기 프로그램 비용의 활용을 포기',
  needs_confirmation: [],
  plan: P3_PLAN
}

// ── OUR PLAN 패턴 분류 (rule-based) ──────────────────────
// C1 PASS(김민준 16:30 이후)와 P1 exact를 반드시 분리한다.
// C1: 김민준 시각만 확인 (동행자 무관)
// P1 exact: 선발 5명 + 김민준만 후발 + 도자기 사용 + C2·C3·C4도 PASS

function classifyPlan(currentPlan, conditionResults) {
  const day1 = currentPlan.day1 || []
  const notes = currentPlan.program_notes || ''
  const groups = currentPlan.transport_groups || []

  const ALL_FIVE_EXCEPT_KIM = ['윤서현 팀장','이수진 과장','장미래 대리','최지원 대리','박준혁 주임']
  const ALL_SIX = ['윤서현 팀장','이수진 과장','장미래 대리','김민준 대리','최지원 대리','박준혁 주임']

  // 미사용: day1에 도자기 일정이 없고 + notes에 미사용 의미가 있어야 함
  // (day1에 도자기 있으면서 notes에 미사용 → 모순 → isNoPottery = false)
  // 실제 도자기 사용 일정 여부 (의미 기반 — 미사용 문구 포함 항목 제외)
  const hasPotteryInDay1 = hasPotteryUsage(day1)
  const hasNoPotteryNote = NoPotteryWords.test(notes)
  // 미사용: day1에 실제 사용 일정 없고, notes나 day1 자체에 미사용 명시
  const allDay1NoPottery = (day1 || []).some(e => NoPotteryWords.test(e.activity || ''))
  const isNoPottery = !hasPotteryInDay1 && (hasNoPotteryNote || allDay1NoPottery || !day1.some(e => /도자기|물레/.test(e.activity || '')))

  // ── P3 exact ─────────────────────────────────────────────
  // 1) 이동그룹 정확히 1개
  // 2) 그 안에 6명 정확히 한 번씩 (raw length + Set 둘 다 확인)
  // 3) 16:30 이상 출발
  // 4) 도자기 미사용 명시
  // 5) C2·C3·C4 PASS
  if (isNoPottery && groups.length === 1) {
    const g = groups[0]
    const dep = g.depart_time || g.departure || ''
    const raw = g.participants || g.members || []
    const memberSet = new Set(raw)
    const sixMatch =
      raw.length === 6 &&
      memberSet.size === 6 &&
      ALL_SIX.every(m => memberSet.has(m))
    if (dep >= '16:30' && sixMatch) {
      if (conditionResults) {
        if (conditionResults.C2?.status !== 'PASS') return 'CUSTOM'
        if (conditionResults.C3?.status !== 'PASS') return 'CUSTOM'
        if (conditionResults.C4?.status !== 'PASS') return 'CUSTOM'
      }
      return 'P3'
    }
  }

  // ── P1 exact ─────────────────────────────────────────────
  // 1) transport_groups 존재
  // 2) 도자기 사용 (day1에 있고 notes에 미사용 아님 — 모순 방지)
  // 3) 김민준 그룹 정확히 1명, 16:30 이상
  // 4) 후발 그룹 1개뿐
  // 5) 선발 명단이 정확한 5명 (raw length + Set 둘 다)
  // 6) 선발 모두 16:30 이전 출발
  // 7) C2·C3·C4 PASS
  if (groups.length === 0) return 'CUSTOM'

  // P1: day1에 실제 도자기 일정이 있어야 하고, 미사용 notes 없어야 함
  // (hasPotteryInDay1, hasNoPotteryNote는 위에서 이미 계산됨)
  if (!hasPotteryInDay1 || hasNoPotteryNote) return 'CUSTOM'

  const kimGroup = groups.find(g =>
    (g.participants || g.members || []).some(m => m.includes('김민준'))
  )
  if (!kimGroup) return 'CUSTOM'
  const kimMems = kimGroup.participants || kimGroup.members || []
  if (kimMems.length !== 1) return 'CUSTOM'
  const kimDep = kimGroup.depart_time || kimGroup.departure || ''
  if (!kimDep || kimDep < '16:30') return 'CUSTOM'

  const lateGroups = groups.filter(g => (g.depart_time || g.departure || '') >= '16:30')
  if (lateGroups.length !== 1) return 'CUSTOM'

  const earlyGroups = groups.filter(g =>
    !(g.participants || g.members || []).some(m => m.includes('김민준'))
  )
  const earlyRaw = earlyGroups.flatMap(g => g.participants || g.members || [])
  const earlySet = new Set(earlyRaw)
  // raw 개수와 Set 개수 모두 5여야 함 (중복 차단)
  if (earlyRaw.length !== 5 || earlySet.size !== 5) return 'CUSTOM'
  if (!ALL_FIVE_EXCEPT_KIM.every(m => earlySet.has(m))) return 'CUSTOM'
  if (!earlyGroups.every(g => (g.depart_time || g.departure || '') < '16:30')) return 'CUSTOM'

  if (conditionResults) {
    if (conditionResults.C2?.status !== 'PASS') return 'CUSTOM'
    if (conditionResults.C3?.status !== 'PASS') return 'CUSTOM'
    if (conditionResults.C4?.status !== 'PASS') return 'CUSTOM'
  }

  return 'P1'
}


const HUMANEDGE_SYSTEM = `당신은 HumanEdge AI입니다. 팀이 완성한 워크숍 운영안을 바탕으로 판단 피드백을 제공합니다.

[역할]
팀의 선택을 거울처럼 비춰주는 판단 파트너입니다. 정답을 알려주는 것이 아니라, 이 선택에 담긴 가치와 감수한 것을 드러냅니다. 차분하고 사려 깊은 어조를 유지하십시오.

[팀 구성]
윤서현 팀장, 이수진 과장, 김민준 대리, 최지원 대리, 장미래 대리, 박준혁 주임

[비용 표현 원칙]
"24만원을 잃는다"가 아니라 "이미 예약·청구되는 도자기 프로그램 비용의 활용을 포기한다"로 표현하십시오.

[당신의 역할]
OUR PLAN(참가자가 만든 운영안)의 핵심 가치와 trade-off를 자연스럽게 설명하십시오.
아래 JSON의 OUR_PLAN.priority/gain/tradeoff/plan_summary만 채워주십시오.
비교 기준안(OPTION_B, OPTION_C)은 이미 코드에서 제공되므로 수정하지 마십시오.

[출력 형식 — 반드시 순수 JSON만 출력, 마크다운 없이]
{
  "assistant_message": "전체 판단 피드백 메시지 (2~3문단, 차분하고 사려 깊은 어조)",
  "our_plan": {
    "plan_summary": "참가자 운영안의 핵심 내용 2~3줄",
    "priority": "이 선택이 우선한 가치",
    "gain": "이 선택으로 얻는 것",
    "tradeoff": "이 선택으로 감수한 것"
  },
  "final_question": "이번 워크숍에서 여러분이 가장 우선하고 싶었던 것은 무엇인가요? 그리고 감수한 것은 무엇인가요?"
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { currentPlan, conditionResults } = req.body
  const pattern = classifyPlan(currentPlan, conditionResults)

  const userMessage = `팀이 완성한 운영안:\n${JSON.stringify(currentPlan, null, 2)}\n\n판정 결과:\n${JSON.stringify(conditionResults, null, 2)}\n\nOUR PLAN의 판단 피드백을 제공해주세요.`

  try {
    // signal/timeout/maxRetries는 두 번째 인자(RequestOptions)에 전달
    // SDK 기본값(timeout 10분, maxRetries 2)을 쓰면 장시간 멈춤이 발생함
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 25000)
    let response
    try {
      response = await client.messages.create(
        {
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          system: HUMANEDGE_SYSTEM,
          messages: [{ role: 'user', content: userMessage }]
        },
        { signal: controller.signal, timeout: 25000, maxRetries: 0 }
      )
    } finally {
      clearTimeout(timer)
    }

    const text = response.content[0].text
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')
    const aiResult = JSON.parse(jsonMatch[0])

    // OUR PLAN 카드 조립
    const ourPlanCard = {
      id: 'OUR_PLAN',
      title: '우리 조가 만든 운영안',
      plan_summary: aiResult.our_plan?.plan_summary || '',
      priority: aiResult.our_plan?.priority || '',
      gain: aiResult.our_plan?.gain || '',
      tradeoff: aiResult.our_plan?.tradeoff || '',
      needs_confirmation: []
    }

    // 비교 카드: 중복이면 제외
    const options = [ourPlanCard]
    if (pattern !== 'P1') {
      options.push({ id: 'OPTION_B', ...STATIC_P1 })
    }
    if (pattern !== 'P3') {
      options.push({ id: 'OPTION_C', ...STATIC_P3 })
    }

    return res.status(200).json({
      pattern,
      assistant_message: aiResult.assistant_message || '',
      options,
      final_question: aiResult.final_question || '이번 워크숍에서 여러분이 가장 우선하고 싶었던 것은 무엇인가요? 그리고 감수한 것은 무엇인가요?'
    })
  } catch (error) {
    console.error('HumanEdge API error:', error)
    return res.status(500).json({ error: 'HumanEdge 처리에 실패했습니다.' })
  }
}
