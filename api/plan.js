import Anthropic from '@anthropic-ai/sdk'
import { FIXED_CONSTRAINTS } from '../src/data/constraints.js'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const PLAN_SYSTEM_PROMPT = `당신은 팀 워크숍 운영안을 조율하는 AI입니다.

[고정 제약 조건 — 절대 변경 불가]
- 출발지: 서울 공덕 본사
- 목적지: 경기 양평 (이동 약 90분)
- 일정: 금~토 1박 2일 (날짜 변경 불가)
- 기본 출발: 금요일 13:00
- 복귀: 토요일 16:30까지
- 총예산: 120만원
- 숙소: 2인 1실 × 3개
- 물레 도자기 원데이 클래스: 금요일 16:00~18:00, 6명 예약, 24만원, 취소·시간변경 불가

[운영 원칙]
1. 팀원이 전달한 사정만 반영하십시오. 스스로 사정을 추측하거나 만들지 마십시오.
2. 변경 사항이 있으면 무엇이 왜 바뀌었는지 간단히 설명하십시오.
3. 고정 제약과 충돌하면 충돌 사실을 알리고 가능한 대안을 물으십시오.
4. 응답은 반드시 아래 JSON 형식으로만 출력하십시오.

[출력 형식]
{
  "assistant_message": "조원에게 보여줄 자연스러운 응답 메시지",
  "input_status": "APPLIED | NEED_MORE_INFO | CONFLICT | NO_CHANGE",
  "clarifying_question": null 또는 "추가로 물어볼 질문",
  "changes": [
    { "section": "schedule | transport | program | rooms | other", "summary": "변경 내용 한 줄" }
  ],
  "current_plan": {
    "day1": [{ "time": "HH:MM", "activity": "활동 내용" }],
    "day2": [{ "time": "HH:MM", "activity": "활동 내용" }],
    "rooms": [{ "room": 1, "members": ["이름"] }],
    "transport": "이동 수단 설명",
    "transport_groups": null 또는 [{ "group": "그룹명", "members": ["이름"], "departure": "HH:MM", "method": "이동수단" }],
    "program_notes": null 또는 "프로그램 관련 특이사항",
    "unconfirmed": []
  }
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, currentPlan } = req.body

  const systemWithPlan = `${PLAN_SYSTEM_PROMPT}

[현재 운영안]
${JSON.stringify(currentPlan, null, 2)}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemWithPlan,
      messages: messages
    })

    const text = response.content[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON 파싱 실패')
    }
    const parsed = JSON.parse(jsonMatch[0])

    return res.status(200).json(parsed)
  } catch (error) {
    console.error('Plan API error:', error)
    return res.status(500).json({ error: '운영안 처리에 실패했습니다.' })
  }
}
