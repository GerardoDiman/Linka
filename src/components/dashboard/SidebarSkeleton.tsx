import { motion } from "framer-motion"

interface SidebarSkeletonProps {
    count?: number
}

export function SidebarSkeleton({ count = 5 }: SidebarSkeletonProps) {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="px-6 pt-6 pb-4 space-y-4">
                <div className="text-center space-y-2">
                    {/* Title skeleton */}
                    <div className="h-3 w-24 mx-auto bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    {/* Count skeleton */}
                    <div className="h-8 w-12 mx-auto bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>

                {/* Sort buttons skeleton */}
                <div className="flex items-center justify-center gap-2">
                    <div className="h-8 w-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-8 w-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-8 w-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Database items skeleton */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {Array.from({ length: count }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50"
                    >
                        {/* Database icon skeleton */}
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />

                        <div className="flex-1 space-y-2">
                            {/* Database name skeleton */}
                            <div
                                className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
                                style={{ width: `${60 + (i * 15 % 30)}%` }}
                            />
                            {/* Properties count skeleton */}
                            <div className="h-2 w-16 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
                        </div>

                        {/* Toggle skeleton */}
                        <div className="w-8 h-4 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
