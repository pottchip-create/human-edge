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
            goTo('humanedge')
          }}
        />
      )}
      {screen === 'humanedge' && (
        <HumanEdgeScreen
          humanEdgeResult={humanEdgeResult}
          currentPlan={currentPlan}
        />
      )}
    </div>
  )
}