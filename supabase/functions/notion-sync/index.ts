import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getCorsHeaders } from "../_shared/cors.ts"

// ─── Color palette (mirrors src/lib/colors.ts) ────────────────────────────────
const NODE_COLORS = [
    "#ABA482", "#910043", "#D50202", "#E0007B", "#F770A6",
    "#00CFD1", "#0078DB", "#4C00F0", "#9600DB", "#B175F6",
    "#00DB84", "#9DFA8F", "#20A55B", "#8DD100", "#D9D200",
    "#F05000", "#FB790E", "#E6AC00",
]


// ─── Encryption Utilities ───────────────────────────────────────────────────

const ENCRYPTION_KEY = Deno.env.get("NOTION_TOKEN_ENCRYPTION_KEY")

async function encrypt(text: string): Promise<string> {
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY not configured")
    const key = await crypto.subtle.importKey(
        "raw",
        Uint8Array.from(atob(ENCRYPTION_KEY), c => c.charCodeAt(0)),
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    )
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(text)
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)

    return JSON.stringify({
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    })
}

async function decrypt(jsonStr: string): Promise<string> {
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY not configured")
    try {
        const { encrypted, iv } = JSON.parse(jsonStr)
        const key = await crypto.subtle.importKey(
            "raw",
            Uint8Array.from(atob(ENCRYPTION_KEY), c => c.charCodeAt(0)),
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        )
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
            key,
            Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
        )
        return new TextDecoder().decode(decrypted)
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Parsing or decryption failed"
        console.error("Decryption failed:", msg)
        throw new Error("Failed to decrypt token. Please provide it again.")
    }
}

Deno.serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req)

    // ─── CORS preflight ────────────────────────────────────────────────
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // ─── Auth: validate Supabase JWT ───────────────────────────────
        const authHeader = req.headers.get('Authorization')

        if (!authHeader) {
            console.error("Missing Authorization header")
            throw new Error("Missing Authorization header")
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        console.log("Validating user...")
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            console.error("Auth error:", authError?.message || "No user found")
            return new Response(JSON.stringify({
                error: "Unauthorized",
                message: authError?.message || "Invalid session"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }
        console.log(`User authenticated: ${user.id.substring(0, 8)}...`)

        // ─── Parse request body ────────────────────────────────────────
        const body = await req.json().catch(() => ({}))
        let notionToken = body.notion_token

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (!notionToken) {
            // Try to find it in the DB
            console.log("No token in request, searching in database...")
            const { data: graphData, error: dbError } = await supabaseAdmin
                .from('user_graph_data')
                .select('notion_token')
                .eq('id', user.id)
                .single()

            if (dbError || !graphData?.notion_token) {
                console.log("No token found in database. Notion sync is disabled for this user.")
                return new Response(JSON.stringify({
                    databases: [],
                    relations: [],
                    notion_connected: false
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                })
            }

            // Decrypt it
            try {
                notionToken = await decrypt(graphData.notion_token)
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Decryption failed"
                return new Response(JSON.stringify({ error: msg }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }
        } else {
            // New token provided, encrypt and save it
            console.log("New token received, encrypting and saving...")
            const encryptedToken = await encrypt(notionToken)
            const { error: saveError } = await supabaseAdmin
                .from('user_graph_data')
                .upsert({ id: user.id, notion_token: encryptedToken })

            if (saveError) {
                console.error("Error saving encrypted token:", saveError)
                // We continue anyway so the user can see their data
            }
        }

        // ─── Call Notion API server-side (with pagination) ────────────────
        const allResults: any[] = []
        let hasMore = true
        let nextCursor: string | undefined = undefined
        const MAX_DATABASES = 1000 // Safety limit

        while (hasMore && allResults.length < MAX_DATABASES) {
            const searchBody: Record<string, unknown> = {
                filter: { value: 'database', property: 'object' },
                page_size: 100
            }
            if (nextCursor) {
                searchBody.start_cursor = nextCursor
            }

            const notionResponse = await fetch('https://api.notion.com/v1/search', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${notionToken}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchBody)
            })

            if (!notionResponse.ok) {
                const errorData = await notionResponse.json().catch(() => ({}))

                if (notionResponse.status === 401) {
                    return new Response(JSON.stringify({
                        error: "Invalid token. Please verify your integration token."
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 401,
                    })
                }

                const message = errorData.message || notionResponse.statusText
                throw new Error(`Notion API error (${notionResponse.status}): ${message}`)
            }

            const data = await notionResponse.json()
            allResults.push(...(data.results || []))
            hasMore = !!data.has_more
            nextCursor = data.next_cursor || undefined
        }

        // ─── Parse Notion response ─────────────────────────────────────
        const results = allResults

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

        interface NotionProperty {
            id: string;
            name: string;
            type: string;
            relation?: {
                database_id: string;
                synced_property_name: string;
                synced_property_id: string;
            }
        }

        interface NotionIcon {
            type: 'emoji' | 'external' | 'file';
            emoji?: string;
            external?: { url: string };
            file?: { url: string; expiry_time: string };
        }

        interface NotionDatabase {
            id: string;
            title?: Array<{ plain_text: string }>;
            properties: Record<string, NotionProperty>;
            icon?: NotionIcon;
            url?: string;
            created_time?: string;
            last_edited_time?: string;
        }

        results.forEach((db: NotionDatabase, index: number) => {
            const title = db.title?.[0]?.plain_text || "Untitled"

            const properties = Object.entries(db.properties).map(([name, prop]) => ({
                name,
                type: prop.type
            }))

            const color = NODE_COLORS[index % NODE_COLORS.length]

            let icon = ""
            if (db.icon) {
                if (db.icon.type === 'emoji' && db.icon.emoji) icon = db.icon.emoji
                else if (db.icon.type === 'external' && db.icon.external) icon = db.icon.external.url
                else if (db.icon.type === 'file' && db.icon.file) icon = db.icon.file.url
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
            Object.values(db.properties).forEach((prop) => {
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
        return new Response(JSON.stringify({
            databases,
            relations,
            is_synced: true
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error occurred"
        console.error("notion-sync error:", errorMsg)
        return new Response(JSON.stringify({ error: errorMsg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
