import type { RawDatabase, RawRelation } from "./graph"
import logger from "./logger"

import { supabase } from "./supabase"

export async function fetchNotionData(
    notionToken: string
): Promise<{ databases: RawDatabase[], relations: RawRelation[], is_synced?: boolean }> {

    try {
        const { data, error } = await supabase.functions.invoke('notion-sync', {
            body: { notion_token: notionToken }
        })

        if (error) {
            logger.error("Notion sync error details:", error)
            throw new Error(error.message || "NOTION_SYNC_ERROR")
        }

        if (!data) {
            throw new Error("NOTION_NO_RESPONSE")
        }

        return {
            databases: data.databases || [],
            relations: data.relations || [],
            is_synced: data.is_synced
        }

    } catch (error) {
        logger.error("Error fetching from Notion:", error)
        throw error
    }
}
