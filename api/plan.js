import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_SYSTEM = `당신은 팀 워크숍 운영안을 조율하는 AI입니다.

[팀 구성 — 이름과 직급을 정확히 사용하십시오]
- 이수진 과장
- 윤서현 과장
- 김민준 대리
- 최지원 대리
- 장미래 대리
- 박준혁 주임

[고정 제약 조건 — 절대 변경 불가]
- 출발지: 서울 공덕 본사 / 목적지: 경기 양평 (이동 약 90분)
- 일정: 금~토 1박 2일 (날짜 변경 불가)
- 기본 출발: 금요일 13:00 / 복귀: 토요일 16:30까지
- 총예산: 120만원 / 숙소: 2인 1실 × 3개
- 물레 도자기: 금요일 16:00~18:00, 6명 예약, 24만원, 취소·시간변경 불가

[운영 원칙]
1. 팀원이 전달한 사정만 반영하십시오. 스스로 사정을 추측하거나 만들지 마십시오.
2. 변경 사항이 있으면 무엇이 왜 바뀌었는지 간단히 설명하십시오.
3. 고정 제약과 충돌하면 충돌 사실을 알리고 가능한 대안을 물으십시오.
4. 사용자를 특정 팀원 이름으로 부르지 마십시오. 사용자는 조 전체입니다.
5. 확인이 필요한 사항이 있어도 일정은 반드시 업데이트하십시오. 미확정 항목은 unconfirmed 배열에 넣으십시오.
6. 이동 중 휴식을 반영할 때는 day1 항목에 "HH:MM 휴식 (XX분)"처럼 시간을 반드시 명시하십시오.
6. 응답은 반드시 아래 JSON 형식으로만 출력하십시오. 마크다운 코드블록 없이 순수 JSON만 출력하십시오.

{"assistant_message":"조원에게 보여줄 자연스러운 응답 메시지","input_status":"APPLIED","clarifying_question":null,"changes":[{"section":"schedule","summary":"변경내용"}],"current_plan":{"day1":[{"time":"HH:MM","activity":"활동"}],"day2":[{"time":"HH:MM","activity":"활동"}],"rooms":[{"room":1,"members":["이름"]}],"transport":"이동수단","transport_groups":null 또는 [{"members":["이름"],"departure":"HH:MM","method":"이동수단"}],"program_notes":null,"unconfirmed":[]}}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, currentPlan } = req.body

  const system = PLAN_SYSTEM + '\n\n[현재 운영안]\n' + JSON.stringify(currentPlan, null, 2)

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system,
      messages
    })

    const text = response.content[0].text
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(200).json({
        assistant_message: clean,
        input_status: 'NO_CHANGE',
        changes: [],
        current_plan: currentPlan
      })
    }

    try {
      const parsed = JSON.parse(jsonMatch[0])
      return res.status(200).json(parsed)
    } catch {
      return res.status(200).json({
        assistant_message: clean,
        input_status: 'NO_CHANGE',
        changes: [],
        current_plan: currentPlan
      })
    }
  } catch (error) {
    console.error('Plan API error:', error)
    return res.status(500).json({ error: '운영안 처리에 실패했습니다.' })
  }
}
