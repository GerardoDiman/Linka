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

    const fetchRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (!error && data) {
                setRole(data.role)
            } else {
                setRole('user') // Default role
            }
        } catch (err) {
            console.error('Error fetching role:', err)
            setRole('user')
        }
    }

    useEffect(() => {
        let mounted = true

        const initAuth = async () => {
            console.log('DEBUG: initAuth internal starting...')
            try {
                // Get initial session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    console.error('DEBUG: getSession error:', sessionError)
                    throw sessionError
                }

                if (!mounted) return

                if (session) {
                    setSession(session)
                    setUser(session.user)
                    setLoading(false)
                    await fetchRole(session.user.id)
                } else {
                    setSession(null)
                    setUser(null)
                    setRole(null)
                    setLoading(false)
                }
            } catch (err: any) {
                console.error('Auth check error:', err)
                if (mounted) setLoading(false)
            }
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change event:', event)
            if (!mounted) return

            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                console.log('Auth event:', event, ' - User detected:', session.user.id)
                await fetchRole(session.user.id)
            } else {
                console.log('Auth event:', event, ' - No user')
                setRole(null)
            }

            setLoading(false)
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
        console.log('DEBUG: Aggressive Sign Out START')

        // 1. Clear local UI state immediately to prevent flicker
        setSession(null)
        setUser(null)
        setRole(null)

        try {
            // 2. Wipe storage and cookies BEFORE calling supabase to prevent auto-restoration
            console.log('DEBUG: Purging localStorage and cookies...')

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
            console.log('Sign out call finished')
        } catch (err) {
            console.error('DEBUG: Sign out error', err)
        } finally {
            console.log('DEBUG: Sign out workflow complete. Redirecting...')
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
