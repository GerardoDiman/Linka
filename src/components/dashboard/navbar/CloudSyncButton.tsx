import { Button } from "../../ui/button"
import { Loader2, Activity } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Tooltip } from "../../ui/Tooltip"

interface CloudSyncButtonProps {
    syncStatus: 'idle' | 'saving' | 'saved' | 'error'
    isDirty: boolean
    onManualSync?: () => void
}

export function CloudSyncButton({ syncStatus, isDirty, onManualSync }: CloudSyncButtonProps) {
    const { t } = useTranslation()

    const tooltipContent =
        syncStatus === 'saving' ? t('dashboard.navbar.cloudSync.saving') :
            syncStatus === 'saved' ? t('dashboard.navbar.cloudSync.saved') :
                syncStatus === 'error' ? t('dashboard.navbar.cloudSync.error') : t('dashboard.navbar.cloudSync.idle')

    return (
        <Tooltip content={tooltipContent} position="bottom">
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
    )
}
