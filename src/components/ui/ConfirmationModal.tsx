import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { createPortal } from "react-dom"
import { Button } from "./button"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'default'
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'default'
}: ConfirmationModalProps) {
    const variantStyles = {
        danger: {
            icon: "text-red-500 bg-red-50 dark:bg-red-900/20",
            button: "bg-red-500 hover:bg-red-600 text-white"
        },
        warning: {
            icon: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
            button: "bg-amber-500 hover:bg-amber-600 text-white"
        },
        default: {
            icon: "text-primary bg-primary/10",
            button: "bg-primary hover:bg-primary/90 text-white"
        }
    }

    const styles = variantStyles[variant]

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="confirmation-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="confirmation-modal-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${styles.icon}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-10 font-bold dark:border-slate-700 dark:text-gray-300"
                                onClick={onClose}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                className={`flex-1 h-10 font-bold ${styles.button}`}
                                onClick={() => {
                                    onConfirm()
                                    onClose()
                                }}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}
