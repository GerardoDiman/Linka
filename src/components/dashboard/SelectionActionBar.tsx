import { motion, AnimatePresence } from "framer-motion"
import { EyeOff, Lock } from "lucide-react"
import { Button } from "../ui/button"
import { Tooltip } from "../ui/Tooltip"
import { NODE_COLORS } from "../../lib/colors"

interface SelectionActionBarProps {
    selectedCount: number
    onBatchColorChange: (color: string) => void
    onBatchHide: () => void
    userPlan?: string
    onOpenPricing?: () => void
    isSidebarCollapsed?: boolean
    activeColor?: string
}

// Use full master palette to ensure all node colors are represented
const PRESET_COLORS = NODE_COLORS

export function SelectionActionBar({
    selectedCount,
    onBatchColorChange,
    onBatchHide,
    userPlan = 'free',
    onOpenPricing,
    isSidebarCollapsed,
    activeColor
}: SelectionActionBarProps) {
    if (selectedCount === 0) return null

    const isFree = userPlan === 'free'
    const sidebarWidth = isSidebarCollapsed ? 80 : 288 // 20*4 : 72*4
    const leftOffset = (sidebarWidth / 2)

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, x: "-50%", opacity: 0 }}
                animate={{
                    y: 0,
                    x: `calc(-50% + ${leftOffset}px)`,
                    opacity: 1
                }}
                exit={{ y: 100, x: "-50%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="fixed bottom-12 left-1/2 z-[100] flex items-center gap-4 px-5 py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] pointer-events-auto"
            >
                {/* Selection Counter */}
                <div className="flex items-center gap-2.5 pr-4 border-r border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-center w-7 h-7 bg-primary text-white text-[10px] font-black rounded-lg shadow-lg shadow-primary/20">
                        {selectedCount}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-900 dark:text-white leading-none uppercase tracking-tight">Seleccion</span>
                    </div>
                </div>

                {/* Color Palette */}
                <div
                    className={`flex items-center gap-2 relative ${isFree ? 'cursor-pointer group/colors' : ''}`}
                    onClick={() => isFree && onOpenPricing?.()}
                >
                    <div className={`flex flex-col gap-1`}>
                        <div className={`flex items-center flex-wrap gap-1.5 bg-gray-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800 relative transition-all max-w-[280px] sm:max-w-[400px] ${isFree ? 'opacity-40 grayscale-[0.8] blur-[0.5px]' : ''}`}>
                            {PRESET_COLORS.map((color) => (
                                <Tooltip key={color} content={isFree ? "Función Pro" : "Cambiar color"}>
                                    <button
                                        onClick={(e) => {
                                            if (isFree) {
                                                e.stopPropagation()
                                                onOpenPricing?.()
                                            } else {
                                                onBatchColorChange(color)
                                            }
                                        }}
                                        className={`w-5 h-5 rounded-lg border-2 shadow-sm transition-all ${isFree ? 'cursor-pointer border-white dark:border-slate-800' : 'hover:scale-125 hover:z-10'} ${!isFree && activeColor?.toLowerCase() === color.toLowerCase() ? 'border-primary ring-2 ring-primary/20 scale-125 z-10' : 'border-white dark:border-slate-800'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                </Tooltip>
                            ))}
                            {isFree && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Lock size={12} className="text-gray-600 dark:text-slate-300" />
                                </div>
                            )}
                        </div>
                        {isFree && (
                            <span className="text-[8px] font-bold text-primary/80 dark:text-primary/60 text-center uppercase tracking-[0.1em]">
                                ¡Hazte Pro para usar colores! 🔒
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-2">
                    <Tooltip content="Ocultar seleccionadas">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBatchHide}
                            className="h-9 px-3 rounded-xl text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-900 font-bold flex items-center gap-2 transition-all"
                        >
                            <EyeOff size={16} />
                            Ocultar
                        </Button>
                    </Tooltip>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
