import { useState } from 'react'
import { askHumanEdge } from '../api'

export default function EvaluateScreen({ currentPlan, conditionResults, onHumanEdge }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleHumanEdge = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await askHumanEdge(currentPlan, conditionResults)
      onHumanEdge(data)
    } catch {
      setError('불러오지 못했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <span className="step-brand" style={{ marginBottom: '10px' }}>HUMAN EDGE · 사수의 결재판</span>
        <span className="step-label">STEP 5 · 판단하고 결재하기</span>

        <h2 className="step-title" style={{ marginTop: '12px', marginBottom: '20px' }}>
          지금까지 확인한 팀원들의 조건이<br />운영안에 반영되었습니다
        </h2>

        <p style={{ fontSize: '1rem', lineHeight: '1.85', marginBottom: '36px', color: 'var(--text-secondary)' }}>
          이제 한 가지 선택이 남아 있습니다.<br />
          같은 조건을 충족하더라도<br />
          무엇을 우선하느냐에 따라 운영안은 달라질 수 있습니다.
        </p>

        <button
          className="btn-primary"
          onClick={handleHumanEdge}
          disabled={loading}
          style={{ fontSize: '1rem', padding: '14px 36px', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '정리하고 있습니다…' : '어떤 선택이 가능한지 비교하기 →'}
        </button>

        {error && (
          <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '16px' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
