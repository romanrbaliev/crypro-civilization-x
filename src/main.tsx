
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GameProvider } from './context/GameContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { UnlockManagerProvider } from './systems/unlock/hooks/useUnlockManager.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <UnlockManagerProvider>
        <App />
        <Toaster />
      </UnlockManagerProvider>
    </GameProvider>
  </React.StrictMode>,
)
