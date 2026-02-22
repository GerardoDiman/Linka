import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Testimonials() {
    const { t } = useTranslation()

    const testimonials = [
        {
            content: t('landing.testimonials.t1.content'),
            author: t('landing.testimonials.t1.author'),
            role: t('landing.testimonials.t1.role'),
            avatarSeed: "Felix"
        },
        {
            content: t('landing.testimonials.t2.content'),
            author: t('landing.testimonials.t2.author'),
            role: t('landing.testimonials.t2.role'),
            avatarSeed: "Avery"
        },
        {
            content: t('landing.testimonials.t3.content'),
            author: t('landing.testimonials.t3.author'),
            role: t('landing.testimonials.t3.role'),
            avatarSeed: "Jocelyn"
        }
    ]

    return (
        <section className="py-24 bg-white dark:bg-slate-900 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent" />
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        {t('landing.testimonials.title')}
                    </h2>
                    <div className="mt-4 flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                            className="p-8 rounded-3xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10 flex flex-col group relative overflow-hidden"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-medium relative z-10 flex-grow">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto relative z-10 pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
                                    <img
                                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=${testimonial.avatarSeed}&backgroundColor=transparent`}
                                        alt={testimonial.author}
                                        className="relative w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{testimonial.author}</h4>
                                    <p className="text-[13px] font-medium text-primary mt-0.5">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
