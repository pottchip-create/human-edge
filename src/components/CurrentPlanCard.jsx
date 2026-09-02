import { useEffect, useRef, useState } from 'react'

// mode: "initial" | "live"
// highlightKeys: live 모드에서 변경된 섹션 키 배열 ['day1', 'rooms', 'transport'] → 1~2초 soft coral 강조
export default function CurrentPlanCard({ plan, mode = 'live', highlightKeys = [] }) {
  const [highlighted, setHighlighted] = useState([])
  const prevHighlightRef = useRef([])

  useEffect(() => {
    if (highlightKeys.length === 0) return
    // 새로 추가된 키만 강조
    const next = highlightKeys.filter(k => !prevHighlightRef.current.includes(k))
    if (next.length === 0) return
    prevHighlightRef.current = highlightKeys
    setHighlighted(next)
    const timer = setTimeout(() => setHighlighted([]), 1800)
    return () => clearTimeout(timer)
  }, [highlightKeys])

  const isHL = (key) => highlighted.includes(key)

  const hlStyle = (key) => isHL(key)
    ? { background: 'var(--accent-soft)', transition: 'background 0.3s ease', borderRadius: '8px', padding: '4px 6px', margin: '-4px -6px' }
    : {}

  if (!plan) return null

  const renderGroup = (group, idx) => {
    const participants = group.participants || group.members || []
    const depart = group.depart_time || group.departure
    const arrival = group.arrival_time
    const breakMin = group.break?.duration_min
    const method = group.transport_method || group.method
    const needsConfirm = group.status === 'needs_confirmation'

    return (
      <div key={idx} style={{
        padding: '10px 12px', marginBottom: '8px',
        background: '#FAFAFA', borderRadius: '10px',
        border: '1px solid var(--line)', fontSize: '0.83rem'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '5px' }}>
          {participants.map(p => (
            <span key={p} style={{
              background: 'white', border: '1px solid var(--line)',
              borderRadius: '100px', padding: '2px 8px', fontSize: '0.78rem'
            }}>{p}</span>
          ))}
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {depart && <span>출발 <b style={{ color: 'var(--accent)' }}>{depart}</b></span>}
          {arrival && <span style={{ marginLeft: '10px' }}>도착 <b>{arrival}</b></span>}
          {breakMin && <span style={{ marginLeft: '10px' }}>휴식 {breakMin}분</span>}
          {method && <span style={{ marginLeft: '10px' }}>· {method}</span>}
          {needsConfirm && <span style={{ marginLeft: '8px', color: '#F59E0B', fontSize: '0.75rem', fontWeight: '600' }}>확인 필요</span>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontSize: '0.85rem' }}>
      {/* 1일차 */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '8px' }}>1일차</div>
        <div style={hlStyle('day1')}>
          {(plan.day1 || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '40px', flexShrink: 0, fontSize: '0.83rem' }}>{item.time}</span>
              <span style={{ color: 'var(--text-primary)' }}>{item.activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 이동 그룹 */}
      {plan.transport_groups && plan.transport_groups.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '8px' }}>이동 그룹</div>
          <div style={hlStyle('transport_groups')}>
            {plan.transport_groups.map((g, i) => renderGroup(g, i))}
          </div>
        </div>
      )}

      {/* 2일차 */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '8px' }}>2일차</div>
        <div style={hlStyle('day2')}>
          {(plan.day2 || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '40px', flexShrink: 0, fontSize: '0.83rem' }}>{item.time}</span>
              <span style={{ color: 'var(--text-primary)' }}>{item.activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 숙박 */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '8px' }}>숙박</div>
        <div style={hlStyle('rooms')}>
          {(plan.rooms || []).map((r, i) => (
            <div key={i} style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>
              <span style={{ fontWeight: '600' }}>방 {r.room}</span>
              <span style={{ color: 'var(--text-secondary)' }}> {(r.members || []).join(', ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 이동수단 (transport_groups 없을 때) */}
      {(!plan.transport_groups || plan.transport_groups.length === 0) && plan.transport && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>이동</div>
          <div style={{ color: 'var(--text-secondary)', ...hlStyle('transport') }}>{plan.transport}</div>
        </div>
      )}

      {/* program_notes */}
      {plan.program_notes && (
        <div style={{ padding: '8px 10px', background: 'var(--accent-soft)', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '8px', color: 'var(--accent-deep)' }}>
          {plan.program_notes}
        </div>
      )}

      {/* 미확정 */}
      {(plan.unconfirmed || []).length > 0 && (
        <div style={{ padding: '8px 10px', background: '#FDF6E8', borderRadius: '8px', fontSize: '0.82rem', color: '#8A6A1F' }}>
          미확정: {plan.unconfirmed.map(u =>
            typeof u === 'string' ? u : (u.item || u.description || JSON.stringify(u))
          ).join(', ')}
        </div>
      )}
    </div>
  )
}
