import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")
const PRO_PLAN_PRICE_ID = Deno.env.get("STRIPE_PRO_PRICE_ID") // User will need to set this

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Iniciando sesión de checkout...")

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error("Sin cabecera de autorización")
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Get the user from the JWT
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            console.error("Error de auth:", authError)
            throw new Error("No autorizado: Debes iniciar sesión")
        }

        console.log(`Usuario autenticado: ${user.email} (${user.id})`)

        if (!PRO_PLAN_PRICE_ID) {
            throw new Error("STRIPE_PRO_PRICE_ID no está configurado")
        }

        // 1. Check if user already has a customer ID in profiles
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.warn("Error buscando perfil:", profileError)
        }

        let customerId = profile?.stripe_customer_id
        console.log(`Customer ID actual: ${customerId || 'Ninguno'}`)

        // 2. Prepare Stripe Checkout Session parameters
        const params = new URLSearchParams({
            "mode": "subscription",
            "payment_method_types[0]": "card", // Updated to index format for clarity
            "line_items[0][price]": PRO_PLAN_PRICE_ID!,
            "line_items[0][quantity]": "1",
            "success_url": `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            "cancel_url": `${req.headers.get("origin")}/dashboard`,
            "client_reference_id": user.id,
            "metadata[supabase_user_id]": user.id,
        })

        if (customerId) {
            params.append("customer", customerId)
        } else {
            params.append("customer_email", user.email!)
        }

        console.log("Enviando petición a Stripe...")

        // 3. Create Stripe Checkout Session
        const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        })

        const result = await response.json()

        if (!response.ok) {
            console.error("Error de Stripe API:", result)
            throw new Error(result.error?.message || "Error en Stripe API")
        }

        console.log("Sesión de Stripe creada con éxito")

        return new Response(JSON.stringify({ url: result.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Error final en la función:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
