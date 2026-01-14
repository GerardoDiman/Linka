import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    session: Session | null
    user: User | null
    role: string | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const loadingRef = React.useRef(loading)

    useEffect(() => {
        loadingRef.current = loading
    }, [loading])

    const fetchRole = async (userId: string, accessToken?: string) => {
        try {
            // 1. Try via standard client with a timeout race
            const { data, error } = await Promise.race([
                supabase.from('profiles').select('role').eq('id', userId).single(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 3000))
            ]) as any

            if (!error && data?.role) {
                setRole(data.role)
                return data.role
            }
            throw error || new Error("No data")
        } catch (err) {
            try {
                // Secondary fetch fallback (more reliable during client hangs)
                const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=role`
                const key = import.meta.env.VITE_SUPABASE_ANON_KEY
                const response = await fetch(url, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                if (!response.ok) throw new Error(`HTTP Error ${response.status}`)

                const data = await response.json()
                if (data?.[0]?.role) {
                    setRole(data[0].role)
                    return data[0].role
                }
            } catch (fetchErr) {
                console.error('❌ Role fallback failed:', fetchErr)
            }

            // 3. Last resort default
            setRole('user')
            return 'user'
        }
    }

    useEffect(() => {
        let mounted = true
        const handleAuthChange = async (newSession: Session | null) => {
            if (!mounted) return

            try {
                if (newSession?.user) {
                    setSession(newSession)
                    setUser(newSession.user)
                    await fetchRole(newSession.user.id, newSession.access_token)
                } else {
                    setSession(null)
                    setUser(null)
                    setRole(null)
                }
            } catch (err) {
                // Silently handle or use generic error log in production if needed
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                await handleAuthChange(session)
            } catch (err) {
                if (mounted) setLoading(false)
            }
        }
        init()

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthChange(session)
        })

        // Safety timeout to prevent permanent hang (5 seconds)
        const timeout = setTimeout(() => {
            if (mounted && loadingRef.current) {
                console.warn('Auth initialization timed out after 5s')
                setLoading(false)
            }
        }, 5000)

        return () => {
            mounted = false
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    const signOut = async () => {

        // 1. Clear local UI state immediately to prevent flicker
        setSession(null)
        setUser(null)
        setRole(null)

        try {
            // 2. Wipe storage and cookies BEFORE calling supabase to prevent auto-restoration

            // Collect all auth-related keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('supabase') || key.startsWith('sb-') || key.includes('token'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Clear all cookies
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // 3. Inform Supabase
            await supabase.auth.signOut()
        } catch (err) {
            console.error('Sign out error:', err)
        } finally {
            // Force a hard reload if the SPA state is sticky
            window.location.href = '/';
        }
    }

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
