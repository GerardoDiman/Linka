import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")

serve(async (req) => {
    const signature = req.headers.get("stripe-signature")

    try {
        if (!signature || !STRIPE_WEBHOOK_SECRET) {
            throw new Error("Missing signature or webhook secret")
        }

        const body = await req.text()
        console.log("Recibido evento de Stripe...")

        // Note: For real production, use Stripe SDK to verify signature.
        // For simplicity in this template, we'll parse the event directly.
        // IMPORTANT: Verify the signature in the actual deployment!
        const event = JSON.parse(body)
        console.log(`Tipo de evento: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const supabaseUserId = session.client_reference_id || session.metadata?.supabase_user_id
            const stripeCustomerId = session.customer

            console.log(`Checkout completado para usuario Supabase: ${supabaseUserId}`)
            console.log(`Stripe Customer ID: ${stripeCustomerId}`)

            if (supabaseUserId) {
                const supabaseAdmin = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                )

                console.log("Actualizando perfil en la base de datos...")
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
                    console.error("Error actualizando perfil:", error)
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
        console.error("Error en webhook:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
