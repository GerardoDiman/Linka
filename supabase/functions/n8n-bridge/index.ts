import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Manejo de la pre-consulta CORS (petición OPTIONS)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const n8nUrl = "https://n8n-n8n.fxkgvm.easypanel.host/webhook/7ab667dd-f501-4b8e-8924-a666e7202fae"

        // Obtenemos el payload enviado desde la app
        const body = await req.json()

        console.log(`Forwarding request to n8n for action: ${body.action}`)

        // Reenviamos la petición a n8n desde el servidor (esto evita el error de CORS)
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`n8n responded with ${response.status}`)
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error(`Error in bridge: ${error.message}`)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
