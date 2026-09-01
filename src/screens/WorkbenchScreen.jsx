import { useState } from 'react'
import { FIXED_CONSTRAINTS } from '../data/constraints'
import { askPlan } from '../api'
import { evaluatePlan } from '../evaluate'
import UnreflectedPopup from '../components/UnreflectedPopup'
import SafeBold from '../components/SafeBold'

const PLAN_SYSTEM = `당신은 팀 워크숍 운영안을 조율하는 AI입니다.

[팀 구성 — 이름과 직급을 정확히 사용하십시오]
- 이수진 과장
- 윤서현 과장
- 김민준 대리
- 최지원 대리
- 장미래 대리
- 박준혁 주임

[고정 제약 조건 — 절대 변경 불가]
- 출발지: 서울 공덕 본사 / 목적지: 경기 양평 (이동 약 90분)
- 일정: 금~토 1박 2일 (날짜 변경 불가)
- 기본 출발: 금요일 13:00 / 복귀: 토요일 16:30까지
- 총예산: 120만원 / 숙소: 2인 1실 × 3개
- 물레 도자기: 금요일 16:00~18:00, 6명 예약, 24만원, 취소·시간변경 불가

[운영 원칙]
1. 팀원이 전달한 사정만 반영하십시오.
2. 변경 사항이 있으면 무엇이 왜 바뀌었는지 설명하십시오.
3. 응답은 반드시 아래 JSON 형식으로만 출력하십시오.
4. 사용자를 특정 팀원 이름으로 절대 부르지 마십시오. 사용자는 조 전체입니다.
5. 확인이 필요한 사항이 있어도 일정은 반드시 업데이트하십시오. 미확정 항목은 current_plan의 unconfirmed 배열에 넣으십시오.

{"assistant_message":"조원에게 보여줄 응답","input_status":"APPLIED","clarifying_question":null,"changes":[{"section":"schedule","summary":"변경내용"}],"current_plan":{"day1":[{"time":"HH:MM","activity":"활동"}],"day2":[{"time":"HH:MM","activity":"활동"}],"rooms":[{"room":1,"members":["이름"]}],"transport":"이동수단","transport_groups":null,"program_notes":null,"unconfirmed":[]}}`

const conditionToCharacter = { C1: 'a', C2: 'b', C3: 'c', C4: 'd' }

export default function WorkbenchScreen({ currentPlan, setCurrentPlan, messages, setMessages, onEvaluate }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [unreflectedKeys, setUnreflectedKeys] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupShown, setPopupShown] = useState(false)

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
      if (data.current_plan) setCurrentPlan(data.current_plan)
      const reply = data.assistant_message || '처리했습니다.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply, display: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했습니다.', display: '오류가 발생했습니다.' }])
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
        gridTemplateColumns: '1fr 1.5fr',
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
            <h3 style={{ marginBottom: '12px', fontSize: '0.95rem', flexShrink: 0 }}>📅 현재 운영안</h3>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: '700' }}>1일차</div>
                {(currentPlan.day1 || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px', fontSize: '0.83rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '38px', flexShrink: 0 }}>{item.time}</span>
                    <span>{item.activity}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: '700' }}>2일차</div>
                {(currentPlan.day2 || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px', fontSize: '0.83rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '38px', flexShrink: 0 }}>{item.time}</span>
                    <span>{item.activity}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: '700' }}>숙박</div>
                {(currentPlan.rooms || []).map((r, i) => (
                  <div key={i} style={{ fontSize: '0.83rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: '600' }}>방 {r.room}</span>: {(r.members || []).join(', ')}
                  </div>
                ))}
              </div>
              {currentPlan.program_notes && (
                <div style={{ padding: '8px 10px', background: 'var(--blue-soft)', borderRadius: '8px', fontSize: '0.82rem', marginTop: '8px' }}>
                  📝 {currentPlan.program_notes}
                </div>
              )}
              {(currentPlan.unconfirmed || []).length > 0 && (
                <div style={{ padding: '8px 10px', background: 'var(--yellow-soft)', borderRadius: '8px', fontSize: '0.82rem', color: '#92400E', marginTop: '8px' }}>
                  ⏳ 미확정: {currentPlan.unconfirmed.join(', ')}
                </div>
              )}
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
          <h3 style={{ marginBottom: '10px', fontSize: '0.95rem', flexShrink: 0 }}>🤖 AI와 조율하기</h3>

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
          </div>

          {/* 입력 영역 */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !showPopup && sendMessage()}
                placeholder={showPopup ? '아래 인물과 대화 후 입력해주세요' : '팀원의 상황을 입력하세요...'}
                disabled={showPopup}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '100px',
                  border: '1.5px solid var(--line)', fontSize: '0.88rem',
                  fontFamily: 'inherit', outline: 'none',
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