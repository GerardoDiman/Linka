import { useCallback, useState, useEffect, useMemo } from "react"
import {
    useReactFlow,
    ReactFlowProvider
} from "reactflow"
import { useGraphStore } from "../stores/useGraphStore"
import type { DatabaseNodeData } from "../types"
import "reactflow/dist/style.css"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

import { Sidebar } from "../components/dashboard/Sidebar"
import { DatabaseNode } from "../components/dashboard/DatabaseNode"
import { Navbar } from "../components/dashboard/Navbar"
import { OnboardingTour } from "../components/dashboard/OnboardingTour"
import { SelectionActionBar } from "../components/dashboard/SelectionActionBar"
import { ErrorBoundary } from "../components/ui/ErrorBoundary"
import { GraphCanvas } from "../components/dashboard/GraphCanvas"
import { PricingModal } from "../components/dashboard/PricingModal"
import { useTheme } from "../context/ThemeContext"
import { useTranslation } from "react-i18next"
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton"
import { ShortcutsHelpModal } from "../components/dashboard/ShortcutsHelpModal"

import { getScopedKey, STORAGE_KEYS } from "../lib/storage"
import { useGraphFilters } from "../hooks/useGraphFilters"
import { useGraphLayout } from "../hooks/useGraphLayout"
import { useCloudSync } from "../hooks/useCloudSync"
import { useDashboardShortcuts } from "../hooks/useDashboardShortcuts"
import { useDemoData } from "../hooks/useDemoData"
import { useNodeInteractions } from "../hooks/useNodeInteractions"

// Referentially stable node types — must stay outside the component
const NODE_TYPES = {
    database: DatabaseNode,
}

interface DashboardContentProps {
    userRole?: string | null
}

function DashboardContent({ userRole }: DashboardContentProps) {
    const { t } = useTranslation()
    const { fitView } = useReactFlow()
    const { theme } = useTheme()
    const { session, loading, plan: authPlan } = useAuth()
    const { toast } = useToast()

    // ─── Global store ────────────────────────────────────────────────────

    const nodes = useGraphStore(state => state.nodes)
    const setNodes = useGraphStore(state => state.setNodes)
    const syncStatus = useGraphStore(state => state.syncStatus)
    const searchQuery = useGraphStore(state => state.searchQuery)
    const setSearchQuery = useGraphStore(state => state.setSearchQuery)
    const syncedDbs = useGraphStore(state => state.syncedDbs)
    const syncedRelations = useGraphStore(state => state.syncedRelations)
    const userPlan = useGraphStore(state => state.userPlan)
    const setUserPlan = useGraphStore(state => state.setUserPlan)
    const isNotionConnected = useGraphStore(state => state.isNotionConnected)

    // Sync auth plan to store
    useEffect(() => {
        if (authPlan) setUserPlan(authPlan)
    }, [authPlan, setUserPlan])

    // ─── UI state ────────────────────────────────────────────────────────

    const [selectedNode, setSelectedNode] = useState<DatabaseNodeData | null>(null)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [showTour, setShowTour] = useState(false)
    const [showPricing, setShowPricing] = useState(false)

    const handleSelectNode = useCallback((nodeData: DatabaseNodeData) => {
        setSelectedNode(nodeData)
    }, [])

    // ─── Hooks ───────────────────────────────────────────────────────────

    const {
        selectedPropertyTypes, hiddenDbIds, hideIsolated,
        customColors, isDirty, setIsDirty, visibleDbIds,
        togglePropertyType, toggleDbVisibility, toggleHideIsolated,
        clearPropertyFilters, setCustomColors, setHiddenDbIds,
        setSelectedPropertyTypes, setHideIsolated
    } = useGraphFilters({ userId: session?.user.id ?? null, syncedDbs, syncedRelations })

    const { runForceLayout } = useGraphLayout({
        setNodes, setEdges: useGraphStore(state => state.setEdges),
        fitView, handleSelectNode, customColors
    })

    const { localizedDemoDatabases, localizedDemoRelations } = useDemoData({
        session, handleSelectNode, runForceLayout, fitView, t
    })

    const cloudSync = useCloudSync({
        session, selectedPropertyTypes, hiddenDbIds, hideIsolated,
        setSelectedPropertyTypes, setHiddenDbIds, setHideIsolated,
        runForceLayout, fitView, handleSelectNode, setSelectedNode, toast, t
    })

    const interactions = useNodeInteractions({
        customColors, setCustomColors, hiddenDbIds, setHiddenDbIds,
        clearPropertyFilters, runForceLayout, handleSelectNode, fitView,
        cloudSync, localizedDemoDatabases, localizedDemoRelations
    })

    // ─── Keyboard shortcuts ─────────────────────────────────────────────

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

    const shortcuts = useDashboardShortcuts({
        session, setNodes,
        setSelectedNode, setSelectedNodeIds: interactions.setSelectedNodeIds,
        isDirty, onSave: handleKeyboardSave,
        onFitView: () => fitView(), toast, t
    })

    // ─── Auto-onboarding ────────────────────────────────────────────────

    useEffect(() => {
        if (!session) return
        const hasSeenLocal = localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING))
        const hasSeenAccount = session.user.user_metadata?.has_seen_onboarding

        if (!hasSeenLocal || hasSeenAccount === false) {
            const timeout = setTimeout(() => setShowTour(true), 1500)
            return () => clearTimeout(timeout)
        }
    }, [session])

    // ─── Derived state ──────────────────────────────────────────────────

    const dbTitles = useMemo(() => {
        const map = new Map<string, string>()
        syncedDbs.forEach((db) => map.set(db.id, db.title))
        return map
    }, [syncedDbs])

    const activeColor = useMemo(() => {
        if (interactions.selectedNodeIds.size !== 1) return undefined
        const id = Array.from(interactions.selectedNodeIds)[0]
        return customColors[id] || nodes.find(n => n.id === id)?.data?.color
    }, [interactions.selectedNodeIds, customColors, nodes])

    // ─── Visibility / search effect ─────────────────────────────────────

    const setEdges = useGraphStore(state => state.setEdges)

    useEffect(() => {
        if (syncedDbs.length === 0) return

        setNodes((nds) => nds.map((node) => ({
            ...node,
            data: { ...node.data, searchQuery },
            hidden: !visibleDbIds.has(node.id),
            style: { ...node.style, transition: 'opacity 0.3s ease' }
        })))

        setEdges((eds) => eds.map((edge) => {
            const sourceTitle = dbTitles.get(edge.source) || ""
            const sourceMatches = !searchQuery || sourceTitle.toLowerCase().includes(searchQuery.toLowerCase())
            const isVisible = visibleDbIds.has(edge.source) && visibleDbIds.has(edge.target)
            return {
                ...edge, hidden: !isVisible,
                style: { ...edge.style, opacity: sourceMatches ? 1 : 0.1, transition: 'opacity 0.3s ease' }
            }
        }))
    }, [searchQuery, visibleDbIds, dbTitles, setNodes, setEdges, nodes.length, syncedDbs.length])

    useEffect(() => {
        if (syncedDbs.length === 0 || visibleDbIds.size === 0) return
        const timeoutId = setTimeout(() => fitView({ padding: 0.2, duration: 400, maxZoom: 1 }), 150)
        return () => clearTimeout(timeoutId)
    }, [visibleDbIds, fitView, syncedDbs.length])

    // ─── Render ─────────────────────────────────────────────────────────

    if (loading || !session) return <DashboardSkeleton />

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <Navbar
                onSync={cloudSync.handleSync}
                onDisconnect={interactions.handleDisconnect}
                isSynced={isNotionConnected}
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

            <div className="flex flex-1 overflow-hidden transition-all duration-500">
                <Sidebar
                    databases={syncedDbs}
                    selectedNode={selectedNode}
                    onClearSelection={() => setSelectedNode(null)}
                    searchQuery={searchQuery}
                    visibleDbIds={visibleDbIds}
                    hiddenDbIds={hiddenDbIds}
                    onToggleVisibility={toggleDbVisibility}
                    onFocusNode={interactions.handleFocusNode}
                    onSelectNode={handleSelectNode}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <ErrorBoundary>
                    <GraphCanvas
                        session={session}
                        theme={theme}
                        syncStatus={syncStatus}
                        searchQuery={searchQuery}
                        nodeTypes={NODE_TYPES}
                        onConnect={interactions.onConnect}
                        onNodeDragStop={() => interactions.onNodeDragStop(shortcuts.saveUndoState)}
                        handleResetLayout={interactions.handleResetLayout}
                        handleSelectionChange={interactions.handleSelectionChange}
                        runForceLayout={runForceLayout}
                        t={t}
                    />
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
                        }).then(({ error }) => {
                            if (error) console.warn('Failed to persist onboarding state:', error.message)
                        })
                    }
                }}
            />

            <SelectionActionBar
                selectedCount={interactions.selectedNodeIds.size}
                onBatchColorChange={interactions.handleBatchColorChange}
                onBatchHide={interactions.handleBatchHide}
                userPlan={userPlan}
                isSidebarCollapsed={isSidebarCollapsed}
                activeColor={activeColor}
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
