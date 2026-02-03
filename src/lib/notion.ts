import type { RawDatabase, RawRelation } from "./graph"
import { getNextColor } from "./colors"
import logger from "./logger"

export async function fetchNotionData(token: string): Promise<{ databases: RawDatabase[], relations: RawRelation[] }> {

    try {
        const response = await fetch('/api/notion/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    value: 'database',
                    property: 'object'
                },
                page_size: 100
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            logger.error("Notion API error details:", errorData)

            if (response.status === 401) {
                throw new Error("Token inválido. Por favor verifica tu token de integración.")
            }

            const message = errorData.message || response.statusText
            throw new Error(`Error de Notion (${response.status}): ${message}`)
        }

        const data = await response.json()
        const results = data.results || []

        const databases: RawDatabase[] = []
        const relations: RawRelation[] = []


        results.forEach((db: any, index: number) => {
            // Extract title
            const title = db.title?.[0]?.plain_text || "Sin título"

            // Extract properties
            const properties = Object.entries(db.properties).map(([name, prop]: [string, any]) => ({
                name,
                type: prop.type
            }))

            // Assign a color (cycle through palette)
            const color = getNextColor(index)

            // Extract icon (emoji or URL)
            let icon = ""
            if (db.icon) {
                if (db.icon.type === 'emoji') {
                    icon = db.icon.emoji
                } else if (db.icon.type === 'external') {
                    icon = db.icon.external.url
                } else if (db.icon.type === 'file') {
                    icon = db.icon.file.url
                }
            }

            databases.push({
                id: db.id,
                title: title,
                properties: properties,
                color: color,
                url: db.url,
                icon: icon,
                createdTime: db.created_time,
                lastEditedTime: db.last_edited_time
            })

            // Extract relations
            Object.values(db.properties).forEach((prop: any) => {
                if (prop.type === 'relation' && prop.relation?.database_id) {
                    relations.push({
                        source: db.id,
                        target: prop.relation.database_id,
                        label: prop.name
                    })
                }
            })
        })

        return { databases, relations }

    } catch (error) {
        logger.error("Error fetching from Notion:", error)
        throw error
    }
}
