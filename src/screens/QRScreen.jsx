import { QRCodeSVG } from 'qrcode.react'

export default function QRScreen({ onNext }) {
  const clues = [
    { id: 'a', label: 'A', color: '#F45A2A' },
    { id: 'b', label: 'B', color: '#4A7FA5' },
    { id: 'c', label: 'C', color: '#5A8A5A' },
    { id: 'd', label: 'D', color: '#8A5A8A' },
  ]

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '172.30.1.87'
  const baseUrl = isLocal ? 'http://172.30.1.87:5173' : window.location.origin

  return (
    <div className="page fade-in" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '40px' }}>
        <span className="step-brand">HUMAN EDGE · 사수의 결재판</span>
        <span className="step-label">STEP 3 · 팀원 상황 확인</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>각자 팀원을 탐색해보세요</h2>
        <p>하나씩 맡아서 스캔하세요. 탐색을 마치면 돌아와 함께 조율을 시작합니다.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
        {clues.map((c) => (
          <div key={c.id} className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: c.color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: '700', margin: '0 auto 16px'
            }}>
              {c.label}
            </div>
            <QRCodeSVG
              value={`${baseUrl}/?clue=${c.id}`}
              size={120}
              style={{ margin: '0 auto 12px', display: 'block' }}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              {baseUrl}/?clue={c.id}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '24px', fontSize: '0.9rem' }}>탐색을 모두 마쳤나요?</p>
      <button className="btn-primary" onClick={onNext}>AI와 조율하러 가기 →</button>
    </div>
  )
}