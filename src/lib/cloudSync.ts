/**
 * Cloud synchronization utilities for persisting graph state to Supabase.
 */
import { supabase } from './supabase'
import logger from './logger'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CloudSyncPayload {
    id: string
    positions?: Record<string, { x: number; y: number }>
    custom_colors?: Record<string, string>
    filters?: string[]
    hidden_dbs?: string[]
    hide_isolated?: boolean
    notion_token?: string | null
}

export interface CloudGraphData {
    id: string
    positions: Record<string, { x: number; y: number }> | null
    custom_colors: Record<string, string> | null
    filters: string[] | null
    hidden_dbs: string[] | null
    hide_isolated: boolean | null
    notion_token: string | null
}

// ─── Direct fetch fallback ───────────────────────────────────────────────────

/**
 * Reliable sync using direct REST fetch as fallback when the Supabase
 * JS client hangs (which can happen due to broken WebSocket connections).
 */
export const syncViaFetch = async (payload: CloudSyncPayload, token: string): Promise<boolean> => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_graph_data`
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    const activeToken = token || key

    const sendRequest = async (tokenToSend: string) => {
        return fetch(url, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${tokenToSend}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload)
        })
    }

    let response = await sendRequest(activeToken)

    // Handle Expired JWT
    if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.message?.includes('expired') || errorData.code === 'PGRST303') {
            try {
                const { data: { session } } = await Promise.race([
                    supabase.auth.refreshSession(),
                    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 3000))
                ])

                if (session?.access_token) {
                    response = await sendRequest(session.access_token)
                } else {
                    throw new Error("Could not refresh session")
                }
            } catch (err) {
                logger.error("❌ Emergency refresh failed. Needs manual login.")
                throw new Error("Tu sesión ha expirado. Por favor cierra sesión y vuelve a entrar.")
            }
        }
    }

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Direct Fetch Error (${response.status}): ${errorText}`)
    }
    return true
}

// ─── Supabase client upsert + fallback ───────────────────────────────────────

export const syncToCloud = async (userId: string, data: Omit<CloudSyncPayload, 'id'>, token?: string): Promise<void> => {
    if (!userId) return

    const payload: CloudSyncPayload = { id: userId }
    if (data.positions) payload.positions = data.positions
    if (data.custom_colors) payload.custom_colors = data.custom_colors
    if (data.filters) payload.filters = data.filters
    if (data.hidden_dbs) payload.hidden_dbs = data.hidden_dbs
    if (data.hide_isolated !== undefined) payload.hide_isolated = data.hide_isolated
    if (data.notion_token !== undefined) payload.notion_token = data.notion_token

    try {
        // Short timeout to trigger REST fallback quickly if the JS client hangs
        const { error } = await Promise.race([
            supabase.from('user_graph_data').upsert(payload),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT_CLIENT")), 4000))
        ])

        if (error) throw error
    } catch {
        try {
            await syncViaFetch(payload, token || '')
        } catch (fetchErr: unknown) {
            logger.error("❌ Falló tanto el cliente como el fallback:", fetchErr instanceof Error ? fetchErr.message : fetchErr)
            throw fetchErr
        }
    }
}

// ─── Fetch cloud data ────────────────────────────────────────────────────────

export const fetchCloudGraphData = async (userId: string, accessToken: string): Promise<CloudGraphData | null> => {
    let data: CloudGraphData | null = null

    // Attempt 1: Supabase JS client
    try {
        const { data: clientData, error } = await Promise.race([
            supabase.from('user_graph_data')
                .select('id, positions, custom_colors, filters, hidden_dbs, hide_isolated, notion_token')
                .eq('id', userId)
                .maybeSingle(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 3000))
        ])

        if (!error) data = clientData
    } catch {
        // Will fall through to REST fallback
    }

    // Attempt 2: Direct REST fetch
    if (!data) {
        try {
            const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_graph_data?id=eq.${userId}&select=id,positions,custom_colors,filters,hidden_dbs,hide_isolated,notion_token`
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY

            const response = await fetch(url, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            if (!response.ok) throw new Error(`Fetch Error: ${response.status}`)
            const rows = await response.json()
            data = rows[0] || null
        } catch {
            // Fail silently — cloud data is optional
        }
    }

    return data
}
