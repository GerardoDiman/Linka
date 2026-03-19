import { useState } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { NotionIcon } from "../../ui/NotionIcon"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useClickOutside } from "../../../hooks/useClickOutside"
import { Tooltip } from "../../ui/Tooltip"
import { ConfirmationModal } from "../../ui/ConfirmationModal"

interface NotionSyncPopoverProps {
    onSync?: (token: string) => void
    onDisconnect?: () => void
    isSynced?: boolean
    loading?: boolean
    isOpen: boolean
    onToggle: () => void
}

export function NotionSyncPopover({
    onSync,
    onDisconnect,
    isSynced,
    loading,
    isOpen,
    onToggle,
}: NotionSyncPopoverProps) {
    const { t } = useTranslation()
    const [token, setToken] = useState("")
    const [tokenError, setTokenError] = useState<string | null>(null)
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
    const popoverRef = useClickOutside(() => isOpen && onToggle())

    return (
        <>
            <div className="relative flex items-center" ref={popoverRef}>
                <Tooltip content="Notion Sync" position="bottom">
                    <Button
                        id="navbar-sync"
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-xl transition-all ${isOpen ? 'bg-primary/10 text-primary shadow-inner' : 'text-gray-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                        onClick={onToggle}
                    >
                        <NotionIcon className="w-5 h-5" />
                    </Button>
                </Tooltip>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 mb-4">
                            <NotionIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('dashboard.navbar.sync')}</h3>
                        </div>
                        <div className="space-y-4">
                            {!isSynced ? (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('notion.integrationToken')}</label>
                                        <Input
                                            placeholder="secret_..."
                                            type="password"
                                            className="h-9 text-xs bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-gray-200 dark:focus:border-slate-700 focus:ring-0 transition-all rounded-xl shadow-none"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    {tokenError && (
                                        <p className="text-[10px] text-red-500 font-medium">{tokenError}</p>
                                    )}
                                    <Button
                                        className="w-full h-9 text-xs font-bold"
                                        onClick={() => {
                                            const isValidFormat = token.startsWith('secret_') || token.startsWith('ntn_')
                                            if (!isValidFormat) {
                                                setTokenError(t('notion.errors.invalidToken'))
                                                return
                                            }
                                            setTokenError(null)
                                            onSync?.(token)
                                            if (!loading) onToggle()
                                        }}
                                        disabled={loading || !token.trim()}
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
                                        onToggle()
                                        setShowDisconnectConfirm(true)
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

            <ConfirmationModal
                isOpen={showDisconnectConfirm}
                onClose={() => setShowDisconnectConfirm(false)}
                onConfirm={() => onDisconnect?.()}
                title={t('dashboard.navbar.confirmModal.title')}
                message={t('dashboard.navbar.confirmModal.message')}
                confirmText={t('dashboard.navbar.confirmModal.confirm')}
                cancelText={t('dashboard.navbar.confirmModal.cancel')}
                variant="warning"
            />
        </>
    )
}
