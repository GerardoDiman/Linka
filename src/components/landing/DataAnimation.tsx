import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Database, Table, Share2, FileText, Tag, Bell, Users, MessageSquare } from "lucide-react"
import { useTranslation } from "react-i18next"

interface SchemaNode {
    id: string
    title: string
    icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
    color: string
    x: number
    y: number
    properties: number
    relations: number
}

export function DataAnimation() {
    const { t } = useTranslation()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const desktopNodes: SchemaNode[] = [
        { id: "tareas", title: t('landing.hero.animation.nodes.tasks'), icon: Table, color: "#3b82f6", x: 50, y: 50, properties: 2, relations: 3 },
        { id: "usuarios", title: t('landing.hero.animation.nodes.users'), icon: Users, color: "#8b5cf6", x: 80, y: 35, properties: 2, relations: 2 },
        { id: "notificaciones", title: t('landing.hero.animation.nodes.notifications'), icon: Bell, color: "#f43f5e", x: 50, y: 15, properties: 2, relations: 1 },
        { id: "comentarios", title: t('landing.hero.animation.nodes.comments'), icon: MessageSquare, color: "#10b981", x: 80, y: 65, properties: 2, relations: 1 },
        { id: "etiquetas", title: t('landing.hero.animation.nodes.tags'), icon: Tag, color: "#f59e0b", x: 50, y: 85, properties: 2, relations: 1 },
        { id: "archivos", title: t('landing.hero.animation.nodes.files'), icon: FileText, color: "#06b6d4", x: 20, y: 65, properties: 2, relations: 1 },
        { id: "logs", title: t('landing.hero.animation.nodes.logs'), icon: Database, color: "#64748b", x: 20, y: 35, properties: 2, relations: 0 },
    ]

    const mobileNodes: SchemaNode[] = [
        { id: "tareas", title: t('landing.hero.animation.nodes.tasks'), icon: Table, color: "#3b82f6", x: 50, y: 50, properties: 2, relations: 3 },
        { id: "usuarios", title: t('landing.hero.animation.nodes.users'), icon: Users, color: "#8b5cf6", x: 78, y: 35, properties: 2, relations: 2 },
        { id: "notificaciones", title: t('landing.hero.animation.nodes.notifications'), icon: Bell, color: "#f43f5e", x: 50, y: 22, properties: 2, relations: 1 },
        { id: "comentarios", title: t('landing.hero.animation.nodes.comments'), icon: MessageSquare, color: "#10b981", x: 78, y: 65, properties: 2, relations: 1 },
        { id: "etiquetas", title: t('landing.hero.animation.nodes.tags'), icon: Tag, color: "#f59e0b", x: 50, y: 78, properties: 2, relations: 1 },
        { id: "archivos", title: t('landing.hero.animation.nodes.files'), icon: FileText, color: "#06b6d4", x: 22, y: 65, properties: 2, relations: 1 },
        { id: "logs", title: t('landing.hero.animation.nodes.logs'), icon: Database, color: "#64748b", x: 22, y: 35, properties: 2, relations: 0 },
    ]

    const connections = [
        { from: "tareas", to: "usuarios", color: "#F97316" },
        { from: "tareas", to: "notificaciones", color: "#A855F7" },
        { from: "tareas", to: "comentarios", color: "#3B82F6" },
        { from: "tareas", to: "etiquetas", color: "#EC4899" },
        { from: "tareas", to: "archivos", color: "#06B6D4" },
        { from: "notificaciones", to: "usuarios", color: "#A855F7" },
    ]

    const nodes = isMobile ? mobileNodes : desktopNodes

    return (
        <div className="relative w-full h-full bg-[#F8FAFC] overflow-hidden group/canvas">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            {/* Background Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 bg-primary/20 rounded-full"
                    initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        opacity: 0
                    }}
                    animate={{
                        y: [null, "-20%"],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                />
            ))}

            {/* Connections Layer */}
            <svg className="absolute inset-0 w-full h-full">
                {connections.map((conn, i) => {
                    const fromNode = nodes.find(n => n.id === conn.from)
                    const toNode = nodes.find(n => n.id === conn.to)
                    if (!fromNode || !toNode) return null

                    return (
                        <g key={`conn-group-${i}`}>
                            {/* Static Background Line */}
                            <line
                                x1={`${fromNode.x}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x}%`}
                                y2={`${toNode.y}%`}
                                stroke={conn.color}
                                strokeWidth="1"
                                className="opacity-10"
                            />
                            {/* Animated Flow Line */}
                            <motion.line
                                x1={`${fromNode.x}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x}%`}
                                y2={`${toNode.y}%`}
                                stroke={conn.color}
                                strokeWidth="2"
                                strokeDasharray="4 8"
                                initial={{ strokeDashoffset: 0, opacity: 0 }}
                                animate={{
                                    strokeDashoffset: -24,
                                    opacity: 0.4
                                }}
                                transition={{
                                    strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" },
                                    opacity: { duration: 0.5, delay: i * 0.1 }
                                }}
                            />
                        </g>
                    )
                })}
            </svg>

            {/* Nodes Layer */}
            {nodes.map((node, index) => (
                <motion.div
                    key={node.id}
                    className="absolute bg-white rounded-lg shadow-md border overflow-hidden w-[70px] sm:w-[84px] cursor-pointer"
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        borderColor: node.color,
                        x: "-50%",
                        y: "-50%",
                        zIndex: node.id === "tareas" ? 20 : 10
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        y: ["-50%", "-51.5%", "-50%"]
                    }}
                    whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        zIndex: 30
                    }}
                    transition={{
                        scale: { duration: 0.3, ease: "easeOut" },
                        opacity: { duration: 0.6, delay: index * 0.1 },
                        y: {
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                >
                    {/* Glow Effect for main node */}
                    {node.id === "tareas" && (
                        <motion.div
                            className="absolute inset-0 bg-primary/20"
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}

                    {/* Card Header */}
                    <div className="px-1 py-0.5 border-b flex items-center justify-between bg-gray-50/50 relative z-10">
                        <div className="flex items-center gap-1">
                            <node.icon className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: node.color }} />
                            <span className="text-[6px] sm:text-[9px] font-bold text-gray-700 truncate">{node.title}</span>
                        </div>
                        <Share2 className="w-1 h-1 sm:w-1.5 sm:h-1.5 text-gray-400" />
                    </div>

                    {/* Card Body */}
                    <div className="p-1 grid grid-cols-2 gap-0.5 sm:gap-1 relative z-10">
                        <div className="text-center">
                            <p className="text-[4px] sm:text-[5px] uppercase tracking-wider text-gray-400 font-black">Props</p>
                            <p className="text-[7px] sm:text-[9px] font-black text-gray-700">{node.properties}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[4px] sm:text-[5px] uppercase tracking-wider text-gray-400 font-black">Rels</p>
                            <p className="text-[7px] sm:text-[9px] font-black text-gray-700">{node.relations}</p>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-1 py-0.5 bg-gray-50/30 border-t flex justify-center relative z-10">
                        <span className="text-[5px] sm:text-[6px] font-bold text-primary flex items-center gap-0.5">
                            <Database className="w-1 h-1" /> {t('landing.hero.animation.more')}
                        </span>
                    </div>
                </motion.div>
            ))}

        </div>
    )
}
