import { useState } from 'react'
import { CHARACTERS } from '../data/characters'
import { askCharacter } from '../api'

export default function UnreflectedPopup({ unreflectedKeys, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [chatOpenMap, setChatOpenMap] = useState({})
  const [messagesMap, setMessagesMap] = useState({})
  const [inputMap, setInputMap] = useState({})
  const [loadingMap, setLoadingMap] = useState({})
  const [turnsMap, setTurnsMap] = useState({})
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

  const sendMessage = async () => {
    if (!input.trim() || loading || turns >= MAX_TURNS) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessagesMap(m => ({ ...m, [currentKey]: newMessages }))
    setInput('')
    setLoadingMap(m => ({ ...m, [currentKey]: true }))
    try {
      const data = await askCharacter(currentKey, newMessages, CHARACTERS)
      setMessagesMap(m => ({ ...m, [currentKey]: [...newMessages, { role: 'assistant', content: data.message }] }))
      setTurnsMap(m => ({ ...m, [currentKey]: turns + 1 }))
    } catch {
      setMessagesMap(m => ({ ...m, [currentKey]: [...newMessages, { role: 'assistant', content: '오류가 발생했습니다.' }] }))
    } finally {
      setLoadingMap(m => ({ ...m, [currentKey]: false }))
    }
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', pointerEvents: 'none'
    }}>
      <div style={{ width: '100%', maxWidth: '960px', padding: '0 16px', pointerEvents: 'auto' }}>

        {/* 인물 카드 */}
        <div style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          border: `2px solid ${character.color}30`,
          borderBottom: chatOpen ? 'none' : undefined,
          borderRadius: chatOpen ? '20px 20px 0 0' : '20px 20px 0 0',
          padding: '20px 24px',
          display: 'flex', alignItems: 'flex-end', gap: '20px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)'
        }}>

          {/* 인물 이미지 */}
          <div style={{ width: '110px', flexShrink: 0, alignSelf: 'flex-end' }}>
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

        {/* 챗봇 */}
        {chatOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.98)',
            borderLeft: `2px solid ${character.color}30`,
            borderRight: `2px solid ${character.color}30`,
            padding: '0 24px 16px', pointerEvents: 'auto'
          }}>
            <div style={{
              height: '180px', overflowY: 'auto',
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
                  maxWidth: '80%', fontSize: '0.88rem', lineHeight: '1.55'
                }}>
                  <span dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: '#F3F4F6', padding: '8px 12px', borderRadius: '4px 12px 12px 12px', color: '#9CA3AF', fontSize: '0.88rem' }}>
                  ...
                </div>
              )}
            </div>
            {turns < MAX_TURNS ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="질문을 입력하세요..."
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: '100px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.88rem',
                    fontFamily: 'inherit', outline: 'none'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    background: character.color, color: 'white',
                    border: 'none', borderRadius: '100px', padding: '9px 18px',
                    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                    opacity: loading || !input.trim() ? 0.5 : 1, fontSize: '0.88rem'
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