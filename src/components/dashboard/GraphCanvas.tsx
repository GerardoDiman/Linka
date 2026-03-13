/**
 * GraphCanvas — ReactFlow canvas with controls, minimap, and sync overlay.
 * Pure presentational component extracted from DashboardPage.
 */
import { useCallback } from 'react'
import ReactFlow, {
    Background,
    MiniMap,
    type NodeChange,
    type EdgeChange,
    type Connection,
    type Edge,
    type Node,
    useReactFlow,
    Panel,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow'
import {
    LayoutTemplate, Loader2,
    Maximize, ZoomIn, ZoomOut
} from 'lucide-react'
import { useGraphStore } from '../../stores/useGraphStore'
import { ExportButton } from './ExportButton'
import { Tooltip } from '../ui/Tooltip'
import { getSavedPositions } from '../../lib/storage'
import 'reactflow/dist/style.css'

interface GraphCanvasProps {
    session: { user: { id: string } } | null
    theme: string
    syncStatus: string
    searchQuery: string
    nodeTypes: Record<string, React.ComponentType<any>>
    onConnect: (params: Connection | Edge) => void
    onNodeDragStop: () => void
    handleResetLayout: () => void
    handleSelectionChange: (params: { nodes: Node[] }) => void
    runForceLayout: (nodes: Node[], edges: Edge[], search?: string) => void
    t: (key: string) => string
}

export function GraphCanvas({
    session,
    theme,
    syncStatus,
    searchQuery,
    nodeTypes,
    onConnect,
    onNodeDragStop,
    handleResetLayout,
    handleSelectionChange,
    runForceLayout,
    t
}: GraphCanvasProps) {
    const { fitView, zoomIn, zoomOut } = useReactFlow()
    const nodes = useGraphStore(state => state.nodes)
    const edges = useGraphStore(state => state.edges)
    const setNodes = useGraphStore(state => state.setNodes)
    const setEdges = useGraphStore(state => state.setEdges)

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    )
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    )

    return (
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
                    if (nodes.length === 0) return
                    const saved = getSavedPositions(session.user.id)
                    const hasAllPositions = nodes.every(n => saved[n.id])

                    if (hasAllPositions) {
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
    )
}
