import { useState, useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Search, LogOut, Activity } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { Logo } from "../ui/Logo"
import { Tooltip } from "../ui/Tooltip"
import logger from "../../lib/logger"
import type { DatabaseInfo } from "../../types"

// Sub-components
import { FilterPopover } from "./navbar/FilterPopover"
import { NotionSyncPopover } from "./navbar/NotionSyncPopover"
import { CloudSyncButton } from "./navbar/CloudSyncButton"
import { SettingsPopover } from "./navbar/SettingsPopover"

interface NavbarProps {
    onSync?: (token: string) => void
    onDisconnect?: () => void
    isSynced?: boolean
    loading?: boolean
    searchQuery?: string
    onSearchChange?: (query: string) => void
    databases?: DatabaseInfo[]
    selectedPropertyTypes?: Set<string>
    onTogglePropertyType?: (type: string) => void
    onClearFilters?: () => void
    hideIsolated?: boolean
    onToggleHideIsolated?: () => void
    userRole?: string | null
    onStartTour?: () => void
    userPlan?: 'free' | 'pro'
    onManualSync?: () => void
    syncStatus?: 'idle' | 'saving' | 'saved' | 'error'
    isDirty?: boolean
    onShowShortcuts?: () => void
    onUpgrade?: () => void
}

export function Navbar({
    onSync,
    onDisconnect,
    isSynced,
    loading,
    searchQuery,
    onSearchChange,
    databases = [],
    selectedPropertyTypes = new Set(),
    onTogglePropertyType,
    onClearFilters,
    hideIsolated = false,
    onToggleHideIsolated,
    userRole,
    onStartTour,
    onManualSync,
    syncStatus = 'idle',
    isDirty = false,
    onShowShortcuts,
    userPlan = 'free',
    onUpgrade
}: NavbarProps) {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { user, signOut } = useAuth()

    // Popover group: only one open at a time
    const [activePopover, setActivePopover] = useState<'filter' | 'sync' | 'settings' | null>(null)

    const togglePopover = useCallback((name: 'filter' | 'sync' | 'settings') => {
        setActivePopover(prev => prev === name ? null : name)
    }, [])

    return (
        <nav className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 z-20 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-6 flex-1">
                <Tooltip content={t('dashboard.navbar.tour')} position="bottom">
                    <div
                        id="navbar-logo"
                        className="flex items-center gap-2 cursor-pointer group/logo transition-all hover:opacity-80"
                        onClick={() => navigate("/")}
                    >
                        <Logo size={28} className="group-hover/logo:scale-110 transition-transform" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">Linka</span>
                    </div>
                </Tooltip>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

                <div className="flex-1 max-w-xs flex items-center gap-2">
                    <div className="flex-1 relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search size={18} />
                        </div>
                        <Input
                            id="navbar-search"
                            placeholder={t('dashboard.navbar.search')}
                            className="pl-10 h-10 bg-gray-50 dark:bg-slate-900/60 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900/80 focus:border-gray-200 dark:focus:border-slate-700 focus:ring-0 transition-all rounded-xl shadow-none"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>

                    <FilterPopover
                        databases={databases}
                        selectedPropertyTypes={selectedPropertyTypes}
                        onTogglePropertyType={onTogglePropertyType}
                        onClearFilters={onClearFilters}
                        hideIsolated={hideIsolated}
                        onToggleHideIsolated={onToggleHideIsolated}
                        isOpen={activePopover === 'filter'}
                        onToggle={() => togglePopover('filter')}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {userPlan === 'free' && (
                    <Button
                        size="sm"
                        className="h-9 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 hidden sm:flex border border-white/10"
                        onClick={onUpgrade}
                    >
                        <Activity className="w-3.5 h-3.5 mr-1.5" />
                        {t('dashboard.pricing.getPro')}
                    </Button>
                )}

                <NotionSyncPopover
                    onSync={onSync}
                    onDisconnect={onDisconnect}
                    isSynced={isSynced}
                    loading={loading}
                    isOpen={activePopover === 'sync'}
                    onToggle={() => togglePopover('sync')}
                />

                <CloudSyncButton
                    syncStatus={syncStatus}
                    isDirty={isDirty}
                    onManualSync={onManualSync}
                />

                <SettingsPopover
                    userRole={userRole}
                    onStartTour={onStartTour}
                    onShowShortcuts={onShowShortcuts}
                    isOpen={activePopover === 'settings'}
                    onToggle={() => togglePopover('settings')}
                />

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1" />

                {user && (
                    <div className="flex items-center gap-3 px-2 py-1 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
                        <div className="flex flex-col items-start hidden md:flex">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t('dashboard.navbar.userLabel')}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${userPlan === 'pro'
                                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                    : 'bg-primary/20 text-primary border border-primary/30'
                                    }`}>
                                    {userPlan === 'pro' ? 'PRO' : 'FREE'}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-slate-200 truncate max-w-[120px]">
                                {user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                            {(user.user_metadata?.username?.[0] || user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </div>
                    </div>
                )}

                <Tooltip content={t('common.logout')} position="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={async () => {
                            try {
                                await signOut()
                                navigate("/", { replace: true })
                            } catch (err) {
                                logger.error("Error during log out:", err)
                                window.location.href = "/"
                            }
                        }}
                    >
                        <LogOut size={20} />
                    </Button>
                </Tooltip>
            </div>
        </nav>
    )
}
