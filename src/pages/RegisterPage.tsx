import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff, Check } from "lucide-react"
import { useToast } from "../context/ToastContext"

export default function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const passwordRequirements = useMemo(() => [
        { label: t('auth.register.passwordRequirements.minLength'), met: password.length >= 10 },
        { label: t('auth.register.passwordRequirements.uppercase'), met: /[A-Z]/.test(password) },
        { label: t('auth.register.passwordRequirements.lowercase'), met: /[a-z]/.test(password) },
        { label: t('auth.register.passwordRequirements.number'), met: /[0-9]/.test(password) },
        { label: t('auth.register.passwordRequirements.special'), met: /[@$!%*?&]/.test(password) },
    ], [password, t])

    const isPasswordValid = passwordRequirements.every(req => req.met)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        if (password !== confirmPassword) {
            setError(t('auth.register.errors.passwordMismatch'))
            setLoading(false)
            return
        }

        try {
            const normalizedEmail = email.toLowerCase().trim()

            // 1. Verificar si el email está en la lista de espera y aprobado mediante RPC seguro
            const { data: status, error: rpcError } = await supabase
                .rpc('check_waitlist_status', { email_to_check: normalizedEmail })

            if (rpcError) {
                setError(t('auth.register.errors.technical'))
                setLoading(false)
                return
            }

            if (!status) {
                setError(t('auth.register.errors.notOnWaitlist'))
                setLoading(false)
                return
            }

            if (status !== 'approved') {
                setError(t('auth.register.errors.notApproved'))
                setLoading(false)
                return
            }

            // 2. Proceder con el registro si está aprobado
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username,
                        has_seen_onboarding: false,
                    }
                }
            })

            if (signUpError) throw signUpError

            toast.success(t('auth.register.success'))
            navigate("/login")
        } catch (err: any) {
            setError(err.message || t('auth.register.errors.generic'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="pt-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('auth.register.fullName')}
                                </label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    required
                                    placeholder={t('auth.register.fullNamePlaceholder')}
                                    className="mt-1 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={fullName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('auth.register.username')}
                                </label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    placeholder={t('auth.register.usernamePlaceholder')}
                                    className="mt-1 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.register.email')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder={t('auth.register.emailPlaceholder')}
                                className="mt-1 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.register.password')}
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="pr-10 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Requirements Checklist */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        {req.met ? (
                                            <Check size={14} className="text-green-500" />
                                        ) : (
                                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600 ml-1.5 mr-1" />
                                        )}
                                        <span className={`text-[11px] ${req.met ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.register.confirmPassword')}
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="pr-10 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={confirmPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
                            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('auth.register.hasAccount')} </span>
                            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                                {t('auth.register.login')}
                            </Link>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">{t('auth.register.noAccess')} </span>
                            <Link to="/#access" className="text-xs font-medium text-primary hover:text-primary/80">
                                {t('auth.register.requestAccess')}
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
