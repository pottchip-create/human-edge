export default function IntroScreen({ onNext }) {
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
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px'
        }}>
          📋
        </div>

        {/* 우측 카드 */}
        <div className="card fade-in">
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>
              HUMAN EDGE
            </span>
          </div>

          <h1 style={{ marginBottom: '8px', fontSize: '2rem' }}>
            사수의 결재판
          </h1>

          <p style={{ fontSize: '1.05rem', marginBottom: '32px', lineHeight: '1.7' }}>
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
            <button className="btn-secondary">
              진행 방법 보기
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}