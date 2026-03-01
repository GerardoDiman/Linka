import { motion } from "framer-motion"
import { Check, Star, Zap } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export function Pricing() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    }

    return (
        <section id="pricing" className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        {t('dashboard.pricing.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 dark:text-slate-400"
                    >
                        {t('dashboard.pricing.subtitle')}
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
                >
                    {/* Free Plan */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500"
                    >
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.pricing.freePlan')}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.pricing.forever')}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {[
                                t('dashboard.pricing.freeLimit'),
                                t('dashboard.pricing.basicFilters'),
                                t('dashboard.pricing.manualSync'),
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/register")}
                            className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-black text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            {t('landing.nav.getStarted')}
                        </Button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className="relative p-8 rounded-3xl bg-white dark:bg-slate-900/40 border-2 border-primary flex flex-col shadow-2xl shadow-primary/10 dark:shadow-none group transition-all duration-500"
                    >
                        <div className="absolute top-0 right-8 bg-primary text-[11px] font-black text-white px-4 py-1.5 rounded-b-xl uppercase tracking-widest">
                            {t('dashboard.pricing.recommended')}
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.pricing.proPlan')}</h3>
                                <div className="p-1 rounded bg-amber-400/20">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">$12</span>
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.pricing.perMonth')}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {[
                                t('dashboard.pricing.proLimit'),
                                t('dashboard.pricing.autoSync'),
                                t('dashboard.pricing.customColors'),
                                t('dashboard.pricing.prioritySupport'),
                                t('dashboard.pricing.futureFeatures'),
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            <Button
                                onClick={() => navigate("/register")}
                                className="relative w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                <Zap className="w-5 h-5 mr-2 fill-white" />
                                {t('dashboard.pricing.getPro')}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
