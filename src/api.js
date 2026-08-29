const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

async function callClaude(system, messages, maxTokens = 1000) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content[0].text
}

export async function askCharacter(characterId, messages, characters) {
  const character = characters[characterId]
  const text = await callClaude(character.systemPrompt, messages, 300)
  return { message: text }
}

export async function askPlan(messages, currentPlan, systemPrompt) {
  const system = systemPrompt + '\n\n[현재 운영안]\n' + JSON.stringify(currentPlan, null, 2)
  const text = await callClaude(system, messages, 1500)

  // 마크다운 코드블록 제거
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      assistant_message: clean,
      input_status: 'NO_CHANGE',
      changes: [],
      current_plan: currentPlan
    }
  }
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return {
      assistant_message: clean,
      input_status: 'NO_CHANGE',
      changes: [],
      current_plan: currentPlan
    }
  }
}

export async function askHumanEdge(currentPlan, conditionResults, systemPrompt) {
  const userMessage = `팀이 완성한 운영안:\n${JSON.stringify(currentPlan, null, 2)}\n\n판정 결과:\n${JSON.stringify(conditionResults, null, 2)}\n\nHumanEdge 판단 피드백을 제공해주세요.`
  const text = await callClaude(systemPrompt, [{ role: 'user', content: userMessage }], 1500)

  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSON 파싱 실패')
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('JSON 파싱 실패')
  }
}