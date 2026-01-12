import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Hero } from "../components/landing/Hero"
import { Features } from "../components/landing/Features"
import { HowItWorks } from "../components/landing/HowItWorks"
import { Testimonials } from "../components/landing/Testimonials"
import { FAQ } from "../components/landing/FAQ"
import { AccessRequestForm } from "../components/landing/AccessRequestForm"
import { Logo } from "../components/ui/Logo"
import { useAuth } from "../context/AuthContext"

export default function LandingPage() {
    const { session } = useAuth()
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
                <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="flex items-center gap-2 group transition-transform hover:scale-105">
                            <Logo size={32} />
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
                                Linka
                            </span>
                        </a>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        <a href="#features" className="text-sm font-semibold leading-6 text-gray-600 hover:text-primary transition-colors">Características</a>
                        <a href="#how-it-works" className="text-sm font-semibold leading-6 text-gray-600 hover:text-primary transition-colors">Cómo funciona</a>
                        <a href="#access" className="text-sm font-semibold leading-6 text-gray-600 hover:text-primary transition-colors">Solicitar Acceso</a>
                    </div>
                    <div className="flex lg:flex-1 lg:justify-end items-center gap-4">
                        {session ? (
                            <a href="/dashboard" className="text-sm font-semibold leading-6 text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                                Ir al Dashboard <span aria-hidden="true">&rarr;</span>
                            </a>
                        ) : (
                            <>
                                <a href="/login" className="hidden sm:block text-sm font-semibold leading-6 text-gray-900 hover:text-primary transition-colors">
                                    Iniciar Sesión
                                </a>
                                <a href="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-105 active:scale-95">
                                    Registrarse
                                </a>
                            </>
                        )}
                    </div>
                </nav>
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

                <div id="how-it-works">
                    <HowItWorks />
                </div>

                <Testimonials />

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

