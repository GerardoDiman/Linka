import { describe, it, expect } from 'vitest'
import { createDemoDatabases, DEMO_RELATIONS } from '../demoData'
import { NODE_COLORS } from '../colors'

import type { TFunction } from 'i18next'

// Simple mock for i18next's TFunction — just returns the key
const mockT = ((key: string) => key) as unknown as TFunction

describe('demoData', () => {
    describe('createDemoDatabases', () => {
        const dbs = createDemoDatabases(mockT)

        it('creates 8 demo databases', () => {
            expect(dbs).toHaveLength(8)
        })

        it('each database has required fields', () => {
            dbs.forEach(db => {
                expect(db.id).toBeDefined()
                expect(db.title).toBeDefined()
                expect(db.properties).toBeDefined()
                expect(db.properties.length).toBeGreaterThan(0)
                expect(db.color).toBeDefined()
                expect(db.icon).toBeDefined()
                expect(db.url).toBeDefined()
            })
        })

        it('databases use NODE_COLORS from the palette', () => {
            dbs.forEach((db, i) => {
                expect(db.color).toBe(NODE_COLORS[i])
            })
        })

        it('IDs are sequential strings 1-8', () => {
            dbs.forEach((db, i) => {
                expect(db.id).toBe(String(i + 1))
            })
        })

        it('uses the t function for localized titles', () => {
            expect(dbs[0].title).toBe('dashboard.demo.users')
            expect(dbs[1].title).toBe('dashboard.demo.tasks')
        })
    })

    describe('DEMO_RELATIONS', () => {
        it('has 6 relations', () => {
            expect(DEMO_RELATIONS).toHaveLength(6)
        })

        it('each relation has source and target', () => {
            DEMO_RELATIONS.forEach(rel => {
                expect(rel.source).toBeDefined()
                expect(rel.target).toBeDefined()
            })
        })

        it('all source/target IDs reference valid demo database IDs', () => {
            const validIds = new Set(['1', '2', '3', '4', '5', '6', '7', '8'])
            DEMO_RELATIONS.forEach(rel => {
                expect(validIds.has(rel.source)).toBe(true)
                expect(validIds.has(rel.target)).toBe(true)
            })
        })

        it('includes a bidirectional relation (1↔8)', () => {
            const has1to8 = DEMO_RELATIONS.some(r => r.source === '1' && r.target === '8')
            const has8to1 = DEMO_RELATIONS.some(r => r.source === '8' && r.target === '1')
            expect(has1to8).toBe(true)
            expect(has8to1).toBe(true)
        })
    })
})
