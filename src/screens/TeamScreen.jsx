// 프로필 이미지 경로: /images/profile-{id}.png
// 이미지 로드 실패 시 이니셜 fallback 표시
const MEMBERS = [
  { id: 'yoon', name: '윤서현', title: '팀장', years: '입사 16년차', role: '사업기획팀 총괄·워크숍 총괄' },
  { id: 'lee',  name: '이수진', title: '과장', years: '입사 12년차', role: '예산·운영 총괄' },
  { id: 'kim',  name: '김민준', title: '대리', years: '입사 5년차',  role: '대외행사 운영' },
  { id: 'choi', name: '최지원', title: '대리', years: '입사 5년차',  role: '숙박·행정 지원' },
  { id: 'jang', name: '장미래', title: '대리', years: '입사 7년차',  role: '콘텐츠 기획' },
  { id: 'park', name: '박준혁', title: '주임', years: '입사 2년차',  role: '프로그램 운영 지원' },
]

function ProfileAvatar({ id, name }) {
  const initial = name[0]
  return (
    <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
      <img
        src={`/images/profile-${id}.png`}
        alt={name}
        style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
      {/* fallback */}
      <div style={{
        display: 'none',
        width: '72px', height: '72px', borderRadius: '50%',
        background: '#E5E7EB', color: 'var(--text-secondary)',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', fontWeight: '700',
        position: 'absolute', top: 0, left: 0
      }}>
        {initial}
      </div>
    </div>
  )
}

export default function TeamScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 1</span>
        <h2 style={{ marginTop: '8px', marginBottom: '12px' }}>사업기획팀을 소개합니다</h2>
        <p>워크숍을 함께 준비할 팀원 6명입니다.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {MEMBERS.map((m) => (
          <div key={m.id} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ProfileAvatar id={m.id} name={m.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>
                {m.name}
                <span style={{ fontWeight: '400', color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '4px' }}>{m.title}</span>
              </div>
              {m.years && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{m.years}</div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{m.role}</div>
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
