import { useState } from 'react'

export default function HumanEdgeScreen({
  humanEdgeResult, currentPlan,
  selectedOption, setSelectedOption,
  priorityText, setPriorityText,
  tradeoffText, setTradeoffText,
  onComplete
}) {
  const [expandedId, setExpandedId] = useState(null)

  if (!humanEdgeResult) return <div className="page">로딩 중...</div>

  const { assistant_message, options, final_question } = humanEdgeResult
  const cardCount = (options || []).length  // 2 또는 3

  const handleSelectOption = (opt) => {
    if (expandedId === opt.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(opt.id)
    setSelectedOption({ id: opt.id, title: opt.title || opt.label })
  }

  const isSelected = (id) => selectedOption?.id === id
  const canProceed = !!selectedOption && priorityText.trim() && tradeoffText.trim()

  return (
    <div className="page fade-in">
      {/* 헤더 */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>HUMAN EDGE</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>판단 이어가기</h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-secondary)' }}>{assistant_message}</p>
      </div>

      {/* 비교 카드 — 2개 또는 3개 유연 grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cardCount}, 1fr)`,
        gap: '16px',
        marginBottom: '32px'
      }}>
        {(options || []).map((opt) => {
          const selected = isSelected(opt.id)
          const label = opt.id === 'OUR_PLAN'
            ? '우리 조가 만든 운영안'
            : (opt.label || opt.title || '')

          return (
            <div key={opt.id} className="card" style={{
              padding: '20px',
              border: selected ? '2px solid var(--accent)' : '1px solid var(--line)',
              transition: 'border 0.2s',
              display: 'flex', flexDirection: 'column'
            }}>
              {opt.id === 'OUR_PLAN' && (
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  ★ 우리 조가 만든 운영안
                </div>
              )}

              {/* 카드 제목 (P1/P3 라벨은 개발용이므로 UI에선 label 사용) */}
              <h3 style={{ marginBottom: '10px', fontSize: '0.92rem', lineHeight: '1.4' }}>{label}</h3>
              <p style={{ fontSize: '0.82rem', marginBottom: '14px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{opt.plan_summary}</p>

              {/* 3요소: 우선 / 얻음 / 감수 */}
              {opt.priority && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '3px', letterSpacing: '0.04em' }}>우선하는 것</div>
                  <div style={{ fontSize: '0.82rem' }}>{opt.priority}</div>
                </div>
              )}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px', letterSpacing: '0.04em' }}>얻는 것</div>
                <div style={{ fontSize: '0.82rem' }}>{opt.gain}</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px', letterSpacing: '0.04em' }}>감수하는 것</div>
                <div style={{ fontSize: '0.82rem' }}>{opt.tradeoff}</div>
              </div>

              {opt.needs_confirmation?.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#F59E0B', marginBottom: '12px' }}>
                  ⚠ {opt.needs_confirmation.join(', ')}
                </div>
              )}

              {/* 선택 버튼 */}
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    width: '100%', padding: '9px',
                    background: selected ? 'var(--accent)' : 'white',
                    color: selected ? 'white' : 'var(--text-primary)',
                    border: selected ? 'none' : '1.5px solid var(--line)',
                    borderRadius: '10px', fontSize: '0.85rem',
                    fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer'
                  }}
                >
                  {selected ? '✓ 선택됨' : '이 안 선택하기'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 우선/감수 입력 */}
      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '0.95rem' }}>우리 조의 결정을 정리해주세요</h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
            우리가 가장 우선한 것은
          </label>
          <textarea
            value={priorityText}
            onChange={e => setPriorityText(e.target.value)}
            placeholder="직접 작성해주세요"
            rows={2}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1.5px solid var(--line)', borderRadius: '10px',
              fontSize: '0.88rem', fontFamily: 'inherit',
              resize: 'none', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
            그 대신 감수하기로 한 것은
          </label>
          <textarea
            value={tradeoffText}
            onChange={e => setTradeoffText(e.target.value)}
            placeholder="직접 작성해주세요"
            rows={2}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1.5px solid var(--line)', borderRadius: '10px',
              fontSize: '0.88rem', fontFamily: 'inherit',
              resize: 'none', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Final Question */}
      {final_question && (
        <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.7', margin: 0 }}>
            {final_question}
          </p>
        </div>
      )}

      {/* 최종 결재 */}
      <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
        {!canProceed && (
          <p style={{ fontSize: '0.83rem', color: '#9CA3AF', marginBottom: '12px' }}>
            운영안을 선택하고 두 항목을 모두 입력해야 최종 결재가 가능합니다.
          </p>
        )}
        <button
          className="btn-primary"
          onClick={onComplete}
          disabled={!canProceed}
          style={{ fontSize: '1rem', padding: '14px 40px', opacity: canProceed ? 1 : 0.4 }}
        >
          최종 결재
        </button>
      </div>
    </div>
  )
}
