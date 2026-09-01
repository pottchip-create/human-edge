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

export default function App() {
  const [screen, setScreen] = useState('intro')
  const [currentPlan, setCurrentPlan] = useState(INITIAL_PLAN)
  const [planMessages, setPlanMessages] = useState([])
  const [conditionResults, setConditionResults] = useState(null)
  const [humanEdgeResult, setHumanEdgeResult] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)  // { id, title, companion? }
  const [priorityText, setPriorityText] = useState('')
  const [tradeoffText, setTradeoffText] = useState('')

  const params = new URLSearchParams(window.location.search)
  const clueParam = params.get('clue')
  if (clueParam && ['a', 'b', 'c', 'd'].includes(clueParam)) {
    return <CharacterScreen clueId={clueParam} />
  }

  const goTo = (s) => setScreen(s)

  const goToWorkbench = () => {
    setConditionResults(null)
    goTo('workbench')
  }

  return (
    <div className="fade-in">
      {screen === 'intro' && (
        <IntroScreen onNext={() => goTo('team')} />
      )}
      {screen === 'team' && (
        <TeamScreen onNext={() => goTo('prompt')} />
      )}
      {screen === 'prompt' && (
        <PromptScreen onNext={() => goTo('initialPlan')} />
      )}
      {screen === 'initialPlan' && (
        <InitialPlanScreen onNext={() => goTo('qr')} />
      )}
      {screen === 'qr' && (
        <QRScreen onNext={() => goTo('workbench')} />
      )}
      {screen === 'workbench' && (
        <WorkbenchScreen
          currentPlan={currentPlan}
          setCurrentPlan={setCurrentPlan}
          messages={planMessages}
          setMessages={setPlanMessages}
          onEvaluate={(conditions) => {
            setConditionResults(conditions)
            goTo('evaluate')
          }}
        />
      )}
      {screen === 'evaluate' && (
        <EvaluateScreen
          currentPlan={currentPlan}
          conditionResults={conditionResults}
          onHumanEdge={(result) => {
            setHumanEdgeResult(result)
            setSelectedOption(null)
            setPriorityText('')
            setTradeoffText('')
            goTo('humanedge')
          }}
        />
      )}
      {screen === 'humanedge' && (
        <HumanEdgeScreen
          humanEdgeResult={humanEdgeResult}
          currentPlan={currentPlan}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          priorityText={priorityText}
          setPriorityText={setPriorityText}
          tradeoffText={tradeoffText}
          setTradeoffText={setTradeoffText}
          onComplete={() => goTo('complete')}
        />
      )}
      {screen === 'complete' && (
        <CompleteScreen
          selectedOption={selectedOption}
          priorityText={priorityText}
          tradeoffText={tradeoffText}
          onRestart={() => goTo('intro')}
        />
      )}
    </div>
  )
}

function CompleteScreen({ selectedOption, priorityText, tradeoffText, onRestart }) {
  return (
    <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent)', letterSpacing: '0.1em' }}>결재 완료</span>
          <h2 style={{ marginTop: '8px', marginBottom: '0' }}>우리 조의 결정</h2>
        </div>

        {selectedOption && (
          <div className="card" style={{ padding: '24px', marginBottom: '20px', border: '2px solid var(--accent)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '6px' }}>선택한 운영안</div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>{selectedOption.title}</div>
            {selectedOption.companion && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                동행자: {selectedOption.companion}
              </div>
            )}
          </div>
        )}

        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>우리가 가장 우선한 것</div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>→ {priorityText}</div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: '40px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>그 대신 감수하기로 한 것</div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>→ {tradeoffText}</div>
        </div>

        <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid #F45A2A30', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-primary)', margin: 0 }}>
            AI는 여러 대안을 만들 수 있습니다.<br />
            무엇을 우선하고 무엇을 감수할지는 사람이 결정합니다.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn-secondary" onClick={onRestart} style={{ padding: '12px 32px' }}>
            활동 마무리하기
          </button>
        </div>
      </div>
    </div>
  )
}
