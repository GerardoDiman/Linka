import type { Node, Edge } from "reactflow"
import type { DatabaseNodeData } from "../types"

export interface RawDatabase {
    id: string
    title: string
    properties: { name: string; type: string }[]
    color?: string
    url?: string
    icon?: string
    createdTime?: string
    lastEditedTime?: string
}

export interface RawRelation {
    source: string
    target: string
    label?: string
}

export function transformToGraphData(
    databases: RawDatabase[],
    relations: RawRelation[],
    savedPositions: Record<string, { x: number; y: number }> = {},
    customColors: Record<string, string> = {},
    onSelect?: (nodeData: DatabaseNodeData) => void
) {
    // Pre-compute relation counts in O(n) instead of O(n*m)
    const outgoingMap = new Map<string, number>()
    const incomingMap = new Map<string, number>()
    for (const r of relations) {
        outgoingMap.set(r.source, (outgoingMap.get(r.source) || 0) + 1)
        incomingMap.set(r.target, (incomingMap.get(r.target) || 0) + 1)
    }

    const nodes: Node[] = databases.map((db) => {
        const outgoingCount = outgoingMap.get(db.id) || 0
        const incomingCount = incomingMap.get(db.id) || 0

        const savedPos = savedPositions[db.id]
        const finalColor = customColors[db.id] || db.color

        return {
            id: db.id,
            type: 'database',
            position: savedPos || { x: Math.random() * 500, y: Math.random() * 500 },
            data: {
                label: db.title,
                properties: db.properties,
                color: finalColor,
                url: db.url,
                icon: db.icon,
                createdTime: db.createdTime,
                lastEditedTime: db.lastEditedTime,
                propertyCount: db.properties.length,
                outgoingRelations: outgoingCount,
                incomingRelations: incomingCount,
                onSelect
            }
        }
    })

    const edges: Edge[] = relations.map((rel, index) => {
        const sourceDb = databases.find(db => db.id === rel.source)
        const color = customColors[rel.source] || sourceDb?.color || '#2986B2'
        return {
            id: `e-${rel.source}-${rel.target}-${rel.label || index}`,
            source: rel.source,
            target: rel.target,
            animated: true,
            style: { stroke: color, strokeWidth: 3 }
        }
    })

    return { nodes, edges }
}
