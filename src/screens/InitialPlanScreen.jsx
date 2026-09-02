import { INITIAL_PLAN, FIXED_CONSTRAINTS } from '../data/constraints'
import CurrentPlanCard from '../components/CurrentPlanCard'

export default function InitialPlanScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <div className="step-header">
        <span className="step-brand">HUMAN EDGE · 사수의 결재판</span>
        <h2 className="step-title">AI가 작성한 운영 초안</h2>
        <p className="step-desc">
          팀 정보와 기본 조건만 입력했을 때 AI가 제안한 운영안입니다.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', marginBottom: '32px', alignItems: 'start' }}>
        <div className="card" style={{ padding: '28px' }}>
          <div className="section-sub">CURRENT PLAN</div>
          <CurrentPlanCard plan={INITIAL_PLAN} mode="initial" />
        </div>

        <div className="card" style={{ padding: '20px', background: 'var(--accent-soft)', border: '1px solid #C0553A20' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.06em' }}>고정 운영 조건</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.9' }}>
            <div>총예산 <b style={{ color: 'var(--text-primary)' }}>{FIXED_CONSTRAINTS.totalBudget}만원</b></div>
            <div>도자기 클래스 <b style={{ color: 'var(--text-primary)' }}>6명 예약</b></div>
            <div style={{ marginTop: '6px', color: 'var(--accent-deep)', fontSize: '0.78rem', lineHeight: '1.6' }}>
              시간 변경 불가<br />사용하지 않아도 24만원 비용 발생
            </div>
          </div>
        </div>
      </div>

      <div>
        <button className="btn-primary" onClick={onNext}>팀원 상황 확인하러 가기 →</button>
      </div>
    </div>
  )
}
