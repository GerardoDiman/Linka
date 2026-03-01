import { motion } from "framer-motion"
import {
    Database,
    Share2,
    Zap,
    Lock,
    Download,
    FileText,
    Layout,
    Palette
} from "lucide-react"
import { useTranslation } from "react-i18next"

// --- Hero Visual Components (Redesigned for the Gallery) ---

const NodeVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0 group/hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent)] blur-3xl" />
        </div>

        <div className="relative w-full h-full p-8 lg:p-12">
            {/* Extended Connection Lines for Rectangular Space */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <motion.path
                    d="M 15 25 L 85 15 L 90 75 L 10 85 Z"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                    className="text-primary/20"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                    d="M 15 25 L 90 75 M 85 15 L 10 85 M 50 50 L 15 25 M 50 50 L 85 15 M 50 50 L 90 75 M 50 50 L 10 85"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    strokeDasharray="2 2"
                    fill="none"
                    className="text-primary/15"
                />
            </svg>

            {/* Spaced Out Pulsing Nodes */}
            {[
                { x: "15%", y: "25%", delay: 0 },
                { x: "85%", y: "15%", delay: 0.5 },
                { x: "90%", y: "75%", delay: 1 },
                { x: "10%", y: "85%", delay: 1.5 },
                { x: "50%", y: "50%", core: true }
            ].map((node, i) => (
                <motion.div
                    key={i}
                    style={{ left: node.x, top: node.y }}
                    animate={{
                        y: [0, -15, 0],
                        x: [0, i % 2 === 0 ? 10 : -10, 0],
                    }}
                    transition={{
                        duration: 5 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: node.delay || 0
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-2xl flex items-center justify-center
                        ${node.core
                            ? "w-14 h-14 lg:w-18 lg:h-18 bg-primary border-primary/20 z-20 shadow-primary/30"
                            : "w-9 h-9 lg:w-11 lg:h-11 bg-white border-slate-100 z-10 shadow-slate-200/50"}`}
                >
                    <div className={`rounded-full ${node.core ? "w-4 h-4 bg-white/40" : "w-2 h-2 bg-primary/30"}`} />
                </motion.div>
            ))}

            {/* Wide-Spread Floating Particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        left: `${(i * 13) % 100}%`,
                        top: `${(i * 29) % 100}%`,
                        opacity: 0
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.4, 0]
                    }}
                    transition={{
                        duration: 8 + (i % 8),
                        repeat: Infinity,
                        delay: (i * 1.5) % 5
                    }}
                    className="absolute w-1 lg:w-1.5 h-1 lg:h-1.5 bg-primary/30 rounded-full blur-[1px]"
                />
            ))}
        </div>
    </div>
)

const RelationVisualHero = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.12),transparent)]" />
        <div className="relative flex items-center justify-between w-full px-12 lg:px-16 z-10 scale-110 lg:scale-125">
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-3.5 lg:p-4 bg-white rounded-2xl shadow-xl border border-purple-100/50"
            >
                <Database className="w-5 h-5 lg:w-7 lg:h-7 text-purple-600" />
            </motion.div>

            <div className="relative flex-1 mx-4 lg:mx-8 h-1">
                <div className="absolute inset-0 bg-purple-200/30 rounded-full" />
                <motion.div
                    animate={{ left: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 w-12 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-md"
                />
            </div>

            <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="p-3.5 lg:p-4 bg-white rounded-2xl shadow-xl border border-blue-100/50"
            >
                <Layout className="w-5 h-5 lg:w-7 lg:h-7 text-blue-600" />
            </motion.div>
        </div>
    </div>
)

const SecurityVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0">
        <div className="absolute inset-x-0 h-1/2 bottom-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent)] blur-3xl" />
        </div>

        <div className="relative w-full h-full flex items-center justify-center scale-100 lg:scale-115">
            <div className="relative w-full max-w-[140px] lg:max-w-[180px] aspect-[16/10] bg-white rounded-3xl border border-emerald-100/50 shadow-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        <Lock className="w-10 h-10 lg:w-14 lg:h-14 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                    </div>
                    <div className="mt-6 w-24 lg:w-32 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-1/2 h-full bg-emerald-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const SyncVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0 overflow-hidden group/sync">
        {/* Immersive Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent)] blur-3xl transition-transform duration-700 group-hover/sync:scale-110" />
        </div>

        {/* High-Density Energy Stream */}
        <div className="relative w-full h-full flex items-center">
            {/* Rapid Horizontal Energy Streaks */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`streak-${i}`}
                    style={{ top: `${20 + i * 12}%` }}
                    animate={{
                        left: ["-20%", "120%"],
                        opacity: [0, 0.6, 0]
                    }}
                    transition={{
                        duration: 0.8 + (i * 0.2 % 1),
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "linear"
                    }}
                    className="absolute h-[1px] w-32 lg:w-48 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[0.5px]"
                />
            ))}

            {/* Dense Particle Field */}
            {[...Array(40)].map((_, i) => (
                <motion.div
                    key={`part-${i}`}
                    style={{
                        top: `${(i * 17) % 100}%`,
                        left: `${(i * 31) % 100}%`
                    }}
                    animate={{
                        x: i % 2 === 0 ? [0, 300] : [0, -300],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.5 + (i * 0.3 % 1.5),
                        repeat: Infinity,
                        delay: (i * 0.7 % 3),
                        ease: "linear"
                    }}
                    className={`absolute rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]
                        ${i % 5 === 0 ? "w-1.5 h-1.5 blur-[1px]" : "w-1 h-1 blur-[0.5px]"}`}
                />
            ))}

            {/* Central Energy Core Pulse (Subtle) */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-x-0 h-32 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent)] blur-2xl"
            />
        </div>
    </div>
)

const CustomizationVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent)]" />

        {/* Animated Settings UI Elements */}
        <div className="relative flex items-center gap-4 lg:gap-6 scale-90 lg:scale-105">
            {/* Color Palette Node */}
            <motion.div
                animate={{
                    backgroundColor: ["#f43f5e", "#3b82f6", "#8b5cf6", "#f43f5e"],
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl shadow-2xl border-4 border-white flex items-center justify-center text-white"
            >
                <Palette className="w-8 h-8 lg:w-10 lg:h-10" />
            </motion.div>

            {/* Floating Filtered Nodes */}
            <div className="flex flex-col gap-3 lg:gap-4">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.2, x: 20 }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            x: [20, 0, 20],
                            scale: [0.9, 1, 0.9]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeInOut"
                        }}
                        className="h-3 lg:h-4 w-20 lg:w-24 bg-slate-100 rounded-full overflow-hidden"
                    >
                        <motion.div
                            animate={{
                                backgroundColor: ["#e2e8f0", "#fda4af", "#e2e8f0"],
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                            className="h-full w-full"
                        />
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Floating Sparks */}
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: [0, 0.5, 0],
                    scale: [0, 1, 0],
                    x: [0, ((i * 13 % 100) - 50)],
                    y: [0, ((i * 23 % 100) - 50)]
                }}
                transition={{
                    duration: 3 + (i % 2),
                    repeat: Infinity,
                    delay: (i * 0.8 % 5)
                }}
                className="absolute w-1.5 h-1.5 bg-rose-400 rounded-full blur-[1px]"
            />
        ))}
    </div>
)

const ExportVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),transparent)]" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent top-1/4" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent bottom-1/4" />

        <div className="relative group/file scale-90 lg:scale-105">
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-20 lg:w-20 lg:h-28 bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-3 lg:p-4 relative overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-0.5 lg:h-1 bg-indigo-500/20" />
                <FileText className="w-6 h-6 lg:w-9 lg:h-9 text-indigo-500 opacity-60 mb-2 lg:mb-3" />
                <div className="w-full space-y-1 lg:space-y-2">
                    <div className="w-full h-1 lg:h-1.5 bg-slate-50 rounded-full" />
                    <div className="w-2/3 h-1 lg:h-1.5 bg-slate-50 rounded-full" />
                </div>
            </motion.div>
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    y: [0, 2, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 lg:p-2 rounded-xl lg:rounded-2xl shadow-xl z-10"
            >
                <Download className="w-3 h-3 lg:w-4 h-4" />
            </motion.div>
        </div>
    </div>
)

// --- Feature Data ---

export function Features() {
    const { t } = useTranslation()

    const bentoFeatures = [
        // Row 1: Large (Left) | Medium (Right Top) | Medium (Right Bottom)
        {
            name: t('landing.features.cards.visualMapping.title'),
            description: t('landing.features.cards.visualMapping.description'),
            icon: Database,
            visual: <NodeVisualHero />,
            badge: t('landing.features.badges.visualCore'),
            iconClass: "bg-blue-600 text-white shadow-blue-500/30",
            bgGlass: "bg-blue-500/[0.03] lg:bg-blue-500/[0.05] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800",
            borderClass: "hover:border-blue-400/50 dark:hover:border-blue-500/50",
            className: "md:col-span-2 lg:col-span-2 flex-col",
            textClass: "flex-1 justify-center",
            visualClass: "h-[200px] lg:h-[240px]"
        },
        {
            name: t('landing.features.cards.autoRelations.title'),
            description: t('landing.features.cards.autoRelations.description'),
            icon: Share2,
            visual: <RelationVisualHero />,
            badge: t('landing.features.badges.intelligence'),
            iconClass: "bg-purple-600 text-white shadow-purple-500/30",
            bgGlass: "bg-purple-500/[0.03] lg:bg-purple-500/[0.05] border-t border-slate-100 dark:border-slate-800",
            borderClass: "hover:border-purple-400/50 dark:hover:border-purple-500/50",
            className: "col-span-1 md:col-span-1 lg:col-span-1 flex-col",
            textClass: "flex-1 justify-start",
            visualClass: "h-[160px] lg:h-[200px]"
        },
        {
            name: t('landing.features.cards.privacy.title'),
            description: t('landing.features.cards.privacy.description'),
            icon: Lock,
            visual: <SecurityVisualHero />,
            badge: t('landing.features.badges.private'),
            iconClass: "bg-emerald-600 text-white shadow-emerald-500/30",
            bgGlass: "bg-emerald-500/[0.03] lg:bg-emerald-500/[0.05] border-t border-slate-100 dark:border-slate-800",
            borderClass: "hover:border-emerald-400/50 dark:hover:border-emerald-500/50",
            className: "col-span-1 md:col-span-1 lg:col-span-1 flex-col",
            textClass: "flex-1 justify-start",
            visualClass: "h-[160px] lg:h-[200px]"
        },

        // Row 2: Medium (Left) | Small (Right Top) | Small (Right Bottom)
        // Note: To match the exact request `Med | Small, Small`, 
        // Sync becomes Medium (col-span-2 but one row), Customization and Export become Small (col-span-1 each).
        {
            name: t('landing.features.cards.sync.title'),
            description: t('landing.features.cards.sync.description'),
            icon: Zap,
            visual: <SyncVisualHero />,
            badge: t('landing.features.badges.fast'),
            iconClass: "bg-amber-500 text-white shadow-amber-500/30",
            bgGlass: "bg-amber-500/[0.03] lg:bg-amber-500/[0.05] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800",
            borderClass: "hover:border-amber-400/50 dark:hover:border-amber-500/50",
            className: "md:col-span-2 lg:col-span-2 flex-col lg:flex-row",
            textClass: "flex-none lg:w-[45%] lg:justify-center",
            visualClass: "h-[140px] lg:h-full lg:w-[55%]"
        },
        {
            name: t('landing.features.cards.customization.title'),
            description: t('landing.features.cards.customization.description'),
            icon: Palette,
            visual: <CustomizationVisualHero />,
            badge: t('landing.features.badges.design'),
            iconClass: "bg-rose-600 text-white shadow-rose-500/30",
            bgGlass: "bg-rose-500/[0.03] lg:bg-rose-500/[0.05] border-t border-slate-100 dark:border-slate-800",
            borderClass: "hover:border-rose-400/50 dark:hover:border-rose-500/50",
            className: "col-span-1 md:col-span-1 lg:col-span-1 flex-col",
            textClass: "flex-1 justify-start",
            visualClass: "h-[180px] lg:h-[220px]"
        },
        {
            name: t('landing.features.cards.qualityExport.title'),
            description: t('landing.features.cards.qualityExport.description'),
            icon: Download,
            visual: <ExportVisualHero />,
            badge: t('landing.features.badges.toolkit'),
            iconClass: "bg-indigo-600 text-white shadow-indigo-500/30",
            bgGlass: "bg-indigo-500/[0.03] lg:bg-indigo-500/[0.05] border-t border-slate-100 dark:border-slate-800",
            borderClass: "hover:border-indigo-400/50 dark:hover:border-indigo-500/50",
            className: "col-span-1 md:col-span-1 lg:col-span-1 flex-col",
            textClass: "flex-1 justify-start",
            visualClass: "h-[180px] lg:h-[220px]"
        }
    ]

    return (
        <section className="pt-12 pb-24 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden" id="features">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                <div className="text-center mb-12 lg:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-bold text-primary dark:text-blue-400 tracking-widest uppercase mb-4 ring-1 ring-inset ring-primary/20"
                    >
                        {t('landing.features.tour')}
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-4 leading-tight max-w-4xl mx-auto"
                    >
                        {t('landing.features.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto"
                    >
                        {t('landing.features.subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-auto lg:grid-rows-[minmax(380px,auto)_minmax(300px,auto)]">
                    {bentoFeatures.map((feature, i) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                            className={`group bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl overflow-hidden rounded-3xl transition-all duration-500 flex ${feature.className} ${feature.borderClass} will-change-transform`}
                        >
                            {/* Text Content */}
                            <div className={`p-5 lg:p-6 flex flex-col z-10 ${feature.textClass}`}>
                                <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                                    <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 ${feature.iconClass}`}>
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1">
                                            <span className="inline-block text-[8px] sm:text-[9px] font-black text-primary dark:text-white tracking-[0.2em] uppercase bg-primary/10 dark:bg-primary/40 px-2 py-0.5 rounded-full max-w-full">
                                                {feature.badge}
                                            </span>
                                        </div>
                                        <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors duration-500">
                                            {feature.name}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm lg:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Immersive Visual Area */}
                            <div className={`relative flex items-center justify-center overflow-hidden w-full ${feature.bgGlass} ${feature.visualClass}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 dark:from-white/5 to-transparent z-0 pointer-events-none" />
                                <motion.div
                                    className="w-full h-full flex items-center justify-center z-10"
                                    whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    style={{ perspective: 1000 }}
                                >
                                    {feature.visual}
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
