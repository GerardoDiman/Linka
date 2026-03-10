import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getCorsHeaders } from "../_shared/cors.ts"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")
const PRO_PLAN_PRICE_ID = Deno.env.get("STRIPE_PRO_PRICE_ID")
const SITE_URL = Deno.env.get("SITE_URL") || "https://linka-web.vercel.app"


Deno.serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req)

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {

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
            return new Response(JSON.stringify({ error: "No autorizado: Debes iniciar sesión" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }


        if (!STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY no está configurado")
        }

        // 1. Check if user already has a customer ID in profiles
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single()

        if (profileError) {
            // If profile not found, it's not necessarily an error, just means no customer ID yet.
            // We'll create one later if needed.
        }

        const customerId = profile?.stripe_customer_id

        const origin = req.headers.get("origin") || SITE_URL

        // 2. Prepare Stripe Checkout Session parameters
        const params = new URLSearchParams({
            "mode": "subscription",
            "payment_method_types[0]": "card",
            "line_items[0][price]": PRO_PLAN_PRICE_ID!,
            "line_items[0][quantity]": "1",
            "automatic_tax[enabled]": "true",
            "billing_address_collection": "required",
            "tax_id_collection[enabled]": "true",
            "allow_promotion_codes": "true",
            "success_url": `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            "cancel_url": `${origin}/dashboard`,
            "client_reference_id": user.id,
            "metadata[supabase_user_id]": user.id,
        })

        if (customerId) {
            params.append("customer", customerId)
            params.append("customer_update[address]", "auto")
        } else if (user.email) {
            params.append("customer_email", user.email)
        } else {
            // No email available, Stripe might still work but it's less ideal.
        }


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
            return new Response(JSON.stringify({
                error: result.error?.message || "Error en Stripe API"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }


        return new Response(JSON.stringify({ url: result.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error("Error en create-checkout-session:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
