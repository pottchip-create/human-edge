import React, { useState } from 'react'
import { INITIAL_PLAN } from './data/constraints'
import { summarizePlan } from './planSummary'
import IntroScreen from './screens/IntroScreen'
import TeamScreen from './screens/TeamScreen'
import InitialPlanScreen from './screens/InitialPlanScreen'
import PromptScreen from './screens/PromptScreen'
import QRScreen from './screens/QRScreen'
import CharacterScreen from './screens/CharacterScreen'
import WorkbenchScreen from './screens/WorkbenchScreen'
import EvaluateScreen from './screens/EvaluateScreen'
import HumanEdgeScreen from './screens/HumanEdgeScreen'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '12px' }}>일시적인 오류가 발생했습니다</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>다시 시도하면 이전 상태로 돌아갑니다.</p>
          <button className="btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const INITIAL_STATE = {
  screen: 'intro',
  currentPlan: INITIAL_PLAN,      // STEP 4에서 조율한 '우리 조의 운영안' — 항상 보존
  approvedPlan: null,             // STEP 5에서 선택한 '최종 결재안'
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

  const setPlanMessages = (updater) => {
    setState(prev => ({
      ...prev,
      planMessages: typeof updater === 'function'
        ? updater(Array.isArray(prev.planMessages) ? prev.planMessages : [])
        : (Array.isArray(updater) ? updater : [])
    }))
  }

  const resetGame = () => setState(INITIAL_STATE)

  const params = new URLSearchParams(window.location.search)
  const clueParam = params.get('clue')
  if (clueParam && ['a', 'b', 'c', 'd'].includes(clueParam)) {
    return <CharacterScreen clueId={clueParam} />
  }

  const {
    screen, currentPlan, approvedPlan, planMessages, conditionResults,
    humanEdgeResult, selectedOption, priorityText, tradeoffText
  } = state

  return (
    <ErrorBoundary>
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
          setMessages={setPlanMessages}
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
            approvedPlan: null,
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
          setSelectedOption={(o) => set({ selectedOption: o, approvedPlan: o?.approvedPlan || null })}
          priorityText={priorityText}
          setPriorityText={(t) => set({ priorityText: t })}
          tradeoffText={tradeoffText}
          setTradeoffText={(t) => set({ tradeoffText: t })}
          onComplete={() => goTo('complete')}
        />
      )}
      {screen === 'complete' && (
        <CompleteScreen
          selectedOption={selectedOption}
          approvedPlan={approvedPlan || currentPlan}
          priorityText={priorityText}
          tradeoffText={tradeoffText}
          onDebrief={() => goTo('debrief')}
        />
      )}
      {screen === 'debrief' && <DebriefScreen onRestart={resetGame} />}
    </div>
    </ErrorBoundary>
  )
}

/* ── 결재 완료 — B안 서류·도장 액센트 ───────────────── */
function CompleteScreen({ selectedOption, approvedPlan, priorityText, tradeoffText, onDebrief }) {
  const summary = summarizePlan(approvedPlan)

  return (
    <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="step-brand">HUMAN EDGE · 사수의 결재판</span>
          <span className="step-label">STEP 5 · 판단하고 결재하기</span>
          <h2 className="step-title" style={{ marginTop: '10px' }}>결재 완료</h2>
        </div>

        {/* 서류 카드 */}
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--paper-line)',
          borderLeft: '4px solid var(--ink)',
          borderRadius: '0 16px 16px 0',
          padding: '32px 32px 28px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>
            최종 결재안
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '22px', paddingRight: '90px' }}>
            {selectedOption?.title || '우리 조가 만든 운영안'}
          </div>

          {/* 도장 */}
          <div style={{
            position: 'absolute', top: '28px', right: '28px',
            width: '76px', height: '76px', borderRadius: '50%',
            border: '2px solid var(--accent)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            opacity: 0.9
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent)', letterSpacing: '0.1em' }}>결 재</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--accent)', marginTop: '2px' }}>사업기획팀</span>
          </div>

          <div style={{ borderTop: '1px solid var(--paper-line)', paddingTop: '18px' }}>
            {summary.map((item, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr', gap: '12px',
                padding: '9px 0',
                borderBottom: i < summary.length - 1 ? '1px solid var(--paper-line)' : 'none'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 참가자 입력 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-sub" style={{ color: 'var(--accent)' }}>우리가 가장 우선한 것</div>
            <div style={{ fontSize: '0.92rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{priorityText}</div>
          </div>
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-sub">그 대신 감수하기로 한 것</div>
            <div style={{ fontSize: '0.92rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{tradeoffText}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--accent-soft)', borderRadius: '20px',
          padding: '28px', textAlign: 'center', marginBottom: '32px'
        }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.85', color: 'var(--accent-deep)', margin: 0 }}>
            AI는 여러 대안을 만들 수 있습니다.<br />
            무엇을 우선하고 무엇을 감수할지는 사람이 결정합니다.
          </p>
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
          <button className="btn-primary" onClick={onDebrief} style={{ padding: '14px 36px' }}>
            활동 돌아보기 →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 디브리핑 — E-2 여백형 / alert 제거 ─────────────── */
function DebriefScreen({ onRestart }) {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '32px' }}>
            활동이 완료되었습니다.
          </p>
          <button className="btn-secondary" onClick={onRestart} style={{ padding: '12px 32px' }}>
            처음으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '460px', width: '100%', textAlign: 'center' }}>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginBottom: '44px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5F5A52' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8A8074' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
        </div>

        <p style={{ fontSize: '0.95rem', color: '#8A8074', margin: '0 0 8px', lineHeight: '2' }}>알아차리고</p>
        <p style={{ fontSize: '0.95rem', color: '#B5AC9E', margin: '0 0 8px', lineHeight: '2' }}>확인하고</p>
        <p style={{ fontSize: '1.5rem', color: '#FCFBF7', margin: '0 0 48px', fontWeight: '600', lineHeight: '1.5' }}>결정했습니다.</p>

        <p style={{ fontSize: '1rem', color: '#D8D0C2', margin: '0 0 6px', lineHeight: '1.9' }}>
          이번에는 워크숍이었습니다.
        </p>
        <p style={{ fontSize: '1.1rem', color: '#FCFBF7', margin: '0 0 48px', lineHeight: '1.7' }}>
          그렇다면 실제 업무에서는 어떨까요?
        </p>

        <button
          onClick={() => setDone(true)}
          style={{
            background: 'transparent', color: '#FCFBF7',
            border: '1.5px solid #5F5A52', borderRadius: '100px',
            padding: '13px 36px', fontSize: '0.95rem', fontWeight: '500',
            fontFamily: 'inherit', cursor: 'pointer'
          }}
        >
          활동 마치기
        </button>
      </div>
    </div>
  )
}
