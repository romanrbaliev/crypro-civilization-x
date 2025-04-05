
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GameProvider } from './context/GameContext'
import { UnlockManagerProvider } from './systems/unlock/hooks/useUnlockManager'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <UnlockManagerProvider>
        <App />
      </UnlockManagerProvider>
    </GameProvider>
  </React.StrictMode>,
)
