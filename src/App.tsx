import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import RecoveryPage from "./pages/RecoveryPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import DashboardPage from "./pages/DashboardPage"
import AdminPage from "./pages/AdminPage"
import { supabase } from "./lib/supabase"
import { ThemeProvider } from "./context/ThemeContext"
import type { Session } from "@supabase/supabase-js"

function ProtectedRoute({ children, session }: { children: (session: Session) => React.ReactNode, session: Session | null }) {
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children(session)}</>
}

function AdminRoute({ children, session, role }: { children: React.ReactNode, session: Session | null, role: string | null }) {
  if (!session) {
    return <Navigate to="/login" replace />
  }
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setRole(data.role)
      }
    }

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchRole(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute session={session}>
                {(s) => <DashboardPage userRole={role} session={s} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute session={session} role={role}>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
