import { useRef, useState } from "react"
import { motion } from "framer-motion"
import {
    Database,
    Share2,
    Zap,
    Lock,
    Users,
    Download,
    FileText,
    Layout,
    ChevronLeft,
    ChevronRight
} from "lucide-react"

// --- Hero Visual Components (Redesigned for the Gallery) ---

const NodeVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0 group/hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent)] blur-3xl" />
        </div>

        <div className="relative w-full h-full p-8 lg:p-12">
            {/* Extended Connection Lines for Rectangular Space */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path
                    d="M 15%,25% L 85%,15% L 90%,75% L 10%,85% Z"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                    className="text-primary/20"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                    d="M 15%,25% L 90%,75% M 85%,15% L 10%,85% M 50%,50% L 15%,25% M 50%,50% L 85%,15% M 50%,50% L 90%,75% M 50%,50% L 10%,85%"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
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
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.4, 0]
                    }}
                    transition={{
                        duration: 8 + Math.random() * 8,
                        repeat: Infinity,
                        delay: Math.random() * 5
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

        <div className="relative w-full h-full flex items-center justify-center scale-110 lg:scale-135">
            <div className="relative w-full max-w-[160px] lg:max-w-[200px] aspect-[16/10] bg-white rounded-3xl border border-emerald-100/50 shadow-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        <Lock className="w-10 h-10 lg:w-14 lg:h-14 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                    </div>
                    <div className="mt-6 w-24 lg:w-32 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
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
                        duration: 0.8 + Math.random() * 1,
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
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    }}
                    animate={{
                        x: i % 2 === 0 ? [0, 300] : [0, -300],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.5 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: Math.random() * 3,
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

const CollaborationVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="flex -space-x-6 lg:-space-x-8 scale-100 lg:scale-110">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                    className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full border-[3px] border-white bg-gradient-to-br shadow-xl ${['from-rose-400 to-rose-600', 'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600'][i]}`}
                />
            ))}
            <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border-[3px] border-white bg-slate-50 shadow-xl flex items-center justify-center text-xs font-black text-slate-400 z-10"
            >
                +12
            </motion.div>
        </div>
    </div>
)

const ExportVisualHero = () => (
    <div className="relative w-full h-full flex items-center justify-center p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),transparent)]" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent top-1/4" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent bottom-1/4" />

        <div className="relative group/file scale-100 lg:scale-115">
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-28 lg:w-28 lg:h-36 bg-white rounded-3xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-5 relative overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500/20" />
                <FileText className="w-8 h-8 lg:w-12 lg:h-12 text-indigo-500 opacity-60 mb-3" />
                <div className="w-full space-y-2">
                    <div className="w-full h-1.5 bg-slate-50 rounded-full" />
                    <div className="w-2/3 h-1.5 bg-slate-50 rounded-full" />
                </div>
            </motion.div>
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    y: [0, 4, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 lg:p-3 rounded-2xl shadow-xl z-10"
            >
                <Download className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.div>
        </div>
    </div>
)

// --- Feature Data ---

const galleryFeatures = [
    {
        name: "Gráfico de Nodos Activo",
        description: "Visualiza tu ecosistema completo como una red de nodos inteligentes. Conecta bases de datos y páginas con una claridad sin precedentes.",
        icon: Database,
        visual: <NodeVisualHero />,
        color: "bg-blue-600",
        badge: "Visual Core"
    },
    {
        name: "Relaciones de un Vistazo",
        description: "Identificamos conexiones complejas automáticamente, permitiéndote navegar tu conocimiento multidimensional sin esfuerzo.",
        icon: Share2,
        visual: <RelationVisualHero />,
        color: "bg-purple-600",
        badge: "Intelligence"
    },
    {
        name: "Seguridad End-to-End",
        description: "Tu privacidad es lo primero. Implementamos encriptación de grado militar para asegurar que tus datos siempre sean tuyos.",
        icon: Lock,
        visual: <SecurityVisualHero />,
        color: "bg-emerald-600",
        badge: "Private"
    },
    {
        name: "Sincronización en Tiempo Real",
        description: "Tus cambios en Notion se reflejan al instante. Sin esperas, sin errores, solo flujo puro de información.",
        icon: Zap,
        visual: <SyncVisualHero />,
        color: "bg-amber-500",
        badge: "Fast"
    },
    {
        name: "Gestión de Equipo",
        description: "Colabora de forma fluida con permisos granulares y visualización compartida de estructuras de datos.",
        icon: Users,
        visual: <CollaborationVisualHero />,
        color: "bg-rose-600",
        badge: "Social"
    },
    {
        name: "Exportación Profesional",
        description: "Lleva tus mapas a donde quieras con exportaciones en SVG, PNG y PDF optimizadas para impresión y diseño.",
        icon: Download,
        visual: <ExportVisualHero />,
        color: "bg-indigo-600",
        badge: "Toolkit"
    }
]

export function Features() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollPosition = scrollContainerRef.current.scrollLeft;
        const width = scrollContainerRef.current.offsetWidth;
        const index = Math.round(scrollPosition / width);
        if (index !== activeIndex) setActiveIndex(index);
    };

    const scroll = (offset: number) => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollBy({
            left: offset,
            behavior: 'smooth'
        });
    };

    const scrollTo = (index: number) => {
        if (!scrollContainerRef.current) return;
        const width = scrollContainerRef.current.offsetWidth;
        scrollContainerRef.current.scrollTo({
            left: index * width,
            behavior: 'smooth'
        });
    };

    return (
        <section className="pt-4 pb-8 bg-slate-50/50 overflow-hidden" id="features">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 lg:mb-6 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary tracking-widest uppercase mb-2"
                        >
                            Tour de Producto
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl mb-1 lg:mb-2 leading-tight"
                        >
                            Tu cerebro digital en <span className="text-primary">alta resolución</span>
                        </motion.h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Explora las herramientas que redefinen tu flujo de trabajo en Notion.
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => scroll(-400)}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all bg-white shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll(400)}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-white hover:bg-primary/90 transition-all bg-slate-900 shadow-md"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {galleryFeatures.map((feature) => (
                        <motion.div
                            key={feature.name}
                            className="min-w-full lg:min-w-[48%] snap-start px-1 lg:px-2 py-1"
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <div className="relative group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl overflow-hidden flex flex-col lg:grid lg:grid-cols-[0.9fr_1.1fr] transition-all duration-500 cursor-pointer">
                                {/* Text Content */}
                                <div className="p-6 md:p-7 lg:p-8 order-2 lg:order-1 flex flex-col items-start justify-center">
                                    <div className="flex items-center gap-3.5 mb-3 lg:mb-4">
                                        <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl ${feature.color} text-white flex items-center justify-center shadow-lg shadow-${feature.color.split('-')[1]}-500/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                                            <feature.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <div>
                                            <div className="mb-0.5">
                                                <span className="text-[7.5px] lg:text-[8px] font-black text-primary tracking-[0.2em] uppercase bg-primary/10 px-2 py-0.5 rounded-full">{feature.badge}</span>
                                            </div>
                                            <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-primary transition-colors duration-500">
                                                {feature.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-sm lg:text-[14.5px] text-slate-500 font-medium leading-relaxed max-w-sm">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Immersive Visual Area - Truly Full Bleed & Adaptive */}
                                <div className={`order-1 lg:order-2 ${feature.color.split('-').slice(0, -1).join('-')}-500/[0.03] lg:${feature.color.split('-').slice(0, -1).join('-')}-500/[0.05] p-0 h-[220px] md:h-[240px] lg:h-auto lg:self-stretch lg:border-l border-slate-100 flex items-center justify-center overflow-hidden relative`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                                    {/* Adaptive Mouse Perspective */}
                                    <motion.div
                                        className="w-full h-full flex items-center justify-center"
                                        whileHover={{
                                            rotateY: 12,
                                            rotateX: -8,
                                            scale: 1.02,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 120,
                                            damping: 25
                                        }}
                                        style={{ perspective: 1200 }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            {feature.visual}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Dots Navigation */}
                <div className="flex justify-center items-center gap-3 mt-4">
                    {galleryFeatures.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`transition-all duration-500 rounded-full ${i === activeIndex
                                ? 'w-10 h-2.5 bg-primary shadow-lg shadow-primary/30'
                                : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
