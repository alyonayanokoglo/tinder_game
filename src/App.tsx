import { SwipeDeck } from './components/SwipeDeck'
import { CASES } from './data/cases'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">КЕЙС_ТРЕНАЖЕР</div>
        <div className="sub">Свайп вправо — Было, влево — Не было</div>
      </header>
      <main>
        <SwipeDeck cases={CASES} />
      </main>
    </div>
  )
}

export default App
