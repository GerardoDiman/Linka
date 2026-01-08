import { useState, useEffect } from "react"
import { Database, ChevronLeft, Tag, Info, ExternalLink, ArrowUpAZ, ArrowDownAZ, SlidersHorizontal } from "lucide-react"
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

interface SidebarProps {
    databases?: {
        id: string;
        title: string;
        color?: string;
        icon?: string;
        properties?: { name: string; type: string }[]
        url?: string;
        createdTime?: string;
        lastEditedTime?: string;
    }[]
    onFitView?: () => void
    selectedNode?: any
    onClearSelection?: () => void
    searchQuery?: string
    visibleDbIds?: Set<string>
    hiddenDbIds?: Set<string>
    onToggleVisibility?: (dbId: string) => void
    onFocusNode?: (nodeId: string) => void
    onSelectNode?: (node: any) => void
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
            .sort((a: any, b: any) => {
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
                                Bases de Datos
                            </h3>
                            <div className="text-2xl font-black text-primary/40 dark:text-primary/30 font-mono">
                                {filteredAndSortedDbs.length.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1.5 p-1">
                                <Tooltip content="Ordenar por nombre">
                                    <button
                                        onClick={() => setSortBy('name')}
                                        className={`text-[10px] px-3 py-1.5 rounded-lg transition-all ${sortBy === 'name' ? 'text-primary font-black scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        Nombre
                                    </button>
                                </Tooltip>
                                <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-slate-800" />
                                <Tooltip content="Ordenar por propiedades">
                                    <button
                                        onClick={() => setSortBy('properties')}
                                        className={`text-[10px] px-3 py-1.5 rounded-lg transition-all ${sortBy === 'properties' ? 'text-primary font-black scale-110' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        Props
                                    </button>
                                </Tooltip>
                                <div className="w-px h-3 bg-gray-200 dark:bg-slate-800 mx-1" />
                                <Tooltip content={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}>
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="text-gray-400 dark:text-gray-500 hover:text-primary p-1.5 rounded-lg transition-all"
                                    >
                                        {sortOrder === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
                                    </button>
                                </Tooltip>
                                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1" />
                                <div className="flex items-center gap-1">
                                    <Tooltip content="Colapsar panel" position="right">
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
                                    <Tooltip content={db.isHidden ? "Mostrar en canvas" : "Ocultar en canvas"} position="right">
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
                                    {isCollapsed ? (
                                        <Tooltip content={db.title} position="right">
                                            <div className="flex-1 min-w-0">
                                                <span className="truncate font-medium transition-all duration-500 text-transparent w-0">
                                                    {db.title}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    ) : (
                                        <span className={`truncate font-medium transition-all duration-500 ${db.isHidden ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'} opacity-100`}>
                                            {db.title}
                                        </span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <Tooltip content="Ver propiedades" position="bottom">
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
                                )}
                            </div>
                        ))}
                    </div>
                    {filteredAndSortedDbs.length === 0 && !isCollapsed && (
                        <p className="text-xs text-gray-400 text-center py-8 italic">No hay bases de datos visibles</p>
                    )}
                </div>
            </div >
        )
    }

    const renderDetailsView = () => {
        return (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-300">
                <div className={`px-6 pt-4 pb-2 ${isCollapsed ? 'flex flex-col items-center gap-4' : 'flex items-center justify-between'}`}>
                    <Tooltip content="Volver al listado" position="right">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary transition-colors bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
                        >
                            <ChevronLeft size={16} />
                            {!isCollapsed && "Volver al listado"}
                        </button>
                    </Tooltip>
                    {!isCollapsed && (
                        <Tooltip content="Abrir en Notion">
                            <a
                                href={selectedNode?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-primary transition-colors flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700"
                            >
                                Ver en Notion
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
                                        Propiedades ({selectedNode?.properties?.length || 0})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedNode?.properties
                                            ?.map((prop: any) => ({
                                                ...prop,
                                                priority: getPriority(prop.name, searchQuery),
                                                matches: !searchQuery || prop.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            }))
                                            .sort((a: any, b: any) => {
                                                if (a.priority !== b.priority) return b.priority - a.priority
                                                return a.name.localeCompare(b.name)
                                            })
                                            .map((prop: any, idx: number) => (
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
                                        Información
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">Creado</span>
                                            <span className="text-gray-700 dark:text-gray-200 font-medium">{new Date(selectedNode?.createdTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">Actualizado</span>
                                            <span className="text-gray-700 dark:text-gray-200 font-medium">{new Date(selectedNode?.lastEditedTime).toLocaleDateString()}</span>
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
                        <Tooltip content="Opciones de orden" position="right">
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
                                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Ordenar por</label>
                                        <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-slate-900 p-1 rounded-xl">
                                            <Tooltip content="Ordenar por nombre" position="right">
                                                <button
                                                    onClick={() => setSortBy('name')}
                                                    className={`text-[10px] py-2 w-full rounded-lg transition-all ${sortBy === 'name' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-bold' : 'text-gray-500 dark:text-slate-400'}`}
                                                >
                                                    Nombre
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Ordenar por propiedades" position="right">
                                                <button
                                                    onClick={() => setSortBy('properties')}
                                                    className={`text-[10px] py-2 w-full rounded-lg transition-all ${sortBy === 'properties' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-bold' : 'text-gray-500 dark:text-slate-400'}`}
                                                >
                                                    Props
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sentido</span>
                                        <Tooltip content={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'} position="right">
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

                    <Tooltip content="Expandir panel" position="right">
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
