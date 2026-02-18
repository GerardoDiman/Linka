/**
 * Hook that encapsulates the D3-force layout simulation for the graph.
 */
import { useCallback } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force'
import type { Node, Edge } from 'reactflow'

interface UseGraphLayoutOptions {
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
    fitView: (options?: { padding?: number; duration?: number; maxZoom?: number }) => void
    handleSelectNode: (nodeData: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
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

        const simulation = forceSimulation(simulationNodes as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            .force("link", forceLink(simulationLinks).id((d: any) => d.id).distance(350)) // eslint-disable-line @typescript-eslint/no-explicit-any
            .force("charge", forceManyBody().strength(-500))
            .force("center", forceCenter(0, 0))
            .force("collide", forceCollide(200))
            .force("x", forceX(0).strength(0.05))
            .force("y", forceY(0).strength(0.05))
            .stop()

        for (let i = 0; i < 300; ++i) simulation.tick()

        const layoutedNodes = nodesToLayout.map((node, index) => {
            const simNode = simulationNodes[index] as any // eslint-disable-line @typescript-eslint/no-explicit-any
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

    return { runForceLayout }
}
