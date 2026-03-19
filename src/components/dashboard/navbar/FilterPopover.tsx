import { useMemo } from "react"
import { Button } from "../../ui/button"
import {
    Filter, X, GitBranch,
    Type, AlignLeft, Hash, List, Layers, Calendar, Users,
    File, CheckSquare, Link, Mail, Phone, Variable,
    Combine, Clock, UserPlus, History, UserCheck, Activity,
    Fingerprint, ShieldCheck, Database
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useClickOutside } from "../../../hooks/useClickOutside"
import { Tooltip } from "../../ui/Tooltip"
import type { DatabaseInfo } from "../../../types"

const PROPERTY_TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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

interface FilterPopoverProps {
    databases: DatabaseInfo[]
    selectedPropertyTypes: Set<string>
    onTogglePropertyType?: (type: string) => void
    onClearFilters?: () => void
    hideIsolated: boolean
    onToggleHideIsolated?: () => void
    isOpen: boolean
    onToggle: () => void
}

export function FilterPopover({
    databases,
    selectedPropertyTypes,
    onTogglePropertyType,
    onClearFilters,
    hideIsolated,
    onToggleHideIsolated,
    isOpen,
    onToggle,
}: FilterPopoverProps) {
    const { t } = useTranslation()
    const popoverRef = useClickOutside(() => isOpen && onToggle())

    const propertyTypes = useMemo(() => {
        const types = new Set<string>()
        databases.forEach(db => {
            db.properties?.forEach((p: { name: string; type: string }) => types.add(p.type))
        })
        return Array.from(types).sort()
    }, [databases])

    return (
        <div className="relative flex items-center" ref={popoverRef}>
            <Tooltip content={t('dashboard.navbar.filters')} position="bottom">
                <Button
                    id="navbar-filters"
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-xl transition-all ${isOpen ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                    onClick={onToggle}
                >
                    <Filter size={20} />
                    {(selectedPropertyTypes.size > 0 || hideIsolated) && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                            {(selectedPropertyTypes.size + (hideIsolated ? 1 : 0))}
                        </span>
                    )}
                </Button>
            </Tooltip>

            {isOpen && (
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
    )
}
