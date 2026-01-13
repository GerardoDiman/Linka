import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "¿Es seguro conectar mi cuenta de Notion?",
        answer: "Sí, Linka utiliza tokens de integración oficiales de Notion y solo solicita los permisos necesarios para leer la estructura de tus bases de datos. No almacenamos tus datos de contenido."
    },
    {
        question: "¿Qué tipos de bases de datos puedo visualizar?",
        answer: "Puedes visualizar cualquier base de datos de Notion a la que tengas acceso. Linka detectará automáticamente las relaciones (Relation properties) entre ellas."
    },
    {
        question: "¿Ofrecen una versión gratuita?",
        answer: "Sí, tenemos un plan gratuito que te permite visualizar un número limitado de nodos y relaciones. Para sistemas más complejos, ofrecemos planes premium."
    },
    {
        question: "¿Puedo exportar mis mapas de datos?",
        answer: "¡Claro! Los usuarios premium pueden exportar sus visualizaciones en formatos de alta resolución como PNG, SVG y PDF."
    }
]

export function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    return (
        <section className="py-24 bg-gray-50/30">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                            Preguntas Frecuentes
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Todo lo que necesitas saber sobre Linka.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm"
                            >
                                <button
                                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                    aria-expanded={activeIndex === index}
                                    aria-controls={`faq-answer-${index}`}
                                    id={`faq-question-${index}`}
                                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-secondary">{faq.question}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            id={`faq-answer-${index}`}
                                            role="region"
                                            aria-labelledby={`faq-question-${index}`}
                                        >
                                            <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
