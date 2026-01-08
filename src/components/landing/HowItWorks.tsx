import { motion } from "framer-motion"
import { Link2, Layout, BarChart3 } from "lucide-react"

const steps = [
    {
        title: "Conecta",
        description: "Vincula tu cuenta de Notion de forma segura en segundos.",
        icon: Link2,
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        title: "Visualiza",
        description: "Mira cómo tus bases de datos se transforman en un mapa interactivo.",
        icon: Layout,
        color: "text-purple-500",
        bg: "bg-purple-50"
    },
    {
        title: "Analiza",
        description: "Descubre relaciones ocultas y optimiza tu flujo de trabajo.",
        icon: BarChart3,
        color: "text-emerald-500",
        bg: "bg-emerald-50"
    }
]

export function HowItWorks() {
    return (
        <section className="py-24 bg-gray-50/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                        ¿Cómo funciona Linka?
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Tres simples pasos para dominar tus datos.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className={`w-20 h-20 ${step.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm group hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className={`w-10 h-10 ${step.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed max-w-xs">
                                    {step.description}
                                </p>

                                {/* Step Number */}
                                <div className="mt-6 w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 shadow-sm">
                                    {index + 1}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
