import { useState, useRef, useEffect } from 'react'
import { FIXED_CONSTRAINTS } from '../data/constraints'
import { askPlan } from '../api'
import { evaluatePlan } from '../evaluate'
import UnreflectedPopup from '../components/UnreflectedPopup'
import SafeBold from '../components/SafeBold'
import CurrentPlanCard from '../components/CurrentPlanCard'

// 실제 프롬프트는 api/plan.js에서 관리합니다

const conditionToCharacter = { C1: 'a', C2: 'b', C3: 'c', C4: 'd' }

export default function WorkbenchScreen({ currentPlan, setCurrentPlan, messages, setMessages, onEvaluate }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [unreflectedKeys, setUnreflectedKeys] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupShown, setPopupShown] = useState(false)
  const chatBottomRef = useRef(null)
  const [highlightKeys, setHighlightKeys] = useState([])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || showPopup) return
    const userMsg = { role: 'user', content: input }
    const historyMessages = messages.map(m => ({ role: m.role, content: m.content }))
    const newHistory = [...historyMessages, userMsg]
    setMessages([...messages, { role: 'user', content: input, display: input }])
    setInput('')
    setLoading(true)
    try {
      const data = await askPlan(newHistory, currentPlan)
      if (data.current_plan) {
        // 변경된 섹션 감지 → soft coral 강조
        const changed = []
        const np = data.current_plan
        if (JSON.stringify(np.day1) !== JSON.stringify(currentPlan.day1)) changed.push('day1')
        if (JSON.stringify(np.day2) !== JSON.stringify(currentPlan.day2)) changed.push('day2')
        if (JSON.stringify(np.rooms) !== JSON.stringify(currentPlan.rooms)) changed.push('rooms')
        if (JSON.stringify(np.transport_groups) !== JSON.stringify(currentPlan.transport_groups)) changed.push('transport_groups')
        if (np.transport !== currentPlan.transport) changed.push('transport')
        setCurrentPlan(np)
        if (changed.length > 0) setHighlightKeys(changed)
      }
      const reply = data.assistant_message || '처리했습니다.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply, display: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했습니다. 로컬 개발 시에는 vercel dev로 실행하거나 배포된 URL에서 테스트해주세요.', display: '오류가 발생했습니다. 로컬 개발 시에는 vercel dev로 실행하거나 배포된 URL에서 테스트해주세요.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = () => {
    if (showPopup) return
    setEvaluating(true)
    const result = evaluatePlan(currentPlan)
    const unref = Object.entries(result.conditions)
      .filter(([, v]) => v.status === 'FAIL' || v.status === 'UNKNOWN' || v.status === 'PARTIAL')
      .map(([k]) => conditionToCharacter[k])

    if (result.overall === 'PASS') {
      onEvaluate(result.conditions)
    } else {
      setUnreflectedKeys(unref)
      setShowPopup(true)
      setPopupShown(true)
    }
    setEvaluating(false)
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg)'
    }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 40px 12px', flexShrink: 0 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 4</span>
        <h2 style={{ marginTop: '4px', marginBottom: '0' }}>운영안 조율</h2>
      </div>

      {/* 본문 — 고정 높이 2열 */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '20px',
        padding: '0 40px 20px',
        minHeight: 0
      }}>

        {/* 좌측: 현재 운영안 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>

          {/* 운영안 카드 — 스크롤 */}
          <div className="card" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '18px',
            minHeight: 0
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em', flexShrink: 0 }}>CURRENT PLAN</h3>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <CurrentPlanCard plan={currentPlan} mode="live" highlightKeys={highlightKeys} />
            </div>
          </div>

          {/* 고정 조건 */}
          <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', padding: '12px 14px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>⚠️ 고정 조건</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              총예산 {FIXED_CONSTRAINTS.totalBudget}만원 · 도자기 클래스 취소 시 24만원 청구
            </div>
          </div>

          {popupShown && !showPopup && (
            <button
              onClick={() => setShowPopup(true)}
              style={{
                background: 'white', color: '#374151',
                border: '1.5px solid #E5E7EB', borderRadius: '12px',
                padding: '10px 14px', fontSize: '0.83rem',
                fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer',
                textAlign: 'left', flexShrink: 0
              }}
            >
              💬 미반영 인물 다시 확인하기
            </button>
          )}
        </div>

        {/* 우측: 채팅 */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '18px',
          minHeight: 0
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em', flexShrink: 0 }}>AI와 조율하기</h3>

          {showPopup && (
            <div style={{
              background: 'var(--yellow-soft)', border: '1px solid #FFE0A0',
              borderRadius: '10px', padding: '9px 12px',
              fontSize: '0.83rem', color: '#92400E',
              marginBottom: '10px', flexShrink: 0
            }}>
              💬 먼저 아래 인물과 대화를 마친 후 입력해주세요.
            </div>
          )}

          {/* 메시지 목록 — 스크롤 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '12px',
            minHeight: 0
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '40px' }}>
                팀원들과 나눈 내용을 알려주세요.<br />한 사람씩 이야기해도 좋아요.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '9px 13px',
                borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                maxWidth: '85%', fontSize: '0.88rem', lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                <SafeBold text={m.display} />
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg)', padding: '9px 13px', borderRadius: '4px 14px 14px 14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                검토 중...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* 입력 영역 */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={showPopup ? '아래 인물과 대화 후 입력해주세요' : '팀원의 상황을 입력하세요… (Shift+Enter 줄바꿈)'}
                disabled={showPopup}
                rows={1}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '16px',
                  border: '1.5px solid var(--line)', fontSize: '0.88rem',
                  fontFamily: 'inherit', outline: 'none', resize: 'none',
                  lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto',
                  opacity: showPopup ? 0.5 : 1,
                  background: showPopup ? '#F9FAFB' : 'white'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || showPopup}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.88rem', opacity: showPopup ? 0.5 : 1 }}
              >
                전송
              </button>
            </div>
            <button
              onClick={handleEvaluate}
              disabled={evaluating || loading || showPopup}
              className="btn-secondary"
              style={{ width: '100%', padding: '11px', opacity: showPopup ? 0.5 : 1 }}
            >
              {evaluating ? '검토 중...' : '📋 운영안 검토 요청'}
            </button>
          </div>
        </div>
      </div>

      {showPopup && unreflectedKeys.length > 0 && (
        <UnreflectedPopup
          unreflectedKeys={unreflectedKeys}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  )
}