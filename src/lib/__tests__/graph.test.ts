import { describe, it, expect } from 'vitest'
import { transformToGraphData } from '../graph'
import type { RawDatabase, RawRelation } from '../graph'

const mockDatabases: RawDatabase[] = [
    {
        id: 'db-1',
        title: 'Tasks',
        properties: [
            { name: 'Name', type: 'title' },
            { name: 'Status', type: 'select' },
        ],
        color: '#FF0000',
        url: 'https://notion.so/db-1',
        icon: '📋',
    },
    {
        id: 'db-2',
        title: 'Projects',
        properties: [
            { name: 'Name', type: 'title' },
            { name: 'Owner', type: 'people' },
        ],
        color: '#00FF00',
        url: 'https://notion.so/db-2',
        icon: '🗂️',
    },
]

const mockRelations: RawRelation[] = [
    { source: 'db-1', target: 'db-2', label: 'Project' },
]

describe('transformToGraphData', () => {
    it('creates a node for each database', () => {
        const { nodes } = transformToGraphData(mockDatabases, [])
        expect(nodes).toHaveLength(2)
        expect(nodes[0].id).toBe('db-1')
        expect(nodes[1].id).toBe('db-2')
    })

    it('nodes have correct data', () => {
        const { nodes } = transformToGraphData(mockDatabases, mockRelations)
        const taskNode = nodes[0]
        expect(taskNode.data.label).toBe('Tasks')
        expect(taskNode.data.properties).toEqual(mockDatabases[0].properties)
        expect(taskNode.data.color).toBe('#FF0000')
        expect(taskNode.data.icon).toBe('📋')
        expect(taskNode.data.propertyCount).toBe(2)
    })

    it('counts outgoing and incoming relations correctly', () => {
        const { nodes } = transformToGraphData(mockDatabases, mockRelations)
        // db-1 has 1 outgoing, 0 incoming
        expect(nodes[0].data.outgoingRelations).toBe(1)
        expect(nodes[0].data.incomingRelations).toBe(0)
        // db-2 has 0 outgoing, 1 incoming
        expect(nodes[1].data.outgoingRelations).toBe(0)
        expect(nodes[1].data.incomingRelations).toBe(1)
    })

    it('creates edges from relations', () => {
        const { edges } = transformToGraphData(mockDatabases, mockRelations)
        expect(edges).toHaveLength(1)
        expect(edges[0].source).toBe('db-1')
        expect(edges[0].target).toBe('db-2')
        expect(edges[0].animated).toBe(true)
    })

    it('applies saved positions', () => {
        const savedPositions = { 'db-1': { x: 300, y: 400 } }
        const { nodes } = transformToGraphData(mockDatabases, [], savedPositions)
        expect(nodes[0].position).toEqual({ x: 300, y: 400 })
        // db-2 has no saved position → random
        expect(nodes[1].position.x).toBeDefined()
    })

    it('custom colors override database colors', () => {
        const customColors = { 'db-1': '#CUSTOM1' }
        const { nodes } = transformToGraphData(mockDatabases, [], {}, customColors)
        expect(nodes[0].data.color).toBe('#CUSTOM1')
        expect(nodes[1].data.color).toBe('#00FF00') // unchanged
    })

    it('edge color inherits from source database or custom color', () => {
        const customColors = { 'db-1': '#EDGE_COLOR' }
        const { edges } = transformToGraphData(mockDatabases, mockRelations, {}, customColors)
        expect(edges[0].style?.stroke).toBe('#EDGE_COLOR')
    })

    it('returns empty arrays for empty inputs', () => {
        const { nodes, edges } = transformToGraphData([], [])
        expect(nodes).toEqual([])
        expect(edges).toEqual([])
    })
})
