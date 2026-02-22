import { useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Sun, Moon, LogOut } from "lucide-react"
import { Hero } from "../components/landing/Hero"
import { Features } from "../components/landing/Features"
import { FAQ } from "../components/landing/FAQ"
// import { Testimonials } from "../components/landing/Testimonials"
import { AccessRequestForm } from "../components/landing/AccessRequestForm"
import { Logo } from "../components/ui/Logo"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { Tooltip } from "../components/ui/Tooltip"

export default function LandingPage() {
    const { t, i18n } = useTranslation()
    const { session, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { scrollY, scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
    }

    const handleLogout = async () => {
        await signOut()
    }

    const headerBg = useTransform(
        scrollY,
        [0, 50],
        theme === 'dark'
            ? ["rgba(15, 23, 42, 0)", "rgba(15, 23, 42, 0.8)"]
            : ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
    )

    const headerBlur = useTransform(
        scrollY,
        [0, 50],
        ["blur(0px)", "blur(12px)"]
    )

    const headerShadow = useTransform(
        scrollY,
        [0, 50],
        theme === 'dark'
            ? ["none", "0 4px 6px -1px rgb(0 0 0 / 0.3)"]
            : ["none", "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"]
    )


    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 selection:bg-primary/10 selection:text-primary transition-colors duration-300">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
                style={{ scaleX }}
            />
            <motion.header
                style={{
                    backgroundColor: headerBg,
                    backdropFilter: headerBlur,
                    boxShadow: headerShadow
                }}
                className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
            >
                <nav className="flex items-center justify-between p-4 lg:px-12 max-w-[1600px] mx-auto" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
                            <Logo size={32} />
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
                                Linka
                            </span>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex lg:gap-x-12 md:gap-x-8">
                        <a href="#features" className="text-sm font-bold leading-6 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">{t('landing.nav.features')}</a>
                        <a href="#access" className="text-sm font-bold leading-6 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">{t('landing.nav.access')}</a>
                    </div>

                    <div className="flex lg:flex-1 lg:justify-end items-center gap-2">
                        {/* Language Toggle */}
                        <Tooltip content={i18n.language === 'es' ? 'English' : 'Español'} position="bottom">
                            <button
                                onClick={toggleLanguage}
                                className="p-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {i18n.language.toUpperCase()}
                            </button>
                        </Tooltip>

                        {/* Theme Toggle */}
                        <Tooltip content={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')} position="bottom">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </Tooltip>

                        {session ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <a href="/dashboard" className="text-sm font-bold leading-6 text-primary hover:text-primary/80 transition-colors px-3 py-2 rounded-lg hover:bg-primary/5">
                                    {t('landing.nav.dashboard')}
                                </a>
                                <Tooltip content={t('common.logout')} position="bottom">
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </Tooltip>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <a href="/login" className="text-sm font-bold leading-6 text-slate-900 dark:text-white hover:text-primary transition-colors">
                                    {t('landing.nav.login')}
                                </a>
                                <a href="/register" className="rounded-full bg-slate-900 dark:bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-200 dark:shadow-none hover:bg-primary hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    {t('landing.nav.getStarted')}
                                </a>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-full p-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">{t('landing.nav.openMenu')}</span>
                            {isMobileMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                <motion.div
                    initial={false}
                    animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    className="md:hidden overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
                >
                    <div className="space-y-1 p-4">
                        <a
                            href="#features"
                            className="block rounded-xl px-3 py-4 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t('landing.nav.features')}
                        </a>
                        <a
                            href="#access"
                            className="block rounded-xl px-3 py-4 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t('landing.nav.access')}
                        </a>
                        <div className="pt-4 pb-2 border-t border-slate-50 dark:border-slate-800 mt-2 space-y-4">
                            {!session && (
                                <>
                                    <a href="/login" className="block px-3 text-base font-bold text-slate-900 dark:text-white">{t('landing.nav.signIn')}</a>
                                    <a href="/register" className="block rounded-full bg-primary px-4 py-3 text-center text-base font-bold text-white shadow-lg">{t('landing.nav.signUp')}</a>
                                </>
                            )}
                            {session && (
                                <>
                                    <a href="/dashboard" className="block px-3 text-base font-bold text-primary">{t('landing.nav.dashboard')}</a>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 text-base font-bold text-red-500"
                                    >
                                        {t('common.logout')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.header>

            <main>
                <Hero />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    id="features"
                >
                    <Features />
                </motion.div>

                {/* <Testimonials /> */}

                <FAQ />

                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="py-24 bg-gray-50/50 dark:bg-slate-800/50 relative overflow-hidden"
                    id="access"
                >
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-2xl mx-auto">
                            <AccessRequestForm />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />
                </motion.section>
            </main>

            <footer className="bg-white dark:bg-slate-900 py-12 border-t border-gray-100 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Logo size={24} className="opacity-50 grayscale" />
                            <span className="text-lg font-bold text-gray-400 dark:text-slate-500">Linka</span>
                        </div>
                        <p className="text-gray-400 dark:text-slate-500 text-sm">&copy; {new Date().getFullYear()} Linka. {t('landing.footer.tagline')}</p>
                        <div className="flex gap-6">
                            <span className="text-gray-300 dark:text-slate-600 text-sm">{t('landing.footer.privacy')}</span>
                            <span className="text-gray-300 dark:text-slate-600 text-sm">{t('landing.footer.terms')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

