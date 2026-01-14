import { useState, useMemo } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Settings, LogOut, Loader2, Share2, Search, Filter,
    Type, AlignLeft, Hash, List, Layers, Calendar, Users,
    File, CheckSquare, Link, Mail, Phone, Variable, GitBranch,
    Combine, Clock, UserPlus, History, UserCheck, Activity,
    Fingerprint, ShieldCheck, Database, X, Sun, Moon, HelpCircle,
    Star
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { Logo } from "../ui/Logo"
import { useClickOutside } from "../../hooks/useClickOutside"
import { Tooltip } from "../ui/Tooltip"

const NotionIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fillRule="evenodd" clipRule="evenodd" d="M15.257.055l-13.31.98C.874 1.128.5 1.83.5 2.667v14.559c0 .654.233 1.213.794 1.96l3.129 4.06c.513.653.98.794 1.962.745l15.457-.932c1.307-.093 1.681-.7 1.681-1.727V4.954c0-.53-.21-.684-.829-1.135l-.106-.078L18.34.755c-1.027-.746-1.45-.84-3.083-.7zm-8.521 4.63c-1.263.086-1.549.105-2.266-.477L2.647 2.76c-.186-.187-.092-.42.375-.466l12.796-.933c1.074-.094 1.634.28 2.054.606l2.195 1.587c.093.047.326.326.047.326l-13.216.794-.162.01zM5.263 21.193V7.287c0-.606.187-.886.748-.933l15.176-.886c.515-.047.748.28.748.886v13.81c0 .609-.093 1.122-.934 1.168l-14.523.84c-.842.047-1.215-.232-1.215-.98zm14.338-13.16c.093.422 0 .842-.422.89l-.699.139v10.264c-.608.327-1.168.513-1.635.513-.747 0-.934-.232-1.495-.932l-4.576-7.185v6.952l1.448.327s0 .84-1.169.84l-3.221.186c-.094-.187 0-.654.327-.747l.84-.232V9.853L7.832 9.76c-.093-.42.14-1.026.794-1.073l3.456-.232 4.763 7.279v-6.44l-1.214-.14c-.094-.513.28-.887.747-.933l3.223-.187z" />
    </svg>
)

interface NavbarProps {
    onSync?: (token: string) => void
    onDisconnect?: () => void
    isSynced?: boolean
    loading?: boolean
    searchQuery?: string
    onSearchChange?: (query: string) => void
    databases?: any[]
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
}

const PROPERTY_TYPE_ICONS: Record<string, any> = {
    title: Type,
    rich_text: AlignLeft,
    number: Hash,
    select: List,
    multi_select: Layers,
    date: Calendar,
    people: Users,
    files: File,
    checkbox: CheckSquare,
    url: Link,
    email: Mail,
    phone_number: Phone,
    formula: Variable,
    relation: GitBranch,
    rollup: Combine,
    created_time: Clock,
    created_by: UserPlus,
    last_edited_time: History,
    last_edited_by: UserCheck,
    status: Activity,
    unique_id: Fingerprint,
    verification: ShieldCheck,
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
    userPlan = 'free',
    onManualSync,
    syncStatus = 'idle',
    isDirty = false
}: NavbarProps) {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { theme, toggleTheme } = useTheme()
    const { user, signOut } = useAuth()
    const [token, setToken] = useState("")
    const [showSyncPopover, setShowSyncPopover] = useState(false)
    const [showFilterPopover, setShowFilterPopover] = useState(false)

    const filterPopoverRef = useClickOutside(() => setShowFilterPopover(false))
    const syncPopoverRef = useClickOutside(() => setShowSyncPopover(false))

    const propertyTypes = useMemo(() => {
        const types = new Set<string>()
        databases.forEach(db => {
            db.properties?.forEach((p: any) => types.add(p.type))
        })
        return Array.from(types).sort()
    }, [databases])

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

                    <div className="relative flex items-center" ref={filterPopoverRef}>
                        <Tooltip content={t('dashboard.navbar.filters')} position="bottom">
                            <Button
                                id="navbar-filters"
                                variant="ghost"
                                size="icon"
                                className={`h-10 w-10 rounded-xl transition-all ${showFilterPopover ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                                onClick={() => {
                                    setShowFilterPopover(!showFilterPopover)
                                    setShowSyncPopover(false)
                                }}
                            >
                                <Filter size={20} />
                                {(selectedPropertyTypes.size > 0 || hideIsolated) && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                                        {(selectedPropertyTypes.size + (hideIsolated ? 1 : 0))}
                                    </span>
                                )}
                            </Button>
                        </Tooltip>

                        {showFilterPopover && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('dashboard.navbar.filters')}</h3>
                                    {(selectedPropertyTypes.size > 0 || hideIsolated) && (
                                        <button
                                            onClick={onClearFilters}
                                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <X size={10} />
                                            {t('dashboard.navbar.clear')}
                                        </button>
                                    )}
                                </div>

                                <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-950/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
                                    <button
                                        onClick={onToggleHideIsolated}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${hideIsolated ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-md ${hideIsolated ? 'bg-primary/10' : 'bg-gray-200'}`}>
                                                <GitBranch size={14} className={hideIsolated ? 'rotate-180 transition-transform' : ''} />
                                            </div>
                                            <span className="text-sm font-medium">{t('dashboard.navbar.hideIsolated')}</span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full transition-colors relative ${hideIsolated ? 'bg-primary' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${hideIsolated ? 'right-0.5' : 'left-0.5'}`} />
                                        </div>
                                    </button>
                                </div>

                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('dashboard.navbar.propertyTypes')}</h3>
                                <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {propertyTypes.map((type) => {
                                        const isSelected = selectedPropertyTypes.has(type)
                                        const Icon = PROPERTY_TYPE_ICONS[type] || Database
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => onTogglePropertyType?.(type)}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all group ${isSelected
                                                    ? 'bg-primary/5 border border-primary/20 text-primary'
                                                    : 'hover:bg-gray-50 dark:hover:bg-slate-900/50 border border-transparent text-gray-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-primary/10' : 'bg-gray-100 group-hover:bg-gray-200'
                                                        }`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium capitalize">
                                                        {type.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                                                    }`}>
                                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                    {propertyTypes.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-8 italic">{t('dashboard.navbar.noPropsFound')}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">


                <div className="relative flex items-center" ref={syncPopoverRef}>
                    <Tooltip content="Notion Sync" position="bottom">
                        <Button
                            id="navbar-sync"
                            variant="ghost"
                            size="icon"
                            className={`h-10 w-10 rounded-xl transition-all ${showSyncPopover ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                            onClick={() => {
                                setShowSyncPopover(!showSyncPopover)
                                setShowFilterPopover(false)
                            }}
                        >
                            <NotionIcon className="w-5 h-5" />
                        </Button>
                    </Tooltip>

                    {showSyncPopover && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-4">
                                <NotionIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('dashboard.navbar.sync')}</h3>
                            </div>
                            <div className="space-y-4">
                                {!isSynced ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Integration Token</label>
                                            <Input
                                                placeholder="secret_..."
                                                type="password"
                                                className="h-9 text-xs bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-gray-200 dark:focus:border-slate-700 focus:ring-0 transition-all rounded-xl shadow-none"
                                                value={token}
                                                onChange={(e) => setToken(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <Button
                                            className="w-full h-9 text-xs font-bold"
                                            onClick={() => {
                                                onSync?.(token)
                                                if (!loading) setShowSyncPopover(false)
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    {t('dashboard.syncStates.syncing')}
                                                </>
                                            ) : (
                                                t('common.syncNow')
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-green-50/50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 p-3 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                            {t('dashboard.syncStates.success')}
                                        </div>
                                    </div>
                                )}

                                {isSynced && (
                                    <Button
                                        variant="outline"
                                        className="w-full h-9 text-xs font-bold text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                                        onClick={() => {
                                            onDisconnect?.()
                                            setShowSyncPopover(false)
                                        }}
                                        disabled={loading}
                                    >
                                        {t('dashboard.navbar.disconnect')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1" />

                <Tooltip content={t('dashboard.navbar.startTourTooltip')} position="bottom">
                    <Button
                        id="navbar-help"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-primary animate-pulse hover:animate-none hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                        onClick={onStartTour}
                    >
                        <HelpCircle size={20} className="fill-primary/10" />
                    </Button>
                </Tooltip>

                <Tooltip content={
                    syncStatus === 'saving' ? t('dashboard.navbar.cloudSync.saving') :
                        syncStatus === 'saved' ? t('dashboard.navbar.cloudSync.saved') :
                            syncStatus === 'error' ? t('dashboard.navbar.cloudSync.error') : t('dashboard.navbar.cloudSync.idle')
                } position="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-xl transition-all relative ${syncStatus === 'error' ? 'text-red-500 hover:bg-red-50' :
                            syncStatus === 'saved' ? 'text-green-500 hover:bg-green-50' :
                                'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5'
                            }`}
                        onClick={onManualSync}
                        disabled={syncStatus === 'saving'}
                    >
                        {syncStatus === 'saving' ? <Loader2 size={20} className="animate-spin" /> : <Activity size={20} />}
                        {isDirty && syncStatus === 'idle' && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white" />
                        )}
                        {syncStatus === 'saved' && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-white" />
                        )}
                        {syncStatus === 'error' && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        )}
                    </Button>
                </Tooltip>

                <Tooltip content={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'} position="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 font-bold text-xs"
                        onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
                    >
                        {i18n.language.toUpperCase().split('-')[0]}
                    </Button>
                </Tooltip>

                <Tooltip content={theme === 'light' ? t('dashboard.navbar.theme.dark') : t('dashboard.navbar.theme.light')} position="bottom">
                    <Button
                        id="navbar-theme"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </Button>
                </Tooltip>

                {userRole === 'admin' && (
                    <Tooltip content={t('dashboard.navbar.admin')} position="bottom">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                            onClick={() => navigate("/admin")}
                        >
                            <ShieldCheck size={20} />
                        </Button>
                    </Tooltip>
                )}

                <Tooltip content={t('dashboard.navbar.share')} position="bottom">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                        <Share2 size={20} />
                    </Button>
                </Tooltip>

                <Tooltip content={t('dashboard.navbar.settings')} position="bottom">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                        <Settings size={20} />
                    </Button>
                </Tooltip>

                {/* Beta Badge instead of Pro CTA during Beta phase */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl mr-2">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary/20" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{t('dashboard.navbar.betaBadge')}</span>
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1" />

                {user && (
                    <div className="flex items-center gap-3 px-2 py-1 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
                        <div className="flex flex-col items-end hidden md:flex">
                            <div className="flex items-center gap-1.5">
                                {userPlan === 'pro' && (
                                    <span className="bg-primary/20 text-[9px] font-black text-primary px-1.5 py-0.5 rounded-md uppercase tracking-tighter">BETA</span>
                                )}
                                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t('dashboard.navbar.userLabel')}</span>
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
                                console.error("Error during log out:", err)
                                // Fallback navigation
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
