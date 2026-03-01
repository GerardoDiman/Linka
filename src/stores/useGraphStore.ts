import { create } from 'zustand'
import type { Node, Edge } from 'reactflow'
import type { DatabaseInfo } from '../types'
import type { RawRelation } from '../lib/graph'

interface GraphState {
    // Flow state
    nodes: Node[]
    edges: Edge[]
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void

    // Synced data
    syncedDbs: DatabaseInfo[]
    syncedRelations: RawRelation[]
    setSyncedDbs: (dbs: DatabaseInfo[]) => void
    setSyncedRelations: (rels: RawRelation[]) => void

    // UI & filter state
    searchQuery: string
    setSearchQuery: (query: string) => void
    syncStatus: 'idle' | 'saving' | 'saved' | 'error'
    setSyncStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void

    // Dirty flag for saving
    isDirty: boolean
    setIsDirty: (dirty: boolean) => void

    // Cloud state
    notionToken: string | null
    setNotionToken: (token: string | null) => void
    userPlan: 'free' | 'pro'
    setUserPlan: (plan: 'free' | 'pro') => void
}

export const useGraphStore = create<GraphState>((set) => ({
    nodes: [],
    edges: [],
    setNodes: (updater) => set((state) => ({
        nodes: typeof updater === 'function' ? updater(state.nodes) : updater
    })),
    setEdges: (updater) => set((state) => ({
        edges: typeof updater === 'function' ? updater(state.edges) : updater
    })),

    syncedDbs: [],
    syncedRelations: [],
    setSyncedDbs: (dbs) => set({ syncedDbs: dbs }),
    setSyncedRelations: (rels) => set({ syncedRelations: rels }),

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    syncStatus: 'idle',
    setSyncStatus: (status) => set({ syncStatus: status }),

    isDirty: false,
    setIsDirty: (dirty) => set({ isDirty: dirty }),

    notionToken: null,
    setNotionToken: (token) => set({ notionToken: token }),
    userPlan: 'free',
    setUserPlan: (plan) => set({ userPlan: plan })
}))
