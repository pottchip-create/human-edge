import Anthropic from '@anthropic-ai/sdk'
import { CHARACTERS } from '../src/data/characters.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { characterId, messages, turnIndex = 0 } = req.body

  if (!characterId || !CHARACTERS[characterId]) {
    return res.status(400).json({ error: 'Invalid character ID' })
  }

  const character = CHARACTERS[characterId]
  const MAX_TURNS = 5

  // 마지막 턴(5번째)이면 핵심사실 강제 공개 지시 추가
  const systemPrompt = turnIndex >= MAX_TURNS - 1
    ? character.systemPrompt + '\n\n[중요] 이번이 마지막 응답입니다. 아직 핵심사실을 전달하지 않았다면 반드시 이번 응답에 포함하십시오. 모호하게 돌리지 말고 구체적으로 말하십시오.'
    : character.systemPrompt

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages
    })

    return res.status(200).json({
      message: response.content[0].text
    })
  } catch (error) {
    console.error('Character API error:', error)
    return res.status(500).json({ error: 'AI 호출에 실패했습니다.' })
  }
}
