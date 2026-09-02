import { useState } from 'react'
import { STEPS } from '../components/StepHeader'

export default function IntroScreen({ onNext }) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '900px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>

        {/* 좌측 — B안 서류 패널 */}
        <div style={{
          background: 'var(--ink)',
          borderRadius: '20px',
          aspectRatio: '4/5',
          padding: '14px',
          display: 'flex'
        }}>
          <div style={{
            background: 'var(--paper)',
            borderRadius: '4px',
            borderLeft: '4px solid var(--ink-deep)',
            flex: 1,
            padding: '32px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '10px' }}>
                문서번호 HE-M2-001
              </div>
              <div style={{ borderTop: '1px solid var(--paper-line)', paddingTop: '16px' }}>
                <div style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.35' }}>
                  사수의<br />결재판
                </div>
              </div>
            </div>

            <div>
              <div style={{ height: '1px', background: 'var(--paper-line)', marginBottom: '16px' }} />
              <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '10px' }}>
                AI가 여기까지 했습니다.<br />
                이제 당신 차례입니다.
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                사업기획팀의 1박 2일 워크숍을 앞두고<br />
                AI가 꽤 그럴듯한 운영 초안을 만들었습니다.
              </div>
            </div>
          </div>
        </div>

        {/* 우측 */}
        <div>
          <span className="step-brand">HUMAN EDGE · 사수의 결재판</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '600', lineHeight: '1.35', marginTop: '10px', marginBottom: '16px' }}>
            이 운영안,<br />그대로 진행해도 괜찮을까요?
          </h2>

          <p style={{ fontSize: '0.98rem', marginBottom: '36px', lineHeight: '1.85', color: 'var(--text-secondary)' }}>
            팀원들의 상황을 살펴보고,<br />
            이 운영안을 더 나은 안으로 다듬어보세요.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onNext}>시작하기 →</button>
            <button className="btn-secondary" onClick={() => setShowGuide(true)}>진행 방법 보기</button>
          </div>
        </div>
      </div>

      {showGuide && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(38,34,28,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '24px'
        }} onClick={() => setShowGuide(false)}>
          <div className="card fade-in" style={{ maxWidth: '460px', width: '100%', padding: '36px' }}
            onClick={e => e.stopPropagation()}>
            <div className="section-sub">진행 방법</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '24px' }}>다섯 단계로 진행합니다</h2>

            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: '700', flexShrink: 0
                }}>{n}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '500' }}>{STEPS[n]}</div>
              </div>
            ))}

            <button className="btn-primary" onClick={() => setShowGuide(false)} style={{ width: '100%', marginTop: '12px' }}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
