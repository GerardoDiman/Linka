/**
 * Utility functions for database visibility logic
 * Ensures consistent visibility calculations across all components
 */

export interface VisibilityState {
  hiddenDatabases: Set<string>
  isolatedDatabases: string[]
  explicitlyShownDatabases: Set<string>
  showIsolatedNodes: boolean
}

/**
 * Determines if a database is really visible considering all visibility rules
 */
export const isReallyVisible = (
  databaseId: string,
  state: VisibilityState
): boolean => {
  const { hiddenDatabases, isolatedDatabases, explicitlyShownDatabases, showIsolatedNodes } = state
  
  // If manually hidden, never visible
  if (hiddenDatabases.has(databaseId)) {
    return false
  }
  
  // If it's an isolated database
  if (isolatedDatabases.includes(databaseId)) {
    // Show if global setting is on OR if explicitly shown
    return showIsolatedNodes || explicitlyShownDatabases.has(databaseId)
  }
  
  // Non-isolated databases are visible by default (unless hidden)
  return true
}

/**
 * Filters databases based on visibility rules
 */
export const getVisibleDatabases = (
  databases: { id: string }[],
  state: VisibilityState
): { id: string }[] => {
  return databases.filter(db => isReallyVisible(db.id, state))
}

/**
 * Gets visibility statistics
 */
export const getVisibilityStats = (
  databases: { id: string }[],
  state: VisibilityState
) => {
  const totalDatabases = databases.length
  const visibleDatabases = databases.filter(db => isReallyVisible(db.id, state))
  const hiddenDatabases = totalDatabases - visibleDatabases.length
  
  const isolatedCount = state.isolatedDatabases.length
  const explicitlyShownCount = state.explicitlyShownDatabases.size
  const manuallyHiddenCount = state.hiddenDatabases.size
  
  return {
    total: totalDatabases,
    visible: visibleDatabases.length,
    hidden: hiddenDatabases,
    isolated: isolatedCount,
    explicitlyShown: explicitlyShownCount,
    manuallyHidden: manuallyHiddenCount
  }
}

/**
 * Gets the reason why a database is hidden (for UI display)
 */
export const getHiddenReason = (
  databaseId: string,
  state: VisibilityState
): string | null => {
  const { hiddenDatabases, isolatedDatabases, explicitlyShownDatabases, showIsolatedNodes } = state
  
  if (!isReallyVisible(databaseId, state)) {
    if (hiddenDatabases.has(databaseId)) {
      if (isolatedDatabases.includes(databaseId) && !showIsolatedNodes && !explicitlyShownDatabases.has(databaseId)) {
        return 'Manual + Auto'
      }
      return 'Manual'
    }
    
    if (isolatedDatabases.includes(databaseId) && !showIsolatedNodes && !explicitlyShownDatabases.has(databaseId)) {
      return 'Auto'
    }
  }
  
  return null
}

/**
 * Gets the visibility status for UI display
 */
export const getVisibilityStatus = (
  databaseId: string,
  state: VisibilityState
): {
  isVisible: boolean
  isExplicitlyShown: boolean
  isIsolated: boolean
  isManuallyHidden: boolean
  reason: string | null
} => {
  const isVisible = isReallyVisible(databaseId, state)
  const isExplicitlyShown = state.explicitlyShownDatabases.has(databaseId)
  const isIsolated = state.isolatedDatabases.includes(databaseId)
  const isManuallyHidden = state.hiddenDatabases.has(databaseId)
  const reason = getHiddenReason(databaseId, state)
  
  return {
    isVisible,
    isExplicitlyShown,
    isIsolated,
    isManuallyHidden,
    reason
  }
} 