export default function HumanEdgeScreen({ humanEdgeResult, currentPlan }) {
  if (!humanEdgeResult) return <div className="page">로딩 중...</div>

  const { assistant_message, options, final_question } = humanEdgeResult

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>HUMAN EDGE</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>최종 결재</h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{assistant_message}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {(options || []).map((opt) => (
          <div key={opt.id} className="card" style={{
            padding: '24px',
            border: opt.id === 'OUR_PLAN' ? '2px solid var(--accent)' : '1px solid var(--line)'
          }}>
            {opt.id === 'OUR_PLAN' && (
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                ★ 우리 조의 선택
              </div>
            )}
            <h3 style={{ marginBottom: '12px', fontSize: '1rem' }}>{opt.title}</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{opt.plan_summary}</p>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--green)', marginBottom: '4px' }}>얻은 것</div>
              <div style={{ fontSize: '0.85rem' }}>{opt.gain}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--red)', marginBottom: '4px' }}>감수한 것</div>
              <div style={{ fontSize: '0.85rem' }}>{opt.tradeoff}</div>
            </div>
          </div>
        ))}
      </div>

      {final_question && (
        <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.7' }}>
            {final_question}
          </p>
        </div>
      )}
    </div>
  )
}