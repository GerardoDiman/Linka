import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"


export function FAQ() {
    const { t } = useTranslation()
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const faqs = [
        {
            question: t('landing.faq.q1.question'),
            answer: t('landing.faq.q1.answer')
        },
        {
            question: t('landing.faq.q2.question'),
            answer: t('landing.faq.q2.answer')
        },
        {
            question: t('landing.faq.q3.question'),
            answer: t('landing.faq.q3.answer')
        },
        {
            question: t('landing.faq.q4.question'),
            answer: t('landing.faq.q4.answer')
        },
        {
            question: t('landing.faq.q5.question'),
            answer: t('landing.faq.q5.answer')
        }
    ]

    return (
        <section className="py-24 bg-gray-50/30">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                            {t('landing.faq.title')}
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            {t('landing.faq.subtitle')}
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
