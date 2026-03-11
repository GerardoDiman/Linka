import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import { ToastContainer } from "./components/ui/Toast"
import { ErrorBoundary } from "./components/ui/ErrorBoundary"
import { Shield } from "lucide-react"
import { Button } from "./components/ui/button"

// Lazy loaded pages for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const RecoveryPage = lazy(() => import("./pages/RecoveryPage"))
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const AdminPage = lazy(() => import("./pages/AdminPage"))
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"))
const TermsPage = lazy(() => import("./pages/TermsPage"))

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.2
}

// Animated page wrapper
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

// Loading spinner for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}

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
  if (role?.toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">No tienes permisos para acceder a esta sección.</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Volver al Dashboard
          </Button>
          <p className="mt-4 text-[10px] text-gray-400">Rol detectado: {role || 'null'}</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation()
  const { session, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageWrapper><LandingPage /></PageWrapper>
        } />
        <Route path="/login" element={
          session ? <Navigate to="/dashboard" replace /> :
            <PageWrapper><LoginPage /></PageWrapper>
        } />
        <Route path="/register" element={
          session ? <Navigate to="/dashboard" replace /> :
            <PageWrapper><RegisterPage /></PageWrapper>
        } />
        <Route path="/recovery" element={
          <PageWrapper><RecoveryPage /></PageWrapper>
        } />
        <Route path="/reset-password" element={
          <PageWrapper><ResetPasswordPage /></PageWrapper>
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {(role) => <PageWrapper><DashboardPage userRole={role} /></PageWrapper>}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <PageWrapper><AdminPage /></PageWrapper>
            </AdminRoute>
          }
        />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <AnimatedRoutes />
              </Suspense>
            </ErrorBoundary>
          </Router>
          <ToastContainer />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
