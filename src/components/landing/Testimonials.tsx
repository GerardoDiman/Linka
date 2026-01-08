import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
    {
        content: "Linka ha cambiado por completo la forma en que gestionamos nuestros proyectos en Notion. La visualización de nodos es simplemente increíble.",
        author: "Carlos Rodríguez",
        role: "Product Manager en TechFlow",
        avatar: "https://i.pravatar.cc/150?u=carlos"
    },
    {
        content: "Poder ver las relaciones entre mis bases de datos me ha ahorrado horas de navegación innecesaria. Es una herramienta esencial.",
        author: "Elena Martínez",
        role: "Consultora de Productividad",
        avatar: "https://i.pravatar.cc/150?u=elena"
    },
    {
        content: "La interfaz es limpia, rápida y muy intuitiva. La integración con Notion fue instantánea. ¡Altamente recomendado!",
        author: "David Soto",
        role: "Desarrollador Fullstack",
        avatar: "https://i.pravatar.cc/150?u=david"
    }
]

export function Testimonials() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                        Lo que dicen nuestros usuarios
                    </h2>
                    <div className="mt-4 flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 hover:border-primary/20 transition-colors duration-300"
                        >
                            <p className="text-gray-600 italic mb-8 leading-relaxed">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.author}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                />
                                <div>
                                    <h4 className="font-bold text-secondary">{testimonial.author}</h4>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
