export default function HumanEdgeScreen({
  humanEdgeResult, currentPlan,
  selectedOption, setSelectedOption,
  priorityText, setPriorityText,
  tradeoffText, setTradeoffText,
  onComplete
}) {
  if (!humanEdgeResult) return <div className="page">불러오는 중…</div>

  const { assistant_message, options, final_question } = humanEdgeResult
  const cards = options || []

  // 선택 시 approvedPlan까지 함께 확정
  // OUR_PLAN → currentPlan / P1 → STATIC_P1.plan / P3 → STATIC_P3.plan
  const handleSelect = (opt) => {
    const approvedPlan = opt.id === 'OUR_PLAN' ? currentPlan : (opt.plan || currentPlan)
    const newOption = {
      id: opt.id,
      title: opt.id === 'OUR_PLAN' ? '우리 조가 만든 운영안' : (opt.label || opt.title),
      approvedPlan
    }
    // 다른 안으로 변경되면 우선/감수 입력 초기화
    if (selectedOption && selectedOption.id !== opt.id) {
      setPriorityText('')
      setTradeoffText('')
    }
    setSelectedOption(newOption)
  }

  const isSelected = (id) => selectedOption?.id === id
  const canProceed = !!selectedOption && priorityText.trim() && tradeoffText.trim()

  const ROWS = [
    { key: 'priority', label: '우선\n하는 것', accent: true },
    { key: 'gain',     label: '얻는\n것',     accent: false },
    { key: 'tradeoff', label: '감수\n하는 것', accent: false },
  ]

  const gridCols = `92px repeat(${cards.length}, minmax(0, 1fr))`

  return (
    <div className="page fade-in">
      <div className="step-header">
        <span className="step-brand">HUMAN EDGE · 사수의 결재판</span>
        <span className="step-label">STEP 5 · 판단하고 결재하기</span>
        <h2 className="step-title">어떤 선택이 가능한지 비교하기</h2>
        <p className="step-desc" style={{ whiteSpace: 'pre-wrap' }}>{assistant_message}</p>
      </div>

      {/* D안 세로 대비형 — 우선·얻음·감수가 같은 행에서 읽힘 */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>

        {/* 카드 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px', alignItems: 'end', marginBottom: '14px' }}>
          <div />
          {cards.map(opt => {
            const ours = opt.id === 'OUR_PLAN'
            return (
              <div key={opt.id} style={{
                border: isSelected(opt.id) ? '2px solid var(--accent)' : '1px solid var(--line)',
                borderRadius: '12px', padding: '14px 14px 12px',
                background: 'var(--card)', transition: 'border 0.2s'
              }}>
                <div style={{ fontSize: '0.68rem', color: ours ? 'var(--accent)' : 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  {ours ? '우리 조' : '비교안'}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '600', lineHeight: '1.4', marginBottom: '6px' }}>
                  {ours ? '우리 조가 만든 운영안' : (opt.label || opt.title)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                  {opt.plan_summary}
                </div>
              </div>
            )
          })}
        </div>

        {/* 3요소 비교 행 */}
        {ROWS.map(row => (
          <div key={row.key} style={{
            display: 'grid', gridTemplateColumns: gridCols, gap: '12px',
            padding: '14px 0', borderTop: '1px solid var(--line)'
          }}>
            <div style={{
              fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'pre-line', lineHeight: '1.45',
              color: row.accent ? 'var(--accent)' : 'var(--text-secondary)'
            }}>{row.label}</div>
            {cards.map(opt => (
              <div key={opt.id} style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                {opt[row.key]}
              </div>
            ))}
          </div>
        ))}

        {/* 선택 버튼 행 */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <div />
          {cards.map(opt => (
            <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => handleSelect(opt)} style={{
                padding: '10px',
                background: isSelected(opt.id) ? 'var(--accent)' : 'var(--card)',
                color: isSelected(opt.id) ? 'white' : 'var(--text-primary)',
                border: isSelected(opt.id) ? 'none' : '1.5px solid var(--line)',
                borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600',
                fontFamily: 'inherit', cursor: 'pointer'
              }}>
                {isSelected(opt.id) ? '선택됨' : '이 안 선택하기'}
              </button>
              {/* P1(OPTION_B) 비교안: 김민준 별도 이동수단이 미확정이면 표시 */}
              {opt.id === 'OPTION_B' && (opt.needs_confirmation || []).length > 0 && (
                <div style={{ fontSize: '0.72rem', color: '#B45309',
                  background: '#FFFBEB', padding: '5px 9px', borderRadius: '8px', lineHeight: '1.5' }}>
                  확인 필요 · {opt.needs_confirmation.join(' / ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 우선/감수 입력 */}
      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div className="section-sub">우리 조의 결정</div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px' }}>
            우리가 가장 우선한 것은
          </label>
          <textarea
            value={priorityText}
            onChange={e => setPriorityText(e.target.value)}
            placeholder="직접 작성해주세요"
            rows={2}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid var(--line)', borderRadius: '10px',
              fontSize: '0.9rem', fontFamily: 'inherit',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
              background: 'var(--bg)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px' }}>
            그 대신 감수하기로 한 것은
          </label>
          <textarea
            value={tradeoffText}
            onChange={e => setTradeoffText(e.target.value)}
            placeholder="직접 작성해주세요"
            rows={2}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid var(--line)', borderRadius: '10px',
              fontSize: '0.9rem', fontFamily: 'inherit',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
              background: 'var(--bg)'
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
        {!canProceed && (
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            운영안을 선택하고 두 항목을 모두 입력하면 결재할 수 있습니다.
          </p>
        )}
        <button
          className="btn-primary"
          onClick={onComplete}
          disabled={!canProceed}
          style={{ fontSize: '1rem', padding: '14px 40px', opacity: canProceed ? 1 : 0.35, cursor: canProceed ? 'pointer' : 'not-allowed' }}
        >
          최종 결재
        </button>
      </div>
    </div>
  )
}
