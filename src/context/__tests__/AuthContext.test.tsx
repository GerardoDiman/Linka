import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'

// Mock the supabase module before importing AuthContext
vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({
                data: {
                    subscription: { unsubscribe: vi.fn() }
                }
            }),
            signOut: vi.fn().mockResolvedValue({}),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null })
                }))
            }))
        }))
    }
}))

vi.mock('../../lib/logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
}))

// Import AFTER mocks
import { AuthProvider, useAuth } from '../AuthContext'

const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(AuthProvider, null, children)

describe('AuthContext', () => {
    it('useAuth throws when used outside AuthProvider', () => {
        expect(() => {
            renderHook(() => useAuth())
        }).toThrow('useAuth must be used within an AuthProvider')
    })

    it('initially loading is true, then resolves', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })
        // Initially loading
        expect(result.current.loading).toBe(true)

        // Wait for async init
        await vi.waitFor(() => {
            expect(result.current.loading).toBe(false)
        })
    })

    it('session and user are null when not authenticated', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await vi.waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.session).toBeNull()
        expect(result.current.user).toBeNull()
    })

    it('provides a signOut function', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await vi.waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(typeof result.current.signOut).toBe('function')
    })
})
