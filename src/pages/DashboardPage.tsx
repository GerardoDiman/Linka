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
import logger from "../lib/logger"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

import { Sidebar } from "../components/dashboard/Sidebar"
import { DatabaseNode } from "../components/dashboard/DatabaseNode"
import { Navbar } from "../components/dashboard/Navbar"
import { OnboardingTour } from "../components/dashboard/OnboardingTour"
import { SelectionActionBar } from "../components/dashboard/SelectionActionBar"
import { ExportButton } from "../components/dashboard/ExportButton"
import { Tooltip } from "../components/ui/Tooltip"
import { fetchNotionData } from "../lib/notion"
import { transformToGraphData, type RawRelation } from "../lib/graph"
import { NODE_COLORS } from "../lib/colors"
import { useTheme } from "../context/ThemeContext"
import { useTranslation } from "react-i18next"
import { useKeyboardShortcuts, createShortcuts } from "../hooks/useKeyboardShortcuts"
import { useUndoRedo } from "../hooks/useUndoRedo"
import { ShortcutsHelpModal } from "../components/dashboard/ShortcutsHelpModal"






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


const getSavedPositions = (userId: string): Record<string, { x: number; y: number }> => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS))
        return saved ? JSON.parse(saved) : {}
    } catch (e) {
        return {}
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

// Move nodeTypes OUTSIDE the component to ensure referential stability and fix React Flow warning
const NODE_TYPES = {
    database: DatabaseNode,
}

// Help functions for cloud sync
// Reliable sync using direct fetch as fallback
const syncViaFetch = async (payload: any, token: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_graph_data`
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    const activeToken = token || key

    const sendRequest = async (tokenToSend: string) => {
        return fetch(url, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${tokenToSend}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload)
        })
    }

    let response = await sendRequest(activeToken)

    // Handle Expired JWT
    if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.message?.includes('expired') || errorData.code === 'PGRST303') {

            try {
                // Try to refresh using the client (even if it hangs, we might get lucky or it might be a quick call)
                const { data: { session } } = await Promise.race([
                    supabase.auth.refreshSession(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 3000))
                ]) as any

                if (session?.access_token) {
                    response = await sendRequest(session.access_token)
                } else {
                    throw new Error("Could not refresh session")
                }
            } catch (err) {
                logger.error("❌ Emergency refresh failed. Needs manual login.")
                // Note: We can't use 't' easily in a helper function outside component without passing it
                throw new Error("Tu sesión ha expirado. Por favor cierra sesión y vuelve a entrar.")
            }
        }
    }

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Direct Fetch Error (${response.status}): ${errorText}`)
    }
    return true
}

const syncToCloud = async (userId: string, data: any, token?: string) => {
    if (!userId) return

    const payload: any = { id: userId }
    if (data.positions) payload.positions = data.positions
    if (data.custom_colors) payload.custom_colors = data.custom_colors
    if (data.filters) payload.filters = data.filters
    if (data.hidden_dbs) payload.hidden_dbs = data.hidden_dbs
    if (data.hide_isolated !== undefined) payload.hide_isolated = data.hide_isolated
    if (data.notion_token !== undefined) payload.notion_token = data.notion_token

    try {
        // We use a shorter timeout here to trigger fallback quickly
        const { error } = await Promise.race([
            supabase.from('user_graph_data').upsert(payload),
            new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT_CLIENT")), 4000))
        ]) as any

        if (error) throw error
    } catch (e: any) {
        try {
            // Use the token passed from the component
            await syncViaFetch(payload, token || '')
        } catch (fetchErr: any) {
            logger.error("❌ Falló tanto el cliente como el fallback:", fetchErr.message)
            throw fetchErr
        }
    }
}


import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton"

interface DashboardContentProps {
    userRole?: string | null
}

function DashboardContent({ userRole }: DashboardContentProps) {
    const { t } = useTranslation()
    const { fitView, zoomIn, zoomOut } = useReactFlow()
    const { theme } = useTheme()
    const { session, loading } = useAuth()
    const { toast } = useToast()

    const localizedDemoDatabases = useMemo(() => [
        {
            id: '1',
            title: t('dashboard.demo.users'),
            properties: [
                { name: t('dashboard.demo.props.name'), type: 'title' },
                { name: t('dashboard.demo.props.email'), type: 'email' }
            ],
            color: NODE_COLORS[0],
            icon: '👤',
            url: 'https://notion.so/usuarios',
            createdTime: new Date().toISOString(),
            lastEditedTime: new Date().toISOString()
        },
        {
            id: '2',
            title: t('dashboard.demo.tasks'),
            properties: [
                { name: t('dashboard.demo.props.title'), type: 'title' },
                { name: t('dashboard.demo.props.status'), type: 'status' }
            ],
            color: NODE_COLORS[1],
            icon: '✅',
            url: 'https://notion.so/tareas',
            createdTime: new Date().toISOString(),
            lastEditedTime: new Date().toISOString()
        },
        {
            id: '3',
            title: t('dashboard.demo.comments'),
            properties: [
                { name: t('dashboard.demo.props.text'), type: 'rich_text' }
            ],
            color: NODE_COLORS[2],
            icon: '💬',
            url: 'https://notion.so/comentarios',
            createdTime: new Date().toISOString(),
            lastEditedTime: new Date().toISOString()
        },
        {
            id: '4',
            title: t('dashboard.demo.tags'),
            properties: [
                { name: t('dashboard.demo.props.name'), type: 'title' }
            ],
            color: NODE_COLORS[3],
            icon: '🏷️',
            url: 'https://notion.so/etiquetas',
            createdTime: new Date().toISOString(),
            lastEditedTime: new Date().toISOString()
        },
        {
            id: '5',
            title: t('dashboard.demo.files'),
            properties: [
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
            title: t('dashboard.demo.logs'),
            properties: [
                { name: t('dashboard.demo.props.event'), type: 'rich_text' }
            ],
            color: NODE_COLORS[5],
            icon: '📜',
            url: 'https://notion.so/logs',
            createdTime: new Date().toISOString(),
            lastEditedTime: new Date().toISOString()
        },
        {
            id: '7',
            title: t('dashboard.demo.config'),
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
            title: t('dashboard.demo.notifications'),
            properties: [
                { name: t('dashboard.demo.props.message'), type: 'rich_text' }
            ],
            color: NODE_COLORS[7],
            icon: '🔔',
            url: 'https://notion.so/notificaciones',
            createdTime: new Date().toISOString(),
            lastEditedTime: new Date().toISOString()
        },
    ], [t])

    const localizedDemoRelations = useMemo(() => [
        { source: '1', target: '2' },
        { source: '2', target: '3' },
        { source: '2', target: '4' },
        { source: '2', target: '5' },
        { source: '1', target: '8' },
        { source: '8', target: '1' },
    ], [])

    const initialGraphData = useMemo(() => {
        if (!session) return { nodes: [], edges: [] }
        const saved = getSavedPositions(session.user.id)
        const custom = getSavedCustomColors(session.user.id)
        return transformToGraphData(localizedDemoDatabases, localizedDemoRelations, saved, custom)
    }, [session, localizedDemoDatabases, localizedDemoRelations])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialGraphData.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraphData.edges)
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [selectedNode, setSelectedNode] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [syncedDbs, setSyncedDbs] = useState<any[]>(localizedDemoDatabases)
    const [syncedRelations, setSyncedRelations] = useState<RawRelation[]>(localizedDemoRelations)
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<Set<string>>(() => new Set(session ? getSavedFilters(session.user.id) : []))
    const [hiddenDbIds, setHiddenDbIds] = useState<Set<string>>(() => new Set(session ? getSavedHiddenDbs(session.user.id) : []))
    const [hideIsolated, setHideIsolated] = useState(() => session ? getSavedHideIsolated(session.user.id) : false)
    const [customColors, setCustomColors] = useState<Record<string, string>>(() => session ? getSavedCustomColors(session.user.id) : {})
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [showTour, setShowTour] = useState(false)
    const [userPlan, setUserPlan] = useState<'free' | 'pro'>('pro') // Forced to pro for Beta
    const [isDirty, setIsDirty] = useState(false)
    const [notionToken, setNotionToken] = useState<string | null>(() => session ? localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.NOTION_TOKEN)) : null)
    const [showShortcutsModal, setShowShortcutsModal] = useState(false)

    // Undo/Redo for node positions
    const { undo, redo, saveState: saveUndoState } = useUndoRedo()

    // Keyboard shortcuts
    useKeyboardShortcuts([
        createShortcuts.search(() => {
            // Focus the search input in Navbar
            const searchInput = document.querySelector('input[placeholder]') as HTMLInputElement
            if (searchInput) {
                searchInput.focus()
                searchInput.select()
            }
        }),
        createShortcuts.save(async () => {
            // Force save to cloud
            if (!session) return

            const payload = {
                positions: Object.fromEntries(
                    nodes.map(n => [n.id, { x: n.position.x, y: n.position.y }])
                ),
                custom_colors: customColors,
                filters: Array.from(selectedPropertyTypes),
                hidden_dbs: Array.from(hiddenDbIds),
                hide_isolated: hideIsolated,
                notion_token: notionToken
            }

            try {
                setCloudSyncStatus('saving')
                await syncToCloud(session.user.id, payload, session.access_token)
                setIsDirty(false)
                setCloudSyncStatus('saved')
                toast.success(t('dashboard.keyboard.saved'))
            } catch (err) {
                setCloudSyncStatus('error')
                toast.error(t('dashboard.keyboard.saveError'))
            }
        }),
        createShortcuts.info(() => {
            // Show sync status info
            if (isDirty) {
                toast.info(t('dashboard.keyboard.syncPending'))
            } else {
                toast.success(t('dashboard.keyboard.allSynced'))
            }
        }),
        createShortcuts.fitView(() => {
            fitView()
        }),
        createShortcuts.escape(() => {
            setSelectedNode(null)
            setSelectedNodeIds(new Set())
            setShowShortcutsModal(false)
        }),
        // Undo/Redo shortcuts
        createShortcuts.undo(() => {
            const previousNodes = undo()
            if (previousNodes) {
                setNodes(previousNodes)
                toast.info(t('dashboard.keyboard.undo'))
            }
        }),
        createShortcuts.redo(() => {
            const nextNodes = redo()
            if (nextNodes) {
                setNodes(nextNodes)
                toast.info(t('dashboard.keyboard.redo'))
            }
        }),
        // Help overlay shortcut (?)
        createShortcuts.help(() => {
            setShowShortcutsModal(prev => !prev)
        })
    ])

    // Early return AFTER all hooks are declared (React rules of hooks)
    if (loading || !session) return <DashboardSkeleton />


    // Fetch cloud data on mount
    useEffect(() => {
        if (!session) return

        const fetchViaFetch = async (userId: string, token: string) => {
            const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_graph_data?id=eq.${userId}&select=id,positions,custom_colors,filters,hidden_dbs,hide_isolated,notion_token`
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY

            const response = await fetch(url, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) throw new Error(`Fetch Error: ${response.status}`)
            const data = await response.json()
            return data[0] || null
        }

        const fetchCloudData = async () => {
            let data = null
            try {
                const { data: clientData, error } = await Promise.race([
                    supabase.from('user_graph_data')
                        .select('id, positions, custom_colors, filters, hidden_dbs, hide_isolated, notion_token')
                        .eq('id', session.user.id)
                        .maybeSingle(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 3000))
                ]) as any

                if (!error) data = clientData
            } catch (e) {
                // Secondary fetch fallback
            }

            if (!data) {
                try {
                    data = await fetchViaFetch(session.user.id, session.access_token || '')
                } catch (err) {
                    // Fail silently or handle accordingly
                }
            }

            if (data) {

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

                // 3. Trigger Notion Sync if we have a token and weren't loaded
                // PASS DATA EXPLICITLY to avoid race conditions with state updates
                // skipDirty: true prevents the orange dot on initial load
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
        }
        fetchCloudData()
    }, [session.user.id])

    // ... (omitting fetchPlan useEffect)

    // Fetch user plan on mount
    useEffect(() => {
        if (!session) return
        const fetchPlan = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('plan_type')
                    .eq('id', session.user.id)
                    .maybeSingle()
                // ...

                if (error) {
                    return
                }

                if (data?.plan_type) {
                    // Overriding for Beta: keep it pro
                    setUserPlan('pro')
                }
            } catch (err) {
                // Handle err
            }
        }
        fetchPlan()
    }, [session.user.id])

    // Auto-onboarding on first visit
    useEffect(() => {
        if (!session) return
        const hasSeenLocalOnboarding = localStorage.getItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING))
        const hasSeenAccountOnboarding = session.user.user_metadata?.has_seen_onboarding

        if (!hasSeenLocalOnboarding || hasSeenAccountOnboarding === false) {
            // Give the app some time to load components
            const timeout = setTimeout(() => setShowTour(true), 1500)
            return () => clearTimeout(timeout)
        }
    }, [session?.user.id, session?.user.user_metadata?.has_seen_onboarding])

    // Update demo data language when it changes
    useEffect(() => {
        const isShowingDemo = !notionToken
        if (isShowingDemo) {
            setSyncedDbs(localizedDemoDatabases)
            setSyncedRelations(localizedDemoRelations)
        }
    }, [localizedDemoDatabases, localizedDemoRelations, notionToken])


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
        const isDemo = !notionToken

        // Apply 4-DB limit for Free users (ONLY on real data)
        if (!isDemo && userPlan === 'free' && filtered.length > 4) {
            filtered = filtered.slice(0, 4)
        }

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
    }, [syncedDbs, selectedPropertyTypes, hiddenDbIds, hideIsolated, syncedRelations, userPlan])

    const togglePropertyType = useCallback((type: string) => {
        setSelectedPropertyTypes(prev => {
            const next = new Set(prev)
            if (next.has(type)) {
                next.delete(type)
            } else {
                next.add(type)
            }
            setIsDirty(true)
            return next
        })
    }, [])

    const toggleDbVisibility = useCallback((dbId: string) => {
        setHiddenDbIds(prev => {
            const next = new Set(prev)
            if (next.has(dbId)) {
                next.delete(dbId)
            } else {
                next.add(dbId)
            }
            setIsDirty(true)
            return next
        })
    }, [])

    const toggleHideIsolated = useCallback(() => {
        setHideIsolated((prev: boolean) => {
            const next = !prev
            setIsDirty(true)
            return next
        })
    }, [])

    const clearPropertyFilters = useCallback(() => {
        setSelectedPropertyTypes(new Set())
        setHideIsolated(false)
        setIsDirty(true)
    }, [])

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
        setEdges(edgesToLayout)
        setTimeout(() => {
            window.requestAnimationFrame(() => fitView({ padding: 0.2, duration: 800, maxZoom: 1 }))
        }, 100)
    }, [setNodes, setEdges, fitView, handleSelectNode, customColors])


    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => {
            const sourceNode = nodes.find(n => n.id === params.source)
            const color = sourceNode?.data?.color || '#2986B2'
            return addEdge({ ...params, animated: true, style: { stroke: color, strokeWidth: 3 } }, eds)
        })
    }, [setEdges, nodes])

    const handleSync = async (token: string, overrideState?: { filters: Set<string>, hidden_dbs: Set<string>, hide_isolated: boolean, custom_colors: Record<string, string> }, skipDirty: boolean = false) => {
        if (!token) {
            toast.warning(t('dashboard.errors.missingToken'))
            return
        }

        setSyncStatus('saving')
        setSelectedNode(null)
        try {
            const data = await fetchNotionData(token)

            // Critical: Update state first
            setSyncedDbs(data.databases)
            setSyncedRelations(data.relations)

            // Get current metadata or use override (to avoid state sync race)
            const savedPositions = getSavedPositions(session.user.id)
            const currentColors = overrideState ? overrideState.custom_colors : customColors

            const { nodes: newNodes, edges: newEdges } = transformToGraphData(
                data.databases,
                data.relations,
                savedPositions,
                currentColors
            )

            // Track the potentially unsaved token in state
            setNotionToken(token)

            // Mark as dirty so user can save token change to cloud
            if (!skipDirty) setIsDirty(true)

            // CRITICAL: Always update edges
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

        } catch (error: any) {
            console.error("❌ handleSync Error:", error)
            toast.error(error.message || t('dashboard.errors.syncError'))
        } finally {
            setSyncStatus('idle')
        }
    }

    const onNodeDragStop = useCallback(() => {
        setIsDirty(true)
        // Save current state to undo history
        saveUndoState(nodes)
    }, [nodes, saveUndoState])

    const handleResetLayout = useCallback(() => {
        setIsDirty(true)
        // Re-run the force-directed layout simulation instead of just random positions
        runForceLayout(nodes, edges, searchQuery)
    }, [nodes, edges, searchQuery, runForceLayout])

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
    }, [selectedNodeIds, customColors, setNodes, setEdges])

    const handleBatchHide = useCallback(() => {
        const newHidden = new Set(hiddenDbIds)
        selectedNodeIds.forEach(id => newHidden.add(id))
        setHiddenDbIds(newHidden)
        setIsDirty(true)
        setSelectedNodeIds(new Set()) // Clear selection after hiding
    }, [selectedNodeIds, hiddenDbIds])

    const handleFocusNode = useCallback((nodeId: string) => {
        fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.5, maxZoom: 1.2 })
    }, [fitView])

    const handleDisconnect = useCallback(() => {
        setSyncedDbs(localizedDemoDatabases)
        setSyncedRelations(localizedDemoRelations)
        setNodes(transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {}).nodes)
        setEdges(transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {}).edges)
        setSelectedPropertyTypes(new Set())
        setHiddenDbIds(new Set())
        setHideIsolated(false)
        setCustomColors({})
        setNotionToken(null)
        setIsDirty(true)
        const initialGraph = transformToGraphData(localizedDemoDatabases, localizedDemoRelations, {}, {})
        runForceLayout(initialGraph.nodes, initialGraph.edges)
    }, [localizedDemoDatabases, localizedDemoRelations, runForceLayout, setNodes, setEdges, setSyncedDbs, setSyncedRelations])

    const handleManualSync = useCallback(async () => {
        if (!session) return
        setCloudSyncStatus('saving')
        try {
            const userId = session.user.id

            // 1. Collect current state data
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


            // 2. Persist to LocalStorage
            localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS), JSON.stringify(currentPositions))
            localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.CUSTOM_COLORS), JSON.stringify(customColors))
            localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.FILTERS), JSON.stringify(Array.from(selectedPropertyTypes)))
            localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.HIDDEN_DBS), JSON.stringify(Array.from(hiddenDbIds)))
            localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.ISOLATED), String(hideIsolated))
            if (notionToken === null) {
                localStorage.removeItem(getScopedKey(userId, STORAGE_KEYS.NOTION_TOKEN))
            } else {
                localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.NOTION_TOKEN), notionToken)
            }

            // 3. Persist to Cloud
            await syncToCloud(userId, payload, session?.access_token)

            setCloudSyncStatus('saved')
            setIsDirty(false)
            setTimeout(() => setCloudSyncStatus('idle'), 3000)
        } catch (err) {
            console.error("Manual Sync failed:", err)
            setCloudSyncStatus('error')
            setTimeout(() => setCloudSyncStatus('idle'), 5000)
        }
    }, [session, nodes, customColors, selectedPropertyTypes, hiddenDbIds, hideIsolated, notionToken])

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
                isSynced={!!notionToken}
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
                onManualSync={handleManualSync}
                syncStatus={cloudSyncStatus}
                isDirty={isDirty}
                onShowShortcuts={() => setShowShortcutsModal(true)}
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
                            if (!session) return
                            const saved = getSavedPositions(session.user.id)
                            const hasAllPositions = nodes.every(n => saved[n.id])

                            if (hasAllPositions) {
                                // Important: Give it a tiny bit of time for dimensions to settle
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
            </div>

            <OnboardingTour
                isOpen={showTour}
                onClose={() => {
                    setShowTour(false)
                    localStorage.setItem(getScopedKey(session.user.id, STORAGE_KEYS.ONBOARDING), 'true')

                    // Persist to Supabase metadata if not already marked
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
                isOpen={showShortcutsModal}
                onClose={() => setShowShortcutsModal(false)}
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
