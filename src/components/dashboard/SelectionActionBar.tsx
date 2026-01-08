import { motion, AnimatePresence } from "framer-motion"
import { EyeOff, Palette, X } from "lucide-react"
import { Button } from "../ui/button"
import { Tooltip } from "../ui/Tooltip"

interface SelectionActionBarProps {
    selectedCount: number
    onClearSelection: () => void
    onBatchColorChange: (color: string) => void
    onBatchHide: () => void
}

const PRESET_COLORS = [
    "#FF5733", // Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#F333FF", // Magenta
    "#33FFF5", // Cyan
    "#F5FF33", // Yellow
    "#FF33A1", // Pink
    "#8C33FF", // Purple
]

export function SelectionActionBar({
    selectedCount,
    onClearSelection,
    onBatchColorChange,
    onBatchHide
}: SelectionActionBarProps) {
    if (selectedCount === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                exit={{ y: 100, x: "-50%", opacity: 0 }}
                className="fixed bottom-12 left-[calc(50%+90px)] z-[100] flex items-center gap-6 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] pointer-events-auto"
            >
                {/* Selection Counter */}
                <div className="flex items-center gap-3 pr-6 border-r border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20">
                        {selectedCount}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">Bases de Datos</span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium tracking-tight">Seleccionadas</span>
                    </div>
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-2">
                    <div className="p-2 text-gray-400 dark:text-slate-500">
                        <Palette size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
                        {PRESET_COLORS.map((color) => (
                            <Tooltip key={color} content="Cambiar color">
                                <button
                                    onClick={() => onBatchColorChange(color)}
                                    className="w-5 h-5 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-125 hover:z-10"
                                    style={{ backgroundColor: color }}
                                />
                            </Tooltip>
                        ))}
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

                    <div className="w-px h-6 bg-gray-100 dark:bg-slate-700 mx-1" />

                    <Tooltip content="Deseleccionar todo">
                        <button
                            onClick={onClearSelection}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </Tooltip>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
