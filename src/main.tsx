
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { UnlockManagerProvider } from './systems/unlock/hooks/useUnlockManager'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnlockManagerProvider>
      <App />
    </UnlockManagerProvider>
  </React.StrictMode>,
)
