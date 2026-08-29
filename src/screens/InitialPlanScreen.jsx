import { INITIAL_PLAN, FIXED_CONSTRAINTS } from '../data/constraints'

export default function InitialPlanScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 2</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>AI가 만든 워크숍 초안</h2>
        <p>팀 정보와 기본 조건만 입력했을 때 AI가 제안한 운영안이에요.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>📅 1일차 일정</h3>
          {INITIAL_PLAN.day1.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '48px', fontSize: '0.9rem' }}>{item.time}</span>
              <span style={{ fontSize: '0.9rem' }}>{item.activity}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>🌙 2일차 일정</h3>
            {INITIAL_PLAN.day2.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '48px', fontSize: '0.9rem' }}>{item.time}</span>
                <span style={{ fontSize: '0.9rem' }}>{item.activity}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>🛏 숙박 배정</h3>
            {INITIAL_PLAN.rooms.map((r) => (
              <div key={r.room} style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600' }}>방 {r.room}</span>: {r.members.join(', ')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', marginBottom: '32px', padding: '20px 24px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>⚠️ 고정 운영 조건</h3>
        <p style={{ fontSize: '0.85rem' }}>총예산 {FIXED_CONSTRAINTS.totalBudget}만원 · 도자기 클래스 6명 예약 · 취소·시간변경 시 {FIXED_CONSTRAINTS.pottery.cost}만원 전액 청구</p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={onNext}>팀원 탐색하러 가기 →</button>
      </div>
    </div>
  )
}