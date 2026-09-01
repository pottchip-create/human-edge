import { useState } from 'react'
import { askHumanEdge } from '../api'

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
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'fadeIn 0.6s ease' }}>✅</div>

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
          {loading ? '분석 중...' : '판단 이어가기 →'}
        </button>
      </div>
    </div>
  )
}
