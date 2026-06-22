import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { MatchesProvider } from './context/MatchesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MatchesProvider>
      <App />
    </MatchesProvider>
  </StrictMode>,
)
