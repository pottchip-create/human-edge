// 브라우저 → Vercel 서버리스 → Anthropic API

async function callAPI(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// 캐릭터 챗봇 — turnIndex: 0부터 시작, 4이면 마지막(5번째)
export async function askCharacter(characterId, messages, turnIndex = 0) {
  return callAPI('/api/character', { characterId, messages, turnIndex })
}

// 운영안 AI
export async function askPlan(messages, currentPlan) {
  return callAPI('/api/plan', { messages, currentPlan })
}

// HumanEdge AI
export async function askHumanEdge(currentPlan, conditionResults) {
  return callAPI('/api/humanedge', { currentPlan, conditionResults })
}
