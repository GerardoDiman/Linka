import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import RecoveryPage from "./pages/RecoveryPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import DashboardPage from "./pages/DashboardPage"
import AdminPage from "./pages/AdminPage"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider, useAuth } from "./context/AuthContext"

function ProtectedRoute({ children }: { children: (role: string | null) => React.ReactNode }) {
  const { session, role, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children(role)}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!session) {
    return <Navigate to="/login" replace />
  }
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/recovery" element={<RecoveryPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {(role) => <DashboardPage userRole={role} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  )
}

import { ToastProvider } from "./context/ToastContext"
import { ToastContainer } from "./components/ui/Toast"

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <AppRoutes />
          </Router>
          <ToastContainer />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
