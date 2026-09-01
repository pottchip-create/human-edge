import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── 검증된 정적 기준안 (P2 없음) ──────────────────────────
const STATIC_P1 = {
  id: 'P1',
  label: '기존 일정과 예약을 더 활용한다면',
  plan_summary: '윤서현 팀장·이수진 과장·박준혁 주임·최지원 대리·장미래 대리 5명 13:00 선출발 (이동 중 15분 이상 휴식) → 16:00~18:00 도자기 프로그램 진행. 박준혁 주임은 관찰 또는 부담 없는 방식으로 참여. 김민준 대리는 16:30 이후 별도 합류.',
  priority: '기존 일정과 예약의 활용',
  gain: '대다수 팀원이 예약된 프로그램과 기존 일정을 활용',
  tradeoff: '김민준 대리가 핵심 프로그램을 함께하지 못하고 별도 이동',
  needs_confirmation: ['김민준 대리 별도 이동수단 미확정']
}

const STATIC_P3 = {
  id: 'P3',
  label: '모두 함께 출발하는 것을 더 우선한다면',
  plan_summary: '6명 모두 16:30 이후 함께 출발 (이동 중 15분 이상 휴식). 도자기 프로그램은 사용하지 않음. 이수진 과장과 최지원 대리는 다른 객실.',
  priority: '전원이 함께 출발하고 경험하는 것',
  gain: '김민준 대리를 포함한 6명이 동일한 출발 경험을 공유',
  tradeoff: '이미 예약·청구되는 도자기 프로그램 비용의 활용을 포기',
  needs_confirmation: []
}

// ── OUR PLAN 패턴 분류 (rule-based) ──────────────────────
// C1 PASS(김민준 16:30 이후)와 P1 exact를 반드시 분리한다.
// C1: 김민준 시각만 확인 (동행자 무관)
// P1 exact: 선발 5명 + 김민준만 후발 + 도자기 사용 + C2·C3·C4도 PASS

function classifyPlan(currentPlan, conditionResults) {
  const day1 = currentPlan.day1 || []
  const notes = currentPlan.program_notes || ''
  const groups = currentPlan.transport_groups || []

  // P3: 전원 16:30 이후 출발 + 도자기 미사용
  const allLate = groups.length > 0
    ? groups.every(g => (g.depart_time || g.departure || '') >= '16:30')
    : day1.some(e => e.activity?.includes('출발') && e.time >= '16:30')
  const noPottery = !day1.some(e => e.activity?.includes('도자기') || e.activity?.includes('물레'))
    || /미사용|포기|취소/.test(notes)
  if (allLate && noPottery) return 'P3'

  // P1 exact: 아래 5가지 조건 모두 충족해야 P1
  // 1) 도자기 프로그램 사용
  const hasPottery = day1.some(e => e.activity?.includes('도자기') || e.activity?.includes('물레'))
  if (!hasPottery) return 'CUSTOM'

  // 2) 김민준 그룹 후발 확인 (16:30 이상)
  const kimGroup = groups.find(g => {
    const members = g.participants || g.members || []
    return members.some(m => m.includes('김민준'))
  })
  const kimDep = kimGroup
    ? (kimGroup.depart_time || kimGroup.departure || '')
    : (day1.find(e => e.activity?.includes('김민준') && e.activity?.includes('출발'))?.time || '')
  if (!kimDep || kimDep < '16:30') return 'CUSTOM'

  // 3) 김민준만 후발 (동행자가 있으면 P1 exact 아님 → CUSTOM)
  if (kimGroup) {
    const kimGroupMembers = kimGroup.participants || kimGroup.members || []
    if (kimGroupMembers.length !== 1) return 'CUSTOM'  // 김민준 외 동행자 있음
  }

  // 4) 선발 그룹이 5명인지 확인
  const earlyGroups = groups.filter(g => {
    const members = g.participants || g.members || []
    return !members.some(m => m.includes('김민준'))
  })
  const earlyCount = earlyGroups.reduce((sum, g) => {
    return sum + (g.participants || g.members || []).length
  }, 0)
  // transport_groups 없으면 선발 그룹 인원 파악 불가 → CUSTOM
  if (groups.length > 0 && earlyCount !== 5) return 'CUSTOM'

  // 5) C2·C3·C4도 모두 PASS인지 확인 (conditionResults 있을 때만)
  if (conditionResults) {
    const c2 = conditionResults.C2?.status
    const c3 = conditionResults.C3?.status
    const c4 = conditionResults.C4?.status
    if (c2 !== 'PASS' || c3 !== 'PASS' || c4 !== 'PASS') return 'CUSTOM'
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
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: HUMANEDGE_SYSTEM,
      messages: [{ role: 'user', content: userMessage }]
    })

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
