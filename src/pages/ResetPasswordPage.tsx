import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { Eye, EyeOff, Check } from "lucide-react"

export default function ResetPasswordPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const passwordRequirements = useMemo(() => [
        { label: t('auth.register.passwordRequirements.minLength'), met: password.length >= 10 },
        { label: t('auth.register.passwordRequirements.uppercase'), met: /[A-Z]/.test(password) },
        { label: t('auth.register.passwordRequirements.lowercase'), met: /[a-z]/.test(password) },
        { label: t('auth.register.passwordRequirements.number'), met: /[0-9]/.test(password) },
        { label: t('auth.register.passwordRequirements.special'), met: /[@$!%*?&]/.test(password) },
    ], [password, t])

    const isPasswordValid = passwordRequirements.every(req => req.met)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!isPasswordValid) {
            setError(t('auth.reset.errors.requirements'))
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError(t('auth.reset.errors.mismatch'))
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                navigate("/login")
            }, 3000)
        } catch (err: any) {
            setError(err.message || t('auth.reset.errors.generic'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="pt-6">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg">
                                {t('auth.reset.success')}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('auth.reset.password')}
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
                                    {t('auth.reset.confirmPassword')}
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
                                {loading ? t('auth.reset.submitting') : t('auth.reset.submit')}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
