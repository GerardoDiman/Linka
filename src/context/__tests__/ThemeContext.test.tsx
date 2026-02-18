import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, useTheme } from '../ThemeContext'

const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(ThemeProvider, null, children)

describe('ThemeContext', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.classList.remove('light', 'dark')
    })

    it('defaults to light theme when nothing is saved', () => {
        const { result } = renderHook(() => useTheme(), { wrapper })
        expect(result.current.theme).toBe('light')
    })

    it('reads saved theme from localStorage', () => {
        localStorage.setItem('theme', 'dark')
        const { result } = renderHook(() => useTheme(), { wrapper })
        expect(result.current.theme).toBe('dark')
    })

    it('toggleTheme switches light → dark', () => {
        const { result } = renderHook(() => useTheme(), { wrapper })
        act(() => { result.current.toggleTheme() })
        expect(result.current.theme).toBe('dark')
    })

    it('toggleTheme switches dark → light', () => {
        localStorage.setItem('theme', 'dark')
        const { result } = renderHook(() => useTheme(), { wrapper })
        act(() => { result.current.toggleTheme() })
        expect(result.current.theme).toBe('light')
    })

    it('persists theme to localStorage on toggle', () => {
        const { result } = renderHook(() => useTheme(), { wrapper })
        act(() => { result.current.toggleTheme() })
        expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('applies theme class to document element', () => {
        const { result } = renderHook(() => useTheme(), { wrapper })
        expect(document.documentElement.classList.contains('light')).toBe(true)

        act(() => { result.current.toggleTheme() })
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('useTheme throws when used outside ThemeProvider', () => {
        expect(() => {
            renderHook(() => useTheme())
        }).toThrow('useTheme must be used within a ThemeProvider')
    })
})
