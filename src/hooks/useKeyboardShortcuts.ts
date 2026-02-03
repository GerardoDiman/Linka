import { useEffect, useCallback } from "react"

type KeyboardShortcutHandler = () => void

interface ShortcutConfig {
    key: string
    ctrl?: boolean
    meta?: boolean  // Cmd on Mac
    shift?: boolean
    alt?: boolean
    handler: KeyboardShortcutHandler
    description?: string
}

/**
 * Hook for registering keyboard shortcuts
 * Automatically handles Ctrl on Windows/Linux and Cmd on Mac
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in inputs (except Escape)
        const target = event.target as HTMLElement
        const isInInput = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable

        for (const shortcut of shortcuts) {
            const needsCtrl = shortcut.ctrl || shortcut.meta
            const needsShift = shortcut.shift === true
            const needsAlt = shortcut.alt === true

            const ctrlMatch = needsCtrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey)
            const shiftMatch = needsShift ? event.shiftKey : !event.shiftKey
            const altMatch = needsAlt ? event.altKey : !event.altKey
            const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

            if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                // Skip if in input (except for Escape)
                if (isInInput && event.key !== 'Escape') continue

                event.preventDefault()
                event.stopPropagation()
                shortcut.handler()
                return
            }
        }
    }, [shortcuts])

    useEffect(() => {
        // Use capture phase to intercept before browser handles it
        window.addEventListener('keydown', handleKeyDown, true)
        return () => window.removeEventListener('keydown', handleKeyDown, true)
    }, [handleKeyDown])
}

/**
 * Preset shortcuts for common actions
 */
export const createShortcuts = {
    search: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: 'k',
        ctrl: true,
        handler,
        description: 'Open search'
    }),
    save: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: 's',
        ctrl: true,
        handler,
        description: 'Save/Sync'
    }),
    escape: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: 'Escape',
        handler,
        description: 'Close/Cancel'
    }),
    help: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: '?',
        shift: true,
        handler,
        description: 'Show help'
    }),
    info: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: 'i',
        ctrl: true,
        handler,
        description: 'Show status info'
    }),
    zoomIn: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: ']',
        ctrl: true,
        handler,
        description: 'Zoom in'
    }),
    zoomOut: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: '[',
        ctrl: true,
        handler,
        description: 'Zoom out'
    }),
    fitView: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: ' ',
        handler,
        description: 'Fit view'
    }),
    undo: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: 'z',
        ctrl: true,
        handler,
        description: 'Undo'
    }),
    redo: (handler: KeyboardShortcutHandler): ShortcutConfig => ({
        key: 'y',
        ctrl: true,
        handler,
        description: 'Redo'
    })
}
