import { useState } from 'react'

const COMPANION_OPTIONS = ['윤서현 과장', '장미래 대리']

export default function HumanEdgeScreen({
  humanEdgeResult, currentPlan,
  selectedOption, setSelectedOption,
  priorityText, setPriorityText,
  tradeoffText, setTradeoffText,
  onComplete
}) {
  const [expandedId, setExpandedId] = useState(null)
  const [companion, setCompanion] = useState('')

  if (!humanEdgeResult) return <div className="page">로딩 중...</div>

  const { assistant_message, options, final_question, pattern } = humanEdgeResult
  const isP2 = (id) => {
    const opt = options?.find(o => o.id === id)
    return opt?.title?.includes('P2') || opt?.title?.includes('개인 배려')
  }

  const handleSelectOption = (opt) => {
    if (expandedId === opt.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(opt.id)
    if (!isP2(opt.id)) {
      setSelectedOption({ id: opt.id, title: opt.title })
      setCompanion('')
    } else {
      setSelectedOption(null)
      setCompanion('')
    }
  }

  const handleCompanionSelect = (c, opt) => {
    setCompanion(c)
    setSelectedOption({ id: opt.id, title: opt.title, companion: c })
  }

  const canProceed = !!selectedOption && priorityText.trim() && tradeoffText.trim()

  return (
    <div className="page fade-in">
      {/* 헤더 */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>HUMAN EDGE</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>판단 이어가기</h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-secondary)' }}>{assistant_message}</p>
      </div>

      {/* 3개 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {(options || []).map((opt) => {
          const isSelected = selectedOption?.id === opt.id
          const isExpanded = expandedId === opt.id
          const needsCompanion = isP2(opt.id)

          return (
            <div key={opt.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card" style={{
                padding: '20px',
                border: isSelected ? '2px solid var(--accent)' : isExpanded ? '2px solid #CBD5E1' : '1px solid var(--line)',
                flex: 1,
                transition: 'border 0.2s'
              }}>
                {opt.id === 'OUR_PLAN' && (
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                    ★ 우리 조가 만든 운영안
                  </div>
                )}
                <h3 style={{ marginBottom: '10px', fontSize: '0.95rem' }}>{opt.title}</h3>
                <p style={{ fontSize: '0.83rem', marginBottom: '14px', color: 'var(--text-secondary)' }}>{opt.plan_summary}</p>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--green)', marginBottom: '3px' }}>얻는 것</div>
                  <div style={{ fontSize: '0.83rem' }}>{opt.gain}</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--red)', marginBottom: '3px' }}>감수하는 것</div>
                  <div style={{ fontSize: '0.83rem' }}>{opt.tradeoff}</div>
                </div>

                {/* 선택 버튼 */}
                <button
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    width: '100%', padding: '9px',
                    background: isSelected ? 'var(--accent)' : 'white',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    border: isSelected ? 'none' : '1.5px solid var(--line)',
                    borderRadius: '10px', fontSize: '0.85rem',
                    fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer'
                  }}
                >
                  {isSelected ? '✓ 선택됨' : '이 안 선택하기'}
                </button>

                {/* P2 동행자 선택 — 인라인 확장 */}
                {needsCompanion && isExpanded && (
                  <div style={{ marginTop: '14px', padding: '14px', background: 'var(--bg)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                      김민준 대리와 함께 후발 출발할 팀원을 선택해주세요.
                    </div>
                    {COMPANION_OPTIONS.map(c => (
                      <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`companion-${opt.id}`}
                          value={c}
                          checked={companion === c}
                          onChange={() => handleCompanionSelect(c, opt)}
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span style={{ fontSize: '0.88rem' }}>{c}</span>
                      </label>
                    ))}
                    {!companion && (
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '4px' }}>
                        동행자를 선택해야 이 안을 최종 선택할 수 있어요.
                      </div>
                    )}
                  </div>
                )}
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

      {/* 최종 결재 버튼 */}
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
