/**
 * Hook for managing graph filter state — property type filters, hidden DBs,
 * isolated-node filter, custom colors, and the derived visibleDbIds set.
 */
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useGraphStore } from '../stores/useGraphStore'
import type { RawRelation } from '../lib/graph'
import {
    getSavedFilters,
    getSavedHiddenDbs,
    getSavedHideIsolated,
    getSavedCustomColors
} from '../lib/storage'

interface RawDatabase {
    id: string
    properties?: { name: string; type: string }[]
}

interface UseGraphFiltersOptions {
    userId: string | null
    syncedDbs: RawDatabase[]
    syncedRelations: RawRelation[]
}

export function useGraphFilters({
    userId,
    syncedDbs,
    syncedRelations
}: UseGraphFiltersOptions) {
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<Set<string>>(
        () => new Set(userId ? getSavedFilters(userId) : [])
    )
    const [hiddenDbIds, setHiddenDbIds] = useState<Set<string>>(
        () => new Set(userId ? getSavedHiddenDbs(userId) : [])
    )
    const [hideIsolated, setHideIsolated] = useState(
        () => userId ? getSavedHideIsolated(userId) : false
    )
    const customColors = useGraphStore(state => state.customColors)
    const setCustomColors = useGraphStore(state => state.setCustomColors)

    // Initial load of custom colors if not already set in store
    useEffect(() => {
        if (userId && Object.keys(customColors).length === 0) {
            const saved = getSavedCustomColors(userId)
            if (Object.keys(saved).length > 0) {
                setCustomColors(saved)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])
    const isDirty = useGraphStore(state => state.isDirty)
    const setIsDirty = useGraphStore(state => state.setIsDirty)
    const isNotionConnected = useGraphStore(state => state.isNotionConnected)
    const userPlan = useGraphStore(state => state.userPlan)

    // Derived state: visible database IDs based on all active filters
    const visibleDbIds = useMemo(() => {
        let filtered = syncedDbs
        // A database is "demo" if its ID is one of '1' through '8'
        const isDemo = filtered.length > 0 && filtered.every(db => ['1', '2', '3', '4', '5', '6', '7', '8'].includes(db.id))

        // Apply 4-DB limit for Free users (ONLY on real data)
        if (!isDemo && userPlan === 'free' && filtered.length > 4) {
            filtered = filtered.slice(0, 4)
        }

        // Apply property type filter if any
        if (selectedPropertyTypes.size > 0) {
            filtered = filtered.filter(db =>
                db.properties?.some((p: { type: string }) => selectedPropertyTypes.has(p.type))
            )
        }

        // Exclude manually hidden databases
        filtered = filtered.filter(db => !hiddenDbIds.has(db.id))

        // Apply isolated filter if enabled
        if (hideIsolated) {
            const connectedDbIds = new Set<string>()
            syncedRelations.forEach(rel => {
                connectedDbIds.add(rel.source)
                connectedDbIds.add(rel.target)
            })
            filtered = filtered.filter(db => connectedDbIds.has(db.id))
        }

        return new Set(filtered.map(db => db.id))
    }, [syncedDbs, selectedPropertyTypes, hiddenDbIds, hideIsolated, syncedRelations, userPlan, isNotionConnected])

    const togglePropertyType = useCallback((type: string) => {
        setSelectedPropertyTypes(prev => {
            const next = new Set(prev)
            if (next.has(type)) {
                next.delete(type)
            } else {
                next.add(type)
            }
            setIsDirty(true)
            return next
        })
    }, [setIsDirty])

    const toggleDbVisibility = useCallback((dbId: string) => {
        setHiddenDbIds(prev => {
            const next = new Set(prev)
            if (next.has(dbId)) {
                next.delete(dbId)
            } else {
                next.add(dbId)
            }
            setIsDirty(true)
            return next
        })
    }, [setIsDirty])

    const toggleHideIsolated = useCallback(() => {
        setHideIsolated((prev: boolean) => {
            const next = !prev
            setIsDirty(true)
            return next
        })
    }, [setIsDirty])

    const clearPropertyFilters = useCallback(() => {
        setSelectedPropertyTypes(new Set())
        setHideIsolated(false)
        setIsDirty(true)
    }, [setIsDirty])

    return {
        selectedPropertyTypes,
        setSelectedPropertyTypes,
        hiddenDbIds,
        setHiddenDbIds,
        hideIsolated,
        setHideIsolated,
        customColors,
        setCustomColors,
        isDirty,
        setIsDirty,
        visibleDbIds,
        togglePropertyType,
        toggleDbVisibility,
        toggleHideIsolated,
        clearPropertyFilters
    }
}
