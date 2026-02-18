import { useState, useEffect } from "react"
import { Database, ChevronLeft, Tag, Info, ExternalLink, ArrowUpAZ, ArrowDownAZ, SlidersHorizontal, Star } from "lucide-react"
import { useClickOutside } from "../../hooks/useClickOutside"
import { Tooltip } from "../ui/Tooltip"
import { NotionIcon } from "../ui/NotionIcon"
import { useTranslation } from "react-i18next"
import type { DatabaseInfo, DatabaseNodeData } from "../../types"

// NotionIcon is now imported from ../ui/NotionIcon

interface SidebarProps {
    databases?: DatabaseInfo[]
    onFitView?: () => void
    selectedNode?: DatabaseNodeData | null
    onClearSelection?: () => void
    searchQuery?: string
    visibleDbIds?: Set<string>
    hiddenDbIds?: Set<string>
    onToggleVisibility?: (dbId: string) => void
    onFocusNode?: (nodeId: string) => void
    onSelectNode?: (node: DatabaseNodeData) => void
    isCollapsed?: boolean
    onToggleCollapse?: () => void
}

export function Sidebar({
    databases = [],
    selectedNode,
    onClearSelection,
    searchQuery = "",
    visibleDbIds = new Set(),
    hiddenDbIds = new Set(),
    onToggleVisibility,
    onFocusNode,
    onSelectNode,
    isCollapsed,
    onToggleCollapse
}: SidebarProps) {
    const { t } = useTranslation()
    const [view, setView] = useState<'main' | 'details'>('main')
    const [sortBy, setSortBy] = useState<'name' | 'properties'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [showSortPopover, setShowSortPopover] = useState(false)
    const sortPopoverRef = useClickOutside(() => setShowSortPopover(false))

    // Automatically switch to details view when a node is selected
    useEffect(() => {
        if (selectedNode) {
            setView('details')
        }
    }, [selectedNode])

    const handleBack = () => {
        setView('main')
        onClearSelection?.()
    }

    const getPriority = (text: string, query: string) => {
        if (!query) return 0
        const t = text.toLowerCase()
        const q = query.toLowerCase()
        if (t === q) return 4
        if (t.startsWith(q)) return 3
        if (t.includes(q)) return 2
        return 1
    }

    const renderMainView = () => {
        const filteredAndSortedDbs = databases
            .filter(db => visibleDbIds.has(db.id) || hiddenDbIds.has(db.id))
            .map((db) => {
                const namePriority = getPriority(db.title, searchQuery)
                const matches = !searchQuery || namePriority > 1
                const isHidden = hiddenDbIds.has(db.id)

                return {
                    ...db,
                    priority: namePriority,
                    matches,
                    isHidden
                }
            })
            .sort((a, b) => {
                if (a.matches !== b.matches) return a.matches ? -1 : 1
                if (searchQuery && a.priority !== b.priority) return b.priority - a.priority
                let comparison = 0
                if (sortBy === 'name') {
                    comparison = a.title.localeCompare(b.title)
                } else {
                    comparison = (a.properties?.length || 0) - (b.properties?.length || 0)
                }
                return sortOrder === 'asc' ? comparison : -comparison
            })

        return (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-2 duration-300">
                {!isCollapsed && (
                    <div className="px-6 pt-6 pb-2 space-y-4">
                        <div className="text-center space-y-0.5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em]">
                                {t('dashboard.sidebar.visibility')}
                            </h3>
                            <div className="text-2xl font-black text-primary/40 dark:text-primary/30 font-mono">
                                {filteredAndSortedDbs.length.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1.5 p-1">
                                <Tooltip content={t('dashboard.sidebar.sortByName')}>
                                    <button
                                        onClick={() => setSortBy('name')}
                                        className={`text-[10px] px-3 py-1.5 rounded-lg transition-all ${sortBy === 'name' ? 'text-primary font-black scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {t('common.name')}
                                    </button>
                                </Tooltip>
                                <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-slate-800" />
                                <Tooltip content={t('dashboard.sidebar.sortByProps')}>
                                    <button
                                        onClick={() => setSortBy('properties')}
                                        className={`text-[10px] px-3 py-1.5 rounded-lg transition-all ${sortBy === 'properties' ? 'text-primary font-black scale-110' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {t('dashboard.sidebar.props')}
                                    </button>
                                </Tooltip>
                                <div className="w-px h-3 bg-gray-200 dark:bg-slate-800 mx-1" />
                                <Tooltip content={sortOrder === 'asc' ? t('dashboard.sidebar.asc') : t('dashboard.sidebar.desc')}>
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="text-gray-400 dark:text-gray-500 hover:text-primary p-1.5 rounded-lg transition-all"
                                    >
                                        {sortOrder === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
                                    </button>
                                </Tooltip>
                                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1" />
                                <div className="flex items-center gap-1">
                                    <Tooltip content={t('dashboard.sidebar.collapse')} position="right">
                                        <button
                                            id="sidebar-collapse-btn"
                                            onClick={onToggleCollapse}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary transition-all"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    id="sidebar-db-list"
                    className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isCollapsed ? 'px-3 py-6' : 'px-6 pb-6'}`}
                >
                    <div className="space-y-1">
                        {filteredAndSortedDbs.map((db) => (
                            <div
                                key={db.id}
                                className={`flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer group transition-all duration-300 ${!db.matches ? 'opacity-40 grayscale-[0.5]' : ''
                                    } ${db.isHidden ? 'bg-gray-50/50 dark:bg-slate-800/20' : ''}`}
                                onClick={() => {
                                    if (!db.isHidden) {
                                        // Handle selection if needed
                                    }
                                }}
                                onDoubleClick={() => {
                                    if (!db.isHidden) {
                                        onFocusNode?.(db.id)
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Tooltip content={db.isHidden ? t('dashboard.sidebar.showCanvas') : t('dashboard.sidebar.hideCanvas')} position="right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onToggleVisibility?.(db.id)
                                            }}
                                            className={`p-1 rounded-md transition-all hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm ${db.isHidden ? 'opacity-30 grayscale' : 'opacity-100'
                                                }`}
                                        >
                                            <div className="relative group/icon">
                                                {db.icon ? (
                                                    <div className="w-5 h-5 flex items-center justify-center text-lg">
                                                        {db.icon.startsWith('http') ? (
                                                            <img src={db.icon} alt="" className="w-4 h-4 object-contain" />
                                                        ) : (
                                                            <span>{db.icon}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Database className="h-3.5 w-3.5 flex-shrink-0" style={{ color: db.color }} />
                                                )}
                                            </div>
                                        </button>
                                    </Tooltip>
                                    {!isCollapsed && (
                                        <div className="flex-1 text-left truncate">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-sm font-bold truncate ${db.isHidden ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-slate-200'}`}>
                                                    {db.title}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {db.isHidden && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                                                    )}
                                                    <Tooltip content={t('dashboard.sidebar.viewProps')} position="bottom">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (!db.isHidden) {
                                                                    onSelectNode?.({
                                                                        id: db.id,
                                                                        label: db.title,
                                                                        color: db.color,
                                                                        icon: db.icon,
                                                                        properties: db.properties,
                                                                        url: db.url,
                                                                        createdTime: db.createdTime,
                                                                        lastEditedTime: db.lastEditedTime
                                                                    })
                                                                }
                                                            }}
                                                            className={`text-[10px] font-mono bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary transition-all ${db.isHidden ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-400 dark:text-gray-500'
                                                                }`}
                                                        >
                                                            {db.properties?.length || 0}
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredAndSortedDbs.length === 0 && !isCollapsed && (
                        <p className="text-xs text-gray-400 text-center py-8 italic">{t('dashboard.sidebar.noDbs')}</p>
                    )}

                    {/* Pro CTA for Free Users */}
                    {/* Beta Access Message for all users during Beta phase */}
                    {!isCollapsed && (
                        <div className="mt-8 p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/10 transition-colors" />
                            <Star className="w-6 h-6 text-primary mb-3 fill-primary/20 group-hover:scale-110 transition-transform" />
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.sidebar.betaTitle')}</h4>
                            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-medium">
                                {t('dashboard.sidebar.betaDesc')}
                            </p>
                            <div className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl text-center border border-primary/10">
                                {t('dashboard.sidebar.betaStatus')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderDetailsView = () => {
        return (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-300">
                <div className={`px-6 pt-4 pb-2 ${isCollapsed ? 'flex flex-col items-center gap-4' : 'flex items-center justify-between'}`}>
                    <Tooltip content={t('common.backToList')} position="right">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary transition-colors bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
                        >
                            <ChevronLeft size={16} />
                            {!isCollapsed && t('common.backToList')}
                        </button>
                    </Tooltip>
                    {!isCollapsed && (
                        <Tooltip content={t('dashboard.sidebar.viewInNotion')}>
                            <a
                                href={selectedNode?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-primary transition-colors flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700"
                            >
                                {t('dashboard.sidebar.viewInNotion')}
                                <ExternalLink size={10} />
                            </a>
                        </Tooltip>
                    )}
                </div>

                <div className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isCollapsed ? 'px-3 pb-6' : 'px-6 pb-6'}`}>
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
                            <div
                                className="p-2 rounded-xl"
                                style={{ backgroundColor: `${selectedNode?.color}20`, color: selectedNode?.color }}
                            >
                                {selectedNode?.icon ? (
                                    <div className="w-5 h-5 flex items-center justify-center text-lg">
                                        {selectedNode.icon.startsWith('http') ? (
                                            <img src={selectedNode.icon} alt="" className="w-5 h-5 object-contain" />
                                        ) : (
                                            <span>{selectedNode.icon}</span>
                                        )}
                                    </div>
                                ) : (
                                    <NotionIcon className="w-5 h-5" />
                                )}
                            </div>
                            {!isCollapsed && <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedNode?.label}</h2>}
                        </div>

                        {!isCollapsed && (
                            <>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Tag size={14} />
                                        {t('dashboard.sidebar.properties')} ({selectedNode?.properties?.length || 0})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedNode?.properties
                                            ?.map((prop: { name: string; type: string }) => ({
                                                ...prop,
                                                priority: getPriority(prop.name, searchQuery),
                                                matches: !searchQuery || prop.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            }))
                                            .sort((a, b) => {
                                                if (a.priority !== b.priority) return b.priority - a.priority
                                                return a.name.localeCompare(b.name)
                                            })
                                            .map((prop, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`group bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-primary/30 hover:bg-blue-50/30 dark:hover:bg-primary/5 transition-all ${!prop.matches ? 'opacity-40 grayscale-[0.5]' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{prop.name}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded font-mono uppercase">
                                                            {prop.type?.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Info size={14} />
                                        {t('dashboard.sidebar.info')}
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">{t('dashboard.sidebar.created')}</span>
                                            <span className="text-gray-700 dark:text-gray-200 font-medium">{new Date(selectedNode?.createdTime || '').toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">{t('dashboard.sidebar.updated')}</span>
                                            <span className="text-gray-700 dark:text-gray-200 font-medium">{new Date(selectedNode?.lastEditedTime || '').toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <aside
            id="sidebar-container"
            className={`bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-full z-10 shadow-sm relative transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}
        >
            {isCollapsed && (
                <div className="flex flex-col items-center py-4 gap-6 border-b border-gray-100 dark:border-slate-700 relative">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter opacity-50">DBS</span>
                        <div className="text-xl font-black text-primary/40 dark:text-primary/30 font-mono">
                            {databases.filter(db => visibleDbIds.has(db.id) || hiddenDbIds.has(db.id)).length.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="relative" ref={sortPopoverRef}>
                        <Tooltip content={t('dashboard.sidebar.sortOptions')} position="right">
                            <button
                                onClick={() => setShowSortPopover(!showSortPopover)}
                                className={`p-2.5 rounded-xl transition-all ${showSortPopover ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                            >
                                <SlidersHorizontal size={20} />
                            </button>
                        </Tooltip>

                        {showSortPopover && (
                            <div className="absolute left-full ml-4 top-0 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl p-4 w-48 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">{t('dashboard.sidebar.sortBy')}</label>
                                        <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-slate-900 p-1 rounded-xl">
                                            <Tooltip content={t('dashboard.sidebar.sortByName')} position="right">
                                                <button
                                                    onClick={() => setSortBy('name')}
                                                    className={`text-[10px] py-2 w-full rounded-lg transition-all ${sortBy === 'name' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-bold' : 'text-gray-500 dark:text-slate-400'}`}
                                                >
                                                    {t('common.name')}
                                                </button>
                                            </Tooltip>
                                            <Tooltip content={t('dashboard.sidebar.sortByProps')} position="right">
                                                <button
                                                    onClick={() => setSortBy('properties')}
                                                    className={`text-[10px] py-2 w-full rounded-lg transition-all ${sortBy === 'properties' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-bold' : 'text-gray-500 dark:text-slate-400'}`}
                                                >
                                                    {t('dashboard.sidebar.props')}
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('dashboard.sidebar.sortOrder')}</span>
                                        <Tooltip content={sortOrder === 'asc' ? t('dashboard.sidebar.asc') : t('dashboard.sidebar.desc')} position="right">
                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary p-1 transition-colors"
                                            >
                                                {sortOrder === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Tooltip content={t('dashboard.sidebar.expand')} position="right">
                        <button
                            onClick={onToggleCollapse}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all rotate-180"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </Tooltip>
                </div>
            )}

            <div className="flex-1 overflow-hidden">
                {view === 'main' ? renderMainView() : renderDetailsView()}
            </div>
        </aside>
    )
}
