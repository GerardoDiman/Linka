import { supabase } from "./supabase"

export type WebhookAction =
    | "user_registration"
    | "waitlist_request"
    | "password_recovery"
    | "user_approval"
    | "user_rejected"
    | "special_invitation"

interface WebhookPayload {
    action: WebhookAction
    email: string
    fullName?: string
    username?: string
    comments?: string
    timestamp: string
}

export async function sendN8NWebhook(action: WebhookAction, data: Omit<WebhookPayload, 'action' | 'timestamp'>) {
    try {
        const payload: WebhookPayload = {
            action,
            ...data,
            timestamp: new Date().toISOString()
        }

        // Llamamos a la Edge Function de Supabase en lugar de directamente a n8n
        // Esto evita errores de CORS ya que la llamada a n8n se hace desde el servidor
        const { error } = await supabase.functions.invoke('n8n-bridge', {
            body: payload
        })

        if (error) {
            console.error(`Webhook Bridge Error:`, error)
            return false
        }

        return true
    } catch (error) {
        console.error("Webhook unexpected error:", error)
        return false
    }
}
