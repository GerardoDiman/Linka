/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ─── Color palette (mirrors src/lib/colors.ts) ────────────────────────────────
const NODE_COLORS = [
    "#ABA482", "#910043", "#D50202", "#E0007B", "#F770A6",
    "#00CFD1", "#0078DB", "#4C00F0", "#9600DB", "#B175F6",
    "#00DB84", "#9DFA8F", "#20A55B", "#8DD100", "#D9D200",
    "#F05000", "#FB790E", "#E6AC00",
]

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // ─── CORS preflight ────────────────────────────────────────────────
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // ─── Auth: validate Supabase JWT ───────────────────────────────
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error("Missing Authorization header")
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        // ─── Parse request body ────────────────────────────────────────
        const { notion_token } = await req.json()
        if (!notion_token) {
            throw new Error("Missing notion_token in request body")
        }

        // ─── Call Notion API server-side ────────────────────────────────
        const notionResponse = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notion_token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: { value: 'database', property: 'object' },
                page_size: 100
            })
        })

        if (!notionResponse.ok) {
            const errorData = await notionResponse.json().catch(() => ({}))

            if (notionResponse.status === 401) {
                return new Response(JSON.stringify({
                    error: "Token inválido. Por favor verifica tu token de integración."
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401,
                })
            }

            const message = errorData.message || notionResponse.statusText
            throw new Error(`Notion API error (${notionResponse.status}): ${message}`)
        }

        // ─── Parse Notion response ─────────────────────────────────────
        const data = await notionResponse.json()
        const results = data.results || []

        interface ParsedDatabase {
            id: string
            title: string
            properties: { name: string; type: string }[]
            color: string
            url?: string
            icon: string
            createdTime?: string
            lastEditedTime?: string
        }

        interface ParsedRelation {
            source: string
            target: string
            label: string
        }

        const databases: ParsedDatabase[] = []
        const relations: ParsedRelation[] = []

        results.forEach((db: any, index: number) => {
            const title = db.title?.[0]?.plain_text || "Sin título"

            const properties = Object.entries(db.properties).map(([name, prop]: [string, any]) => ({
                name,
                type: prop.type
            }))

            const color = NODE_COLORS[index % NODE_COLORS.length]

            let icon = ""
            if (db.icon) {
                if (db.icon.type === 'emoji') icon = db.icon.emoji
                else if (db.icon.type === 'external') icon = db.icon.external.url
                else if (db.icon.type === 'file') icon = db.icon.file.url
            }

            databases.push({
                id: db.id,
                title,
                properties,
                color,
                url: db.url,
                icon,
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

        // ─── Return parsed data ────────────────────────────────────────
        return new Response(JSON.stringify({ databases, relations }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("notion-sync error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
