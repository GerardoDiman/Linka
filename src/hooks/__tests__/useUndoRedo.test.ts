import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoRedo } from '../useUndoRedo'
import type { Node } from 'reactflow'

const makeNodes = (positions: { x: number; y: number }[]): Node[] =>
    positions.map((pos, i) => ({
        id: `node-${i}`,
        type: 'default',
        position: pos,
        data: { label: `Node ${i}` },
    }))

describe('useUndoRedo', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    it('initially cannot undo or redo', () => {
        const { result } = renderHook(() => useUndoRedo())
        expect(result.current.canUndo).toBe(false)
        expect(result.current.canRedo).toBe(false)
    })

    it('undo returns null when no history', () => {
        const { result } = renderHook(() => useUndoRedo())
        let undone: Node[] | null = null
        act(() => { undone = result.current.undo() })
        expect(undone).toBeNull()
    })

    it('saves state and enables undo after 2 saves', () => {
        const { result } = renderHook(() => useUndoRedo())

        // First save
        act(() => {
            result.current.saveState(makeNodes([{ x: 0, y: 0 }]))
        })
        // Advance past debounce
        act(() => { vi.advanceTimersByTime(600) })

        // Second save
        act(() => {
            result.current.saveState(makeNodes([{ x: 100, y: 100 }]))
        })

        expect(result.current.canUndo).toBe(true)
    })

    it('undo returns the previous state', () => {
        const { result } = renderHook(() => useUndoRedo())

        const state1 = makeNodes([{ x: 0, y: 0 }])
        const state2 = makeNodes([{ x: 50, y: 50 }])

        act(() => { result.current.saveState(state1) })
        act(() => { vi.advanceTimersByTime(600) })
        act(() => { result.current.saveState(state2) })

        let undone: Node[] | null = null
        act(() => { undone = result.current.undo() })
        expect(undone).not.toBeNull()
        expect(undone![0].position).toEqual({ x: 0, y: 0 })
    })

    it('redo returns the next state after undo', () => {
        const { result } = renderHook(() => useUndoRedo())

        const state1 = makeNodes([{ x: 0, y: 0 }])
        const state2 = makeNodes([{ x: 50, y: 50 }])

        act(() => { result.current.saveState(state1) })
        act(() => { vi.advanceTimersByTime(600) })
        act(() => { result.current.saveState(state2) })

        act(() => { result.current.undo() })

        let redone: Node[] | null = null
        act(() => { redone = result.current.redo() })
        expect(redone).not.toBeNull()
        expect(redone![0].position).toEqual({ x: 50, y: 50 })
    })

    it('clear resets history', () => {
        const { result } = renderHook(() => useUndoRedo())

        act(() => { result.current.saveState(makeNodes([{ x: 0, y: 0 }])) })
        act(() => { vi.advanceTimersByTime(600) })
        act(() => { result.current.saveState(makeNodes([{ x: 1, y: 1 }])) })

        act(() => { result.current.clear() })

        expect(result.current.canUndo).toBe(false)
        expect(result.current.canRedo).toBe(false)
    })

    it('debounces saves within 500ms', () => {
        const { result } = renderHook(() => useUndoRedo())

        // Save twice rapidly — second should be debounced
        act(() => { result.current.saveState(makeNodes([{ x: 0, y: 0 }])) })
        act(() => { vi.advanceTimersByTime(100) }) // only 100ms
        act(() => { result.current.saveState(makeNodes([{ x: 1, y: 1 }])) })

        // Should not be able to undo because second save was debounced
        expect(result.current.canUndo).toBe(false)
    })
})
