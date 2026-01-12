import { useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Hero } from "../components/landing/Hero"
import { Features } from "../components/landing/Features"
import { FAQ } from "../components/landing/FAQ"
import { AccessRequestForm } from "../components/landing/AccessRequestForm"
import { Logo } from "../components/ui/Logo"
import { useAuth } from "../context/AuthContext"

export default function LandingPage() {
    const { session } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { scrollY, scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const headerBg = useTransform(
        scrollY,
        [0, 50],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
    )

    const headerBlur = useTransform(
        scrollY,
        [0, 50],
        ["blur(0px)", "blur(12px)"]
    )

    const headerShadow = useTransform(
        scrollY,
        [0, 50],
        ["none", "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"]
    )


    return (
        <div className="min-h-screen bg-white selection:bg-primary/10 selection:text-primary">
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
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600 tracking-tight">
                                Linka
                            </span>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex lg:gap-x-12 md:gap-x-8">
                        <a href="#features" className="text-sm font-bold leading-6 text-slate-600 hover:text-primary transition-colors">Características</a>
                        <a href="#access" className="text-sm font-bold leading-6 text-slate-600 hover:text-primary transition-colors">Solicitar Acceso</a>
                    </div>

                    <div className="flex lg:flex-1 lg:justify-end items-center gap-4">
                        {session ? (
                            <a href="/dashboard" className="hidden sm:flex text-sm font-bold leading-6 text-primary hover:text-primary/80 transition-colors items-center gap-1">
                                Ir al Dashboard <span aria-hidden="true">&rarr;</span>
                            </a>
                        ) : (
                            <div className="hidden sm:flex items-center gap-4">
                                <a href="/login" className="text-sm font-bold leading-6 text-slate-900 hover:text-primary transition-colors">
                                    Conectar
                                </a>
                                <a href="/register" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-200 hover:bg-primary hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    Empezar
                                </a>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-full p-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">Abrir menú</span>
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
                    className="md:hidden overflow-hidden bg-white border-t border-slate-100"
                >
                    <div className="space-y-1 p-4">
                        <a
                            href="#features"
                            className="block rounded-xl px-3 py-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Características
                        </a>
                        <a
                            href="#access"
                            className="block rounded-xl px-3 py-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Solicitar Acceso
                        </a>
                        <div className="pt-4 pb-2 border-t border-slate-50 mt-2 space-y-4">
                            {!session && (
                                <>
                                    <a href="/login" className="block px-3 text-base font-bold text-slate-900">Iniciar Sesión</a>
                                    <a href="/register" className="block rounded-full bg-primary px-4 py-3 text-center text-base font-bold text-white shadow-lg">Registrarse</a>
                                </>
                            )}
                            {session && (
                                <a href="/dashboard" className="block px-3 text-base font-bold text-primary">Ir al Dashboard</a>
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

                <FAQ />

                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="py-24 bg-gray-50/50 relative overflow-hidden"
                    id="access"
                >
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-2xl mx-auto">
                            <AccessRequestForm />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </motion.section>
            </main>

            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Logo size={24} className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                            <span className="text-lg font-bold text-gray-400">Linka</span>
                        </div>
                        <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Linka. Todos los derechos reservados.</p>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Privacidad</a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Términos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

