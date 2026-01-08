import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DataAnimation } from "./DataAnimation"

export function Hero() {
    const navigate = useNavigate()

    return (
        <section className="relative isolate pt-24 pb-20 sm:pt-32 sm:pb-32 overflow-hidden bg-white">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                <svg
                    className="absolute left-[50%] top-0 h-[64rem] w-[128rem] -translate-x-[50%] [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] opacity-40"
                    aria-hidden="true"
                >
                    <defs>
                        <pattern
                            id="hero-grid"
                            width={80}
                            height={80}
                            x="50%"
                            y={-1}
                            patternUnits="userSpaceOnUse"
                        >
                            <path d="M80 160V.5M.5 .5H160" fill="none" stroke="rgba(0,0,0,0.05)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth={0} fill="url(#hero-grid)" />
                </svg>

                {/* Floating Blobs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[10%] w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -60, 0],
                        y: [0, 40, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-violet-300/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 40, 0],
                        y: [0, 60, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] right-[20%] w-[25rem] h-[25rem] bg-blue-200/20 rounded-full blur-[100px]"
                />
            </div>

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-3xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-8">
                            Nueva Versión 2.0
                        </span>
                    </motion.div>

                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-7xl leading-tight">
                        Visualiza tus datos con{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
                            Inteligencia
                        </span>
                    </h1>

                    <p className="mt-8 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                        Linka transforma tus bases de datos en un canvas interactivo.
                        Entiende las relaciones entre tus datos de manera gráfica, intuitiva y potente.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button
                            size="lg"
                            onClick={() => {
                                const element = document.getElementById('access');
                                element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
                        >
                            Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/register")}
                            className="h-12 px-8 rounded-full hover:bg-gray-50 transition-all hover:-translate-y-1"
                        >
                            Registrarse
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-16 sm:mt-24"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column: Info */}
                        <div className="text-left space-y-8 order-2 lg:order-1">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-900">Explora sin límites</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Navega por tus datos como nunca antes. Linka crea un mapa mental automático de tu ecosistema Notion.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                    <h4 className="font-bold text-blue-700 mb-1">Sincronización</h4>
                                    <p className="text-sm text-blue-600/80">Cambios en tiempo real reflejados en tu mapa.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                                    <h4 className="font-bold text-purple-700 mb-1">Inteligencia</h4>
                                    <p className="text-sm text-purple-600/80">Detección automática de relaciones complejas.</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <img key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                        ))}
                                    </div>
                                    <span>+500 usuarios ya visualizan sus datos</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Animation */}
                        <div className="relative group order-1 lg:order-2 w-full max-w-2xl mx-auto lg:mr-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10">
                                <div className="rounded-xl bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden relative">
                                    <div className="w-full relative" style={{ paddingBottom: '56.25%' }}>
                                        <div className="absolute inset-0">
                                            <DataAnimation />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}


