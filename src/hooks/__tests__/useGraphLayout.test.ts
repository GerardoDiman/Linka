import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGraphLayout } from '../useGraphLayout'
import type { Node, Edge } from 'reactflow'

// Mock d3-force to avoid actual simulation computation in tests
vi.mock('d3-force', () => {
    const mockSimulation = {
        force: vi.fn().mockReturnThis(),
        stop: vi.fn().mockReturnThis(),
        tick: vi.fn(),
    }
    return {
        forceSimulation: vi.fn(() => mockSimulation),
        forceLink: vi.fn(() => ({ id: vi.fn().mockReturnThis(), distance: vi.fn().mockReturnThis() })),
        forceManyBody: vi.fn(() => ({ strength: vi.fn().mockReturnThis() })),
        forceCenter: vi.fn(),
        forceCollide: vi.fn(),
        forceX: vi.fn(() => ({ strength: vi.fn().mockReturnThis() })),
        forceY: vi.fn(() => ({ strength: vi.fn().mockReturnThis() })),
    }
})

const mockNodes: Node[] = [
    { id: 'n1', type: 'database', position: { x: 0, y: 0 }, data: { label: 'Test', color: '#FFF' } },
    { id: 'n2', type: 'database', position: { x: 100, y: 100 }, data: { label: 'Other', color: '#000' } },
]

const mockEdges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2' },
]

describe('useGraphLayout', () => {
    it('runForceLayout calls setNodes and setEdges', () => {
        const setNodes = vi.fn()
        const setEdges = vi.fn()
        const fitView = vi.fn()
        const handleSelectNode = vi.fn()

        const { result } = renderHook(() =>
            useGraphLayout({ setNodes, setEdges, fitView, handleSelectNode, customColors: {} })
        )

        act(() => {
            result.current.runForceLayout(mockNodes, mockEdges)
        })

        expect(setNodes).toHaveBeenCalledTimes(1)
        expect(setEdges).toHaveBeenCalledWith(mockEdges)
    })

    it('applies custom colors to nodes during layout', () => {
        const setNodes = vi.fn()
        const setEdges = vi.fn()
        const fitView = vi.fn()
        const handleSelectNode = vi.fn()
        const customColors = { n1: '#CUSTOM' }

        const { result } = renderHook(() =>
            useGraphLayout({ setNodes, setEdges, fitView, handleSelectNode, customColors })
        )

        act(() => {
            result.current.runForceLayout(mockNodes, mockEdges)
        })

        const passedNodes = setNodes.mock.calls[0][0]
        expect(passedNodes[0].data.color).toBe('#CUSTOM')
        expect(passedNodes[1].data.color).toBe('#000') // original color
    })

    it('passes searchQuery into node data', () => {
        const setNodes = vi.fn()
        const setEdges = vi.fn()
        const fitView = vi.fn()
        const handleSelectNode = vi.fn()

        const { result } = renderHook(() =>
            useGraphLayout({ setNodes, setEdges, fitView, handleSelectNode, customColors: {} })
        )

        act(() => {
            result.current.runForceLayout(mockNodes, mockEdges, 'search term')
        })

        const passedNodes = setNodes.mock.calls[0][0]
        expect(passedNodes[0].data.searchQuery).toBe('search term')
    })
})
