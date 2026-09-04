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
- 워크숍 날짜 자체 변경 불가 (금~토 1박 2일)
- 토요일 16:30까지 서울 공덕 회사 복귀
- 총예산: 120만원
- 숙소: 2인 1실 × 3개 / 동성 객실 (남성 2명·여성 4명)
- 물레 도자기: 금요일 16:00~18:00, 시간 변경 불가
- 도자기를 사용하지 않아도 24만원 비용이 발생함

[현재 초안 기본값 — 참가자 입력에 따라 변경 가능]
- 금요일 13:00 출발 (전원 16:30 이후 출발 등 다른 안도 유효함)
- 단체 전세버스 이용

[운영 원칙]
1. 팀원이 전달한 사정만 반영하십시오. 스스로 사정을 추측하거나 만들지 마십시오.
2. 변경 사항이 있으면 무엇이 왜 바뀌었는지 간단히 설명하십시오.
3. 고정 제약과 충돌하면 충돌 사실을 알리고 가능한 대안을 물으십시오.
4. 사용자를 특정 팀원 이름으로 부르지 마십시오. 사용자는 조 전체입니다.
5. 확인이 필요한 사항이 있어도 일정은 반드시 업데이트하십시오. 미확정 항목은 unconfirmed 배열에 넣으십시오.
6. 이동 중 휴식은 반드시 day1 또는 day2 일정 "항목"으로 추가하십시오. program_notes에만 적지 마십시오.
   형식: { "time": "13:50", "activity": "이동 중 휴식 (15분)" }
   - 반드시 분 단위 숫자를 포함하십시오. "휴게소 들름", "잠시 휴식"처럼 시간이 없으면 안 됩니다.
   - 출발 이동과 복귀 이동 각각에 별도 항목으로 넣으십시오. 금요일에만 넣으면 안 됩니다.
   - transport_groups를 사용할 때는 break: { "duration_min": 15 } 도 함께 채우십시오.
7. unconfirmed 배열의 각 항목은 반드시 문자열(string)이어야 합니다.
8. 참가자가 전달한 맥락만 운영안에 반영하십시오. 정보가 부족하면 추가 확인 질문을 하십시오.
9. 유료 교통수단·숙소·서비스·비용을 참가자가 명시하지 않았다면 임의로 추가하지 마십시오. 필요하면 unconfirmed에 넣고 참가자에게 확인하십시오.
10. 객실은 동성 2인실 3개로 구성하십시오. 남성(김민준 대리·박준혁 주임)끼리, 여성(윤서현 팀장·이수진 과장·장미래 대리·최지원 대리)끼리 방을 배정하십시오.
11. 이동 중 휴식이나 참가자 별도 출발 등을 반영할 때 transport_groups를 사용하십시오. 이동 계획이 확정된 이후에는 1개 그룹이든 여럿이든 transport_groups에 6명 전원의 이동 구조를 명시하십시오.
12. assistant_message에 추가 확인이 필요한 내용을 포함하십시오. clarifying_question은 assistant_message에 이미 포함되지 않은 추가 질문이 있을 때만 사용하십시오.

[최소 수정 원칙]
- 참가자가 전달한 맥락을 반영하는 데 필요한 부분만 수정하십시오.
- 입력과 직접 관련 없는 일정, 객실, 이동, 프로그램 참여방식은 현재 운영안(currentPlan)을 그대로 유지하십시오.
- 아직 전달받지 않은 팀원의 개인 상황을 추측하거나, 선제적으로 배려안을 만들지 마십시오.
- 이전 대화에서 이미 반영된 변경사항은 새 입력과 충돌하지 않는 한 유지하십시오.
- '전체 계획을 다시 정리해줘'라는 요청에도 아직 발견되지 않은 숨은 조건을 추측해 해결하지 마십시오.
  예: 김민준 출발조건만 입력받았다면 이수진 휴식, 박준혁 참여방식, 객실 배정은 그대로 유지.

13. 응답은 반드시 아래 JSON 형식으로만 출력하십시오. 마크다운 코드블록 없이 순수 JSON만 출력하십시오.

[이름 표기 규칙]
rooms와 transport_groups의 인물 이름은 반드시 "이름 직급" 형태로 정확히 쓰십시오.
올바름: "김민준 대리", "이수진 과장", "윤서현 팀장", "박준혁 주임", "최지원 대리", "장미래 대리"
틀림: "김민준", "민준 대리", "김 대리"

[transport_groups 스키마 — 이동 그룹이 있을 때 사용]
출발 그룹이 나뉘면 6명 전원을 그룹에 배치하는 것이 가장 좋습니다.
예: 김민준 대리만 늦게 출발한다면 나머지 5명 그룹과 김민준 그룹 2개를 만드십시오.
{
  "id": "G1",
  "participants": ["이름"],
  "depart_time": "HH:MM",
  "arrival_time": "HH:MM",
  "break": { "duration_min": 15 },
  "transport_method": "단체 차량",
  "status": "confirmed 또는 needs_confirmation"
}

{"assistant_message":"조원에게 보여줄 응답 (추가 확인 질문도 여기에 포함)","input_status":"APPLIED","clarifying_question":null,"changes":[{"section":"schedule","summary":"변경내용"}],"current_plan":{"day1":[{"time":"HH:MM","activity":"활동"}],"day2":[{"time":"HH:MM","activity":"활동"}],"rooms":[{"room":1,"members":["이름"]}],"transport":"이동수단","transport_groups":null,"program_notes":null,"unconfirmed":[]}}`

// ── 팀원 성별 매핑 ──────────────────────────────────────────
const GENDER = {
  '윤서현 팀장': 'F', '이수진 과장': 'F',
  '최지원 대리': 'F', '장미래 대리': 'F',
  '김민준 대리': 'M', '박준혁 주임': 'M'
}
const ALLOWED_MEMBERS = Object.keys(GENDER)

// ── 이름 정규화 ─────────────────────────────────────────────
// AI가 '김민준' / '김민준 대리' / '김민준대리' 등으로 섞어 써도 동일 인물로 인식
const SURNAME_MAP = {
  '윤서현': '윤서현 팀장', '이수진': '이수진 과장', '최지원': '최지원 대리',
  '장미래': '장미래 대리', '김민준': '김민준 대리', '박준혁': '박준혁 주임'
}
function normalizeMember(name) {
  if (typeof name !== 'string') return null
  const t = name.trim()
  if (GENDER[t]) return t                       // 이미 정식 표기
  for (const key of Object.keys(SURNAME_MAP)) { // 이름만 있거나 표기가 다른 경우
    if (t.includes(key)) return SURNAME_MAP[key]
  }
  return null                                   // 알 수 없는 인물
}

// ── validatePlan — 구조적 유효성만 (숨은 조건 C4 제외) ──────
// ⚠️ 최소 수정 원칙과 충돌하지 않도록 느슨하게 검증한다.
//    AI가 참가자 입력과 관련된 부분만 수정해도 통과해야 한다.
//    의미적 옳고 그름(C1~C4)은 evaluate.js가 판단한다.
function validatePlan(plan) {
  if (!plan || typeof plan !== 'object') return false

  // day1/day2: 배열, 각 항목에 time·activity 존재
  if (!Array.isArray(plan.day1) || plan.day1.length === 0) return false
  if (!Array.isArray(plan.day2) || plan.day2.length === 0) return false
  for (const item of [...plan.day1, ...plan.day2]) {
    if (!item.time || !item.activity) return false
  }

  // rooms: 3개, 각 방 2명, 동성, 6명 중복 없음 (이름 표기는 정규화 후 비교)
  if (!Array.isArray(plan.rooms) || plan.rooms.length !== 3) return false
  const allMembers = []
  for (const room of plan.rooms) {
    if (!Array.isArray(room.members) || room.members.length !== 2) return false
    const a = normalizeMember(room.members[0])
    const b = normalizeMember(room.members[1])
    if (!a || !b) return false                  // 알 수 없는 인물
    if (GENDER[a] !== GENDER[b]) return false   // 동성 객실
    allMembers.push(a, b)
  }
  if (allMembers.length !== 6 || new Set(allMembers).size !== 6) return false

  if (typeof plan.transport !== 'string') return false

  // transport_groups: 구조만 확인
  // ⚠️ '6명 전원 포함'을 요구하지 않는다.
  //    최소 수정 원칙에 따라 AI가 김민준 그룹만 추가할 수 있기 때문.
  if (plan.transport_groups && Array.isArray(plan.transport_groups)) {
    for (const g of plan.transport_groups) {
      if (!Array.isArray(g.participants) || g.participants.length === 0) return false
      if (!g.depart_time) return false
      // 유령 인물만 차단 (정규화 후에도 매칭 안 되면 거부)
      for (const p of g.participants) {
        if (!normalizeMember(p)) return false
      }
    }
  }

  return true
}

// 통과한 plan의 인물 표기를 정식 명칭으로 통일 (판정·요약 일관성 확보)
function normalizePlanNames(plan) {
  if (!plan) return plan
  if (Array.isArray(plan.rooms)) {
    plan.rooms = plan.rooms.map(r => ({
      ...r,
      members: (r.members || []).map(m => normalizeMember(m) || m)
    }))
  }
  if (Array.isArray(plan.transport_groups)) {
    plan.transport_groups = plan.transport_groups.map(g => ({
      ...g,
      participants: (g.participants || []).map(p => normalizeMember(p) || p)
    }))
  }
  return plan
}

// ── timeout 예산 ─────────────────────────────────────────────
const FIRST_TIMEOUT_MS  = 20000   // 1차
const REPAIR_TIMEOUT_MS = 8000    // repair (합산 30초 < 프런트 35초)

function isExternalError(err) {
  if (!err) return false
  const name = err.name || ''
  if (name === 'AbortError') return true
  if (name.includes('Timeout') || name.includes('Connection')) return true
  const status = err.status
  if (typeof status === 'number' && (status === 429 || status >= 500)) return true
  if (err instanceof SyntaxError) return false
  return true
}

function parseResponse(response) {
  const text = response?.content?.[0]?.text
  if (!text) throw new SyntaxError('응답 본문 없음')
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new SyntaxError('JSON 구조 없음')
  return JSON.parse(jsonMatch[0])
}

async function callAI(system, messages) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FIRST_TIMEOUT_MS)
  try {
    const response = await client.messages.create(
      { model: 'claude-sonnet-4-6', max_tokens: 1500, system, messages },
      { signal: controller.signal, timeout: FIRST_TIMEOUT_MS, maxRetries: 0 }
    )
    return parseResponse(response)
  } finally {
    clearTimeout(timer)
  }
}

async function repairAI(system, messages) {
  const repairSystem = system +
    '\n\n[교정] 직전 응답이 유효한 JSON이 아니었습니다. 순수 JSON만 출력하십시오.'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REPAIR_TIMEOUT_MS)
  try {
    const response = await client.messages.create(
      { model: 'claude-sonnet-4-6', max_tokens: 1500, system: repairSystem, messages },
      { signal: controller.signal, timeout: REPAIR_TIMEOUT_MS, maxRetries: 0 }
    )
    return parseResponse(response)
  } finally {
    clearTimeout(timer)
  }
}

function makeFallback(currentPlan, msg) {
  return { assistant_message: msg, input_status: 'NO_CHANGE', clarifying_question: null, changes: [], current_plan: currentPlan }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, currentPlan } = req.body || {}
  if (!Array.isArray(messages) || !currentPlan) {
    return res.status(200).json(makeFallback(currentPlan || null, '요청을 처리하지 못했습니다.'))
  }

  const system = PLAN_SYSTEM + '\n\n[현재 운영안]\n' + JSON.stringify(currentPlan, null, 2)
  let parsed = null, repaired = null

  try {
    try {
      parsed = await callAI(system, messages)
    } catch (err) {
      if (isExternalError(err)) {
        return res.status(200).json(makeFallback(currentPlan, '응답이 지연되어 이전 운영안을 유지합니다.'))
      }
    }
    if (parsed && validatePlan(parsed.current_plan)) {
      parsed.current_plan = normalizePlanNames(parsed.current_plan)
      return res.status(200).json(parsed)
    }
    if (parsed) console.error('[plan] 1차 validate 실패:', JSON.stringify(parsed.current_plan)?.slice(0, 400))

    try { repaired = await repairAI(system, messages) } catch { /* repair 실패 */ }
    if (repaired && validatePlan(repaired.current_plan)) {
      repaired.current_plan = normalizePlanNames(repaired.current_plan)
      return res.status(200).json(repaired)
    }

    const aiMsg = repaired?.assistant_message || parsed?.assistant_message || ''
    return res.status(200).json(makeFallback(currentPlan,
      (aiMsg ? aiMsg + '\n\n' : '') + '운영안 구조를 확인하지 못해 이전 운영안을 유지합니다.'))

  } catch (error) {
    return res.status(200).json(makeFallback(currentPlan, '처리 중 오류가 발생했습니다.'))
  }
}
