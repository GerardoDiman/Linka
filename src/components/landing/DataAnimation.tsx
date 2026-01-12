import { motion } from "framer-motion"
import { Database, Table, Share2, FileText, Tag, Bell, Users, MessageSquare } from "lucide-react"

interface SchemaNode {
    id: string
    title: string
    icon: any
    color: string
    x: number
    y: number
    properties: number
    relations: number
}

const nodes: SchemaNode[] = [
    { id: "tareas", title: "Tareas", icon: Table, color: "#22C55E", x: 50, y: 50, properties: 2, relations: 3 },
    { id: "usuarios", title: "Usuarios", icon: Users, color: "#F97316", x: 80, y: 35, properties: 2, relations: 2 },
    { id: "notificaciones", title: "Notificaciones", icon: Bell, color: "#A855F7", x: 50, y: 15, properties: 2, relations: 1 },
    { id: "comentarios", title: "Comentarios", icon: MessageSquare, color: "#3B82F6", x: 80, y: 65, properties: 2, relations: 1 },
    { id: "etiquetas", title: "Etiquetas", icon: Tag, color: "#EC4899", x: 50, y: 85, properties: 2, relations: 1 },
    { id: "archivos", title: "Archivos", icon: FileText, color: "#06B6D4", x: 20, y: 65, properties: 2, relations: 1 },
    { id: "logs", title: "Logs", icon: Database, color: "#EAB308", x: 20, y: 35, properties: 2, relations: 0 },
]

const connections = [
    { from: "tareas", to: "usuarios", color: "#F97316" },
    { from: "tareas", to: "notificaciones", color: "#A855F7" },
    { from: "tareas", to: "comentarios", color: "#3B82F6" },
    { from: "tareas", to: "etiquetas", color: "#EC4899" },
    { from: "tareas", to: "archivos", color: "#06B6D4" },
    { from: "notificaciones", to: "usuarios", color: "#A855F7" },
]

export function DataAnimation() {
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
                    className="absolute bg-white rounded-lg shadow-md border overflow-hidden w-20 sm:w-24 cursor-pointer"
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
                            className="absolute inset-0 bg-primary/5"
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}

                    {/* Card Header */}
                    <div className="px-1.5 py-0.5 border-b flex items-center justify-between bg-gray-50/50 relative z-10">
                        <div className="flex items-center gap-1">
                            <node.icon size={8} style={{ color: node.color }} />
                            <span className="text-[7px] sm:text-[9px] font-bold text-gray-700 truncate">{node.title}</span>
                        </div>
                        <Share2 size={6} className="text-gray-400" />
                    </div>

                    {/* Card Body */}
                    <div className="p-1.5 grid grid-cols-2 gap-1 relative z-10">
                        <div className="text-center">
                            <p className="text-[5px] uppercase tracking-wider text-gray-400 font-bold">Props</p>
                            <p className="text-[9px] font-bold text-gray-700">{node.properties}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[5px] uppercase tracking-wider text-gray-400 font-bold">Rels</p>
                            <p className="text-[9px] font-bold text-gray-700">{node.relations}</p>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-1.5 py-0.5 bg-gray-50/30 border-t flex justify-center relative z-10">
                        <span className="text-[5px] font-bold text-primary flex items-center gap-1">
                            <Database size={5} /> Ver más
                        </span>
                    </div>
                </motion.div>
            ))}

            {/* UI Controls (Simulated) */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1 opacity-50 group-hover/canvas:opacity-100 transition-opacity">
                {[1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className="w-6 h-6 bg-white rounded shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 text-[10px]"
                    >
                        {i === 1 ? "+" : i === 2 ? "-" : i === 3 ? "□" : "🔒"}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
