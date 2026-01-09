import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const publicActions = ['waitlist_request', 'password_recovery']

        // Only require authentication for non-public actions
        let user = null
        if (!publicActions.includes(body.action)) {
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? '',
                {
                    global: { headers: { Authorization: req.headers.get('Authorization')! } },
                }
            )

            const { data: { user: authUser } } = await supabase.auth.getUser()
            user = authUser

            if (!user) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401,
                })
            }
        }

        const n8nUrl = "https://n8n-n8n.fxkgvm.easypanel.host/webhook/7ab667dd-f501-4b8e-8924-a666e7202fae"

        // Include user ID in the payload for auditing if authenticated
        const payload = { ...body, userId: user?.id || 'anonymous' }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error(`n8n responded with ${response.status}`)
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
