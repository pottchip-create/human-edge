import { useState } from 'react'
import { CHARACTERS } from '../data/characters'
import { askCharacter } from '../api'

export default function CharacterScreen({ clueId }) {
  const character = CHARACTERS[clueId]
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turns, setTurns] = useState(0)
  const MAX_TURNS = 5

  if (!character) return <div className="page">잘못된 접근입니다.</div>

  const sendMessage = async () => {
    if (!input.trim() || loading || turns >= MAX_TURNS) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const data = await askCharacter(clueId, newMessages, CHARACTERS)
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
      setTurns(t => t + 1)
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: '오류가 발생했습니다: ' + e.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px', maxWidth: '480px', margin: '0 auto' }}>

      {/* 상황 그림 카드 */}
      <div className="card fade-in" style={{ marginBottom: '16px', padding: '0', overflow: 'hidden' }}>
        <img
          src={character.situationImage}
          alt={`${character.name} 상황`}
          style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '280px' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: character.color, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: '700', flexShrink: 0
          }}>
            {character.initial}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{character.name} {character.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{character.years}</div>
          </div>
        </div>
      </div>

      {/* 챗봇 카드 */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: character.color, marginBottom: '2px' }}>
            {character.name} {character.title}와 대화하기
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            자유롭게 질문하면서 이 사람의 상황을 파악해보세요.
          </div>
        </div>

        <div style={{ height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {messages.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '40px' }}>
              궁금한 것을 자유롭게 물어보세요.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? character.color : 'var(--bg)',
              color: m.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: '9px 13px', borderRadius: '14px',
              maxWidth: '82%', fontSize: '0.88rem', lineHeight: '1.6',
              borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px'
            }}>
              <span dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg)', padding: '9px 13px', borderRadius: '4px 14px 14px 14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              ...
            </div>
          )}
        </div>

        {turns >= MAX_TURNS && (
          <div style={{ textAlign: 'center', padding: '10px', background: 'var(--yellow-soft)', borderRadius: '8px', fontSize: '0.85rem', color: '#92400E', marginBottom: '10px' }}>
            💡 충분히 이야기를 나눴어요. 공유 화면에서 팀원들과 논의해보세요!
          </div>
        )}

        {turns < MAX_TURNS && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="질문을 입력하세요..."
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '100px',
                border: '1.5px solid var(--line)', fontSize: '0.88rem',
                fontFamily: 'inherit', outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: character.color, color: 'white', border: 'none',
                borderRadius: '100px', padding: '10px 18px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.88rem',
                opacity: loading || !input.trim() ? 0.5 : 1
              }}
            >
              전송
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        발견한 내용을 공유 화면에서 팀원들에게 설명해보세요.
      </div>
    </div>
  )
}