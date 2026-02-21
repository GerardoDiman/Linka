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

        interface AuthHookPayload {
            user?: {
                email?: string;
                user_metadata?: { full_name?: string };
            };
            email_data?: {
                email_action_type?: string;
                confirmation_url?: string;
                token_hash?: string;
                token?: string;
            };
            mailer?: { otp_type?: string };
            otc_type?: string;
            otp_type?: string;
            confirmation_url?: string;
            otp?: string;
        }

        interface ManualPayload {
            action?: string;
            link?: string;
            token?: string;
            fullName?: string;
            email?: string;
        }

        type WebhookPayload = AuthHookPayload & ManualPayload;

        const body: WebhookPayload = await req.json();
        console.log("--- REQUEST BODY RECEIVED ---");
        console.log(JSON.stringify(body, null, 2));

        // 1. Detect if this is a Supabase Auth Hook or a Manual call
        const isAuthHook = body.user && (body.mailer || body.email_data || body.confirmation_url || body.otp);

        // 2. Determine Action and Template
        let action = body.action || 'user_registration';
        let templateKey: keyof typeof templates = 'user_registration';
        const rawType = body.email_data?.email_action_type || body.mailer?.otp_type || body.otc_type || body.otp_type;

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

        // Step 3a: Manual assembly if link is missing
        if (!link && (body.email_data?.token_hash || body.token || body.otp || body.email_data?.token)) {
            console.log("Link Construction: Manual assembly needed");
            const h = body.email_data?.token_hash || body.token || body.otp || body.email_data?.token;
            const q = new URLSearchParams();
            if (h && h.length > 20) {
                // It's a hash
                q.set('token_hash', h);
                q.set('token', h); // Set both for maximum compatibility
            } else if (h) {
                // It's an OTP
                q.set('token', h);
            }
            q.set('type', rawType || 'signup');
            q.set('redirect_to', envSiteUrl + "/login");
            link = `${supabaseAuthUrl}/verify?${q.toString()}`;
        }

        // Step 3b: Universal Normalization (covers both Hook-provided and manually assembled links)
        if (link) {
            console.log("Normalizing link URL...");
            try {
                const urlObj = new URL(link);

                // 1. Force Production Host (Handshake host) for links pointing to localhost
                if (urlObj.hostname.includes('localhost') || urlObj.hostname.includes('127.0.0.1')) {
                    const authBase = new URL(supabaseAuthUrl);
                    urlObj.protocol = authBase.protocol;
                    urlObj.host = authBase.host;
                }

                // 2. Ensure /auth/v1 prefix for Supabase Cloud links
                if (urlObj.hostname.endsWith('.supabase.co') && !urlObj.pathname.startsWith('/auth/v1')) {
                    const path = urlObj.pathname.startsWith('/') ? urlObj.pathname : '/' + urlObj.pathname;
                    urlObj.pathname = '/auth/v1' + path;
                }

                // 3. Force Production Redirect (Landing host)
                const redirectTo = urlObj.searchParams.get('redirect_to');
                if (redirectTo && (redirectTo.includes('localhost') || redirectTo.includes('127.0.0.1'))) {
                    urlObj.searchParams.set('redirect_to', redirectTo.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, envSiteUrl));
                }

                // 4. Parameter insurance: ensure token_hash is there if we have a hash
                const t = urlObj.searchParams.get('token');
                const th = urlObj.searchParams.get('token_hash');
                const anyHash = (t && t.length > 20) ? t : (th && th.length > 20 ? th : null);
                if (anyHash) {
                    urlObj.searchParams.set('token_hash', anyHash);
                    // We also keep/set token=hash for legacy compatibility
                    urlObj.searchParams.set('token', anyHash);
                }

                link = urlObj.toString();
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : "Unknown URL error"
                console.error("Link normalization failed, using fallback regex:", errMsg);
                link = link.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, envSiteUrl);
            }
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
        } catch (fetchError) {
            clearTimeout(timeoutId);
            const fetchErrMsg = fetchError instanceof Error ? fetchError.message : "Unknown fetch error"
            console.error("n8n transmission failed:", fetchErrMsg);
            // We don't throw here to avoid failing the whole function if n8n is just slow/down
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown fatal error"
        console.error("FATAL ERROR:", errorMsg);
        return new Response(JSON.stringify({ error: errorMsg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
