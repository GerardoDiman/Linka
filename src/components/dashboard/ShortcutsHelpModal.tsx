import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ShortcutsHelpModalProps {
    isOpen: boolean
    onClose: () => void
}

interface ShortcutItem {
    keys: string[]
    description: string
}

export function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
    const { t } = useTranslation()

    const shortcuts: ShortcutItem[] = [
        { keys: ['Ctrl', 'K'], description: t('dashboard.shortcuts.search') },
        { keys: ['Ctrl', 'S'], description: t('dashboard.shortcuts.save') },
        { keys: ['Ctrl', 'I'], description: t('dashboard.shortcuts.info') },
        { keys: ['Ctrl', 'Z'], description: t('dashboard.shortcuts.undo') },
        { keys: ['Ctrl', 'Y'], description: t('dashboard.shortcuts.redo') },
        { keys: ['Space'], description: t('dashboard.shortcuts.fitView') },
        { keys: ['Esc'], description: t('dashboard.shortcuts.deselect') },
        { keys: ['Shift', '?'], description: t('dashboard.shortcuts.help') },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden w-full max-w-md max-h-[85vh] flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Keyboard size={20} className="text-primary" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {t('dashboard.shortcuts.title')}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Shortcuts List */}
                            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                                {shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {shortcut.description}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <span key={keyIndex}>
                                                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg shadow-sm min-w-[28px] text-center inline-block">
                                                        {key}
                                                    </kbd>
                                                    {keyIndex < shortcut.keys.length - 1 && (
                                                        <span className="mx-0.5 text-gray-400">+</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700">
                                <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
                                    {t('dashboard.shortcuts.footer')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
