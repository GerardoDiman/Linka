import { useCallback, useState, useEffect, useMemo } from "react"
import ReactFlow, {
    Background,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    type Connection,
    type Edge,
    type Node,
    useReactFlow,
    ReactFlowProvider,
    Panel
} from "reactflow"
import "reactflow/dist/style.css"
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force"
import {
    LayoutTemplate, Loader2,
    Maximize, ZoomIn, ZoomOut
} from "lucide-react"
import { supabase } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js"

import { Sidebar } from "../components/dashboard/Sidebar"
import { DatabaseNode } from "../components/dashboard/DatabaseNode"
import { Navbar } from "../components/dashboard/Navbar"
import { OnboardingTour } from "../components/dashboard/OnboardingTour"
import { SelectionActionBar } from "../components/dashboard/SelectionActionBar"
import { Tooltip } from "../components/ui/Tooltip"
import { fetchNotionData } from "../lib/notion"
import { transformToGraphData, type RawDatabase, type RawRelation } from "../lib/graph"
import { NODE_COLORS } from "../lib/colors"
import { useTheme } from "../context/ThemeContext"

const nodeTypes = {
    database: DatabaseNode,
}

// Raw Demo Data (Template)
const demoDatabases: RawDatabase[] = [
    {
        id: '1',
        title: 'Usuarios',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'nombre', type: 'title' },
            { name: 'email', type: 'email' }
        ],
        color: NODE_COLORS[0],
        icon: '👤',
        url: 'https://notion.so/usuarios',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Tareas',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'titulo', type: 'title' },
            { name: 'estado', type: 'status' }
        ],
        color: NODE_COLORS[1],
        icon: '✅',
        url: 'https://notion.so/tareas',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Comentarios',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'texto', type: 'rich_text' }
        ],
        color: NODE_COLORS[2],
        icon: '💬',
        url: 'https://notion.so/comentarios',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Etiquetas',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'nombre', type: 'title' }
        ],
        color: NODE_COLORS[3],
        icon: '🏷️',
        url: 'https://notion.so/etiquetas',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Archivos',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'url', type: 'url' }
        ],
        color: NODE_COLORS[4],
        icon: '📁',
        url: 'https://notion.so/archivos',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '6',
        title: 'Logs',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'evento', type: 'rich_text' }
        ],
        color: NODE_COLORS[5],
        icon: '📜',
        url: 'https://notion.so/logs',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '7',
        title: 'Config',
        properties: [
            { name: 'key', type: 'title' },
            { name: 'value', type: 'rich_text' }
        ],
        color: NODE_COLORS[6],
        icon: '⚙️',
        url: 'https://notion.so/config',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '8',
        title: 'Notificaciones',
        properties: [
            { name: 'id', type: 'unique_id' },
            { name: 'mensaje', type: 'rich_text' }
        ],
        color: NODE_COLORS[7],
        icon: '🔔',
        url: 'https://notion.so/notificaciones',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
]

const demoRelations: RawRelation[] = [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '2', target: '4' },
    { source: '2', target: '5' },
    { source: '1', target: '8' },
    { source: '8', target: '1' },
]

const LEGACY_KEYS = [
    'linka-node-positions',
    'linka-property-filters',
    'linka-hidden-dbs',
    'linka-hide-isolated',
    'linka-notion-token',
    'linka-onboarding-seen',
    'linka-custom-colors'
]

const getScopedKey = (userId: string, key: string) => `linka_${userId}_${key}`

const STORAGE_KEYS = {
    POSITIONS: 'node-positions',
    FILTERS: 'property-filters',
    HIDDEN_DBS: 'hidden-dbs',
    ISOLATED: 'hide-isolated',
    NOTION_TOKEN: 'notion-token',
    ONBOARDING: 'onboarding-seen',
    CUSTOM_COLORS: 'custom-colors'
}

const cleanupLegacySettings = () => {
    try {
        LEGACY_KEYS.forEach(key => localStorage.removeItem(key))
    } catch (e) {
        console.error("Error during legacy cleanup:", e)
    }
}

const getSavedPositions = (userId: string): Record<string, { x: number; y: number }> => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS))
        return saved ? JSON.parse(saved) : {}
    } catch (e) {
        return {}
    }
}

const savePosition = (userId: string, nodeId: string, position: { x: number; y: number }) => {
    try {
        const saved = getSavedPositions(userId)
        saved[nodeId] = position
        localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS), JSON.stringify(saved))
    } catch (e) {
        console.error("Error saving position:", e)
    }
}

const saveAllPositions = (userId: string, nodes: Node[]) => {
    try {
        const saved = getSavedPositions(userId)
        nodes.forEach(node => {
            saved[node.id] = node.position
        })
        localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS), JSON.stringify(saved))
    } catch (e) {
        console.error("Error saving positions:", e)
    }
}

const getSavedFilters = (userId: string): string[] => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.FILTERS))
        return saved ? JSON.parse(saved) : []
    } catch (e) {
        return []
    }
}

const getSavedHiddenDbs = (userId: string): string[] => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.HIDDEN_DBS))
        return saved ? JSON.parse(saved) : []
    } catch (e) {
        return []
    }
}

const getSavedHideIsolated = (userId: string): boolean => {
    try {
        return localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.ISOLATED)) === 'true'
    } catch (e) {
        return false
    }
}

const getSavedCustomColors = (userId: string): Record<string, string> => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.CUSTOM_COLORS))
        return saved ? JSON.parse(saved) : {}
    } catch (e) {
        return {}
    }
}

// Generate initial graph data helper moved inside component to support fresh localStorage

interface DashboardContentProps {
    userRole?: string | null
    session: Session
}

function DashboardContent({ userRole, session }: DashboardContentProps) {
    const { fitView, zoomIn, zoomOut } = useReactFlow()
    const { theme } = useTheme()

    const initialGraphData = useMemo(() => {
        const saved = getSavedPositions(session.user.id)
        const custom = getSavedCustomColors(session.user.id)
        return transformToGraphData(demoDatabases, demoRelations, saved, custom)
    }, [session.user.id])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialGraphData.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraphData.edges)
    const [loading, setLoading] = useState(false)
    const [selectedNode, setSelectedNode] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [syncedDbs, setSyncedDbs] = useState<any[]>(demoDatabases)
    const [syncedRelations, setSyncedRelations] = useState<RawRelation[]>(demoRelations)
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<Set<string>>(() => new Set(getSavedFilters(session.user.id)))
    const [hiddenDbIds, setHiddenDbIds] = useState<Set<string>>(() => new Set(getSavedHiddenDbs(session.user.id)))
    const [hideIsolated, setHideIsolated] = useState(() => getSavedHideIsolated(session.user.id))
    const [customColors, setCustomColors] = useState<Record<string, string>>(() => getSavedCustomColors(session.user.id))
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [showTour, setShowTour] = useState(false)

    // Auto-onboarding on first visit
    useEffect(() => {
        const hasSeenLocalOnboarding = localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING))
        const hasSeenAccountOnboarding = session.user.user_metadata?.has_seen_onboarding

        if (!hasSeenLocalOnboarding || hasSeenAccountOnboarding === false) {
            // Give the app some time to load components
            const timeout = setTimeout(() => setShowTour(true), 1500)
            return () => clearTimeout(timeout)
        }
    }, [session.user.id, session.user.user_metadata?.has_seen_onboarding])

    // Cleanup legacy settings and auto-sync on mount if token exists
    useEffect(() => {
        cleanupLegacySettings()
        const savedToken = localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.NOTION_TOKEN))
        if (savedToken) {
            handleSync(savedToken)
        }
    }, [session.user.id])

    // Map for quick title lookups without depending on nodes state
    const dbTitles = useMemo(() => {
        const map = new Map<string, string>()
        syncedDbs.forEach(db => map.set(db.id, db.title))
        return map
    }, [syncedDbs])

    const handleSelectNode = useCallback((nodeData: any) => {
        setSelectedNode(nodeData)
    }, [])

    // Derived state: visible database IDs based on selected property types AND manual toggles AND isolated filter
    const visibleDbIds = useMemo(() => {
        let filtered = syncedDbs

        // Apply property type filter if any
        if (selectedPropertyTypes.size > 0) {
            filtered = filtered.filter(db => db.properties?.some((p: any) => selectedPropertyTypes.has(p.type)))
        }

        // Exclude manually hidden databases
        filtered = filtered.filter(db => !hiddenDbIds.has(db.id))

        // Apply isolated filter if enabled
        if (hideIsolated) {
            const connectedDbIds = new Set<string>()
            syncedRelations.forEach(rel => {
                connectedDbIds.add(rel.source)
                connectedDbIds.add(rel.target)
            })
            filtered = filtered.filter(db => connectedDbIds.has(db.id))
        }

        return new Set(filtered.map(db => db.id))
    }, [syncedDbs, selectedPropertyTypes, hiddenDbIds, hideIsolated, syncedRelations])

    const togglePropertyType = useCallback((type: string) => {
        setSelectedPropertyTypes(prev => {
            const next = new Set(prev)
            if (next.has(type)) {
                next.delete(type)
            } else {
                next.add(type)
            }
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.FILTERS), JSON.stringify(Array.from(next)))
            return next
        })
    }, [session.user.id])

    const toggleDbVisibility = useCallback((dbId: string) => {
        setHiddenDbIds(prev => {
            const next = new Set(prev)
            if (next.has(dbId)) {
                next.delete(dbId)
            } else {
                next.add(dbId)
            }
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.HIDDEN_DBS), JSON.stringify(Array.from(next)))
            return next
        })
    }, [session.user.id])

    const toggleHideIsolated = useCallback(() => {
        setHideIsolated((prev: boolean) => {
            const next = !prev
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ISOLATED), String(next))
            return next
        })
    }, [session.user.id])

    const clearPropertyFilters = useCallback(() => {
        setSelectedPropertyTypes(new Set())
        setHideIsolated(false)
        localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.FILTERS), JSON.stringify([]))
        localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ISOLATED), 'false')
    }, [session.user.id])

    // Function to run force layout
    const runForceLayout = useCallback((nodesToLayout: Node[], edgesToLayout: Edge[], currentSearch: string = "") => {
        // Only run if we actually want to reposition everything
        const simulationNodes = nodesToLayout.map((node) => ({
            ...node,
            x: node.position.x,
            y: node.position.y,
        }))

        const simulationLinks = edgesToLayout.map((edge) => ({
            source: edge.source,
            target: edge.target,
        }))

        const simulation = forceSimulation(simulationNodes as any)
            .force("link", forceLink(simulationLinks).id((d: any) => d.id).distance(350))
            .force("charge", forceManyBody().strength(-500))
            .force("center", forceCenter(0, 0))
            .force("collide", forceCollide(200))
            .force("x", forceX(0).strength(0.05))
            .force("y", forceY(0).strength(0.05))
            .stop()

        for (let i = 0; i < 300; ++i) simulation.tick()

        const layoutedNodes = nodesToLayout.map((node, index) => {
            const simNode = simulationNodes[index] as any
            return {
                ...node,
                position: { x: simNode.x, y: simNode.y },
                data: {
                    ...node.data,
                    onSelect: handleSelectNode,
                    searchQuery: currentSearch,
                    color: customColors[node.id] || node.data.color
                }
            }
        })

        setNodes(layoutedNodes)
        saveAllPositions(session.user.id, layoutedNodes)
        setTimeout(() => {
            window.requestAnimationFrame(() => fitView({ padding: 0.2, duration: 800, maxZoom: 1 }))
        }, 100)
    }, [setNodes, fitView, handleSelectNode, session.user.id, customColors])


    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => {
            const sourceNode = nodes.find(n => n.id === params.source)
            const color = sourceNode?.data?.color || '#2986B2'
            return addEdge({ ...params, animated: true, style: { stroke: color, strokeWidth: 3 } }, eds)
        })
    }, [setEdges, nodes])

    const handleSync = async (token: string) => {
        if (!token) {
            alert("Por favor ingresa un token de Notion")
            return
        }

        setLoading(true)
        setSelectedNode(null)
        try {
            const data = await fetchNotionData(token)
            const saved = getSavedPositions(session.user.id)
            const { nodes: newNodes, edges: newEdges } = transformToGraphData(data.databases, data.relations, saved, customColors)

            setSyncedDbs(data.databases)
            setSyncedRelations(data.relations)
            setSelectedPropertyTypes(new Set())
            setHiddenDbIds(new Set())
            setHideIsolated(false)
            setEdges(newEdges)

            // Save token on success
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.NOTION_TOKEN), token)

            // Reset persistence on new sync
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.FILTERS), JSON.stringify([]))
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.HIDDEN_DBS), JSON.stringify([]))
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ISOLATED), 'false')
            localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.CUSTOM_COLORS), JSON.stringify({}))
            setCustomColors({})

            const hasAllPositions = newNodes.every(n => saved[n.id])
            if (!hasAllPositions) {
                runForceLayout(newNodes, newEdges, searchQuery)
            } else {
                setNodes(newNodes.map(n => ({
                    ...n,
                    data: { ...n.data, onSelect: handleSelectNode, searchQuery, color: customColors[n.id] || n.data.color }
                })))
                setTimeout(() => {
                    fitView({ padding: 0.2, duration: 800, maxZoom: 1 })
                }, 100)
            }

        } catch (error: any) {
            console.error("Error syncing Notion:", error)
            alert(error.message || "Error al sincronizar con Notion")
        } finally {
            setLoading(false)
        }
    }

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        savePosition(session.user.id, node.id, node.position)
    }, [session.user.id])

    const handleResetLayout = useCallback(() => {
        // Clear saved positions in localStorage for this user
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.POSITIONS))

        // Re-run the force-directed layout simulation instead of just random positions
        runForceLayout(nodes, edges, searchQuery)
    }, [nodes, edges, searchQuery, runForceLayout, session.user.id])

    const handleSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
        setSelectedNodeIds(new Set(selectedNodes.map(n => n.id)))
    }, [])

    const handleBatchColorChange = useCallback((color: string) => {
        const newColors = { ...customColors }
        selectedNodeIds.forEach(id => {
            newColors[id] = color
        })
        setCustomColors(newColors)
        localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.CUSTOM_COLORS), JSON.stringify(newColors))

        // Update nodes and edges in view
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
    }, [selectedNodeIds, customColors, setNodes, setEdges, session.user.id])

    const handleBatchHide = useCallback(() => {
        const newHidden = new Set(hiddenDbIds)
        selectedNodeIds.forEach(id => newHidden.add(id))
        setHiddenDbIds(newHidden)
        localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.HIDDEN_DBS), JSON.stringify(Array.from(newHidden)))
        setSelectedNodeIds(new Set()) // Clear selection after hiding
    }, [selectedNodeIds, hiddenDbIds, session.user.id])

    const handleClearSelection = useCallback(() => {
        // ReactFlow manages internal selection, but we can clear ours
        setSelectedNodeIds(new Set())
        // To truly deselect in ReactFlow we'd need to update nodes with selected: false
        setNodes(nds => nds.map(n => ({ ...n, selected: false })))
    }, [setNodes])

    const handleFocusNode = useCallback((nodeId: string) => {
        fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.5, maxZoom: 1.2 })
    }, [fitView])

    const handleDisconnect = useCallback(() => {
        setSyncedDbs(demoDatabases)
        setSyncedRelations(demoRelations)
        setNodes(transformToGraphData(demoDatabases, demoRelations, {}, {}).nodes)
        setEdges(transformToGraphData(demoDatabases, demoRelations, {}, {}).edges)
        setSelectedPropertyTypes(new Set())
        setHiddenDbIds(new Set())
        setHideIsolated(false)
        setCustomColors({})
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.FILTERS))
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.HIDDEN_DBS))
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.ISOLATED))
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.CUSTOM_COLORS))
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.NOTION_TOKEN))

        // Reset positions too for demo data
        localStorage.removeItem(getScopedKey(session.user.id, STORAGE_KEYS.POSITIONS))
    }, [session.user.id, setNodes, setEdges, setSyncedDbs, setSyncedRelations, setSelectedPropertyTypes, setHiddenDbIds, setHideIsolated, setCustomColors])

    // Effect to update nodes/edges when search query or visibility changes
    useEffect(() => {
        setNodes((nds) => nds.map((node) => {
            const isVisible = visibleDbIds.has(node.id)
            return {
                ...node,
                data: {
                    ...node.data,
                    searchQuery,
                },
                hidden: !isVisible,
                style: {
                    ...node.style,
                    transition: 'opacity 0.3s ease'
                }
            }
        }))

        setEdges((eds) => eds.map((edge) => {
            const sourceTitle = dbTitles.get(edge.source) || ""
            const sourceMatches = !searchQuery || sourceTitle.toLowerCase().includes(searchQuery.toLowerCase())
            const isVisible = visibleDbIds.has(edge.source) && visibleDbIds.has(edge.target)

            return {
                ...edge,
                hidden: !isVisible,
                style: {
                    ...edge.style,
                    opacity: sourceMatches ? 1 : 0.1,
                    transition: 'opacity 0.3s ease'
                }
            }
        }))
    }, [searchQuery, visibleDbIds, dbTitles, setNodes, setEdges])

    // Separate effect for fitView to avoid loops and ensure it runs after layout/visibility changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fitView({ padding: 0.2, duration: 400, maxZoom: 1 })
        }, 150)
        return () => clearTimeout(timeoutId)
    }, [visibleDbIds, fitView])

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <Navbar
                onSync={handleSync}
                onDisconnect={handleDisconnect}
                isSynced={syncedDbs !== demoDatabases}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                databases={syncedDbs}
                selectedPropertyTypes={selectedPropertyTypes}
                onTogglePropertyType={togglePropertyType}
                onClearFilters={clearPropertyFilters}
                hideIsolated={hideIsolated}
                onToggleHideIsolated={toggleHideIsolated}
                userRole={userRole}
                onStartTour={() => setShowTour(true)}
            />

            <div className={`flex flex-1 overflow-hidden transition-all duration-500`}>
                <Sidebar
                    databases={syncedDbs}
                    selectedNode={selectedNode}
                    onClearSelection={() => setSelectedNode(null)}
                    searchQuery={searchQuery}
                    visibleDbIds={visibleDbIds}
                    hiddenDbIds={hiddenDbIds}
                    onToggleVisibility={toggleDbVisibility}
                    onFocusNode={handleFocusNode}
                    onSelectNode={handleSelectNode}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <div id="dashboard-canvas" className="flex-1 h-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDragStop={onNodeDragStop}
                        onInit={() => {
                            const saved = getSavedPositions(session.user.id)
                            const hasAllPositions = nodes.every(n => saved[n.id])

                            if (hasAllPositions) {
                                // Important: Give it a tiny bit of time for dimensions to settle
                                setTimeout(() => fitView({ padding: 0.2, duration: 800, maxZoom: 1 }), 100)
                            } else {
                                runForceLayout(nodes, edges, searchQuery)
                            }
                        }}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                        minZoom={0.05}
                        maxZoom={2}
                        className="bg-gray-50 dark:bg-slate-900"
                        proOptions={{ hideAttribution: true }}
                        onSelectionChange={handleSelectionChange}
                        selectionKeyCode="Shift"
                        multiSelectionKeyCode="Shift"
                    >
                        {loading && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-[2px] pointer-events-none transition-all duration-300">
                                <div className="flex flex-col items-center gap-4 p-8 bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 animate-in fade-in zoom-in duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                                        <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Sincronizando Notion</span>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Trayendo tus bases de datos...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <Background color={theme === 'dark' ? '#1e293b' : '#cbd5e1'} gap={20} size={1} />

                        <Panel position="bottom-left" className="!m-6">
                            <div className="flex flex-col gap-2 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-2xl shadow-2xl">
                                <Tooltip content="Acercar" position="right">
                                    <button
                                        onClick={() => zoomIn()}
                                        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                    >
                                        <ZoomIn size={14} />
                                    </button>
                                </Tooltip>

                                <Tooltip content="Alejar" position="right">
                                    <button
                                        onClick={() => zoomOut()}
                                        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                    >
                                        <ZoomOut size={14} />
                                    </button>
                                </Tooltip>

                                <Tooltip content="Ajustar a la pantalla" position="right">
                                    <button
                                        onClick={() => fitView()}
                                        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                    >
                                        <Maximize size={14} />
                                    </button>
                                </Tooltip>

                                <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-0.5" />

                                <Tooltip content="Reiniciar disposición automática" position="right">
                                    <button
                                        id="dashboard-reset-layout"
                                        onClick={handleResetLayout}
                                        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                    >
                                        <LayoutTemplate size={14} />
                                    </button>
                                </Tooltip>
                            </div>
                        </Panel>

                        <Panel position="bottom-right" className="!m-6">
                            <div className="p-0.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden">
                                <MiniMap
                                    ariaLabel=""
                                    nodeColor={(node) => node.data.color || (theme === 'dark' ? '#334155' : '#eee')}
                                    maskColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(240, 240, 240, 0.6)'}
                                    style={{
                                        position: 'relative',
                                        height: 120,
                                        width: 150,
                                        backgroundColor: 'transparent',
                                        margin: 0,
                                        borderRadius: '12px',
                                    }}
                                />
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>

            <OnboardingTour
                isOpen={showTour}
                onClose={async () => {
                    setShowTour(false)
                    localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING), 'true')

                    // Persist to Supabase metadata if not already marked
                    if (session.user.user_metadata?.has_seen_onboarding !== true) {
                        await supabase.auth.updateUser({
                            data: { has_seen_onboarding: true }
                        })
                    }
                }}
            />

            <SelectionActionBar
                selectedCount={selectedNodeIds.size}
                onClearSelection={handleClearSelection}
                onBatchColorChange={handleBatchColorChange}
                onBatchHide={handleBatchHide}
            />
        </div>
    )
}

interface DashboardPageProps {
    userRole?: string | null
    session: Session
}

export default function DashboardPage({ userRole, session }: DashboardPageProps) {
    return (
        <ReactFlowProvider>
            <DashboardContent userRole={userRole} session={session} />
        </ReactFlowProvider>
    )
}
