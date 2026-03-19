import { Button } from "../../ui/button"
import { Settings, Sun, Moon, Keyboard, Languages, PlayCircle, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "../../../context/ThemeContext"
import { useClickOutside } from "../../../hooks/useClickOutside"
import { Tooltip } from "../../ui/Tooltip"

interface SettingsPopoverProps {
    userRole?: string | null
    onStartTour?: () => void
    onShowShortcuts?: () => void
    isOpen: boolean
    onToggle: () => void
}

export function SettingsPopover({
    userRole,
    onStartTour,
    onShowShortcuts,
    isOpen,
    onToggle,
}: SettingsPopoverProps) {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { theme, toggleTheme } = useTheme()
    const popoverRef = useClickOutside(() => isOpen && onToggle())

    return (
        <div className="relative flex items-center" ref={popoverRef}>
            <Tooltip content={t('dashboard.navbar.settings')} position="bottom">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-xl transition-all ${isOpen ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                    onClick={onToggle}
                >
                    <Settings size={20} />
                </Button>
            </Tooltip>

            {userRole?.toLowerCase() === 'admin' && (
                <Tooltip content={t('dashboard.navbar.admin')} position="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 ml-2 rounded-xl text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all border border-primary/20 bg-primary/5 shadow-sm"
                        onClick={() => navigate('/admin')}
                    >
                        <ShieldCheck size={20} />
                    </Button>
                </Tooltip>
            )}

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-2">
                        {t('dashboard.navbar.settings')}
                    </div>

                    {/* Keyboard Shortcuts */}
                    <button
                        onClick={() => {
                            onShowShortcuts?.()
                            onToggle()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
                            <Keyboard size={16} />
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-medium">{t('dashboard.settings.shortcuts')}</span>
                        </div>
                    </button>

                    {/* Help Tour */}
                    <button
                        onClick={() => {
                            onStartTour?.()
                            onToggle()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
                            <PlayCircle size={16} />
                        </div>
                        <span className="text-sm font-medium">{t('dashboard.settings.helpTour')}</span>
                    </button>


                    <div className="h-px bg-gray-100 dark:bg-slate-800 my-2" />

                    {/* Language Toggle */}
                    <button
                        onClick={() => {
                            i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
                            <Languages size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm font-medium">{t('dashboard.settings.language')}</span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {i18n.language === 'es' ? 'ES' : 'EN'}
                            </span>
                        </div>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm font-medium">{t('dashboard.settings.theme')}</span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">
                                {theme === 'light' ? t('dashboard.navbar.theme.light') : t('dashboard.navbar.theme.dark')}
                            </span>
                        </div>
                    </button>

                </div>
            )}
        </div>
    )
}
