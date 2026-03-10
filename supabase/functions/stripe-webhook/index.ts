import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    // Use the latest stable API version
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
})

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")

Deno.serve(async (req) => {
    const signature = req.headers.get("stripe-signature")

    try {
        if (!signature || !STRIPE_WEBHOOK_SECRET) {
            console.error("❌ Firma faltante o el secreto del webhook no está configurado")
            return new Response(
                JSON.stringify({ error: "Missing signature or webhook secret" }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const body = await req.text()

        // Verificar la firma criptográfica del evento
        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                STRIPE_WEBHOOK_SECRET
            )
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error"
            console.error(`❌ Error de verificación de firma: ${msg}`)
            return new Response(
                JSON.stringify({ error: `Signature verification failed: ${msg}` }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        console.log(`🔔 Evento recibido: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const supabaseUserId = session.client_reference_id || session.metadata?.supabase_user_id
            const stripeCustomerId = session.customer

            console.log(`🚀 Checkout completado para usuario Supabase: ${supabaseUserId}`)

            if (supabaseUserId) {
                const supabaseAdmin = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                )

                console.log("📝 Actualizando perfil en la base de datos...")
                const { error, data } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        plan_type: 'pro',
                        stripe_customer_id: stripeCustomerId,
                        subscription_status: 'active'
                    })
                    .eq('id', supabaseUserId)
                    .select()

                if (error) {
                    console.error("❌ Error actualizando perfil:", error)
                    throw error
                }

                if (data && data.length > 0) {
                    console.log(`✅ Usuario ${supabaseUserId} actualizado con éxito a PRO`)
                } else {
                    console.warn(`⚠️ No se encontró el perfil para el usuario ${supabaseUserId}`)
                }
            } else {
                console.warn("⚠️ No se encontró supabaseUserId en el evento de Stripe")
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error"
        console.error("❌ Error en webhook:", message)
        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
