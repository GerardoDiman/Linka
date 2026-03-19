/**
 * Hook for node/edge interaction handlers — batch operations,
 * layout reset, connect, drag, visibility, and disconnect.
 */
import { useCallback, useState } from 'react'
import type { Connection, Edge, Node } from 'reactflow'
import { addEdge } from 'reactflow'
import { useGraphStore } from '../stores/useGraphStore'
import { transformToGraphData, type RawDatabase, type RawRelation } from '../lib/graph'
import type { DatabaseNodeData } from '../types'

interface UseNodeInteractionsOptions {
    customColors: Record<string, string>
    setCustomColors: (colors: Record<string, string>) => void
    hiddenDbIds: Set<string>
    setHiddenDbIds: (ids: Set<string>) => void
    clearPropertyFilters: () => void
    runForceLayout: (nodes: Node[], edges: Edge[], search?: string) => void
    handleSelectNode: (nodeData: DatabaseNodeData) => void
    fitView: (options?: { nodes?: { id: string }[]; duration?: number; padding?: number; maxZoom?: number }) => void
    cloudSync: {
        setNotionToken: (token: string | null) => void
    }
    localizedDemoDatabases: RawDatabase[]
    localizedDemoRelations: RawRelation[]
}

export function useNodeInteractions({
    customColors,
    setCustomColors,
    hiddenDbIds,
    setHiddenDbIds,
    clearPropertyFilters,
    runForceLayout,
    handleSelectNode,
    fitView,
    cloudSync,
    localizedDemoDatabases,
    localizedDemoRelations
}: UseNodeInteractionsOptions) {
    const nodes = useGraphStore(state => state.nodes)
    const setNodes = useGraphStore(state => state.setNodes)
    const edges = useGraphStore(state => state.edges)
    const setEdges = useGraphStore(state => state.setEdges)
    const searchQuery = useGraphStore(state => state.searchQuery)
    const setIsDirty = useGraphStore(state => state.setIsDirty)
    const setSyncedDbs = useGraphStore(state => state.setSyncedDbs)
    const setSyncedRelations = useGraphStore(state => state.setSyncedRelations)
    const setIsNotionConnected = useGraphStore(state => state.setIsNotionConnected)

    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())

    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => {
            const sourceNode = nodes.find(n => n.id === params.source)
            const color = sourceNode?.data?.color || '#2986B2'
            return addEdge({ ...params, animated: true, style: { stroke: color, strokeWidth: 3 } }, eds)
        })
    }, [setEdges, nodes])

    const onNodeDragStop = useCallback((saveUndoState: (nodes: Node[]) => void) => {
        setIsDirty(true)
        saveUndoState(nodes)
    }, [nodes, setIsDirty])

    const handleResetLayout = useCallback(() => {
        setIsDirty(true)
        runForceLayout(nodes, edges, searchQuery)
    }, [nodes, edges, searchQuery, runForceLayout, setIsDirty])

    const handleSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
        setSelectedNodeIds(new Set(selectedNodes.map(n => n.id)))
    }, [])

    const handleBatchColorChange = useCallback((color: string) => {
        const newColors = { ...customColors }
        selectedNodeIds.forEach(id => {
            newColors[id] = color
        })
        setCustomColors(newColors)
        setIsDirty(true)

        setNodes(nds => nds.map(n => {
            if (selectedNodeIds.has(n.id)) {
                return { ...n, data: { ...n.data, color } }
            }
            return n
        }))

        setEdges(eds => eds.map(e => {
            if (selectedNodeIds.has(e.source)) {
                return { ...e, style: { ...e.style, stroke: color } }
            }
            return e
        }))
    }, [selectedNodeIds, customColors, setCustomColors, setIsDirty, setNodes, setEdges])

    const handleBatchHide = useCallback(() => {
        const newHidden = new Set(hiddenDbIds)
        selectedNodeIds.forEach(id => newHidden.add(id))
        setHiddenDbIds(newHidden)
        setIsDirty(true)
        setSelectedNodeIds(new Set())
    }, [selectedNodeIds, hiddenDbIds, setHiddenDbIds, setIsDirty])

    const handleFocusNode = useCallback((nodeId: string) => {
        fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.5, maxZoom: 1.2 })
    }, [fitView])

    const handleDisconnect = useCallback(() => {
        setSyncedDbs(localizedDemoDatabases)
        setSyncedRelations(localizedDemoRelations)
        const initialGraph = transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {}, handleSelectNode)
        setNodes(initialGraph.nodes)
        setEdges(initialGraph.edges)
        clearPropertyFilters()
        cloudSync.setNotionToken(null)
        setIsNotionConnected(false)
        runForceLayout(initialGraph.nodes, initialGraph.edges)
    }, [localizedDemoDatabases, localizedDemoRelations, runForceLayout, setNodes, setEdges, clearPropertyFilters, cloudSync, setSyncedDbs, setSyncedRelations, handleSelectNode, setIsNotionConnected])

    return {
        selectedNodeIds,
        setSelectedNodeIds,
        onConnect,
        onNodeDragStop,
        handleResetLayout,
        handleSelectionChange,
        handleBatchColorChange,
        handleBatchHide,
        handleFocusNode,
        handleDisconnect
    }
}
