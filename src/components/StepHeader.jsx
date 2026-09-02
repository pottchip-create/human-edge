// 전체 진행 단계 STEP 1~5 통일
// STEP 1 팀 확인 / 2 AI 초안 확인 / 3 팀원 상황 확인 / 4 AI와 조율하기 / 5 판단하고 결재하기
export const STEPS = {
  1: '팀 확인',
  2: 'AI 초안 확인',
  3: '팀원 상황 확인',
  4: 'AI와 조율하기',
  5: '판단하고 결재하기',
}

export default function StepHeader({ step, title, desc, showBrand = false }) {
  return (
    <div className="step-header">
      {showBrand && (
        <span className="step-brand">HUMAN EDGE · 사수의 결재판</span>
      )}
      {step && (
        <span className="step-label">STEP {step} · {STEPS[step]}</span>
      )}
      {title && <h2 className="step-title">{title}</h2>}
      {desc && <p className="step-desc">{desc}</p>}
    </div>
  )
}
