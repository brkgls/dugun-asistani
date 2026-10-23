import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './shared/i18n/I18nProvider'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './shared/components/Toast'
import { registerServiceWorker } from './shared/push/registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
