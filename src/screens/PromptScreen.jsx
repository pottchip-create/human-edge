export default function PromptScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 2</span>
        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>AI에게 이것만 알려줬습니다</h2>
        <p>아래가 AI에게 입력한 프롬프트의 전부입니다. 개인 사정은 단 하나도 없어요.</p>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* 프롬프트 카드 */}
        <div className="card" style={{ background: '#1A1F2E', border: '1px solid #2E3550', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
            <span style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: '8px', fontFamily: 'monospace' }}>prompt.txt</span>
          </div>

          <pre style={{
            fontSize: '0.92rem',
            lineHeight: '1.8',
            color: '#C8D4F0',
            fontFamily: '"Pretendard", monospace',
            whiteSpace: 'pre-wrap',
            margin: 0
          }}>{`팀 워크숍 1박 2일 일정을 짜줘.

팀원: 6명
  - 이수진 과장 (12년차)
  - 윤서현 과장
  - 김민준 대리 (5년차)
  - 최지원 대리 (5년차)
  - 장미래 대리
  - 박준혁 주임 (2년차)

일정: 11월 중 금~토 1박 2일
장소: 수도권 외곽, 숙박 가능
예산: 총 120만원 이내
목적: 팀빌딩, 분기 마무리
기확정: 물레 도자기 원데이 클래스
         (금 16:00~18:00, 24만원, 6명)`}</pre>
        </div>

        {/* 안내 카드 */}
        <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                AI가 모른 것
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                각 팀원의 개인 사정, 건강 상태, 인간관계, 가족 상황 —
                AI는 이것들을 전혀 모른 채 초안을 만들었어요.
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={onNext}>
            AI 초안 보기 →
          </button>
        </div>
      </div>
    </div>
  )
}
