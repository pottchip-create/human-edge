import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 모든 패턴이 HARD 조건 4개를 충족함
const HUMANEDGE_SYSTEM = `당신은 HumanEdge AI입니다. 팀이 완성한 워크숍 운영안을 바탕으로 판단 피드백을 제공합니다.

[역할]
팀의 선택을 거울처럼 비춰주는 판단 파트너입니다. 정답을 알려주는 것이 아니라, 이 선택에 담긴 가치와 감수한 것을 드러냅니다. 차분하고 사려 깊은 어조를 유지하십시오.

[3가지 비교 패턴 — 모두 HARD 조건(C1~C4) 충족]

P1 — 기존 일정·예약 활용형
- 5명 13:00 선출발 (이수진 과장은 이동 중 15분 이상 휴식 포함)
- 김민준 대리만 16:30 이후 개인 이동으로 별도 합류
- 물레 도자기: 김민준 대리 제외 5명 진행 (예약 인원 조정 확인 필요)
- 방 배정: 이수진·최지원 분리
- 우선 가치: 예약된 프로그램 최대 활용, 대다수 일정 유지

P2 — 개인 배려·동행형
- 4명 13:00 선출발 (이동 중 15분 이상 휴식 포함)
- 김민준 대리 + 자원 동행자 1명 16:30 이후 출발
- 물레 도자기: 김민준·박준혁 제외 4명 진행 / 박준혁은 방식 조정 참여
- 방 배정: 이수진·최지원 분리
- 우선 가치: 개인 사정 최대 배려, 소그룹 동행

P3 — 전원 함께함형
- 6명 모두 16:30 이후 출발 (이동 중 15분 이상 휴식 포함)
- 물레 도자기 미사용 (이미 지급된 24만원은 환불 불가)
- 방 배정: 이수진·최지원 분리
- 우선 가치: 전원 동일 출발·경험, 완전한 함께함

[비용 표현 원칙]
"24만원을 잃는다"가 아니라 "기지출된 도자기 프로그램 비용의 활용을 포기한다"로 표현하십시오.

[출력 형식 — 반드시 순수 JSON만 출력, 마크다운 없이]
{
  "assistant_message": "전체 판단 피드백 메시지 (2~3문단, 차분하고 사려 깊은 어조)",
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
      "title": "P1 — 기존 일정 활용형",
      "plan_summary": "P1 핵심 내용",
      "priority": "예약된 프로그램 최대 활용, 대다수 일정 유지",
      "gain": "기지출 도자기 비용 활용, 운영 단순",
      "tradeoff": "김민준 대리 별도 이동, 물레 인원 조정 필요",
      "needs_confirmation": ["물레 5명 진행 가능 여부 공방 확인"]
    },
    {
      "id": "OPTION_C",
      "title": "P3 — 전원 함께함형",
      "plan_summary": "P3 핵심 내용",
      "priority": "전원 동시 출발·경험",
      "gain": "6명 모두 같은 시간에 출발·도착",
      "tradeoff": "기지출 도자기 프로그램 비용 활용 포기",
      "needs_confirmation": ["대체 프로그램 또는 자유 시간 구성 필요"]
    }
  ],
  "final_question": "이번 워크숍에서 여러분이 가장 우선하고 싶었던 것은 무엇인가요? 그리고 감수한 것은 무엇인가요?"
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { currentPlan, conditionResults } = req.body

  const userMessage = `팀이 완성한 운영안:\n${JSON.stringify(currentPlan, null, 2)}\n\n판정 결과:\n${JSON.stringify(conditionResults, null, 2)}\n\nHumanEdge 판단 피드백을 제공해주세요.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: HUMANEDGE_SYSTEM,
      messages: [{ role: 'user', content: userMessage }]
    })

    const text = response.content[0].text
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json(parsed)
  } catch (error) {
    console.error('HumanEdge API error:', error)
    return res.status(500).json({ error: 'HumanEdge 처리에 실패했습니다.' })
  }
}
