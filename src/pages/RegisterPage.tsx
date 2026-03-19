import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Eye, EyeOff, Mail, User, CheckCircle2, Circle } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useToast } from "../context/ToastContext"
import { GoogleIcon } from "../components/ui/GoogleIcon"
import { NotionIcon } from "../components/ui/NotionIcon"

// Module-level constant — no re-creation per render (DRY, referential stability)
const PASSWORD_REQUIREMENTS = [
    { regex: /.{8,}/, labelKey: 'auth.register.passwordRequirements.minLength' },
    { regex: /[A-Z]/, labelKey: 'auth.register.passwordRequirements.uppercase' },
    { regex: /[0-9]/, labelKey: 'auth.register.passwordRequirements.number' },
] as const

export default function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [error, setError] = useState("")

    // Password validation
    const [isPasswordValid, setIsPasswordValid] = useState(false)

    useEffect(() => {
        setIsPasswordValid(PASSWORD_REQUIREMENTS.every(req => req.regex.test(password)))
    }, [password])

    const handleSignUp = async (e: React.FormEvent) => {
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

            const { error: signUpError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username,
                        has_seen_onboarding: false,
                        accepted_terms: true,
                        accepted_terms_at: new Date().toISOString()
                    }
                }
            })

            if (signUpError) throw signUpError

            toast.success(t('auth.register.success'))
            navigate("/login")
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('auth.login.error')
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleOAuthLogin = async (provider: 'google' | 'notion') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            })
            if (error) throw error
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('auth.login.error')
            toast.error(message)
        }
    }

    return (
        <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl max-w-md w-full">
                <CardContent className="space-y-6 pt-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="fullName">
                                    {t('auth.register.fullName')}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="fullName"
                                        placeholder={t('auth.register.fullNamePlaceholder')}
                                        className="pl-10 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="username">
                                    {t('auth.register.username')}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="username"
                                        placeholder={t('auth.register.usernamePlaceholder')}
                                        className="pl-10 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="email">
                                {t('auth.register.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('auth.register.emailPlaceholder')}
                                    className="pl-10 h-11 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="password">
                                {t('auth.register.password')}
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="h-11 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 mt-2">
                                {PASSWORD_REQUIREMENTS.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[11px]">
                                        {req.regex.test(password) ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                                        )}
                                        <span className={req.regex.test(password) ? "text-emerald-500 font-medium" : "text-gray-500"}>
                                            {t(req.labelKey)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                                {t('auth.register.confirmPassword')}
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                className="h-11 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-start space-x-2 py-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                    required
                                />
                            </div>
                            <label
                                htmlFor="terms"
                                className="text-[11px] font-medium leading-none text-gray-500 dark:text-gray-400 cursor-pointer"
                            >
                                <Trans
                                    i18nKey="auth.register.acceptTerms"
                                    components={[
                                        <Link key="privacy" to="/privacy" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()} />,
                                        <Link key="terms" to="/terms" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()} />
                                    ]}
                                />
                            </label>
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={loading || !isPasswordValid || !acceptTerms}>
                            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
                        </Button>
                    </form>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.login.or')}</span>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] h-11"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loading}
                        >
                            <GoogleIcon className="w-4 h-4 mr-2" />
                            {t('auth.login.google')}
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] h-11"
                            onClick={() => handleOAuthLogin('notion')}
                            disabled={loading}
                        >
                            <NotionIcon className="w-4 h-4 mr-2" />
                            {t('auth.login.notion')}
                        </Button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed px-4">
                            <Trans
                                i18nKey="auth.login.oauthDisclaimer"
                                components={[
                                    <Link key="privacy" to="/privacy" className="text-primary hover:underline font-medium" />,
                                    <Link key="terms" to="/terms" className="text-primary hover:underline font-medium" />
                                ]}
                            />
                        </p>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('auth.register.hasAccount')} </span>
                        <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                            {t('auth.register.login')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
