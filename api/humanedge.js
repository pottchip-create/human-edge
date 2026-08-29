import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const HUMANEDGE_SYSTEM = `당신은 HumanEdge AI입니다. 팀이 완성한 워크숍 운영안을 바탕으로 판단 피드백을 제공합니다.

[역할]
팀의 선택을 거울처럼 비춰주는 판단 파트너입니다. 정답을 알려주는 것이 아니라, 이 선택에 담긴 가치와 감수한 것을 드러냅니다.

[3가지 비교 패턴]
P1 — 기존 일정·예약을 최대한 활용하는 안
- 13:00 전원 출발, 물레 도자기 전원 동일 참여, 기존 방 배정 유지
- 우선 가치: 예산 효율, 예약 활용, 단순한 운영

P3 — 전원이 함께하는 경험을 최우선으로 하는 안  
- 17:00 전원 출발, 물레 대신 대체 프로그램(24만원 손실), 방 배정 조정
- 우선 가치: 전원 동시 경험, 배려, 팀 화합

P2 — P1과 P3의 절충안
- 일부는 13:00 출발, 김민준은 17:00 후합류, 물레 방식 조정, 방 배정 조정
- 우선 가치: 개인 사정 존중 + 예약 유지

[출력 형식 — 반드시 JSON으로만 출력]
{
  "assistant_message": "전체 판단 피드백 메시지 (2~3문단)",
  "options": [
    {
      "id": "OUR_PLAN",
      "title": "우리 조의 선택",
      "plan_summary": "핵심 내용 2~3줄",
      "priority": "이 선택이 우선한 가치",
      "gain": "이 선택으로 얻는 것",
      "tradeoff": "이 선택으로 감수한 것",
      "needs_confirmation": []
    },
    {
      "id": "OPTION_B",
      "title": "다른 선택 — 기존 예약 우선",
      "plan_summary": "P1 핵심 내용",
      "priority": "예산 효율과 예약 활용",
      "gain": "24만원 도자기 비용 전액 활용, 단순한 운영",
      "tradeoff": "김민준 대리 아이 행사 참석 불가, 이수진 과장 90분 연속 이동",
      "needs_confirmation": []
    },
    {
      "id": "OPTION_C",
      "title": "다른 선택 — 전원 함께",
      "plan_summary": "P3 핵심 내용",
      "priority": "전원이 동시에 같은 경험",
      "gain": "6명 모두 동시 출발·참여, 배려 극대화",
      "tradeoff": "도자기 24만원 손실, 대체 프로그램 필요",
      "needs_confirmation": ["대체 프로그램 확인 필요"]
    }
  ],
  "final_question": "이번 워크숍에서 여러분이 가장 우선하고 싶었던 것은 무엇인가요? 그리고 감수한 것은 무엇인가요?"
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { currentPlan, conditionResults } = req.body

  const userMessage = `
팀이 완성한 운영안:
${JSON.stringify(currentPlan, null, 2)}

판정 결과:
${JSON.stringify(conditionResults, null, 2)}

위 운영안을 바탕으로 HumanEdge 판단 피드백을 제공해주세요.
`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: HUMANEDGE_SYSTEM,
      messages: [{ role: 'user', content: userMessage }]
    })

    const text = response.content[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')
    const parsed = JSON.parse(jsonMatch[0])

    return res.status(200).json(parsed)
  } catch (error) {
    console.error('HumanEdge API error:', error)
    return res.status(500).json({ error: 'HumanEdge 처리에 실패했습니다.' })
  }
}