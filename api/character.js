import Anthropic from '@anthropic-ai/sdk'
import { CHARACTERS } from '../src/data/characters.js'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { characterId, messages } = req.body

  if (!characterId || !CHARACTERS[characterId]) {
    return res.status(400).json({ error: 'Invalid character ID' })
  }

  const character = CHARACTERS[characterId]

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: character.systemPrompt,
      messages: messages
    })

    return res.status(200).json({
      message: response.content[0].text
    })
  } catch (error) {
    console.error('Character API error:', error)
    return res.status(500).json({ error: 'AI 호출에 실패했습니다.' })
  }
}