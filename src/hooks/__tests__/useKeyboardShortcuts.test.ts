import { describe, it, expect, vi } from 'vitest'
import { createShortcuts } from '../useKeyboardShortcuts'

// We test createShortcuts (pure factory) directly,
// and useKeyboardShortcuts (event-based) via dispatching KeyboardEvents.

describe('createShortcuts', () => {
    it('search creates Ctrl+K shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.search(handler)
        expect(config.key).toBe('k')
        expect(config.ctrl).toBe(true)
        expect(config.handler).toBe(handler)
    })

    it('save creates Ctrl+S shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.save(handler)
        expect(config.key).toBe('s')
        expect(config.ctrl).toBe(true)
    })

    it('escape creates Escape shortcut (no modifiers)', () => {
        const handler = vi.fn()
        const config = createShortcuts.escape(handler)
        expect(config.key).toBe('Escape')
        expect(config.ctrl).toBeUndefined()
        expect(config.shift).toBeUndefined()
    })

    it('help creates Shift+? shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.help(handler)
        expect(config.key).toBe('?')
        expect(config.shift).toBe(true)
    })

    it('undo creates Ctrl+Z shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.undo(handler)
        expect(config.key).toBe('z')
        expect(config.ctrl).toBe(true)
    })

    it('redo creates Ctrl+Y shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.redo(handler)
        expect(config.key).toBe('y')
        expect(config.ctrl).toBe(true)
    })

    it('fitView creates Space shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.fitView(handler)
        expect(config.key).toBe(' ')
    })

    it('info creates Ctrl+I shortcut', () => {
        const handler = vi.fn()
        const config = createShortcuts.info(handler)
        expect(config.key).toBe('i')
        expect(config.ctrl).toBe(true)
    })

    it('all factories include a description', () => {
        const handler = vi.fn()
        const allShortcuts = [
            createShortcuts.search(handler),
            createShortcuts.save(handler),
            createShortcuts.escape(handler),
            createShortcuts.help(handler),
            createShortcuts.undo(handler),
            createShortcuts.redo(handler),
            createShortcuts.fitView(handler),
            createShortcuts.info(handler),
            createShortcuts.zoomIn(handler),
            createShortcuts.zoomOut(handler),
        ]
        allShortcuts.forEach(s => {
            expect(s.description).toBeDefined()
            expect(s.description!.length).toBeGreaterThan(0)
        })
    })
})
