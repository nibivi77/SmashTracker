import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { RecordsProvider } from './context/RecordsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecordsProvider>
      <App />
    </RecordsProvider>
  </StrictMode>,
)
