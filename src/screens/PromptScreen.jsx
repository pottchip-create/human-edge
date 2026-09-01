export default function PromptScreen({ onNext }) {
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>STEP 2</span>
        <h2 style={{ marginTop: '8px', marginBottom: '12px' }}>초안을 작성하기 위해 AI에 입력한 내용입니다.</h2>
        <p style={{ lineHeight: '1.75' }}>
          AI는 아래 정보를 바탕으로 워크숍 초안을 작성했습니다.<br />
          초안 그대로 진행해도 괜찮을지, 추가로 고려해야 할 사항이 있을지 찾아보세요.
        </p>
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
  - 윤서현 팀장 (16년차)
  - 이수진 과장 (12년차)
  - 장미래 대리 (7년차)
  - 김민준 대리 (5년차)
  - 최지원 대리 (5년차)
  - 박준혁 주임 (2년차)

일정: 11월 중 금~토 1박 2일
장소: 수도권 외곽, 숙박 가능
예산: 총 120만원 이내
목적: 팀빌딩, 분기 마무리
기확정: 물레 도자기 원데이 클래스
         (금 16:00~18:00, 24만원, 6명)`}</pre>
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
