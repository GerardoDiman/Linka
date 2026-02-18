import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGraphFilters } from '../useGraphFilters'

// Mock storage functions
vi.mock('../../lib/storage', () => ({
    getSavedFilters: vi.fn(() => []),
    getSavedHiddenDbs: vi.fn(() => []),
    getSavedHideIsolated: vi.fn(() => false),
    getSavedCustomColors: vi.fn(() => ({})),
}))

const mockDbs = [
    { id: 'db-1', properties: [{ name: 'Name', type: 'title' }, { name: 'Status', type: 'select' }] },
    { id: 'db-2', properties: [{ name: 'Name', type: 'title' }, { name: 'Date', type: 'date' }] },
    { id: 'db-3', properties: [{ name: 'Name', type: 'title' }] },
    { id: 'db-4', properties: [{ name: 'Name', type: 'title' }] },
    { id: 'db-5', properties: [{ name: 'Name', type: 'title' }] },
]

const mockRelations = [
    { source: 'db-1', target: 'db-2' },
]

const defaultOptions = {
    userId: 'user-1',
    syncedDbs: mockDbs,
    syncedRelations: mockRelations,
    notionToken: 'some-token',
    userPlan: 'pro' as const,
}

describe('useGraphFilters', () => {
    it('initially all databases are visible', () => {
        const { result } = renderHook(() => useGraphFilters(defaultOptions))
        expect(result.current.visibleDbIds.size).toBe(5)
    })

    it('togglePropertyType adds and removes a filter', () => {
        const { result } = renderHook(() => useGraphFilters(defaultOptions))

        // Add 'select' filter → only db-1 has a 'select' property
        act(() => { result.current.togglePropertyType('select') })
        expect(result.current.selectedPropertyTypes.has('select')).toBe(true)
        expect(result.current.visibleDbIds.has('db-1')).toBe(true)
        expect(result.current.visibleDbIds.has('db-2')).toBe(false) // db-2 has 'date', not 'select'

        // Toggle again to remove
        act(() => { result.current.togglePropertyType('select') })
        expect(result.current.selectedPropertyTypes.has('select')).toBe(false)
        expect(result.current.visibleDbIds.size).toBe(5) // all visible again
    })

    it('toggleDbVisibility hides and shows a database', () => {
        const { result } = renderHook(() => useGraphFilters(defaultOptions))

        act(() => { result.current.toggleDbVisibility('db-3') })
        expect(result.current.visibleDbIds.has('db-3')).toBe(false)
        expect(result.current.visibleDbIds.size).toBe(4)

        act(() => { result.current.toggleDbVisibility('db-3') })
        expect(result.current.visibleDbIds.has('db-3')).toBe(true)
        expect(result.current.visibleDbIds.size).toBe(5)
    })

    it('toggleHideIsolated hides databases with no relations', () => {
        const { result } = renderHook(() => useGraphFilters(defaultOptions))

        act(() => { result.current.toggleHideIsolated() })
        // Only db-1 and db-2 are connected via the relation
        expect(result.current.hideIsolated).toBe(true)
        expect(result.current.visibleDbIds.has('db-1')).toBe(true)
        expect(result.current.visibleDbIds.has('db-2')).toBe(true)
        expect(result.current.visibleDbIds.has('db-3')).toBe(false)
        expect(result.current.visibleDbIds.size).toBe(2)
    })

    it('clearPropertyFilters resets filters and hideIsolated', () => {
        const { result } = renderHook(() => useGraphFilters(defaultOptions))

        act(() => { result.current.togglePropertyType('select') })
        act(() => { result.current.toggleHideIsolated() })
        act(() => { result.current.clearPropertyFilters() })

        expect(result.current.selectedPropertyTypes.size).toBe(0)
        expect(result.current.hideIsolated).toBe(false)
        expect(result.current.visibleDbIds.size).toBe(5)
    })

    it('free plan limits to 4 databases (real data only)', () => {
        const freeOptions = { ...defaultOptions, userPlan: 'free' as const }
        const { result } = renderHook(() => useGraphFilters(freeOptions))
        expect(result.current.visibleDbIds.size).toBe(4)
    })

    it('free plan does NOT limit demo data (no notion token)', () => {
        const demoFreeOptions = { ...defaultOptions, userPlan: 'free' as const, notionToken: null }
        const { result } = renderHook(() => useGraphFilters(demoFreeOptions))
        expect(result.current.visibleDbIds.size).toBe(5)
    })

    it('sets isDirty when any filter changes', () => {
        const { result } = renderHook(() => useGraphFilters(defaultOptions))
        expect(result.current.isDirty).toBe(false)

        act(() => { result.current.togglePropertyType('date') })
        expect(result.current.isDirty).toBe(true)
    })

    it('handles null userId gracefully', () => {
        const { result } = renderHook(() => useGraphFilters({ ...defaultOptions, userId: null }))
        expect(result.current.visibleDbIds.size).toBe(5)
    })
})
