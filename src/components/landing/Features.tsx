import { motion } from "framer-motion"
import { Database, Share2, Zap, Lock, Users, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"

const features = [
    {
        name: "Visualización de Nodos",
        description: "Cada base de datos es un nodo. Visualiza tus tablas como entidades conectadas en un espacio infinito.",
        icon: Database,
        className: "lg:col-span-2 lg:row-span-2",
        color: "bg-blue-500"
    },
    {
        name: "Relaciones Claras",
        description: "Las relaciones se dibujan automáticamente.",
        icon: Share2,
        className: "lg:col-span-1 lg:row-span-1",
        color: "bg-purple-500"
    },
    {
        name: "Integración Directa",
        description: "Conecta Notion en segundos.",
        icon: Zap,
        className: "lg:col-span-1 lg:row-span-1",
        color: "bg-amber-500"
    },
    {
        name: "Seguridad Total",
        description: "Tus datos están encriptados y seguros con nosotros.",
        icon: Lock,
        className: "lg:col-span-1 lg:row-span-1",
        color: "bg-emerald-500"
    },
    {
        name: "Colaboración",
        description: "Comparte tus mapas con tu equipo en tiempo real.",
        icon: Users,
        className: "lg:col-span-1 lg:row-span-1",
        color: "bg-rose-500"
    },
    {
        name: "Exportación",
        description: "Exporta tus diagramas a PDF o imagen de alta calidad.",
        icon: Download,
        className: "lg:col-span-1 lg:row-span-1",
        color: "bg-indigo-500"
    },
]

export function Features() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl"
                    >
                        Todo tu sistema Notion en un vistazo
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-lg leading-8 text-gray-600"
                    >
                        Deja de navegar entre páginas infinitas. Linka te da la perspectiva aérea que necesitas.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[180px]">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={feature.className}
                        >
                            <Card className="group h-full border-none shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden relative bg-gray-50/50">
                                <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${feature.color}`} />

                                <CardHeader className="relative z-10">
                                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <CardTitle className="text-xl text-secondary group-hover:text-primary transition-colors duration-300">
                                        {feature.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <CardDescription className="text-base leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
