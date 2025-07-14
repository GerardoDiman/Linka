import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { PlanProvider } from './context/PlanContext'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <PlanProvider>
        <AppRoutes />
      </PlanProvider>
    </AuthProvider>
  </StrictMode>,
) 