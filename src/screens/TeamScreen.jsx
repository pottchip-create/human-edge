export default function TeamScreen({ onNext }) {
  const members = [
  { name: '이수진', title: '과장', initial: '이', color: '#4A7FA5' },
  { name: '윤서현', title: '과장', initial: '윤', color: '#6B7280' },
  { name: '김민준', title: '대리', initial: '김', color: '#F45A2A' },
  { name: '최지원', title: '대리', initial: '최', color: '#8A5A8A' },
  { name: '장미래', title: '대리', initial: '장', color: '#6B7280' },
  { name: '박준혁', title: '주임', initial: '박', color: '#5A8A5A' },
]

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 1</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>사업기획팀을 소개합니다</h2>
        <p>워크숍을 함께 준비할 팀원들이에요.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {members.map((m) => (
          <div key={m.name} className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: m.color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: '700', margin: '0 auto 12px'
            }}>
              {m.initial}
            </div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{m.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.title}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={onNext}>AI 초안 보기 →</button>
      </div>
    </div>
  )
}