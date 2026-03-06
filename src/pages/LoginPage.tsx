import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Eye, EyeOff, Mail } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useToast } from "../context/ToastContext"
import { GoogleIcon } from "../components/ui/GoogleIcon"
import { NotionIcon } from "../components/ui/NotionIcon"

export default function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast.success(t('auth.login.success'))
            navigate("/dashboard")
        } catch (error: any) {
            toast.error(error.message || t('auth.login.error'))
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
        } catch (error: any) {
            toast.error(error.message || t('auth.login.error'))
        }
    }

    return (
        <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="email">
                                {t('auth.login.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="pl-10 h-11 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300" htmlFor="password">
                                    {t('auth.login.password')}
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    {t('auth.login.forgotPassword')}
                                </Link>
                            </div>
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
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
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
                        <span className="text-gray-500 dark:text-gray-400">{t('auth.login.noAccount')} </span>
                        <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                            {t('auth.login.register')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
