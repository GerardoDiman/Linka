/**
 * Shared type definitions for the Linka application.
 * Centralizes types used across components, hooks, and pages.
 */
import type { Node } from 'reactflow'

/** Shape of a Notion database as it flows through the app */
export interface DatabaseInfo {
    id: string
    title: string
    color?: string
    icon?: string
    properties?: { name: string; type: string }[]
    url?: string
    createdTime?: string
    lastEditedTime?: string
}

/** Data attached to every graph node via node.data */
export interface DatabaseNodeData {
    id?: string
    label: string
    color?: string
    icon?: string
    url?: string
    properties?: { name: string; type: string }[]
    propertyCount?: number
    outgoingRelations?: number
    incomingRelations?: number
    createdTime?: string
    lastEditedTime?: string
    onSelect?: (data: DatabaseNodeData) => void
    searchQuery?: string
}

/** Convenience alias for a React Flow Node carrying DatabaseNodeData */
export type DatabaseGraphNode = Node<DatabaseNodeData>
