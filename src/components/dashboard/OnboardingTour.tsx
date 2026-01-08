import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, X, HelpCircle, CheckCircle2 } from "lucide-react"
import { Button } from "../ui/button"

interface Step {
    targetId: string
    title: string
    content: string
    position: "top" | "bottom" | "left" | "right" | "center"
}

const STEPS: Step[] = [
    {
        targetId: "navbar-logo",
        title: "¡Bienvenido a Linka!",
        content: "Esta es tu brújula para navegar la complejidad de tus bases de datos de Notion. Vamos a darte un tour rápido.",
        position: "bottom"
    },
    {
        targetId: "navbar-sync",
        title: "Conecta con Notion",
        content: "Aquí puedes ingresar tu Token de Integración para traer tus bases de datos reales. Linka recordará tu sesión.",
        position: "bottom"
    },
    {
        targetId: "navbar-search",
        title: "Búsqueda Rápida",
        content: "¿Buscas una base de datos específica? Escribe aquí para resaltar los nodos y filtrar tu lista al instante.",
        position: "bottom"
    },
    {
        targetId: "navbar-filters",
        title: "Filtros de Propiedades",
        content: "Filtra el mapa por tipos de propiedad (ej. solo ver DBs que tengan Emails) o limpia el ruido ocultando bases aisladas.",
        position: "bottom"
    },
    {
        targetId: "sidebar-container",
        title: "Tu Inventario",
        content: "Aquí tienes todas tus bases de datos. Puedes ver cuántas propiedades tienen y hacer doble clic para centrar una en el mapa.",
        position: "right"
    },
    {
        targetId: "sidebar-collapse-btn",
        title: "Espacio de Trabajo",
        content: "Colapsa este panel si necesitas más espacio para explorar tu mapa. Linka es totalmente responsivo.",
        position: "right"
    },
    {
        targetId: "dashboard-canvas",
        title: "El Mapa Interactivo",
        content: "Arrastra los nodos para organizarlos a tu gusto. Haz zoom con la rueda del ratón o usa los controles para navegar.",
        position: "center"
    },
    {
        targetId: "dashboard-reset-layout",
        title: "Orden Automático",
        content: "¿Tu mapa se volvió caótico? Pulsa aquí y nuestro algoritmo de fuerzas volverá a organizar todo de forma equilibrada.",
        position: "right"
    },
    {
        targetId: "navbar-theme",
        title: "A tu Estilo",
        content: "Cambia entre el modo oscuro (para concentración) y el modo claro (para claridad) según prefieras.",
        position: "bottom"
    }
]

interface OnboardingTourProps {
    isOpen: boolean
    onClose: () => void
}

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

    const step = STEPS[currentStep]

    // Reset to start if reopened after completion
    useEffect(() => {
        if (isOpen && currentStep === STEPS.length - 1) {
            // If the user previously finished it and is opening it again via "Help"
            setCurrentStep(0)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const updateRect = () => {
            const el = document.getElementById(step.targetId)
            if (el) {
                setTargetRect(el.getBoundingClientRect())
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else if (step.targetId === "dashboard-canvas") {
                setTargetRect(null) // Special case for center
            }
        }

        updateRect()
        window.addEventListener('resize', updateRect)
        return () => window.removeEventListener('resize', updateRect)
    }, [isOpen, currentStep, step.targetId])

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            onClose()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    if (!isOpen) return null

    // Compute coordinates
    const tooltipWidth = 320
    const padding = 20
    let left = 0
    let top = 0

    if (targetRect) {
        if (step.position === "bottom") {
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
            top = targetRect.bottom + 20
        } else if (step.position === "top") {
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
            top = targetRect.top - 240 // Expected max height
        } else if (step.position === "right") {
            left = targetRect.right + 20
            top = targetRect.top
        } else if (step.position === "left") {
            left = targetRect.left - tooltipWidth - 20
            top = targetRect.top
        }

        // Clamp horizontally to viewport
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))
        // Clamp vertically to viewport
        top = Math.max(padding, Math.min(top, window.innerHeight - 250 - padding))
    }

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dark Overlay with Hole (Spotlight) */}
            <AnimatePresence>
                {targetRect && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 pointer-events-auto overflow-hidden"
                        style={{
                            clipPath: `polygon(
                                0% 0%, 
                                0% 100%, 
                                ${targetRect.left - 12}px 100%, 
                                ${targetRect.left - 12}px ${targetRect.top - 12}px, 
                                ${targetRect.right + 12}px ${targetRect.top - 12}px, 
                                ${targetRect.right + 12}px ${targetRect.bottom + 12}px, 
                                ${targetRect.left - 12}px ${targetRect.bottom + 12}px, 
                                ${targetRect.left - 12}px 100%, 
                                100% 100%, 
                                100% 0%
                            )`
                        }}
                        onClick={onClose}
                    />
                )}
                {!targetRect && step.position === "center" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 pointer-events-auto"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        x: targetRect ? left - (window.innerWidth / 2) + (tooltipWidth / 2) : 0,
                        top: targetRect ? top : undefined
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`pointer-events-auto w-[320px] bg-white dark:bg-gray-800 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white dark:border-gray-700 p-6 flex flex-col gap-4 relative`}
                    style={{
                        position: targetRect ? 'absolute' : 'relative',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                {currentStep === STEPS.length - 1 ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                ) : (
                                    <HelpCircle className="w-5 h-5 text-primary" />
                                )}
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">
                                Paso {currentStep + 1} de {STEPS.length}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            {step.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        {currentStep > 0 && (
                            <Button
                                variant="outline"
                                className="flex-1 h-11 rounded-2xl border-gray-100 dark:border-gray-700 font-bold text-gray-500"
                                onClick={handlePrev}
                            >
                                <ChevronLeft className="mr-1 w-4 h-4" />
                                Anterior
                            </Button>
                        )}
                        <Button
                            className="flex-[1.5] h-11 rounded-2xl shadow-lg shadow-primary/20 font-bold"
                            onClick={handleNext}
                        >
                            {currentStep === STEPS.length - 1 ? "Completar" : "Siguiente"}
                            {currentStep < STEPS.length - 1 && <ChevronRight className="ml-1 w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Arrow Pointer */}
                    {targetRect && (step.position !== "center") && (
                        <div
                            className={`absolute w-4 h-4 bg-white dark:bg-gray-800 border-white dark:border-gray-700 rotate-45 pointer-events-none -z-10`}
                            style={{
                                // Vertical position
                                ...((step.position === "bottom" || step.position === "top") ? {
                                    top: step.position === "bottom" ? -8 : 'auto',
                                    bottom: step.position === "top" ? -8 : 'auto',
                                } : {
                                    top: Math.max(20, Math.min(220, targetRect.top + (targetRect.height / 2) - top - 8))
                                }),
                                // Horizontal position
                                ...((step.position === "left" || step.position === "right") ? {
                                    left: step.position === "right" ? -8 : 'auto',
                                    right: step.position === "left" ? -8 : 'auto'
                                } : {
                                    left: Math.max(20, Math.min(tooltipWidth - 40, targetRect.left + (targetRect.width / 2) - left - 8))
                                }),
                                borderLeftWidth: (step.position === "bottom" || step.position === "right") ? 1 : 0,
                                borderTopWidth: (step.position === "bottom" || step.position === "left") ? 1 : 0,
                                borderRightWidth: (step.position === "top" || step.position === "left") ? 1 : 0,
                                borderBottomWidth: (step.position === "top" || step.position === "right") ? 1 : 0,
                            }}
                        />
                    )}
                </motion.div>
            </div>
        </div>
    )
}
