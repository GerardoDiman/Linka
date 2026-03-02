import { motion } from "framer-motion"
import { Shield, Lock, Eye, Server, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "../components/ui/Logo"

export default function PrivacyPage() {

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
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight underline decoration-primary/30 decoration-8 underline-offset-4">
                            Política de Privacidad
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Última actualización: 2 de marzo de 2026</p>
                    </section>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <Shield className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Protección de Datos</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Tu privacidad es nuestra prioridad. Solo recopilamos la información estrictamente necesaria para que Linka funcione.
                            </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <Lock className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Tokens Seguros</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Los tokens de integración de Notion se almacenan de forma cifrada en nuestra base de datos segura gestionada por Supabase.
                            </p>
                        </div>
                    </div>

                    <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Server className="text-primary" size={24} />
                                1. Información que Recopilamos
                            </h2>
                            <p>
                                Para proporcionar el servicio de visualización y sincronización, recopilamos los siguientes datos:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Datos de Cuenta</strong>: Tu nombre, avatar y correo electrónico (obtenidos vía Google o registro directo).</li>
                                <li><strong>Tokens de Integración</strong>: Almacenamos tus tokens de acceso a Notion para poder consultar las bases de datos que elijas visualizar.</li>
                                <li><strong>Metadatos de Visualización</strong>: Guardamos tus preferencias personales como <strong>colores de nodos, filtros aplicados y posiciones de los elementos</strong> en el gráfico para que tu espacio de trabajo se mantenga tal como lo dejaste.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Eye className="text-primary" size={24} />
                                2. Uso de la Información
                            </h2>
                            <p>
                                Linka utiliza la información de Notion únicamente para generar las visualizaciones solicitadas por el usuario. **No vendemos, alquilamos ni compartimos tus datos de Notion ni de Google con terceros**.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">3. Seguridad</h2>
                            <p>
                                Implementamos medidas de seguridad de nivel industrial para proteger tus tokens y datos personales. Toda la comunicación entre Linka, Notion y Google se realiza a través de canales cifrados HTTPS.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">4. Tus Derechos</h2>
                            <p>
                                Puedes eliminar tu cuenta y todos los datos asociados (incluyendo tokens guardados) en cualquier momento desde los ajustes de la aplicación o enviando un correo a soporte@linka.io.
                            </p>
                        </div>
                    </article>

                    <section className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 mb-6">¿Tienes alguna duda sobre nuestra política?</p>
                        <a href="mailto:soporte@linka.io" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors">
                            Contactar Soporte
                        </a>
                    </section>
                </motion.div>
            </main>
        </div>
    )
}
