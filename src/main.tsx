import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './theme.css'
import './styles.css'
import App from './App'
import { installKioskGuards, registerServiceWorker } from './kiosk'

installKioskGuards()
registerServiceWorker()

// Errores no capturados: se registran, la app sigue viva
window.addEventListener('error', (e) => console.error('[window.error]', e.error ?? e.message))
window.addEventListener('unhandledrejection', (e) => console.error('[unhandledrejection]', e.reason))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
