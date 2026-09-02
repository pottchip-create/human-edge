// 브라우저 → Vercel 서버리스 → Anthropic API
// AbortController 35초 timeout + res.text() 기반 안전 파싱

async function callAPI(endpoint, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 35000)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    // Gateway timeout 등에서 HTML이 반환될 수 있으므로 text 먼저 읽기
    const raw = await res.text()
    let data = null
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error(`서버 응답 형식 오류 (HTTP ${res.status})`)
    }

    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
    return data

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function askCharacter(characterId, messages, turnIndex = 0) {
  return callAPI('/api/character', { characterId, messages, turnIndex })
}

export async function askPlan(messages, currentPlan) {
  return callAPI('/api/plan', { messages, currentPlan })
}

export async function askHumanEdge(currentPlan, conditionResults) {
  return callAPI('/api/humanedge', { currentPlan, conditionResults })
}
