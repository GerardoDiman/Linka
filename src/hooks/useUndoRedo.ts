import { useState, useCallback, useRef } from 'react'
import type { Node } from 'reactflow'

interface HistoryState {
    nodes: Node[]
    timestamp: number
}

interface UseUndoRedoReturn {
    canUndo: boolean
    canRedo: boolean
    undo: () => Node[] | null
    redo: () => Node[] | null
    saveState: (nodes: Node[]) => void
    clear: () => void
}

const MAX_HISTORY_SIZE = 50
const DEBOUNCE_MS = 500

/**
 * Custom hook for undo/redo functionality on node positions
 * Uses a simple history stack with debouncing to avoid saving every drag pixel
 */
export function useUndoRedo(): UseUndoRedoReturn {
    const [history, setHistory] = useState<HistoryState[]>([])
    const [currentIndex, setCurrentIndex] = useState(-1)
    const lastSaveTime = useRef(0)

    const canUndo = currentIndex > 0
    const canRedo = currentIndex < history.length - 1

    const saveState = useCallback((nodes: Node[]) => {
        const now = Date.now()

        // Debounce - don't save if less than DEBOUNCE_MS since last save
        if (now - lastSaveTime.current < DEBOUNCE_MS) {
            return
        }
        lastSaveTime.current = now

        // Clone nodes to avoid reference issues (only save position data)
        const state: HistoryState = {
            nodes: nodes.map(n => ({
                ...n,
                position: { ...n.position }
            })),
            timestamp: now
        }

        setHistory(prev => {
            // Remove any "future" states if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1)
            newHistory.push(state)

            // Limit history size
            if (newHistory.length > MAX_HISTORY_SIZE) {
                newHistory.shift()
                return newHistory
            }

            return newHistory
        })

        setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1))
    }, [currentIndex])

    const undo = useCallback((): Node[] | null => {
        if (!canUndo) return null

        const newIndex = currentIndex - 1
        setCurrentIndex(newIndex)

        return history[newIndex].nodes
    }, [canUndo, currentIndex, history])

    const redo = useCallback((): Node[] | null => {
        if (!canRedo) return null

        const newIndex = currentIndex + 1
        setCurrentIndex(newIndex)

        return history[newIndex].nodes
    }, [canRedo, currentIndex, history])

    const clear = useCallback(() => {
        setHistory([])
        setCurrentIndex(-1)
    }, [])

    return {
        canUndo,
        canRedo,
        undo,
        redo,
        saveState,
        clear
    }
}
