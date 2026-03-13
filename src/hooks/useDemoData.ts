/**
 * Hook for initializing demo data when Notion is not connected.
 * Handles localized demo databases, initial graph computation, and first-load layout.
 */
import { useEffect, useMemo, useRef } from 'react'
import type { Node, Edge } from 'reactflow'
import type { TFunction } from 'i18next'
import { useGraphStore } from '../stores/useGraphStore'
import { transformToGraphData } from '../lib/graph'
import { getSavedPositions, getSavedCustomColors } from '../lib/storage'
import { createDemoDatabases, DEMO_RELATIONS } from '../lib/demoData'
import type { DatabaseNodeData } from '../types'

interface UseDemoDataOptions {
    session: { user: { id: string } } | null
    handleSelectNode: (nodeData: DatabaseNodeData) => void
    runForceLayout: (nodes: Node[], edges: Edge[], search?: string) => void
    fitView: (options?: { padding?: number; duration?: number; maxZoom?: number }) => void
    t: TFunction
}

export function useDemoData({
    session,
    handleSelectNode,
    runForceLayout,
    fitView,
    t
}: UseDemoDataOptions) {
    const hasInitializedRef = useRef(false)

    const nodes = useGraphStore(state => state.nodes)
    const setNodes = useGraphStore(state => state.setNodes)
    const setEdges = useGraphStore(state => state.setEdges)
    const setSyncedDbs = useGraphStore(state => state.setSyncedDbs)
    const setSyncedRelations = useGraphStore(state => state.setSyncedRelations)
    const searchQuery = useGraphStore(state => state.searchQuery)
    const isNotionConnected = useGraphStore(state => state.isNotionConnected)

    const localizedDemoDatabases = useMemo(() => createDemoDatabases(t), [t])
    const localizedDemoRelations = useMemo(() => DEMO_RELATIONS, [])

    const initialGraphData = useMemo(() => {
        if (!session) return { nodes: [], edges: [] }
        const saved = getSavedPositions(session.user.id)
        const custom = getSavedCustomColors(session.user.id)
        return transformToGraphData(localizedDemoDatabases, localizedDemoRelations, saved, custom, handleSelectNode)
    }, [session, localizedDemoDatabases, localizedDemoRelations, handleSelectNode])

    // Initialize demo data on first mount (when Notion is not connected)
    useEffect(() => {
        if (hasInitializedRef.current) return
        if (isNotionConnected) return

        if (initialGraphData.nodes.length > 0) {
            hasInitializedRef.current = true
            setSyncedDbs(localizedDemoDatabases)
            setSyncedRelations(localizedDemoRelations)

            if (nodes.length === 0) {
                if (session) {
                    const saved = getSavedPositions(session.user.id)
                    const hasAllPositions = initialGraphData.nodes.every(n => saved[n.id])

                    if (hasAllPositions) {
                        setNodes(initialGraphData.nodes)
                        setEdges(initialGraphData.edges)
                        setTimeout(() => fitView({ padding: 0.2, duration: 800, maxZoom: 1 }), 100)
                    } else {
                        runForceLayout(initialGraphData.nodes, initialGraphData.edges, searchQuery)
                    }
                } else {
                    setNodes(initialGraphData.nodes)
                    setEdges(initialGraphData.edges)
                }
            }
        }
    }, [initialGraphData, nodes.length, setNodes, setEdges, setSyncedDbs, setSyncedRelations, localizedDemoDatabases, localizedDemoRelations, runForceLayout, session, searchQuery, fitView, isNotionConnected])

    return {
        localizedDemoDatabases,
        localizedDemoRelations
    }
}
