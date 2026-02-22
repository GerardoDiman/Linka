import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { motion } from "framer-motion"
import { supabase } from "../../lib/supabase"
import { sendN8NWebhook } from "../../lib/webhooks"
import { useTranslation } from "react-i18next"

export function AccessRequestForm() {
    const { t } = useTranslation()
    const [email, setEmail] = useState("")
    const [comments, setComments] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.rpc('submit_waitlist_request', {
                email_input: email,
                comments_input: comments
            })

            if (error) throw error

            // Send webhook to n8n
            await sendN8NWebhook("waitlist_request", {
                email,
                comments
            })

            setSubmitted(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('landing.access.error'))
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-green-50 rounded-lg border border-green-100"
            >
                <h3 className="text-lg font-semibold text-green-800">{t('landing.access.success.title')}</h3>
                <p className="text-green-600">{t('landing.access.success.desc')}</p>
            </motion.div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto relative group">
            {/* Background Decor */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>

            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-[2rem] shadow-2xl overflow-hidden p-8 md:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{t('landing.access.title')}</h2>
                    <p className="text-slate-500 font-medium">
                        {t('landing.access.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('landing.access.form.emailLabel')}</label>
                        <Input
                            type="email"
                            placeholder={t('landing.access.form.emailPlaceholder')}
                            required
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-primary/20 transition-all text-base px-6 dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('landing.access.form.commentsLabel')}</label>
                        <Textarea
                            placeholder={t('landing.access.form.commentsPlaceholder')}
                            value={comments}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                            className="min-h-[120px] rounded-2xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-primary/20 transition-all text-base p-6 resize-none dark:text-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                    >
                        {loading ? t('landing.access.form.submitting') : t('landing.access.form.submit')}
                    </Button>

                    <p className="text-center text-[10px] text-slate-400 font-medium px-4 leading-relaxed">
                        {t('landing.access.form.policy')}
                    </p>
                </form>
            </div>
        </div>
    )
}
