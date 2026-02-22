import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { DataAnimation } from "./DataAnimation"
import { SplitText } from "../animations/SplitText"
import { ShinyText } from "../animations/ShinyText"

export function Hero() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    return (
        <section className="relative isolate pt-20 pb-16 sm:pt-24 sm:pb-24 overflow-hidden bg-white dark:bg-slate-900">
            {/* ... (background elements unchanged) ... */}
            <div className="absolute inset-0 -z-10 overflow-hidden bg-white dark:bg-slate-950">
                {/* Clean Modern Engineering Grid */}
                <svg
                    className="absolute inset-0 h-full w-full stroke-slate-200/50 dark:stroke-slate-800/50 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
                    aria-hidden="true"
                >
                    <defs>
                        <pattern
                            id="hero-grid"
                            width={60}
                            height={60}
                            x="50%"
                            y={-1}
                            patternUnits="userSpaceOnUse"
                        >
                            <path d="M.5 60V.5H60" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth={0} fill="url(#hero-grid)" />
                </svg>

                {/* Sweeping Aurora / Glows */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                    <motion.div
                        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[40rem] h-[40rem] bg-secondary/20 dark:bg-secondary/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen will-change-transform"
                    />
                </div>
                <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4">
                    <motion.div
                        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="w-[50rem] h-[50rem] bg-primary/20 dark:bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen will-change-transform"
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-4xl will-change-transform"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium ring-1 ring-inset ring-primary/20">
                            <ShinyText text={t('landing.hero.badge')} speed={3} className="!text-primary font-bold" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl mb-4 lg:mb-6 leading-[1.1] lg:leading-[1.05]">
                        <SplitText
                            text={t('landing.hero.title1')}
                            display="block"
                            delay={0.2}
                            className="pb-1"
                        />
                        <SplitText
                            text={t('landing.hero.title2')}
                            delay={0.2}
                            display="block"
                            className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary pb-2"
                        />
                    </h1>

                    <p className="mt-10 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
                        {t('landing.hero.description')}
                    </p>

                    <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <div className="relative group w-full sm:w-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-100 transition duration-700"></div>
                            <Button
                                size="lg"
                                onClick={() => {
                                    const element = document.getElementById('access');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                aria-label={t('landing.hero.cta')}
                                className="relative w-full sm:w-auto h-14 px-10 text-lg rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all font-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:translate-y-0"
                            >
                                {t('landing.hero.cta')} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/register")}
                            aria-label={t('landing.hero.secondaryCta')}
                            className="w-full sm:w-auto h-14 px-10 text-lg rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all"
                        >
                            {t('landing.hero.secondaryCta')}
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
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('landing.hero.infoTitle')}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t('landing.hero.infoDesc')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                                <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex flex-col justify-center">
                                    <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1">{t('landing.hero.syncTitle')}</h4>
                                    <p className="text-sm text-blue-600/80 dark:text-blue-300/80 leading-snug">{t('landing.hero.syncDesc')}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex flex-col justify-center">
                                    <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-1">{t('landing.hero.intelTitle')}</h4>
                                    <p className="text-sm text-purple-600/80 dark:text-purple-300/80 leading-snug">{t('landing.hero.intelDesc')}</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <div className="flex -space-x-3">
                                        {['Alex', 'Sam', 'Jordan', 'Taylor'].map((seed, i) => (
                                            <img
                                                key={i}
                                                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 shadow-md hover:scale-110 hover:z-10 transition-transform relative cursor-default object-cover bg-slate-100 dark:bg-slate-800"
                                                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=transparent`}
                                                alt={`${t('landing.hero.avatarAlt')} ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                    <span>{t('landing.hero.community')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Animation */}
                        <div className="relative group order-1 lg:order-2 w-full max-w-2xl mx-auto lg:mr-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10">
                                <div className="rounded-xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-gray-900/10 dark:ring-slate-700 overflow-hidden relative">
                                    <div className="w-full relative pb-[70%] sm:pb-[56.25%]">
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


