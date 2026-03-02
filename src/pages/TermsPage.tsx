import { motion } from "framer-motion"
import { FileText, Scale, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "../components/ui/Logo"

export default function TermsPage() {

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-primary/10 selection:text-primary">
            <header className="fixed top-0 inset-x-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-50">
                <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity">
                        <ArrowLeft size={18} />
                        <span>Volver</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Logo size={24} />
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
                            Linka
                        </span>
                    </div>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <section className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight underline decoration-secondary/30 decoration-8 underline-offset-4">
                            Términos de Servicio
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Vigente desde: 2 de marzo de 2026</p>
                    </section>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <CheckCircle className="text-secondary mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Uso Autorizado</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Al usar Linka, aceptas cumplir con nuestros términos y utilizar la herramienta de forma ética y legal.
                            </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <Scale className="text-secondary mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Responsabilidad</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Eres responsable de mantener la seguridad de tu cuenta y de los tokens de integración que vincules.
                            </p>
                        </div>
                    </div>

                    <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="text-secondary" size={24} />
                                1. Aceptación de los Términos
                            </h2>
                            <p>
                                Al acceder o utilizar Linka, aceptas estar legalmente vinculado a estos términos. Si no estás de acuerdo con alguna parte, no podrás utilizar el servicio.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">2. Descripción del Servicio</h2>
                            <p>
                                Linka es una herramienta de visualización de datos diseñada para trabajar en conjunto con Notion. El servicio permite conectar bases de datos externas para generar gráficos y visualizaciones interactivas.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <AlertCircle className="text-secondary" size={24} />
                                3. Limitaciones de Responsabilidad
                            </h2>
                            <p>
                                Linka no se hace responsable por pérdidas de datos originadas en plataformas externas (Notion/Google), errores de red, o fallos fuera de nuestro control razonable. El servicio se ofrece "tal cual" (as-is).
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">4. Modificaciones</h2>
                            <p>
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la aplicación tras dichos cambios constituye tu aceptación de los nuevos términos.
                            </p>
                        </div>
                    </article>

                    <section className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 mb-6">¿Alguna pregunta sobre estas condiciones?</p>
                        <a href="mailto:soporte@linka.io" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Contactar Soporte
                        </a>
                    </section>
                </motion.div>
            </main>
        </div>
    )
}
