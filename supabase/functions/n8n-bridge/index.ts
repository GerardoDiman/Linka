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

        // 3. Construct and Normalize the verification/target link
        let link = body.link || body.confirmation_url || body.email_data?.confirmation_url;

        // Configuration for normalization
        const projectRef = Deno.env.get('SUPABASE_PROJECT_ID') || "gnuedinkyheevdkfyujm";
        const supabaseAuthUrl = `https://${projectRef}.supabase.co/auth/v1`;
        const envSiteUrl = Deno.env.get('SITE_URL') || "https://linka-six.vercel.app";

        // CASE A: Link is provided (Auth Hooks or manual call)
        if (link) {
            console.log("Normalizing provided link...");
            try {
                const urlObj = new URL(link);

                // 1. Force Host to Supabase Production if it's local
                if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                    console.log("Forcing host to Supabase Production.");
                    const authBaseObj = new URL(supabaseAuthUrl);
                    urlObj.protocol = authBaseObj.protocol;
                    urlObj.host = authBaseObj.host;

                    // Supabase cloud expects /auth/v1/ - ensure it's there
                    if (!urlObj.pathname.startsWith('/auth/v1')) {
                        const originalPath = urlObj.pathname.startsWith('/') ? urlObj.pathname : '/' + urlObj.pathname;
                        urlObj.pathname = '/auth/v1' + originalPath;
                    }
                }

                // 2. Normalize 'redirect_to' parameter
                let redirectTo = urlObj.searchParams.get('redirect_to');
                if (redirectTo && (redirectTo.includes('localhost') || redirectTo.includes('127.0.0.1'))) {
                    console.log("Normalizing redirect_to parameter...");
                    const fixedRedirect = redirectTo.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, envSiteUrl);
                    urlObj.searchParams.set('redirect_to', fixedRedirect);
                }

                // 3. Cleanup redundant tokens if both are hash-like
                const t = urlObj.searchParams.get('token');
                const th = urlObj.searchParams.get('token_hash');
                if (t && th && t === th && t.length > 20) {
                    console.log("Cleaning up duplicate hash-token...");
                    urlObj.searchParams.delete('token'); // Keep only token_hash for verify links
                }

                link = urlObj.toString();
            } catch (err: any) {
                console.error("Link normalization failed:", err.message);
                link = link.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, envSiteUrl);
            }
        }

        // CASE B: Link is missing - Manual assembly needed
        if (!link && (body.email_data?.token_hash || body.token || body.otp || body.email_data?.token)) {
            console.log("Link Construction: Manual assembly needed");

            const h = body.email_data?.token_hash || body.token || body.otp || body.email_data?.token;
            const queryParams = new URLSearchParams();

            // If it's a long hash, use token_hash. If it's a short OTP, use token.
            if (h.length > 20) {
                queryParams.set('token_hash', h);
            } else {
                queryParams.set('token', h);
            }

            queryParams.set('type', rawType || 'signup');
            queryParams.set('redirect_to', envSiteUrl + "/login");

            link = `${supabaseAuthUrl}/verify?${queryParams.toString()}`;
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
