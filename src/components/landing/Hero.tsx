import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { DataAnimation } from "./DataAnimation"
import { SplitText } from "../animations/SplitText"
import { ShinyText } from "../animations/ShinyText"
import { Magnetic } from "../animations/Magnetic"

export function Hero() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    return (
        <section className="relative isolate pt-20 pb-16 sm:pt-24 sm:pb-24 overflow-hidden bg-white dark:bg-slate-900">
            {/* ... (background elements unchanged) ... */}
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
                            <path d="M80 160V.5M.5 .5H160" fill="none" stroke="currentColor" className="text-black/5 dark:text-white/5" />
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
                    className="mx-auto max-w-4xl"
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
                            delay={1.2}
                            display="block"
                            className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-600 to-primary pb-2"
                        />
                    </h1>

                    <p className="mt-10 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
                        {t('landing.hero.description')}
                    </p>

                    <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                        <Magnetic amount={1.2}>
                            <Button
                                size="lg"
                                onClick={() => {
                                    const element = document.getElementById('access');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                aria-label={t('landing.hero.cta')}
                                className="w-full sm:w-auto h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
                            >
                                {t('landing.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                            </Button>
                        </Magnetic>
                        <Magnetic amount={1.2}>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate("/register")}
                                aria-label={t('landing.hero.secondaryCta')}
                                className="w-full sm:w-auto h-14 px-10 text-lg rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-600 dark:text-white transition-all border-2 font-bold"
                            >
                                {t('landing.hero.secondaryCta')}
                            </Button>
                        </Magnetic>
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
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <img key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/100?u=${i}`} alt={`${t('landing.hero.avatarAlt')} ${i}`} />
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


