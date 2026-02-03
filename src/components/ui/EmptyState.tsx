import { Database, Inbox, Search, FileQuestion } from "lucide-react"
import { motion } from "framer-motion"

interface EmptyStateProps {
    type?: 'databases' | 'search' | 'generic'
    title: string
    description?: string
    action?: React.ReactNode
}

const icons = {
    databases: Database,
    search: Search,
    generic: FileQuestion
}

export function EmptyState({ type = 'generic', title, description, action }: EmptyStateProps) {
    const Icon = icons[type] || Inbox

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
        >
            {/* Animated Icon Container */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative w-20 h-20 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-primary/10"
                >
                    <Icon size={36} className="text-primary/60" strokeWidth={1.5} />
                </motion.div>

                {/* Decorative dots */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary/30 rounded-full"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-2 -left-2 w-2 h-2 bg-violet-400/40 rounded-full"
                />
            </div>

            {/* Text Content */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    {description}
                </p>
            )}

            {/* Optional Action */}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </motion.div>
    )
}
