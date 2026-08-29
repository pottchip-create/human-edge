import { useState } from 'react'
import { FIXED_CONSTRAINTS } from '../data/constraints'
import { askPlan } from '../api'
import { evaluatePlan } from '../evaluate'
import UnreflectedPopup from '../components/UnreflectedPopup'

const PLAN_SYSTEM = `당신은 팀 워크숍 운영안을 조율하는 AI입니다.

[팀 구성 — 이름과 직급을 정확히 사용하십시오]
- 오준혁 팀장
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
      const data = await askPlan(newHistory, currentPlan, PLAN_SYSTEM)
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
    <div className="page fade-in" style={{ paddingBottom: showPopup ? '340px' : '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 4</span>
        <h2 style={{ marginTop: '8px', marginBottom: '4px' }}>운영안 조율</h2>
        <p>발견한 내용을 AI에게 전달해 운영안을 다듬어보세요.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>

        {/* 좌측: 현재 운영안 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1rem' }}>📅 현재 운영안</h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>1일차</div>
              {(currentPlan.day1 || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '40px' }}>{item.time}</span>
                  <span>{item.activity}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>2일차</div>
              {(currentPlan.day2 || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '40px' }}>{item.time}</span>
                  <span>{item.activity}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>숙박</div>
              {(currentPlan.rooms || []).map((r, i) => (
                <div key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>방 {r.room}</span>: {(r.members || []).join(', ')}
                </div>
              ))}
            </div>
            {currentPlan.program_notes && (
              <div style={{ marginTop: '12px', padding: '10px', background: 'var(--blue-soft)', borderRadius: '8px', fontSize: '0.85rem' }}>
                📝 {currentPlan.program_notes}
              </div>
            )}
            {(currentPlan.unconfirmed || []).length > 0 && (
              <div style={{ marginTop: '12px', padding: '10px', background: 'var(--yellow-soft)', borderRadius: '8px', fontSize: '0.85rem', color: '#92400E' }}>
                ⏳ 미확정: {currentPlan.unconfirmed.join(', ')}
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>⚠️ 고정 조건</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              총예산 {FIXED_CONSTRAINTS.totalBudget}만원<br />
              도자기 클래스 취소 시 24만원 청구
            </div>
          </div>

          {popupShown && !showPopup && (
            <button
              onClick={() => setShowPopup(true)}
              style={{
                background: 'white', color: '#374151',
                border: '1.5px solid #E5E7EB', borderRadius: '12px',
                padding: '10px 16px', fontSize: '0.85rem',
                fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              💬 미반영 인물 다시 확인하기
            </button>
          )}
        </div>

        {/* 우측: 채팅 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>🤖 AI와 조율하기</h3>

          {showPopup && (
            <div style={{
              background: 'var(--yellow-soft)', border: '1px solid #FFE0A0',
              borderRadius: '10px', padding: '10px 14px',
              fontSize: '0.85rem', color: '#92400E', marginBottom: '12px'
            }}>
              💬 먼저 아래 인물과 대화를 마친 후 입력해주세요.
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', height: '360px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '60px' }}>
                팀원들과 나눈 내용을 알려주세요.<br />한 사람씩 이야기해도 좋아요.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '10px 14px', borderRadius: '16px',
                maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                <span dangerouslySetInnerHTML={{ __html: m.display.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg)', padding: '10px 14px', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                검토 중...
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !showPopup && sendMessage()}
              placeholder={showPopup ? '아래 인물과 대화 후 입력해주세요' : '팀원의 상황을 입력하세요...'}
              disabled={showPopup}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '100px',
                border: '1.5px solid var(--line)', fontSize: '0.9rem',
                fontFamily: 'inherit', outline: 'none',
                opacity: showPopup ? 0.5 : 1,
                background: showPopup ? '#F9FAFB' : 'white'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || showPopup}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem', opacity: showPopup ? 0.5 : 1 }}
            >
              전송
            </button>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluating || loading || showPopup}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px', opacity: showPopup ? 0.5 : 1 }}
          >
            {evaluating ? '검토 중...' : '📋 운영안 검토 요청'}
          </button>
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