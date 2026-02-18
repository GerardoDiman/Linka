/**
 * Hook for cloud synchronization — fetching cloud data on mount,
 * performing manual saves, and handling Notion sync.
 */
import { useState, useCallback, useEffect } from 'react'
import type { Node, Edge } from 'reactflow'
import { supabase } from '../lib/supabase'
import { fetchCloudGraphData, syncToCloud } from '../lib/cloudSync'
import {
    STORAGE_KEYS,
    getScopedKey,
    getSavedPositions,
    saveAllToStorage
} from '../lib/storage'
import { fetchNotionData } from '../lib/notion'
import { transformToGraphData, type RawRelation } from '../lib/graph'
import type { DatabaseNodeData, DatabaseInfo } from '../types'

interface UseCloudSyncOptions {
    session: { user: { id: string; user_metadata?: Record<string, unknown> }; access_token?: string } | null
    // Graph state setters
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
    nodes: Node[]
    // Filter state
    customColors: Record<string, string>
    selectedPropertyTypes: Set<string>
    hiddenDbIds: Set<string>
    hideIsolated: boolean
    setCustomColors: (colors: Record<string, string>) => void
    setSelectedPropertyTypes: (types: Set<string>) => void
    setHiddenDbIds: (ids: Set<string>) => void
    setHideIsolated: (value: boolean) => void
    setIsDirty: (dirty: boolean) => void
    // Synced data
    syncedDbs: DatabaseInfo[]
    setSyncedDbs: (dbs: DatabaseInfo[]) => void
    setSyncedRelations: (rels: RawRelation[]) => void
    // Layout
    runForceLayout: (nodes: Node[], edges: Edge[], search?: string) => void
    fitView: (options?: { padding?: number; duration?: number; maxZoom?: number; nodes?: { id: string }[] }) => void
    handleSelectNode: (nodeData: DatabaseNodeData) => void
    searchQuery: string
    // UI feedback
    setSyncStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void
    setSelectedNode: (node: DatabaseNodeData | null) => void
    toast: {
        success: (msg: string) => void
        error: (msg: string) => void
        warning: (msg: string) => void
        info: (msg: string) => void
    }
    t: (key: string) => string
}

export function useCloudSync({
    session,
    setNodes,
    setEdges,
    nodes,
    customColors,
    selectedPropertyTypes,
    hiddenDbIds,
    hideIsolated,
    setCustomColors,
    setSelectedPropertyTypes,
    setHiddenDbIds,
    setHideIsolated,
    setIsDirty,
    syncedDbs,
    setSyncedDbs,
    setSyncedRelations,
    runForceLayout,
    fitView,
    handleSelectNode,
    searchQuery,
    setSyncStatus,
    setSelectedNode,
    toast,
    t
}: UseCloudSyncOptions) {
    const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [notionToken, setNotionToken] = useState<string | null>(
        () => session ? localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.NOTION_TOKEN)) : null
    )
    const [userPlan, setUserPlan] = useState<'free' | 'pro'>('pro') // Forced to pro for Beta

    // ─── Fetch cloud data on mount ──────────────────────────────────────

    useEffect(() => {
        if (!session) return

        const loadCloudData = async () => {
            const data = await fetchCloudGraphData(session.user.id, session.access_token || '')
            if (!data) return

            // 1. Update localStorage
            if (data.notion_token) {
                localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.NOTION_TOKEN), data.notion_token)
                setNotionToken(data.notion_token)
            }
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.POSITIONS), JSON.stringify(data.positions || {}))
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.CUSTOM_COLORS), JSON.stringify(data.custom_colors || {}))
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.FILTERS), JSON.stringify(data.filters || []))
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.HIDDEN_DBS), JSON.stringify(data.hidden_dbs || []))
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ISOLATED), String(data.hide_isolated || false))

            // 2. Update React State
            const newFilters = new Set<string>(data.filters || [])
            const newHidden = new Set<string>(data.hidden_dbs || [])
            const newIsolated = data.hide_isolated || false
            const newColors = data.custom_colors || {}

            setSelectedPropertyTypes(newFilters)
            setHiddenDbIds(newHidden)
            setHideIsolated(newIsolated)
            setCustomColors(newColors)

            // 3. Trigger Notion Sync if we have a token and are showing demo
            const isCurrentlyShowingDemo = syncedDbs.length > 0 && syncedDbs[0].id === '1'
            if (data.notion_token && isCurrentlyShowingDemo) {
                handleSync(data.notion_token, {
                    filters: newFilters,
                    hidden_dbs: newHidden,
                    hide_isolated: newIsolated,
                    custom_colors: newColors
                }, true)
            }
        }
        loadCloudData()
    }, [session?.user.id]) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Fetch user plan on mount ───────────────────────────────────────

    useEffect(() => {
        if (!session) return
        const fetchPlan = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('plan_type')
                    .eq('id', session.user.id)
                    .maybeSingle()

                if (error) return

                if (data?.plan_type) {
                    // Overriding for Beta: keep it pro
                    setUserPlan('pro')
                }
            } catch {
                // Handle silently
            }
        }
        fetchPlan()
    }, [session?.user.id]) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Handle Notion sync ─────────────────────────────────────────────

    const handleSync = useCallback(async (
        token: string,
        overrideState?: {
            filters: Set<string>
            hidden_dbs: Set<string>
            hide_isolated: boolean
            custom_colors: Record<string, string>
        },
        skipDirty: boolean = false
    ) => {
        if (!token || !session) {
            toast.warning(t('dashboard.errors.missingToken'))
            return
        }

        setSyncStatus('saving')
        setSelectedNode(null)
        try {
            const data = await fetchNotionData(token, session.access_token || '')

            setSyncedDbs(data.databases)
            setSyncedRelations(data.relations)

            const savedPositions = getSavedPositions(session.user.id)
            const currentColors = overrideState ? overrideState.custom_colors : customColors

            const { nodes: newNodes, edges: newEdges } = transformToGraphData(
                data.databases,
                data.relations,
                savedPositions,
                currentColors
            )

            setNotionToken(token)
            if (!skipDirty) setIsDirty(true)

            setEdges(newEdges)

            const hasAllPositions = newNodes.every(n => savedPositions[n.id])
            if (!hasAllPositions) {
                runForceLayout(newNodes, newEdges, searchQuery)
            } else {
                setNodes(newNodes.map(n => ({
                    ...n,
                    data: {
                        ...n.data,
                        onSelect: handleSelectNode,
                        searchQuery,
                        color: currentColors[n.id] || n.data.color
                    }
                })))
                setTimeout(() => {
                    fitView({ padding: 0.2, duration: 800, maxZoom: 1 })
                }, 100)
            }
        } catch (error: unknown) {
            console.error("❌ handleSync Error:", error)
            toast.error(error instanceof Error ? error.message : t('dashboard.errors.syncError'))
        } finally {
            setSyncStatus('idle')
        }
    }, [session, customColors, searchQuery, setNodes, setEdges, fitView, setSyncStatus, setSelectedNode, setSyncedDbs, setSyncedRelations, setIsDirty, runForceLayout, handleSelectNode, toast, t])

    // ─── Manual cloud sync ──────────────────────────────────────────────

    const handleManualSync = useCallback(async () => {
        if (!session) return
        setCloudSyncStatus('saving')
        try {
            const userId = session.user.id

            const currentPositions: Record<string, { x: number, y: number }> = {}
            nodes.forEach(node => {
                currentPositions[node.id] = node.position
            })

            const payload = {
                positions: currentPositions,
                custom_colors: customColors,
                filters: Array.from(selectedPropertyTypes),
                hidden_dbs: Array.from(hiddenDbIds),
                hide_isolated: hideIsolated,
                notion_token: notionToken
            }

            // Persist to LocalStorage
            saveAllToStorage(userId, {
                positions: currentPositions,
                customColors,
                filters: Array.from(selectedPropertyTypes),
                hiddenDbs: Array.from(hiddenDbIds),
                hideIsolated: hideIsolated,
                notionToken
            })

            // Persist to Cloud
            await syncToCloud(userId, payload, session.access_token)

            setCloudSyncStatus('saved')
            setIsDirty(false)
            setTimeout(() => setCloudSyncStatus('idle'), 3000)
        } catch (err) {
            console.error("Manual Sync failed:", err)
            setCloudSyncStatus('error')
            setTimeout(() => setCloudSyncStatus('idle'), 5000)
        }
    }, [session, nodes, customColors, selectedPropertyTypes, hiddenDbIds, hideIsolated, notionToken, setIsDirty])

    return {
        cloudSyncStatus,
        setCloudSyncStatus,
        notionToken,
        setNotionToken,
        userPlan,
        handleSync,
        handleManualSync
    }
}
