import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_SYSTEM = `당신은 팀 워크숍 운영안을 조율하는 AI입니다.

[팀 구성 — 이름과 직급을 정확히 사용하십시오]
- 윤서현 팀장 (입사 16년차)
- 이수진 과장 (입사 12년차)
- 장미래 대리 (입사 7년차)
- 김민준 대리 (입사 5년차)
- 최지원 대리 (입사 5년차)
- 박준혁 주임 (입사 2년차)

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
7. unconfirmed 배열의 각 항목은 반드시 문자열(string)이어야 합니다. 객체가 아닌 짧은 한국어 문장으로 작성하십시오.
8. 참가자가 전달한 맥락만 운영안에 반영하십시오. 정보가 부족하면 추가 확인 질문을 하십시오.
9. 응답은 반드시 아래 JSON 형식으로만 출력하십시오. 마크다운 코드블록 없이 순수 JSON만 출력하십시오.

[transport_groups 스키마 — 출발 그룹이 여럿일 때만 사용]
transport_groups는 null 또는 아래 표준 스키마 배열:
{
  "id": "G1",
  "participants": ["이름"],
  "depart_time": "HH:MM",
  "arrival_time": "HH:MM",
  "break": { "duration_min": 15 },
  "transport_method": "단체 차량",
  "status": "confirmed 또는 needs_confirmation"
}

{"assistant_message":"조원에게 보여줄 자연스러운 응답 메시지","input_status":"APPLIED","clarifying_question":null,"changes":[{"section":"schedule","summary":"변경내용"}],"current_plan":{"day1":[{"time":"HH:MM","activity":"활동"}],"day2":[{"time":"HH:MM","activity":"활동"}],"rooms":[{"room":1,"members":["이름"]}],"transport":"이동수단","transport_groups":null,"program_notes":null,"unconfirmed":[]}}`

// 허용 팀원 목록
const ALLOWED_MEMBERS = ['윤서현 팀장', '이수진 과장', '김민준 대리', '최지원 대리', '장미래 대리', '박준혁 주임']

// current_plan 필수 필드 검증 (강화)
function validatePlan(plan) {
  if (!plan || typeof plan !== 'object') return false
  // day1/day2: 배열, 각 항목에 time·activity 존재
  if (!Array.isArray(plan.day1) || plan.day1.length === 0) return false
  if (!Array.isArray(plan.day2) || plan.day2.length === 0) return false
  for (const item of [...plan.day1, ...plan.day2]) {
    if (!item.time || !item.activity) return false
  }
  // rooms: 정확히 3개, 각 2명씩, 총 6명, 중복 없음, 허용 인물만
  if (!Array.isArray(plan.rooms) || plan.rooms.length !== 3) return false
  const allMembers = plan.rooms.flatMap(r => r.members || [])
  if (allMembers.length !== 6) return false
  if (new Set(allMembers).size !== 6) return false  // 중복 검사
  for (const m of allMembers) {
    if (!ALLOWED_MEMBERS.includes(m)) return false  // 허용 인물 검사
  }
  if (typeof plan.transport !== 'string') return false
  // transport_groups: 사용 시 표준 스키마 확인
  if (plan.transport_groups && Array.isArray(plan.transport_groups)) {
    for (const g of plan.transport_groups) {
      if (!Array.isArray(g.participants) || !g.depart_time) return false
    }
  }
  return true
}

async function callAI(system, messages) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system,
    messages
  })
  const text = response.content[0].text
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  return JSON.parse(jsonMatch[0])
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, currentPlan } = req.body
  const system = PLAN_SYSTEM + '\n\n[현재 운영안]\n' + JSON.stringify(currentPlan, null, 2)

  try {
    // 1차 시도
    let parsed = null
    try {
      parsed = await callAI(system, messages)
    } catch {
      parsed = null
    }

    // 유효성 검사
    if (parsed && validatePlan(parsed.current_plan)) {
      return res.status(200).json(parsed)
    }

    // 2차 재시도
    try {
      parsed = await callAI(system, messages)
    } catch {
      parsed = null
    }

    if (parsed && validatePlan(parsed.current_plan)) {
      return res.status(200).json(parsed)
    }

    // 재시도도 실패 → last valid plan 유지
    const fallbackMessage = parsed?.assistant_message || '운영안을 처리했습니다. 다시 한번 말씀해 주세요.'
    return res.status(200).json({
      assistant_message: fallbackMessage + '\n\n(운영안 구조에 문제가 생겨 이전 운영안을 유지합니다.)',
      input_status: 'NO_CHANGE',
      changes: [],
      current_plan: currentPlan
    })

  } catch (error) {
    console.error('Plan API error:', error)
    return res.status(200).json({
      assistant_message: '처리 중 오류가 발생했습니다. 이전 운영안을 유지합니다.',
      input_status: 'NO_CHANGE',
      changes: [],
      current_plan: currentPlan
    })
  }
}
