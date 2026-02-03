import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "../components/auth/AuthLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { supabase } from "../lib/supabase"

export default function RecoveryPage() {
    const { t } = useTranslation()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || t('auth.recovery.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title={t('auth.recovery.title')} subtitle={t('auth.recovery.subtitle')}>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="pt-6">
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="text-green-600 dark:text-green-400 font-medium">
                                {t('auth.recovery.success')}
                            </div>
                            <Link to="/login">
                                <Button variant="outline" className="w-full dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700">
                                    {t('auth.recovery.backToLogin')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRecovery} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('auth.recovery.email')}
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    className="mt-1 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('auth.recovery.submitting') : t('auth.recovery.submit')}
                            </Button>
                            <div className="text-center text-sm">
                                <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                                    {t('auth.recovery.back')}
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
