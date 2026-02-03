import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Redirection is handled by App.tsx observing session change
        } catch (err: any) {
            setError(err.message || t('auth.login.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.login.email')}
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
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('auth.login.password')}
                                </label>
                                <Link to="/recovery" className="text-sm font-medium text-primary hover:text-primary/80">
                                    {t('auth.login.forgotPassword')}
                                </Link>
                            </div>
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
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('auth.login.noAccount')} </span>
                            <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                                {t('auth.login.register')}
                            </Link>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">{t('auth.login.noAccess')} </span>
                            <Link to="/#access" className="text-xs font-medium text-primary hover:text-primary/80">
                                {t('auth.login.requestAccess')}
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
