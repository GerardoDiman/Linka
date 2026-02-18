import { describe, it, expect, beforeEach } from 'vitest'
import {
    STORAGE_KEYS,
    getScopedKey,
    getSavedPositions,
    getSavedFilters,
    getSavedHiddenDbs,
    getSavedHideIsolated,
    getSavedCustomColors,
    saveAllToStorage,
} from '../storage'

const USER_ID = 'test-user-123'

describe('storage', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    // ─── getScopedKey ──────────────────────────────────────────────────
    describe('getScopedKey', () => {
        it('produces linka_{userId}_{key} format', () => {
            expect(getScopedKey(USER_ID, 'my-key')).toBe('linka_test-user-123_my-key')
        })
    })

    // ─── Getters ───────────────────────────────────────────────────────
    describe('getSavedPositions', () => {
        it('returns empty object when nothing is saved', () => {
            expect(getSavedPositions(USER_ID)).toEqual({})
        })

        it('parses saved positions', () => {
            const positions = { 'node-1': { x: 100, y: 200 } }
            localStorage.setItem(getScopedKey(USER_ID, STORAGE_KEYS.POSITIONS), JSON.stringify(positions))
            expect(getSavedPositions(USER_ID)).toEqual(positions)
        })

        it('returns empty object on invalid JSON', () => {
            localStorage.setItem(getScopedKey(USER_ID, STORAGE_KEYS.POSITIONS), 'not-json')
            expect(getSavedPositions(USER_ID)).toEqual({})
        })
    })

    describe('getSavedFilters', () => {
        it('returns empty array when nothing is saved', () => {
            expect(getSavedFilters(USER_ID)).toEqual([])
        })

        it('parses saved filters', () => {
            localStorage.setItem(getScopedKey(USER_ID, STORAGE_KEYS.FILTERS), JSON.stringify(['relation', 'date']))
            expect(getSavedFilters(USER_ID)).toEqual(['relation', 'date'])
        })
    })

    describe('getSavedHiddenDbs', () => {
        it('returns empty array by default', () => {
            expect(getSavedHiddenDbs(USER_ID)).toEqual([])
        })
    })

    describe('getSavedHideIsolated', () => {
        it('returns false by default', () => {
            expect(getSavedHideIsolated(USER_ID)).toBe(false)
        })

        it('returns true when stored as "true"', () => {
            localStorage.setItem(getScopedKey(USER_ID, STORAGE_KEYS.ISOLATED), 'true')
            expect(getSavedHideIsolated(USER_ID)).toBe(true)
        })

        it('returns false for any other string', () => {
            localStorage.setItem(getScopedKey(USER_ID, STORAGE_KEYS.ISOLATED), 'false')
            expect(getSavedHideIsolated(USER_ID)).toBe(false)
        })
    })

    describe('getSavedCustomColors', () => {
        it('returns empty object by default', () => {
            expect(getSavedCustomColors(USER_ID)).toEqual({})
        })
    })

    // ─── saveAllToStorage ──────────────────────────────────────────────
    describe('saveAllToStorage', () => {
        it('persists all data to localStorage', () => {
            const data = {
                positions: { 'n1': { x: 10, y: 20 } },
                customColors: { 'n1': '#FF0000' },
                filters: ['relation'],
                hiddenDbs: ['db-1'],
                hideIsolated: true,
                notionToken: 'secret_abc',
            }

            saveAllToStorage(USER_ID, data)

            expect(getSavedPositions(USER_ID)).toEqual(data.positions)
            expect(getSavedCustomColors(USER_ID)).toEqual(data.customColors)
            expect(getSavedFilters(USER_ID)).toEqual(data.filters)
            expect(getSavedHiddenDbs(USER_ID)).toEqual(data.hiddenDbs)
            expect(getSavedHideIsolated(USER_ID)).toBe(true)
            expect(localStorage.getItem(getScopedKey(USER_ID, STORAGE_KEYS.NOTION_TOKEN))).toBe('secret_abc')
        })

        it('removes notion token when null', () => {
            // Set a token first
            localStorage.setItem(getScopedKey(USER_ID, STORAGE_KEYS.NOTION_TOKEN), 'secret_old')

            saveAllToStorage(USER_ID, {
                positions: {},
                customColors: {},
                filters: [],
                hiddenDbs: [],
                hideIsolated: false,
                notionToken: null,
            })

            expect(localStorage.getItem(getScopedKey(USER_ID, STORAGE_KEYS.NOTION_TOKEN))).toBeNull()
        })
    })
})
