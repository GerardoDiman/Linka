/**
 * Hook that wires keyboard shortcuts for the dashboard.
 * Takes action callbacks and manages the shortcuts modal state internally.
 */
import { useState } from 'react'
import type { Node } from 'reactflow'
import { useKeyboardShortcuts, createShortcuts } from './useKeyboardShortcuts'
import { useUndoRedo } from './useUndoRedo'

interface UseDashboardShortcutsOptions {
    session: { user: { id: string }; access_token?: string } | null
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setSelectedNode: (node: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
    setSelectedNodeIds: (ids: Set<string>) => void
    isDirty: boolean
    onSave: () => Promise<void>
    onFitView: () => void
    toast: {
        success: (msg: string) => void
        error: (msg: string) => void
        info: (msg: string) => void
    }
    t: (key: string) => string
}

export function useDashboardShortcuts({
    session,
    setNodes,
    setSelectedNode,
    setSelectedNodeIds,
    isDirty,
    onSave,
    onFitView,
    toast,
    t
}: UseDashboardShortcutsOptions) {
    const [showShortcutsModal, setShowShortcutsModal] = useState(false)
    const { undo, redo, saveState: saveUndoState } = useUndoRedo()

    useKeyboardShortcuts([
        createShortcuts.search(() => {
            const searchInput = document.querySelector('input[placeholder]') as HTMLInputElement
            if (searchInput) {
                searchInput.focus()
                searchInput.select()
            }
        }),
        createShortcuts.save(async () => {
            if (!session) return
            await onSave()
        }),
        createShortcuts.info(() => {
            if (isDirty) {
                toast.info(t('dashboard.keyboard.syncPending'))
            } else {
                toast.success(t('dashboard.keyboard.allSynced'))
            }
        }),
        createShortcuts.fitView(() => {
            onFitView()
        }),
        createShortcuts.escape(() => {
            setSelectedNode(null)
            setSelectedNodeIds(new Set())
            setShowShortcutsModal(false)
        }),
        createShortcuts.undo(() => {
            const previousNodes = undo()
            if (previousNodes) {
                setNodes(previousNodes)
                toast.info(t('dashboard.keyboard.undo'))
            }
        }),
        createShortcuts.redo(() => {
            const nextNodes = redo()
            if (nextNodes) {
                setNodes(nextNodes)
                toast.info(t('dashboard.keyboard.redo'))
            }
        }),
        createShortcuts.help(() => {
            setShowShortcutsModal(prev => !prev)
        })
    ])

    return {
        showShortcutsModal,
        setShowShortcutsModal,
        saveUndoState,
        undo,
        redo
    }
}
