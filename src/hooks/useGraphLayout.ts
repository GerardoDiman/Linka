/**
 * Hook that encapsulates the D3-force layout simulation for the graph.
 */
import { useCallback } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force'
import type { SimulationNodeDatum } from 'd3-force'
import type { Node, Edge } from 'reactflow'
import type { DatabaseNodeData } from '../types'

interface SimulationNode extends SimulationNodeDatum {
    id: string
    position: { x: number; y: number }
    data: DatabaseNodeData
}

interface UseGraphLayoutOptions {
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
    fitView: (options?: { padding?: number; duration?: number; maxZoom?: number }) => void
    handleSelectNode: (nodeData: DatabaseNodeData) => void
    customColors: Record<string, string>
}

export function useGraphLayout({
    setNodes,
    setEdges,
    fitView,
    handleSelectNode,
    customColors
}: UseGraphLayoutOptions) {
    const runForceLayout = useCallback((
        nodesToLayout: Node[],
        edgesToLayout: Edge[],
        currentSearch: string = ""
    ) => {
        const simulationNodes = nodesToLayout.map((node) => ({
            ...node,
            x: node.position.x,
            y: node.position.y,
        }))

        const simulationLinks = edgesToLayout.map((edge) => ({
            source: edge.source,
            target: edge.target,
        }))

        const simulation = forceSimulation<SimulationNode>(simulationNodes as SimulationNode[])
            .force("link", forceLink(simulationLinks).id((d) => (d as SimulationNode).id).distance(350))
            .force("charge", forceManyBody().strength(-500))
            .force("center", forceCenter(0, 0))
            .force("collide", forceCollide(200))
            .force("x", forceX(0).strength(0.05))
            .force("y", forceY(0).strength(0.05))
            .stop()

        for (let i = 0; i < 300; ++i) simulation.tick()

        const layoutedNodes = nodesToLayout.map((node, index) => {
            const simNode = simulationNodes[index] as SimulationNode
            return {
                ...node,
                position: { x: simNode.x ?? 0, y: simNode.y ?? 0 },
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

    return { runForceLayout }
}
