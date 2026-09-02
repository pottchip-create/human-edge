import StepHeader from '../components/StepHeader'

// 프로필 이미지: /images/profile-{id}.png (6명 모두 준비 완료)
// 이미지 로드 실패 시 이니셜 fallback 표시
const MEMBERS = [
  { id: 'yoon', name: '윤서현', title: '팀장', years: '입사 16년차', role: '사업기획팀 총괄·워크숍 총괄' },
  { id: 'lee',  name: '이수진', title: '과장', years: '입사 12년차', role: '예산·운영 총괄' },
  { id: 'jang', name: '장미래', title: '대리', years: '입사 7년차',  role: '콘텐츠 기획' },
  { id: 'kim',  name: '김민준', title: '대리', years: '입사 5년차',  role: '대외행사 운영' },
  { id: 'choi', name: '최지원', title: '대리', years: '입사 5년차',  role: '숙박·행정 지원' },
  { id: 'park', name: '박준혁', title: '주임', years: '입사 2년차',  role: '프로그램 운영 지원' },
]

function ProfileAvatar({ id, name }) {
  return (
    <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
      <img
        src={`/images/profile-${id}.png`}
        alt={name}
        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
      <div style={{
        display: 'none',
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'var(--accent-soft)', color: 'var(--accent)',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', fontWeight: '600',
        position: 'absolute', top: 0, left: 0
      }}>
        {name[0]}
      </div>
    </div>
  )
}

export default function TeamScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <StepHeader
        showBrand={true}
        step={1}
        title="사업기획팀을 소개합니다"
        desc="워크숍을 함께 준비할 팀원 6명입니다."
      />

      {/* F-1 명부형 — 직급 위계가 한눈에 */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '40px', maxWidth: '640px' }}>
        {MEMBERS.map((m, i) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '18px 24px',
            borderBottom: i < MEMBERS.length - 1 ? '1px solid var(--line)' : 'none'
          }}>
            <ProfileAvatar id={m.id} name={m.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '2px' }}>
                {m.name}
                <span style={{ fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '6px' }}>{m.title}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {m.years} · {m.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button className="btn-primary" onClick={onNext}>AI에 입력한 내용 보기 →</button>
      </div>
    </div>
  )
}
