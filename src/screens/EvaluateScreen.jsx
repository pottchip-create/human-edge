import { useState } from 'react'
import { askHumanEdge } from '../api'

const HUMANEDGE_SYSTEM = `당신은 HumanEdge AI입니다. 팀이 완성한 워크숍 운영안을 바탕으로 판단 피드백을 제공합니다.

P1 — 기존 일정·예약 활용 우선: 13:00 전원 출발, 물레 도자기 전원 동일 참여, 기존 방 배정 유지
P3 — 전원 함께하는 경험 우선: 17:00 전원 출발, 물레 대신 대체 프로그램(24만원 손실), 방 배정 조정

응답은 반드시 아래 JSON으로만 출력하십시오.
{"assistant_message":"전체 판단 피드백 (2~3문단)","options":[{"id":"OUR_PLAN","title":"우리 조의 선택","plan_summary":"핵심 내용","priority":"우선한 가치","gain":"얻은 것","tradeoff":"감수한 것","needs_confirmation":[]},{"id":"OPTION_B","title":"다른 선택 — 기존 예약 우선","plan_summary":"P1 핵심","priority":"예산 효율","gain":"24만원 전액 활용","tradeoff":"개인 사정 미반영","needs_confirmation":[]},{"id":"OPTION_C","title":"다른 선택 — 전원 함께","plan_summary":"P3 핵심","priority":"전원 동시 경험","gain":"완전한 배려","tradeoff":"도자기 24만원 손실","needs_confirmation":["대체 프로그램 확인 필요"]}],"final_question":"이번 워크숍에서 여러분이 가장 우선하고 싶었던 것은 무엇인가요?"}`

export default function EvaluateScreen({ currentPlan, conditionResults, onHumanEdge }) {
  const [loading, setLoading] = useState(false)

  const handleHumanEdge = async () => {
    setLoading(true)
    try {
      const data = await askHumanEdge(currentPlan, conditionResults)
      onHumanEdge(data)
    } catch {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <div style={{
          fontSize: '64px', marginBottom: '24px',
          animation: 'fadeIn 0.6s ease'
        }}>✅</div>

        <h2 style={{ marginBottom: '12px' }}>모든 사정이 반영됐어요</h2>

        <p style={{ fontSize: '1.05rem', lineHeight: '1.75', marginBottom: '40px', color: 'var(--text-secondary)' }}>
          팀원들의 상황을 확인하고 운영안을 다듬었어요.<br />
          이제 여러분의 선택을 돌아볼 차례입니다.<br />
          AI가 판단하지 못한 것, 여러분이 결정한 것을 함께 살펴볼게요.
        </p>

        <button
          className="btn-primary"
          onClick={handleHumanEdge}
          disabled={loading}
          style={{ fontSize: '1rem', padding: '14px 36px' }}
        >
          {loading ? '분석 중...' : '최종 결재 →'}
        </button>
      </div>
    </div>
  )
}