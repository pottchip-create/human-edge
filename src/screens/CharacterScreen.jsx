import { useState, useRef, useEffect } from 'react'
import { CHARACTERS } from '../data/characters'
import SafeBold from '../components/SafeBold'
import { askCharacter } from '../api'

export default function CharacterScreen({ clueId }) {
  const character = CHARACTERS[clueId]
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turns, setTurns] = useState(0)
  const chatBottomRef = useRef(null)
  const MAX_TURNS = 5

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  if (!character) return <div className="page">잘못된 접근입니다.</div>

  const sendMessage = async () => {
    if (!input.trim() || loading || turns >= MAX_TURNS) return
    // isError를 제거한 정상 history에 user 질문 추가
    const cleanMessages = messages.filter(m => !m.isError)
    const userMsg = { role: 'user', content: input }
    const newMessages = [...cleanMessages, userMsg]
    const savedInput = input
    setInput('')
    setLoading(true)
    try {
      const data = await askCharacter(clueId, newMessages, turns)
      if (data.error) {
        // 오류: 실패한 user 질문은 history에 남기지 않음
        // cleanMessages만 유지하고 오류 안내만 표시
        setMessages([
          ...cleanMessages,
          {
            role: 'assistant',
            content: '응답이 조금 지연되고 있습니다.\n질문 횟수는 차감되지 않았습니다. 다시 시도해주세요.',
            isError: true
          }
        ])
        setInput(savedInput)
        return
      }
      // 성공: 정상 history에 저장 + turns +1
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
      setTurns(t => t + 1)
    } catch (e) {
      // 오류: 동일 처리 — 실패한 user 질문 미포함
      setMessages([
        ...cleanMessages,
        {
          role: 'assistant',
          content: '응답이 조금 지연되고 있습니다.\n질문 횟수는 차감되지 않았습니다. 다시 시도해주세요.',
          isError: true
        }
      ])
      setInput(savedInput)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const remainingTurns = MAX_TURNS - turns

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      maxWidth: '480px', margin: '0 auto',
      display: 'flex', flexDirection: 'column'
    }}>

      {/* 상황 이미지 — 상단 고정, 충분한 비중 */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', paddingBottom: '8px' }}>
        <div style={{ overflow: 'hidden', borderRadius: '0 0 20px 20px' }}>
          <img
            src={character.situationImage}
            alt={`${character.name} 상황`}
            style={{ width: '100%', display: 'block', objectFit: 'cover', height: '280px' }}
            onError={e => { e.target.parentElement.style.display = 'none' }}
          />
        </div>
        {/* 인물 정보 바 */}
        <div style={{
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: '700', flexShrink: 0
            }}>
              {character.initial}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{character.name} {character.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{character.years}</div>
            </div>
          </div>
          <div style={{
            fontSize: '0.78rem', color: turns >= MAX_TURNS ? 'var(--text-muted)' : 'var(--text-secondary)',
            fontWeight: '600', background: 'white',
            border: '1px solid var(--line)', borderRadius: '100px',
            padding: '4px 10px'
          }}>
            질문 {turns} · 최대 {MAX_TURNS}회
          </div>
        </div>
        <div style={{ padding: '0 20px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {character.name} {character.title}의 최근 모습입니다.<br />
          이 장면을 보며 한 번 더 확인해보고 싶은 것이 있나요?
        </div>
      </div>

      {/* 대화 영역 */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', paddingBottom: '4px' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '24px' }}>
            궁금한 것을 자유롭게 물어보세요.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'var(--accent)' : 'var(--card)',
            color: m.role === 'user' ? 'white' : 'var(--text-primary)',
            padding: '10px 14px',
            borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            maxWidth: '82%', fontSize: '0.88rem', lineHeight: '1.6',
            border: m.role === 'user' ? 'none' : '1px solid var(--line)',
            whiteSpace: 'pre-wrap'
          }}>
            <SafeBold text={m.content} />
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start', background: 'white',
            padding: '10px 14px', borderRadius: '4px 14px 14px 14px',
            color: 'var(--text-muted)', fontSize: '0.88rem',
            border: '1px solid var(--line)'
          }}>
            ...
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* 입력 영역 — 하단 고정 */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'var(--bg)', padding: '12px 16px 20px',
        borderTop: '1px solid var(--line)'
      }}>
        {turns >= MAX_TURNS ? (
          <div style={{
            textAlign: 'center', padding: '12px',
            background: 'white', borderRadius: '12px',
            border: '1px solid var(--line)',
            fontSize: '0.85rem', color: 'var(--text-secondary)'
          }}>
            대화가 마무리됐어요. 공유 화면에서 팀원들과 논의해보세요.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '14px',
                border: '1.5px solid var(--line)', fontSize: '0.88rem',
                fontFamily: 'inherit', outline: 'none',
                resize: 'none', lineHeight: '1.5', maxHeight: '80px', overflowY: 'auto',
                background: 'white'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none',
                borderRadius: '100px', padding: '10px 18px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.88rem', flexShrink: 0,
                opacity: loading || !input.trim() ? 0.5 : 1
              }}
            >
              전송
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
