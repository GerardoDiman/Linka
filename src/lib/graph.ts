import type { Node, Edge } from "reactflow"

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
    customColors: Record<string, string> = {}
) {
    const nodes: Node[] = databases.map((db) => {
        // Calculate relation counts
        const outgoingCount = relations.filter(r => r.source === db.id).length
        const incomingCount = relations.filter(r => r.target === db.id).length

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
                incomingRelations: incomingCount
            }
        }
    })

    const edges: Edge[] = relations.map((rel, index) => {
        const sourceDb = databases.find(db => db.id === rel.source)
        const color = customColors[rel.source] || sourceDb?.color || '#2986B2'
        return {
            id: `e-${index}-${Math.random().toString(36).substr(2, 9)}`,
            source: rel.source,
            target: rel.target,
            animated: true,
            style: { stroke: color, strokeWidth: 3 }
        }
    })

    return { nodes, edges }
}
