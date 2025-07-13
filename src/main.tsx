import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import LandingPage from './components/LandingPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
) 