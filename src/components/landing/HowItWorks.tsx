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

                <div className="relative mt-20">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[40px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="relative">
                                    <div className={`absolute -inset-4 ${step.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className={`relative w-24 h-24 ${step.bg} rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                                        <step.icon className={`w-12 h-12 ${step.color}`} />
                                    </div>

                                    {/* Step Number Badge */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-primary shadow-lg flex items-center justify-center text-sm font-bold text-primary z-20">
                                        {index + 1}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-lg font-medium">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
