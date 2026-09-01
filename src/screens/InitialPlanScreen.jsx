import { INITIAL_PLAN, FIXED_CONSTRAINTS } from '../data/constraints'
import CurrentPlanCard from '../components/CurrentPlanCard'

export default function InitialPlanScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 2</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>AI가 만든 워크숍 초안</h2>
        <p>팀 정보와 기본 조건만 입력했을 때 AI가 제안한 운영안입니다.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', marginBottom: '32px', alignItems: 'start' }}>
        {/* 운영안 카드 */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>CURRENT PLAN</h3>
          <CurrentPlanCard plan={INITIAL_PLAN} mode="initial" />
        </div>

        {/* 고정 조건 */}
        <div className="card" style={{ padding: '20px', background: 'var(--accent-soft)', border: '1px solid #F45A2A20' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.05em' }}>고정 운영 조건</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <div>총예산 <b style={{ color: 'var(--text-primary)' }}>{FIXED_CONSTRAINTS.totalBudget}만원</b></div>
            <div>도자기 클래스 <b style={{ color: 'var(--text-primary)' }}>6명 예약</b></div>
            <div style={{ marginTop: '4px', color: '#E05A1A', fontSize: '0.78rem' }}>
              취소·시간변경 시<br />{FIXED_CONSTRAINTS.pottery.cost}만원 전액 청구
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={onNext}>팀원 탐색하러 가기 →</button>
      </div>
    </div>
  )
}
