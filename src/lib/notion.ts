import type { RawDatabase, RawRelation } from "./graph"
import logger from "./logger"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export async function fetchNotionData(
    notionToken: string,
    supabaseAccessToken: string
): Promise<{ databases: RawDatabase[], relations: RawRelation[] }> {

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/notion-sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notion_token: notionToken })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            logger.error("Notion sync error details:", errorData)

            if (response.status === 401) {
                throw new Error(errorData.error || "Token inválido. Por favor verifica tu token de integración.")
            }

            const message = errorData.error || response.statusText
            throw new Error(`Error de sincronización (${response.status}): ${message}`)
        }

        const { databases, relations } = await response.json()
        return { databases: databases || [], relations: relations || [] }

    } catch (error) {
        logger.error("Error fetching from Notion:", error)
        throw error
    }
}
