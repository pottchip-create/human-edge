import { useState } from 'react'
import { INITIAL_PLAN } from './data/constraints'
import IntroScreen from './screens/IntroScreen'
import TeamScreen from './screens/TeamScreen'
import InitialPlanScreen from './screens/InitialPlanScreen'
import PromptScreen from './screens/PromptScreen'
import QRScreen from './screens/QRScreen'
import CharacterScreen from './screens/CharacterScreen'
import WorkbenchScreen from './screens/WorkbenchScreen'
import EvaluateScreen from './screens/EvaluateScreen'
import HumanEdgeScreen from './screens/HumanEdgeScreen'

const INITIAL_STATE = {
  screen: 'intro',
  currentPlan: INITIAL_PLAN,
  planMessages: [],
  conditionResults: null,
  humanEdgeResult: null,
  selectedOption: null,
  priorityText: '',
  tradeoffText: '',
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE)

  const set = (patch) => setState(prev => ({ ...prev, ...patch }))
  const goTo = (screen) => set({ screen })

  // 완전 초기화 — 다음 조 사용 시
  const resetGame = () => setState(INITIAL_STATE)

  const params = new URLSearchParams(window.location.search)
  const clueParam = params.get('clue')
  if (clueParam && ['a', 'b', 'c', 'd'].includes(clueParam)) {
    return <CharacterScreen clueId={clueParam} />
  }

  const { screen, currentPlan, planMessages, conditionResults, humanEdgeResult, selectedOption, priorityText, tradeoffText } = state

  return (
    <div className="fade-in">
      {screen === 'intro' && <IntroScreen onNext={() => goTo('team')} />}
      {screen === 'team' && <TeamScreen onNext={() => goTo('prompt')} />}
      {screen === 'prompt' && <PromptScreen onNext={() => goTo('initialPlan')} />}
      {screen === 'initialPlan' && <InitialPlanScreen onNext={() => goTo('qr')} />}
      {screen === 'qr' && <QRScreen onNext={() => goTo('workbench')} />}
      {screen === 'workbench' && (
        <WorkbenchScreen
          currentPlan={currentPlan}
          setCurrentPlan={(p) => set({ currentPlan: p })}
          messages={planMessages}
          setMessages={(m) => set({ planMessages: m })}
          onEvaluate={(conditions) => set({ conditionResults: conditions, screen: 'evaluate' })}
        />
      )}
      {screen === 'evaluate' && (
        <EvaluateScreen
          currentPlan={currentPlan}
          conditionResults={conditionResults}
          onHumanEdge={(result) => set({
            humanEdgeResult: result,
            selectedOption: null,
            priorityText: '',
            tradeoffText: '',
            screen: 'humanedge'
          })}
        />
      )}
      {screen === 'humanedge' && (
        <HumanEdgeScreen
          humanEdgeResult={humanEdgeResult}
          currentPlan={currentPlan}
          selectedOption={selectedOption}
          setSelectedOption={(o) => set({ selectedOption: o })}
          priorityText={priorityText}
          setPriorityText={(t) => set({ priorityText: t })}
          tradeoffText={tradeoffText}
          setTradeoffText={(t) => set({ tradeoffText: t })}
          onComplete={() => set({ screen: 'complete' })}
        />
      )}
      {screen === 'complete' && (
        <CompleteScreen
          selectedOption={selectedOption}
          priorityText={priorityText}
          tradeoffText={tradeoffText}
          onDebrief={() => goTo('debrief')}
        />
      )}
      {screen === 'debrief' && (
        <DebriefScreen onRestart={resetGame} />
      )}
    </div>
  )
}

// 결재 완료 화면
function CompleteScreen({ selectedOption, priorityText, tradeoffText, onDebrief }) {
  return (
    <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>결재 완료</span>
          <h2 style={{ marginTop: '8px' }}>우리 조의 결정</h2>
        </div>

        {selectedOption && (
          <div className="card" style={{ padding: '24px', marginBottom: '16px', border: '2px solid var(--accent)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '6px', letterSpacing: '0.05em' }}>선택한 운영안</div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>{selectedOption.title}</div>
            {selectedOption.companion && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>동행자: {selectedOption.companion}</div>
            )}
          </div>
        )}

        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>우리가 가장 우선한 것</div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>→ {priorityText}</div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>그 대신 감수하기로 한 것</div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>→ {tradeoffText}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={onDebrief} style={{ padding: '14px 36px' }}>
            마무리로 →
          </button>
        </div>
      </div>
    </div>
  )
}

// 디브리핑 화면
function DebriefScreen({ onRestart }) {
  return (
    <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '40px' }}>
          {['알아차리고', '확인하고', '결정했습니다.'].map((text, i) => (
            <div key={i} style={{
              fontSize: i === 2 ? '1.4rem' : '1.1rem',
              fontWeight: i === 2 ? '700' : '400',
              color: i === 2 ? 'var(--text-primary)' : 'var(--text-muted)',
              marginBottom: i < 2 ? '4px' : '0',
              lineHeight: '1.5'
            }}>
              {i < 2 && <span style={{ display: 'inline-block', marginRight: '8px', color: 'var(--accent)' }}>↓</span>}
              {text}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '32px', textAlign: 'left' }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            이번에는 워크숍이었습니다.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-primary)', fontWeight: '500' }}>
            그렇다면 실제 업무에서는 어떨까요?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '0.95rem' }}
            onClick={() => alert('나의 업무 결재판 — 준비 중입니다.')}
          >
            나의 업무 결재판으로 →
          </button>
          <button
            className="btn-secondary"
            onClick={onRestart}
            style={{ padding: '12px 32px', fontSize: '0.88rem', color: 'var(--text-muted)' }}
          >
            활동 마무리하기
          </button>
        </div>
      </div>
    </div>
  )
}
