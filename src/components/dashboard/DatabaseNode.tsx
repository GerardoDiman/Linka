import { Handle, Position } from "reactflow"
import { ExternalLink, Database, Calendar, Clock, ArrowUpRight, ArrowDownLeft, List, Check } from "lucide-react"
import { Tooltip } from "../ui/Tooltip"
import { useTranslation } from "react-i18next"
import type { DatabaseNodeData } from "../../types"

export function DatabaseNode({ data, selected }: { data: DatabaseNodeData, selected?: boolean }) {
    const { t } = useTranslation()
    const matchesSearch = !data.searchQuery || data.label.toLowerCase().includes(data.searchQuery.toLowerCase())

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div
            className={`px-4 py-3 shadow-xl rounded-xl transition-all duration-300 hover:shadow-2xl min-w-[240px] relative isolate ${!matchesSearch
                ? 'bg-gray-100 dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 scale-95 grayscale-[0.5] shadow-none'
                : 'bg-white dark:bg-slate-800 border-2'
                } ${selected
                    ? 'ring-4 ring-primary/30 border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02] z-50'
                    : 'dark:border-slate-700'
                }`}
            style={{
                borderColor: selected ? undefined : ((!matchesSearch ? '#334155' : data.color) || undefined),
                opacity: 1 // Force full opacity for the container to act as a mask
            }}
        >
            <div className={`transition-opacity duration-300 ${!matchesSearch ? 'opacity-30' : 'opacity-100'}`}>
                {/* Selection Checkmark */}
                {selected && (
                    <div className="absolute -top-3 -right-3 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 animate-in zoom-in duration-200">
                        <Check size={14} strokeWidth={3} />
                    </div>
                )}
                {/* Invisible handles at the center for "Center-to-Center" logic */}
                <Handle type="target" position={Position.Top} className="w-0 h-0 border-none opacity-0" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                <Handle type="source" position={Position.Bottom} className="w-0 h-0 border-none opacity-0" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${data.color}20`, color: data.color }}
                        >
                            {data.icon ? (
                                <div className="w-[18px] h-[18px] flex items-center justify-center text-sm">
                                    {data.icon.startsWith('http') ? (
                                        <img src={data.icon} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <span>{data.icon}</span>
                                    )}
                                </div>
                            ) : (
                                <Database size={18} />
                            )}
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{data.label}</span>
                    </div>
                    {data.url && (
                        <Tooltip content={t('dashboard.node.openInNotionTooltip')}>
                            <a
                                href={data.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 dark:text-slate-500 hover:text-blue-500 transition-colors"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </Tooltip>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700/50">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-0.5">{t('dashboard.node.properties')}</div>
                        <div className="text-sm font-bold text-gray-700 dark:text-slate-200">{data.propertyCount || 0}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700/50">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-0.5">{t('dashboard.node.relations')}</div>
                        <div className="flex items-center gap-2">
                            <Tooltip content={t('dashboard.node.outgoing')}>
                                <div className="flex items-center text-xs font-bold text-green-600">
                                    <ArrowUpRight size={12} className="mr-0.5" />
                                    {data.outgoingRelations || 0}
                                </div>
                            </Tooltip>
                            <Tooltip content={t('dashboard.node.incoming')}>
                                <div className="flex items-center text-xs font-bold text-blue-600">
                                    <ArrowDownLeft size={12} className="mr-0.5" />
                                    {data.incomingRelations || 0}
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center text-[11px] text-gray-500 dark:text-slate-400 gap-1.5">
                        <Calendar size={12} />
                        <span>{t('dashboard.node.created')}: {formatDate(data.createdTime)}</span>
                    </div>
                    <div className="flex items-center text-[11px] text-gray-500 dark:text-slate-400 gap-1.5">
                        <Clock size={12} />
                        <span>{t('dashboard.node.updated')}: {formatDate(data.lastEditedTime)}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onSelect?.(data);
                    }}
                    className="w-full mt-3 py-1.5 bg-gray-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-primary/10 text-blue-600 dark:text-primary text-xs font-bold rounded-lg border border-gray-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                >
                    <List size={14} />
                    {t('dashboard.node.viewProperties')}
                </button>
            </div>
        </div>
    )
}
