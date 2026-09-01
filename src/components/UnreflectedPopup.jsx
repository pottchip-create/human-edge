import { useState, useRef, useEffect } from 'react'
import { CHARACTERS } from '../data/characters'
import { askCharacter } from '../api'
import SafeBold from './SafeBold'

export default function UnreflectedPopup({ unreflectedKeys, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [chatOpenMap, setChatOpenMap] = useState({})
  const [messagesMap, setMessagesMap] = useState({})
  const [inputMap, setInputMap] = useState({})
  const [loadingMap, setLoadingMap] = useState({})
  const [turnsMap, setTurnsMap] = useState({})
  const chatBottomRef = useRef(null)
  const MAX_TURNS = 5

  if (!unreflectedKeys || unreflectedKeys.length === 0) return null

  const currentKey = unreflectedKeys[currentIdx]
  const character = CHARACTERS[currentKey]
  if (!character) return null

  const chatOpen = chatOpenMap[currentKey] || false
  const messages = messagesMap[currentKey] || []
  const input = inputMap[currentKey] || ''
  const loading = loadingMap[currentKey] || false
  const turns = turnsMap[currentKey] || 0

  const setInput = (v) => setInputMap(m => ({ ...m, [currentKey]: v }))

  const openChat = () => setChatOpenMap(m => ({ ...m, [currentKey]: true }))

  // 메시지/로딩 변경 시 자동 스크롤
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, chatOpen])

  const sendMessage = async () => {
    if (!input.trim() || loading || turns >= MAX_TURNS) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessagesMap(m => ({ ...m, [currentKey]: newMessages }))
    setInput('')
    setLoadingMap(m => ({ ...m, [currentKey]: true }))
    try {
      const data = await askCharacter(currentKey, newMessages, turns)
      setMessagesMap(m => ({ ...m, [currentKey]: [...newMessages, { role: 'assistant', content: data.message }] }))
      setTurnsMap(m => ({ ...m, [currentKey]: turns + 1 }))
    } catch {
      setMessagesMap(m => ({ ...m, [currentKey]: [...newMessages, { role: 'assistant', content: '오류가 발생했습니다.' }] }))
    } finally {
      setLoadingMap(m => ({ ...m, [currentKey]: false }))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', pointerEvents: 'none',
      maxHeight: '100vh', overflowY: 'auto'
    }}>
      <div style={{ width: '100%', maxWidth: '960px', padding: '0 16px', pointerEvents: 'auto' }}>

        {/* 상황 사진 — 대화 시작 후에만, 상단 가로 꽉 차게 크게 */}
        {chatOpen && (
          <div style={{
            width: '100%', height: '175px', overflow: 'hidden',
            borderRadius: '20px 20px 0 0',
            border: `2px solid ${character.color}30`,
            borderBottom: 'none'
          }}>
            <img
              src={character.situationImage}
              alt={`${character.name} 상황`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.parentElement.style.display = 'none' }}
            />
          </div>
        )}

        {/* 인물 카드 */}
        <div style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          border: `2px solid ${character.color}30`,
          borderTop: chatOpen ? 'none' : undefined,
          borderBottom: chatOpen ? 'none' : undefined,
          borderRadius: chatOpen ? '0' : '20px 20px 0 0',
          padding: '16px 24px 20px',
          display: 'flex', alignItems: 'flex-end', gap: '16px',
          boxShadow: chatOpen ? 'none' : '0 -8px 32px rgba(0,0,0,0.12)'
        }}>

          {/* 미반영 표정 이미지 */}
          <div style={{ width: '80px', flexShrink: 0 }}>
            <img
              src={character.unreflectedImage}
              alt={character.name}
              style={{ width: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* 말풍선 + 버튼 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: character.color }}>
                {character.name} {character.title}
              </span>
              {unreflectedKeys.length > 1 && (
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  {currentIdx + 1} / {unreflectedKeys.length}
                </span>
              )}
            </div>

            {/* 말풍선 */}
            <div style={{
              background: character.bgColor,
              border: `1.5px solid ${character.color}40`,
              borderRadius: '4px 16px 16px 16px',
              padding: '12px 16px', fontSize: '0.93rem',
              lineHeight: '1.65', color: '#222', marginBottom: '14px'
            }}>
              {character.unreflectedMsg}
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {unreflectedKeys.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    style={{
                      background: 'white', color: '#6B7280',
                      border: '1.5px solid #E5E7EB', borderRadius: '100px',
                      padding: '8px 14px', fontSize: '0.85rem',
                      fontFamily: 'inherit', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentIdx === 0 ? 0.4 : 1
                    }}
                  >← 이전</button>
                  <button
                    onClick={() => setCurrentIdx(i => Math.min(unreflectedKeys.length - 1, i + 1))}
                    disabled={currentIdx === unreflectedKeys.length - 1}
                    style={{
                      background: 'white', color: '#6B7280',
                      border: '1.5px solid #E5E7EB', borderRadius: '100px',
                      padding: '8px 14px', fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      cursor: currentIdx === unreflectedKeys.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: currentIdx === unreflectedKeys.length - 1 ? 0.4 : 1
                    }}
                  >다음 →</button>
                </>
              )}
              {!chatOpen && (
                <button onClick={openChat} style={{
                  background: character.color, color: 'white',
                  border: 'none', borderRadius: '100px',
                  padding: '8px 18px', fontSize: '0.85rem',
                  fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer'
                }}>
                  이 사람과 대화해보기
                </button>
              )}
              <button onClick={onClose} style={{
                background: 'white', color: '#374151',
                border: '1.5px solid #E5E7EB', borderRadius: '100px',
                padding: '8px 18px', fontSize: '0.85rem',
                fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer'
              }}>
                운영안으로 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* 챗봇 영역 */}
        {chatOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.98)',
            border: `2px solid ${character.color}30`,
            borderTop: 'none',
            padding: '0 24px 16px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)'
          }}>
            {/* 메시지 목록 — 스크롤, 하단 고정 */}
            <div style={{
              height: '200px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
              gap: '8px', paddingTop: '12px', marginBottom: '10px'
            }}>
              {messages.length === 0 && (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem', marginTop: '30px' }}>
                  궁금한 것을 물어보세요.
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? character.color : '#F3F4F6',
                  color: m.role === 'user' ? 'white' : '#111318',
                  padding: '8px 12px',
                  borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  maxWidth: '80%', fontSize: '0.88rem', lineHeight: '1.55',
                  whiteSpace: 'pre-wrap'
                }}>
                  <SafeBold text={m.content} />
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: '#F3F4F6', padding: '8px 12px', borderRadius: '4px 12px 12px 12px', color: '#9CA3AF', fontSize: '0.88rem' }}>
                  ...
                </div>
              )}
              {/* 자동 스크롤 앵커 */}
              <div ref={chatBottomRef} />
            </div>

            {/* 입력 */}
            {turns < MAX_TURNS ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="질문을 입력하세요… (Shift+Enter 줄바꿈)"
                  rows={1}
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: '16px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.88rem',
                    fontFamily: 'inherit', outline: 'none',
                    resize: 'none', lineHeight: '1.5',
                    maxHeight: '80px', overflowY: 'auto'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    background: character.color, color: 'white',
                    border: 'none', borderRadius: '100px', padding: '9px 18px',
                    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                    opacity: loading || !input.trim() ? 0.5 : 1, fontSize: '0.88rem',
                    flexShrink: 0
                  }}
                >전송</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px', background: '#FEFCE8', borderRadius: '8px', fontSize: '0.85rem', color: '#92400E' }}>
                💡 충분히 이야기를 나눴어요.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
