/**
 * Scoped localStorage helpers for persisting user-specific graph state.
 */

export const STORAGE_KEYS = {
    POSITIONS: 'node-positions',
    FILTERS: 'property-filters',
    HIDDEN_DBS: 'hidden-dbs',
    ISOLATED: 'hide-isolated',
    NOTION_TOKEN: 'notion-token',
    ONBOARDING: 'onboarding-seen',
    CUSTOM_COLORS: 'custom-colors'
} as const

export const getScopedKey = (userId: string, key: string): string =>
    `linka_${userId}_${key}`

export const getSavedPositions = (userId: string): Record<string, { x: number; y: number }> => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS))
        return saved ? JSON.parse(saved) : {}
    } catch {
        return {}
    }
}

export const getSavedFilters = (userId: string): string[] => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.FILTERS))
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export const getSavedHiddenDbs = (userId: string): string[] => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.HIDDEN_DBS))
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export const getSavedHideIsolated = (userId: string): boolean => {
    try {
        return localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.ISOLATED)) === 'true'
    } catch {
        return false
    }
}

export const getSavedCustomColors = (userId: string): Record<string, string> => {
    try {
        const saved = localStorage.getItem(getScopedKey(userId, STORAGE_KEYS.CUSTOM_COLORS))
        return saved ? JSON.parse(saved) : {}
    } catch {
        return {}
    }
}

/**
 * Persist all graph state to localStorage at once.
 */
export const saveAllToStorage = (
    userId: string,
    data: {
        positions: Record<string, { x: number; y: number }>
        customColors: Record<string, string>
        filters: string[]
        hiddenDbs: string[]
        hideIsolated: boolean
        notionToken: string | null
    }
): void => {
    localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.POSITIONS), JSON.stringify(data.positions))
    localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.CUSTOM_COLORS), JSON.stringify(data.customColors))
    localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.FILTERS), JSON.stringify(data.filters))
    localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.HIDDEN_DBS), JSON.stringify(data.hiddenDbs))
    localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.ISOLATED), String(data.hideIsolated))
    if (data.notionToken === null) {
        localStorage.removeItem(getScopedKey(userId, STORAGE_KEYS.NOTION_TOKEN))
    } else {
        localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.NOTION_TOKEN), data.notionToken)
    }
}
