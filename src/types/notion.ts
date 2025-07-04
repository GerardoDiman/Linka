export interface NotionDatabase {
  id: string
  title: string
  description?: string
  url: string
  cover?: {
    type: string
    url?: string
    file?: { url: string }
  }
  icon?: {
    type: string
    emoji?: string
    file?: { url: string }
    external?: { url: string }
  }
  properties: Record<string, NotionProperty>
  relations?: string[]
  createdTime: string
  lastEditedTime: string
}

export interface NotionProperty {
  id: string
  name: string
  type: string
  [key: string]: any
}

export interface NotionPage {
  id: string
  title: string
  url: string
  properties: Record<string, any>
  createdTime: string
  lastEditedTime: string
}

export interface NotionApiResponse<T> {
  object: string
  results: T[]
  next_cursor?: string
  has_more: boolean
}

export interface DatabaseNodeData {
  database: NotionDatabase
  onSelect: (database: NotionDatabase) => void
  isIsolated?: boolean
  isStronglyConnected?: boolean
  relationCount?: number
  cluster?: {
    id: string
    databases: string[]
    centerDatabase?: string
    connections: number
  }
}

export interface CustomEdgeData {
  label?: string
  animated?: boolean
  strength?: number
  relationType?: string
  isReciprocal?: boolean
  isStrong?: boolean
  sourceDb?: string
  targetDb?: string
} 