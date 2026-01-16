import { populateTemplate, templates } from "./utils.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Edge Function 'n8n-bridge' initialized and ready.");

Deno.serve(async (req: Request) => {
    // Immediate handshake log
    console.log(`[${new Date().toISOString()}] New request: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Log headers for debugging
        const headers = Object.fromEntries(req.headers.entries());
        console.log("Headers:", JSON.stringify(headers, null, 2));

        const body = await req.json();
        console.log("--- REQUEST BODY RECEIVED ---");
        console.log(JSON.stringify(body, null, 2));

        // 1. Detect if this is a Supabase Auth Hook or a Manual call
        const isAuthHook = body.user && (body.mailer || body.email_data || body.confirmation_url || body.otp);

        // 2. Determine Action and Template
        let action = body.action || 'user_registration';
        let templateKey: keyof typeof templates = 'user_registration';
        let rawType = body.email_data?.email_action_type || body.mailer?.otp_type || body.otc_type || body.otp_type;

        if (isAuthHook) {
            console.log("Context: Supabase Auth Hook");
            if (rawType === 'recovery') {
                action = 'password_recovery';
                templateKey = 'password_recovery';
            } else {
                action = 'user_registration';
                templateKey = 'user_registration';
            }
        } else {
            console.log("Context: Manual Call");
            if (Object.keys(templates).includes(action)) {
                templateKey = action as keyof typeof templates;
            }
        }

        // 3. Construct the verification/target link
        let link = body.link || body.confirmation_url || body.email_data?.confirmation_url;

        if (!link && (body.email_data?.token_hash || body.token || body.otp || body.email_data?.token)) {
            console.log("Link Construction: Manual assembly needed");

            // Normalize Project Reference (User's project is gnuedinkyheevdkfyujm)
            const projectRef = Deno.env.get('SUPABASE_PROJECT_ID') || "gnuedinkyheevdkfyujm";
            const supabaseAuthUrl = `https://${projectRef}.supabase.co/auth/v1`;

            // Robust Base URL detection
            const envSiteUrl = Deno.env.get('SITE_URL');
            let baseUrl = body.email_data?.site_url || envSiteUrl || supabaseAuthUrl;

            // Logic to prevent localhost links in production
            if (baseUrl.includes('localhost')) {
                console.log("WARNING: Localhost detected in production context. Normalizing to Supabase Auth URL.");
                baseUrl = envSiteUrl || supabaseAuthUrl;
            }

            const h = body.email_data?.token_hash || body.token || body.otp || body.email_data?.token;

            const queryParams = new URLSearchParams();
            if (h) {
                queryParams.set('token', h);
                queryParams.set('token_hash', h);
            }
            queryParams.set('type', rawType || 'signup');
            if (body.email_data?.redirect_to) {
                queryParams.set('redirect_to', body.email_data.redirect_to);
            }

            // Ensure we always use the /auth/v1/verify endpoint on the Supabase project for maximum reliability
            const cleanBaseUrl = baseUrl.includes('.supabase.co')
                ? (baseUrl.endsWith('/auth/v1') ? baseUrl : (baseUrl.endsWith('/') ? `${baseUrl}auth/v1` : `${baseUrl}/auth/v1`))
                : supabaseAuthUrl; // Fallback to Supabase for non-supabase baseUrls during verification

            link = `${cleanBaseUrl}/verify?${queryParams.toString()}`;
        }

        console.log(`Resolved Link: ${link || "NONE"}`);

        // 4. Generate the HTML Body
        const fullName = body.fullName || body.user?.user_metadata?.full_name || body.user?.email || body.email || 'User';
        const htmlBody = populateTemplate(templates[templateKey], {
            fullName: fullName,
            link: link || ""
        });

        // 5. Prepare Payload for n8n
        const payload = {
            ...body,
            action,
            email: body.email || body.user?.email,
            fullName,
            link: link,
            htmlBody,
            timestamp: new Date().toISOString(),
            source: isAuthHook ? 'supabase_auth_hook' : 'manual_call',
            raw_event: rawType
        };

        const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL') || "https://n8n-n8n.fxkgvm.easypanel.host/webhook/7ab667dd-f501-4b8e-8924-a666e7202fae";

        console.log(`Dispatching to n8n: ${action}`);

        // Set a timeout for the n8n fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const n8nResponse = await fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!n8nResponse.ok) {
                console.error(`n8n error: ${n8nResponse.status}`);
            } else {
                console.log("n8n delivery successful");
            }
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            console.error("n8n transmission failed:", fetchError.message);
            // We don't throw here to avoid failing the whole function if n8n is just slow/down
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("FATAL ERROR:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
