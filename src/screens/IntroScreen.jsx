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
      <div style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>

        {/* 좌측 비주얼 */}
        <div style={{
          background: '#F0EDE8',
          borderRadius: '28px',
          aspectRatio: '4/5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '40px'
        }}>
          <div style={{ fontSize: '72px' }}>📋</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#8A7A6A', fontWeight: '600', letterSpacing: '0.1em' }}>HUMAN EDGE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#3A3028', marginTop: '8px' }}>사수의 결재판</div>
          </div>
        </div>

        {/* 우측 카드 */}
        <div className="card fade-in">
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>
              HUMAN EDGE — MODULE 2
            </span>
          </div>

          <h1 style={{ marginBottom: '8px', fontSize: '2rem' }}>
            AI 운영안 완성 미션
          </h1>

          <p style={{ fontSize: '1.05rem', marginBottom: '16px', lineHeight: '1.7' }}>
            AI가 만든 초안을,<br />
            사람의 직관·공감·판단으로 완성하세요.
          </p>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.7' }}>
            팀 워크숍 운영안을 함께 만들어가는 과정에서
            AI와 사람이 각각 잘하는 것이 무엇인지 직접 경험합니다.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onNext}>
              시작하기 →
            </button>
            <button className="btn-secondary" onClick={() => setShowGuide(true)}>
              진행 방법 보기
            </button>
          </div>
        </div>
      </div>

      {/* 진행 방법 모달 */}
      {showGuide && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '24px'
        }} onClick={() => setShowGuide(false)}>
          <div className="card fade-in" style={{ maxWidth: '520px', width: '100%', padding: '36px' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px' }}>진행 방법</h2>

            {[
              { step: '01', title: '팀 소개', desc: '워크숍을 함께 준비할 팀원 6명을 확인합니다.' },
              { step: '02', title: 'AI 프롬프트 확인', desc: 'AI에게 주어진 정보와 AI가 만든 초안을 확인합니다.' },
              { step: '03', title: '개인 탐색', desc: '각자 QR을 스캔해 팀원과 대화하며 숨겨진 사정을 발견합니다.' },
              { step: '04', title: '운영안 조율', desc: '발견한 내용을 AI에게 전달해 운영안을 개선합니다.' },
              { step: '05', title: '최종 결재', desc: '모든 사정이 반영되면 최종 판단을 내립니다.' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700', flexShrink: 0
                }}>{item.step}</div>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.desc}</div>
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
