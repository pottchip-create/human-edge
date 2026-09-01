export default function TeamScreen({ onNext }) {
  const members = [
    { name: '이수진', title: '과장', years: '입사 12년차', role: '예산·운영 총괄', initial: '이', color: '#4A7FA5' },
    { name: '윤서현', title: '과장', years: '입사 8년차', role: '일정·대외 담당', initial: '윤', color: '#6B7280' },
    { name: '김민준', title: '대리', years: '입사 5년차', role: '대외행사 운영', initial: '김', color: '#F45A2A' },
    { name: '최지원', title: '대리', years: '입사 5년차', role: '숙박·행정 지원', initial: '최', color: '#8A5A8A' },
    { name: '장미래', title: '대리', years: '입사 4년차', role: '콘텐츠 기획', initial: '장', color: '#6B7280' },
    { name: '박준혁', title: '주임', years: '입사 2년차', role: '프로그램 운영 지원', initial: '박', color: '#5A8A5A' },
  ]

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 1</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>사업기획팀을 소개합니다</h2>
        <p>워크숍을 함께 준비할 팀원 6명이에요. AI는 이들의 개인 사정을 모릅니다.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {members.map((m) => (
          <div key={m.name} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: m.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: '700', flexShrink: 0
              }}>
                {m.initial}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem' }}>{m.name} <span style={{ fontWeight: '400', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{m.title}</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.years}</div>
              </div>
            </div>
            <div style={{
              fontSize: '0.82rem', color: 'var(--text-secondary)',
              background: 'var(--bg)', borderRadius: '8px',
              padding: '8px 10px'
            }}>
              {m.role}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={onNext}>AI 프롬프트 확인하기 →</button>
      </div>
    </div>
  )
}
