/**
 * Hook for cloud synchronization — fetching cloud data on mount,
 * performing manual saves, and handling Notion sync.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import type { Node, Edge } from 'reactflow'
import { supabase } from '../lib/supabase'
import { fetchCloudGraphData, syncToCloud } from '../lib/cloudSync'
import { useGraphStore } from '../stores/useGraphStore'
import {
    STORAGE_KEYS,
    getScopedKey,
    getSavedPositions,
    saveAllToStorage
} from '../lib/storage'
import { fetchNotionData } from '../lib/notion'
import { transformToGraphData } from '../lib/graph'
import type { DatabaseNodeData } from '../types'

interface UseCloudSyncOptions {
    session: { user: { id: string; user_metadata?: Record<string, unknown> }; access_token?: string } | null
    // Filter state
    selectedPropertyTypes: Set<string>
    hiddenDbIds: Set<string>
    hideIsolated: boolean
    setSelectedPropertyTypes: (types: Set<string>) => void
    setHiddenDbIds: (ids: Set<string>) => void
    setHideIsolated: (value: boolean) => void
    // Layout and UI feedback
    runForceLayout: (nodes: Node[], edges: Edge[], search?: string) => void
    fitView: (options?: { padding?: number; duration?: number; maxZoom?: number; nodes?: { id: string }[] }) => void
    handleSelectNode: (nodeData: DatabaseNodeData) => void
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
    selectedPropertyTypes,
    hiddenDbIds,
    hideIsolated,
    setSelectedPropertyTypes,
    setHiddenDbIds,
    setHideIsolated,
    runForceLayout,
    fitView,
    handleSelectNode,
    setSelectedNode,
    toast,
    t
}: UseCloudSyncOptions) {
    const isSyncingRef = useRef(false)
    const initialLoadRef = useRef<string | null>(null)

    const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const notionToken = useGraphStore(state => state.notionToken)
    const setNotionToken = useGraphStore(state => state.setNotionToken)
    const isNotionConnected = useGraphStore(state => state.isNotionConnected)
    const setIsNotionConnected = useGraphStore(state => state.setIsNotionConnected)
    const userPlan = useGraphStore(state => state.userPlan)
    const setUserPlan = useGraphStore(state => state.setUserPlan)
    const customColors = useGraphStore(state => state.customColors)
    const setCustomColors = useGraphStore(state => state.setCustomColors)

    // Zustand store connections
    const nodes = useGraphStore(state => state.nodes)
    const setNodes = useGraphStore(state => state.setNodes)
    const setEdges = useGraphStore(state => state.setEdges)
    const setSyncedDbs = useGraphStore(state => state.setSyncedDbs)
    const setSyncedRelations = useGraphStore(state => state.setSyncedRelations)
    const searchQuery = useGraphStore(state => state.searchQuery)
    const setSyncStatus = useGraphStore(state => state.setSyncStatus)
    const setIsDirty = useGraphStore(state => state.setIsDirty)

    // Token now lives only in memory (Zustand) and is persisted encrypted in the DB.

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
        if (!session) {
            toast.warning(t('dashboard.errors.missingSession'))
            return
        }

        if (isSyncingRef.current) return
        isSyncingRef.current = true

        setSyncStatus('saving')
        setSelectedNode(null)
        try {
            const data = await fetchNotionData(token)

            // If no databases returned and no token was provided (auto-reload),
            // don't overwrite existing data — the user isn't connected to Notion.
            if (data.databases.length === 0 && !token && !data.is_synced) {
                setIsNotionConnected(false)
                return
            }

            setSyncedDbs(data.databases)
            setSyncedRelations(data.relations)

            // If we got databases back, we are connected (either via new token or saved token)
            const connected = !!data.is_synced || data.databases.length > 0
            setIsNotionConnected(connected)

            const savedPositions = getSavedPositions(session.user.id)
            const currentColors = overrideState ? overrideState.custom_colors : customColors

            const { nodes: newNodes, edges: newEdges } = transformToGraphData(
                data.databases,
                data.relations,
                savedPositions,
                currentColors,
                handleSelectNode
            )

            // Only set token if it's not empty (don't overwrite with empty string on reload)
            if (token) setNotionToken(token)

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
            console.error("❌ [CloudSync] handleSync Error:", error)
            toast.error(error instanceof Error ? error.message : t('dashboard.errors.syncError'))
        } finally {
            setSyncStatus('idle')
            isSyncingRef.current = false
        }
    }, [session, customColors, searchQuery, setNodes, setEdges, fitView, setSyncStatus, setSelectedNode, setSyncedDbs, setSyncedRelations, setIsDirty, runForceLayout, handleSelectNode, toast, t, setNotionToken, setIsNotionConnected])

    // ─── Fetch cloud data on mount ──────────────────────────────────────

    useEffect(() => {
        if (!session || initialLoadRef.current === session.user.id) return
        initialLoadRef.current = session.user.id

        const loadCloudData = async () => {
            const data = await fetchCloudGraphData(session.user.id, session.access_token || '')
            if (!data) return

            // 1. Update localStorage
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

            // 3. Trigger Notion Sync
            // We can call handleSync with an empty token because the Edge Function
            // will retrieve it from the database if available.
            handleSync('', {
                filters: newFilters,
                hidden_dbs: newHidden,
                hide_isolated: newIsolated,
                custom_colors: newColors
            }, true)
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
                    setUserPlan(data.plan_type as 'free' | 'pro')
                }
            } catch {
                // Handle silently
            }
        }
        fetchPlan()
    }, [session?.user.id, setUserPlan]) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Fetch user plan on mount ───────────────────────────────────────

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
                hide_isolated: hideIsolated
            }

            // Persist to LocalStorage
            saveAllToStorage(userId, {
                positions: currentPositions,
                customColors,
                filters: Array.from(selectedPropertyTypes),
                hiddenDbs: Array.from(hiddenDbIds),
                hideIsolated: hideIsolated
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
    }, [session, nodes, customColors, selectedPropertyTypes, hiddenDbIds, hideIsolated, notionToken, setIsDirty, setNotionToken])

    return {
        cloudSyncStatus,
        setCloudSyncStatus,
        notionToken,
        setNotionToken,
        isNotionConnected,
        setIsNotionConnected,
        userPlan,
        handleSync,
        handleManualSync
    }
}
