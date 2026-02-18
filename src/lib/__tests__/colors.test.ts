import { describe, it, expect } from 'vitest'
import { NODE_COLORS, getNextColor } from '../colors'

describe('colors', () => {
    it('NODE_COLORS has 18 entries', () => {
        expect(NODE_COLORS).toHaveLength(18)
    })

    it('all colors are valid hex strings', () => {
        NODE_COLORS.forEach(color => {
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        })
    })

    it('getNextColor returns correct color by index', () => {
        expect(getNextColor(0)).toBe(NODE_COLORS[0])
        expect(getNextColor(5)).toBe(NODE_COLORS[5])
        expect(getNextColor(17)).toBe(NODE_COLORS[17])
    })

    it('getNextColor cycles when index exceeds palette length', () => {
        expect(getNextColor(18)).toBe(NODE_COLORS[0])
        expect(getNextColor(19)).toBe(NODE_COLORS[1])
        expect(getNextColor(36)).toBe(NODE_COLORS[0])
    })
})
