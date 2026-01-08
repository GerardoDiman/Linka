import React, { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

interface TooltipProps {
    children: React.ReactNode
    content: string
    position?: "top" | "bottom" | "left" | "right"
    delay?: number
}

export function Tooltip({ children, content, position = "top", delay = 0.7 }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.top + rect.height / 2,
                left: rect.left + rect.width / 2
            })
        }

        // Clear any existing timer before starting a new one
        if (timer) clearTimeout(timer)

        const timeout = setTimeout(() => {
            setIsVisible(true)
        }, delay * 1000)
        setTimer(timeout)
    }

    const handleMouseLeave = () => {
        if (timer) {
            clearTimeout(timer)
            setTimer(null)
        }
        setIsVisible(false)
    }

    const handleMouseDown = () => {
        // Hide immediately on click to prevent tooltips getting stuck during theme changes or other actions
        handleMouseLeave()
    }

    const positionStyles: Record<string, React.CSSProperties> = {
        top: { transform: "translate(-50%, -100%)", marginTop: "-10px" },
        bottom: { transform: "translate(-50%, 0)", marginTop: "10px" },
        left: { transform: "translate(-100%, -50%)", marginLeft: "-10px" },
        right: { transform: "translate(0, -50%)", marginLeft: "10px" },
    }

    const animationVariants = {
        top: { opacity: 0, y: 10, x: "-50%" },
        bottom: { opacity: 0, y: -10, x: "-50%" },
        left: { opacity: 0, x: 10, y: "-50%" },
        right: { opacity: 0, x: -10, y: "-50%" },
    }

    const tooltipContent = (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={animationVariants[position]}
                    animate={{
                        opacity: 1,
                        x: position === "left" || position === "right" ? (position === "left" ? "-100%" : "0%") : "-50%",
                        y: position === "top" || position === "bottom" ? (position === "top" ? "-100%" : "0%") : "-50%"
                    }}
                    exit={animationVariants[position]}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                        position: "fixed",
                        top: coords.top,
                        left: coords.left,
                        zIndex: 9999,
                        ...positionStyles[position],
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-white/10"
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 border-white/10 ${position === "top"
                            ? "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b"
                            : position === "bottom"
                                ? "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t"
                                : position === "left"
                                    ? "right-[-4px] top-1/2 -translate-y-1/2 border-r border-t"
                                    : "left-[-4px] top-1/2 -translate-y-1/2 border-l border-b"
                            }`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <div ref={containerRef} className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={handleMouseDown}>
            {children}
            {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
        </div>
    )
}
