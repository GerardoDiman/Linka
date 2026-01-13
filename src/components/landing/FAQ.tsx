import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "¿Cómo protege Linka mi privacidad en Notion?",
        answer: "Linka utiliza el protocolo oficial de integración de Notion. Solo solicitamos permisos para leer la estructura de tus bases de datos y páginas. Nunca almacenamos el contenido interno de tus documentos; solo visualizamos las conexiones entre ellos."
    },
    {
        question: "¿La sincronización con Notion es automática?",
        answer: "Para darte total control y optimizar el rendimiento, la sincronización es bajo demanda. Con un solo clic en el botón de 'Sincronizar', Linka traerá los últimos cambios y relaciones de tu espacio de trabajo."
    },
    {
        question: "¿Puedo exportar mis gráficos para presentaciones?",
        answer: "Sí, puedes exportar cualquier visualización en formato PNG de alta fidelidad. Esto es ideal para incluir tus mapas de datos en reportes, presentaciones de equipo o documentación técnica."
    },
    {
        question: "¿Qué pasa si mis bases de datos son muy grandes?",
        answer: "Linka está diseñado para manejar estructuras complejas. Contamos con filtros inteligentes que te permiten ocultar o mostrar bases de datos específicas, permitiéndote enfocarte en las relaciones que realmente importan."
    },
    {
        question: "¿Cómo puedo obtener soporte si tengo dudas?",
        answer: "Estamos aquí para ayudarte. Puedes contactarnos directamente escribiendo a soporte@linka.io o a través de nuestros canales oficiales. Respondemos a todas las consultas en menos de 24 horas."
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
