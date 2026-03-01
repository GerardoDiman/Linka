import { useCallback, useState, useEffect, useMemo } from "react"
import ReactFlow, {
    Background,
    MiniMap,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
    type Connection,
    type Edge,
    type Node,
    useReactFlow,
    ReactFlowProvider,
    Panel
} from "reactflow"
import { useGraphStore } from "../stores/useGraphStore"
import type { DatabaseNodeData } from "../types"
import "reactflow/dist/style.css"
import {
    LayoutTemplate, Loader2,
    Maximize, ZoomIn, ZoomOut
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

import { Sidebar } from "../components/dashboard/Sidebar"
import { DatabaseNode } from "../components/dashboard/DatabaseNode"
import { Navbar } from "../components/dashboard/Navbar"
import { OnboardingTour } from "../components/dashboard/OnboardingTour"
import { SelectionActionBar } from "../components/dashboard/SelectionActionBar"
import { ExportButton } from "../components/dashboard/ExportButton"
import { Tooltip } from "../components/ui/Tooltip"
import { PricingModal } from "../components/dashboard/PricingModal"
import { ErrorBoundary } from "../components/ui/ErrorBoundary"
import { transformToGraphData } from "../lib/graph"
import { useTheme } from "../context/ThemeContext"
import { useTranslation } from "react-i18next"
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton"
import { ShortcutsHelpModal } from "../components/dashboard/ShortcutsHelpModal"

// Extracted utilities & hooks
import { getScopedKey, getSavedPositions, getSavedCustomColors, STORAGE_KEYS } from "../lib/storage"
import { createDemoDatabases, DEMO_RELATIONS } from "../lib/demoData"
import { useGraphFilters } from "../hooks/useGraphFilters"
import { useGraphLayout } from "../hooks/useGraphLayout"
import { useCloudSync } from "../hooks/useCloudSync"
import { useDashboardShortcuts } from "../hooks/useDashboardShortcuts"

// Move nodeTypes OUTSIDE the component to ensure referential stability and fix React Flow warning
const NODE_TYPES = {
    database: DatabaseNode,
}

interface DashboardContentProps {
    userRole?: string | null
}

function DashboardContent({ userRole }: DashboardContentProps) {
    const { t } = useTranslation()
    const { fitView, zoomIn, zoomOut } = useReactFlow()
    const { theme } = useTheme()
    const { session, loading } = useAuth()
    const { toast } = useToast()

    // ─── Demo data ──────────────────────────────────────────────────────

    const localizedDemoDatabases = useMemo(() => createDemoDatabases(t), [t])
    const localizedDemoRelations = useMemo(() => DEMO_RELATIONS, [])

    const initialGraphData = useMemo(() => {
        if (!session) return { nodes: [], edges: [] }
        const saved = getSavedPositions(session.user.id)
        const custom = getSavedCustomColors(session.user.id)
        return transformToGraphData(localizedDemoDatabases, localizedDemoRelations, saved, custom)
    }, [session, localizedDemoDatabases, localizedDemoRelations])

    // ─── ReactFlow & Global state ───────────────────────────────────────

    const nodes = useGraphStore(state => state.nodes)
    const setNodes = useGraphStore(state => state.setNodes)
    const edges = useGraphStore(state => state.edges)
    const setEdges = useGraphStore(state => state.setEdges)
    const syncStatus = useGraphStore(state => state.syncStatus)
    const searchQuery = useGraphStore(state => state.searchQuery)
    const setSearchQuery = useGraphStore(state => state.setSearchQuery)
    const syncedDbs = useGraphStore(state => state.syncedDbs)
    const setSyncedDbs = useGraphStore(state => state.setSyncedDbs)
    const syncedRelations = useGraphStore(state => state.syncedRelations)
    const setSyncedRelations = useGraphStore(state => state.setSyncedRelations)
    const userPlan = useGraphStore(state => state.userPlan)
    const setUserPlan = useGraphStore(state => state.setUserPlan)

    const { plan: authPlan } = useAuth()

    // Sync auth plan to store
    useEffect(() => {
        if (authPlan) {
            setUserPlan(authPlan)
        }
    }, [authPlan, setUserPlan])

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes])
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges])

    const [selectedNode, setSelectedNode] = useState<DatabaseNodeData | null>(null)
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [showTour, setShowTour] = useState(false)
    const [showPricing, setShowPricing] = useState(false)

    // Initialize store with demo data if empty
    useEffect(() => {
        if (nodes.length === 0 && initialGraphData.nodes.length > 0) {
            setNodes(initialGraphData.nodes)
            setEdges(initialGraphData.edges)
            setSyncedDbs(localizedDemoDatabases)
            setSyncedRelations(localizedDemoRelations)
        }
    }, [initialGraphData, nodes.length, setNodes, setEdges, setSyncedDbs, setSyncedRelations, localizedDemoDatabases, localizedDemoRelations])

    // ─── Graph filters ──────────────────────────────────────────────────

    const handleSelectNode = useCallback((nodeData: DatabaseNodeData) => {
        setSelectedNode(nodeData)
    }, [])

    const {
        selectedPropertyTypes,
        hiddenDbIds,
        hideIsolated,
        customColors,
        isDirty,
        setIsDirty,
        visibleDbIds,
        togglePropertyType,
        toggleDbVisibility,
        toggleHideIsolated,
        clearPropertyFilters,
        setCustomColors,
        setHiddenDbIds
    } = useGraphFilters({
        userId: session?.user.id ?? null,
        syncedDbs,
        syncedRelations
    })

    // ─── Graph layout ───────────────────────────────────────────────────

    const { runForceLayout } = useGraphLayout({
        setNodes,
        setEdges,
        fitView,
        handleSelectNode,
        customColors: customColors
    })

    // ─── Cloud sync ─────────────────────────────────────────────────────

    const cloudSync = useCloudSync({
        session,
        customColors: customColors,
        selectedPropertyTypes: selectedPropertyTypes,
        hiddenDbIds: hiddenDbIds,
        hideIsolated: hideIsolated,
        setCustomColors: setCustomColors,
        setSelectedPropertyTypes: clearPropertyFilters, // Note: Not directly manipulated by sync
        setHiddenDbIds: setHiddenDbIds,
        setHideIsolated: clearPropertyFilters, // ...
        runForceLayout,
        fitView,
        handleSelectNode,
        setSelectedNode,
        toast,
        t
    })

    // Override notionToken/userPlan for the filters visibleDbIds calculation
    // Now done directly inside useGraphFilters using cloudSync.notionToken!

    // ─── Save handler for keyboard shortcuts ────────────────────────────

    const handleKeyboardSave = useCallback(async () => {
        if (!session) return
        try {
            setIsDirty(false)
            await cloudSync.handleManualSync()
            toast.success(t('dashboard.keyboard.saved'))
        } catch {
            toast.error(t('dashboard.keyboard.saveError'))
        }
    }, [session, cloudSync, setIsDirty, toast, t])

    // ─── Keyboard shortcuts ─────────────────────────────────────────────

    const shortcuts = useDashboardShortcuts({
        session,
        setNodes,
        setSelectedNode,
        setSelectedNodeIds,
        isDirty: isDirty,
        onSave: handleKeyboardSave,
        onFitView: () => fitView(),
        toast,
        t
    })

    // ─── Auto-onboarding on first visit ─────────────────────────────────

    useEffect(() => {
        if (!session) return
        const hasSeenLocalOnboarding = localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING))
        const hasSeenAccountOnboarding = session.user.user_metadata?.has_seen_onboarding

        if (!hasSeenLocalOnboarding || hasSeenAccountOnboarding === false) {
            const timeout = setTimeout(() => setShowTour(true), 1500)
            return () => clearTimeout(timeout)
        }
    }, [session])

    // Update demo data language when it changes
    useEffect(() => {
        const isShowingDemo = !cloudSync.notionToken
        if (isShowingDemo) {
            setTimeout(() => {
                setSyncedDbs(localizedDemoDatabases)
                setSyncedRelations(localizedDemoRelations)
            }, 0)
        }
    }, [localizedDemoDatabases, localizedDemoRelations, cloudSync.notionToken, setSyncedDbs, setSyncedRelations])

    // ─── Derived state ──────────────────────────────────────────────────

    const dbTitles = useMemo(() => {
        const map = new Map<string, string>()
        syncedDbs.forEach((db) => map.set(db.id, db.title))
        return map
    }, [syncedDbs])

    // ─── Node / Edge interactions ───────────────────────────────────────

    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => {
            const sourceNode = nodes.find(n => n.id === params.source)
            const color = sourceNode?.data?.color || '#2986B2'
            return addEdge({ ...params, animated: true, style: { stroke: color, strokeWidth: 3 } }, eds)
        })
    }, [setEdges, nodes])

    const onNodeDragStop = useCallback(() => {
        setIsDirty(true)
        shortcuts.saveUndoState(nodes)
    }, [nodes, shortcuts, setIsDirty])

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
        setNodes(transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {}).nodes)
        setEdges(transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {}).edges)
        clearPropertyFilters()
        cloudSync.setNotionToken(null)
        const initialGraph = transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {})
        runForceLayout(initialGraph.nodes, initialGraph.edges)
    }, [localizedDemoDatabases, localizedDemoRelations, runForceLayout, setNodes, setEdges, clearPropertyFilters, cloudSync, setSyncedDbs, setSyncedRelations])

    // ─── Effects for visibility/search updates ──────────────────────────

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

    // Separate effect for fitView
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fitView({ padding: 0.2, duration: 400, maxZoom: 1 })
        }, 150)
        return () => clearTimeout(timeoutId)
    }, [visibleDbIds, fitView])

    // ─── Render ─────────────────────────────────────────────────────────

    if (loading || !session) return <DashboardSkeleton />

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <Navbar
                onSync={cloudSync.handleSync}
                onDisconnect={handleDisconnect}
                isSynced={!!cloudSync.notionToken}
                loading={syncStatus === 'saving'}
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
                userPlan={userPlan}
                onManualSync={cloudSync.handleManualSync}
                syncStatus={cloudSync.cloudSyncStatus}
                isDirty={isDirty}
                onShowShortcuts={() => shortcuts.setShowShortcutsModal(true)}
                onUpgrade={() => setShowPricing(true)}
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
                <ErrorBoundary>
                    <div id="dashboard-canvas" className="flex-1 h-full relative">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeDragStop={onNodeDragStop}
                            onInit={() => {
                                if (!session) return
                                const saved = getSavedPositions(session.user.id)
                                const hasAllPositions = nodes.every(n => saved[n.id])

                                if (hasAllPositions) {
                                    setTimeout(() => fitView({ padding: 0.2, duration: 800, maxZoom: 1 }), 100)
                                } else {
                                    runForceLayout(nodes, edges, searchQuery)
                                }
                            }}
                            nodeTypes={NODE_TYPES}
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
                            {syncStatus === 'saving' && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-[2px] pointer-events-none transition-all duration-300">
                                    <div className="flex flex-col items-center gap-4 p-8 bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 animate-in fade-in zoom-in duration-300">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                                            <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('dashboard.syncStates.syncingNotion')}</span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.syncStates.fetchingDbs')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Background color={theme === 'dark' ? '#1e293b' : '#cbd5e1'} gap={20} size={1} />

                            <Panel position="bottom-left" className="!m-6">
                                <div className="flex flex-col gap-2 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-2xl shadow-2xl">
                                    <Tooltip content={t('dashboard.controls.zoomIn')} position="right">
                                        <button
                                            onClick={() => zoomIn()}
                                            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                        >
                                            <ZoomIn size={14} />
                                        </button>
                                    </Tooltip>

                                    <Tooltip content={t('dashboard.controls.zoomOut')} position="right">
                                        <button
                                            onClick={() => zoomOut()}
                                            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                        >
                                            <ZoomOut size={14} />
                                        </button>
                                    </Tooltip>

                                    <Tooltip content={t('dashboard.controls.fitView')} position="right">
                                        <button
                                            onClick={() => fitView()}
                                            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                        >
                                            <Maximize size={14} />
                                        </button>
                                    </Tooltip>

                                    <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-0.5" />

                                    <Tooltip content={t('dashboard.controls.resetLayout')} position="right">
                                        <button
                                            id="dashboard-reset-layout"
                                            onClick={handleResetLayout}
                                            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none"
                                        >
                                            <LayoutTemplate size={14} />
                                        </button>
                                    </Tooltip>

                                    <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-0.5" />

                                    <ExportButton />
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
                </ErrorBoundary>
            </div>

            <OnboardingTour
                isOpen={showTour}
                onClose={() => {
                    setShowTour(false)
                    localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING), 'true')

                    if (session.user.user_metadata?.has_seen_onboarding !== true) {
                        supabase.auth.updateUser({
                            data: { has_seen_onboarding: true }
                        })
                    }
                }}
            />

            <SelectionActionBar
                selectedCount={selectedNodeIds.size}
                onBatchColorChange={handleBatchColorChange}
                onBatchHide={handleBatchHide}
                userPlan={userPlan}
                isSidebarCollapsed={isSidebarCollapsed}
                activeColor={selectedNodeIds.size === 1 ? customColors[Array.from(selectedNodeIds)[0]] || nodes.find(n => n.id === Array.from(selectedNodeIds)[0])?.data?.color : undefined}
            />

            <ShortcutsHelpModal
                isOpen={shortcuts.showShortcutsModal}
                onClose={() => shortcuts.setShowShortcutsModal(false)}
            />

            <PricingModal
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                currentPlan={userPlan}
            />
        </div>
    )
}

interface DashboardPageProps {
    userRole?: string | null
}

export default function DashboardPage({ userRole }: DashboardPageProps) {
    return (
        <ReactFlowProvider>
            <DashboardContent userRole={userRole} />
        </ReactFlowProvider>
    )
}
