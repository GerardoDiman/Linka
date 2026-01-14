import { motion } from "framer-motion"

interface SkeletonProps {
    className?: string
    variant?: 'rectangle' | 'circle' | 'text'
    width?: string | number
    height?: string | number
}

export function Skeleton({
    className = "",
    variant = 'rectangle',
    width,
    height
}: SkeletonProps) {
    const baseStyles = "bg-slate-200 dark:bg-slate-700 overflow-hidden relative"
    const variantStyles = {
        rectangle: "rounded-md",
        circle: "rounded-full",
        text: "rounded h-4 w-full mb-2 last:mb-0"
    }

    return (
        <motion.div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={{ width, height }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
        </motion.div>
    )
}
