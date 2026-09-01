import { useState } from 'react'

export default function IntroScreen({ onNext }) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '900px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>

        {/* 좌측 — 브랜드 패널 */}
        <div style={{
          background: '#F0EDE8',
          borderRadius: '28px',
          aspectRatio: '4/5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#A8998A', letterSpacing: '0.15em' }}>HUMAN EDGE — MODULE 2</div>
            <div style={{ marginTop: '12px', fontSize: '1.5rem', fontWeight: '700', color: '#2A2018', lineHeight: '1.3' }}>사수의<br />결재판</div>
          </div>

          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#3A3028', lineHeight: '1.6', marginBottom: '8px' }}>
              AI가 여기까지 했습니다.<br />
              이제 당신 차례입니다.
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8A7A6A', lineHeight: '1.7' }}>
              사업기획팀의 1박 2일 워크숍을 앞두고<br />
              AI가 꽤 그럴듯한 운영안을 만들었습니다.
            </div>
          </div>
        </div>

        {/* 우측 — 카드 */}
        <div className="card fade-in" style={{ padding: '40px' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.6rem', lineHeight: '1.3' }}>
            AI가 만든 초안,<br />그대로 써도 괜찮을까요?
          </h2>

          <p style={{ fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.75', color: 'var(--text-secondary)' }}>
팀원들의 상황을 살펴보고,<br />
            이 운영안을 더 나은 안으로 다듬어보세요.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onNext} style={{ fontSize: '0.95rem' }}>
              시작하기 →
            </button>
            <button className="btn-secondary" onClick={() => setShowGuide(true)} style={{ fontSize: '0.95rem' }}>
              진행 방법 보기
            </button>
          </div>
        </div>
      </div>

      {/* 진행 방법 모달 */}
      {showGuide && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '24px'
        }} onClick={() => setShowGuide(false)}>
          <div className="card fade-in" style={{ maxWidth: '500px', width: '100%', padding: '36px' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>진행 방법</h2>

            {[
              { step: '01', title: '팀 소개', desc: '워크숍을 함께 준비할 팀원 6명을 확인합니다.' },
              { step: '02', title: 'AI 초안 확인', desc: 'AI에게 주어진 정보와 AI가 만든 초안을 확인합니다.' },
              { step: '03', title: '개인 탐색', desc: '각자 QR을 스캔해 팀원과 대화하며 상황을 파악합니다.' },
              { step: '04', title: '운영안 조율', desc: '발견한 내용을 AI에게 전달해 운영안을 개선합니다.' },
              { step: '05', title: '최종 결재', desc: '운영안이 완성되면 판단하고 결재합니다.' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--accent)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: '700', flexShrink: 0
                }}>{item.step}</div>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '2px', fontSize: '0.9rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}

            <button className="btn-primary" onClick={() => setShowGuide(false)} style={{ width: '100%', marginTop: '8px' }}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
