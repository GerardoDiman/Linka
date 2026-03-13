import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { populateTemplate, templates } from "./utils.ts"
import { getCorsHeaders } from "../_shared/cors.ts"


console.log("Edge Function 'n8n-bridge' initialized and ready.");

Deno.serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req)

    // Immediate handshake log
    console.log(`[${new Date().toISOString()}] New request: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Log safe headers for debugging (omit Authorization to protect JWT tokens)
        const safeHeaders = {
            'content-type': req.headers.get('content-type'),
            'user-agent': req.headers.get('user-agent'),
            'origin': req.headers.get('origin'),
        };
        console.log("Headers (safe):", JSON.stringify(safeHeaders, null, 2));

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

        interface DatabaseWebhookPayload {
            type?: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
            table?: string;
            record?: any;
            schema?: string;
        }

        type WebhookPayload = AuthHookPayload & ManualPayload & DatabaseWebhookPayload;

        const body: WebhookPayload = await req.json();
        console.log("--- REQUEST BODY RECEIVED ---");
        console.log(JSON.stringify({
            action: body.action,
            source: body.type ? 'database_webhook' : (body.user ? 'auth_hook' : 'manual'),
            table: body.table,
            hasEmail: !!body.email,
            hasUser: !!body.user,
        }, null, 2));

        // 1. Detect Context type
        const isAuthHook = body.user && (body.mailer || body.email_data || body.confirmation_url || body.otp);
        const isDatabaseWebhook = body.table === 'profiles' && body.type === 'INSERT';

        // 2. Authentication & Authorization for Manual Calls
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || "";
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || "";
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";
        const authHeader = req.headers.get('Authorization');

        if (!isAuthHook && !isDatabaseWebhook) {
            console.log("Context: Manual Call - Verifying authentication...");
            
            if (!authHeader) {
                console.warn("Manual call without Authorization header rejected.");
                return new Response(JSON.stringify({ error: "No autorizado: Sin cabecera de autenticación" }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: authHeader } }
            });

            const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

            if (authError || !user) {
                console.warn("Authentication failed for manual call:", authError?.message);
                return new Response(JSON.stringify({ error: "No autorizado: Sesión inválida" }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Authorization: Check for admin role
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError || profile?.role !== 'admin') {
                console.warn(`User ${user.id} attempted admin action without permission.`);
                return new Response(JSON.stringify({ error: "Prohibido: Se requieren permisos de administrador" }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            console.log(`Admin user authenticated: ${user.email} (${user.id})`);
        }

        // Configuration and environment variables
        const projectRef = Deno.env.get('SUPABASE_PROJECT_ID');
        if (!projectRef && (isAuthHook || !body.link)) {
            // Need projectRef to construct auth links
            throw new Error("SUPABASE_PROJECT_ID not configured");
        }
        
        const supabaseAuthUrl = `https://${projectRef}.supabase.co/auth/v1`;
        const envSiteUrl = Deno.env.get('SITE_URL') || "https://linka-studio.com";

        // Determine Action and Template
        let action = body.action || 'user_registration';
        let templateKey: keyof typeof templates = 'user_registration';
        const rawType = body.email_data?.email_action_type || body.mailer?.otp_type || body.otc_type || body.otp_type;

        if (isDatabaseWebhook) {
            console.log("Context: Database Webhook (profiles INSERT)");
            action = 'user_registration';
            templateKey = 'welcome_social';
            // Normalize body values for subsequent logic
            body.email = body.record?.email;
            body.fullName = body.record?.full_name;
            // Provide a default "Get Started" link
            body.link = envSiteUrl + "/login";
        } else if (isAuthHook) {
            console.log("Context: Supabase Auth Hook");
            if (rawType === 'recovery') {
                action = 'password_recovery';
                templateKey = 'password_recovery';
            } else {
                action = 'user_registration';
                templateKey = 'user_registration';
            }
        } else {
            console.log("Context: Manual Call Verified");
            // Only allow existing simple actions
            if (Object.keys(templates).includes(action)) {
                templateKey = action as keyof typeof templates;
            }
        }

        // 3. Construct and Normalize the verification/target link
        let link = body.link || body.confirmation_url || body.email_data?.confirmation_url;

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
            source: isAuthHook ? 'supabase_auth_hook' : (isDatabaseWebhook ? 'database_webhook' : 'manual_call'),
            raw_event: rawType
        };

        const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL');
        if (!n8nUrl) {
            console.error("N8N_WEBHOOK_URL not configured");
            return new Response(JSON.stringify({ error: "N8N delivery skipped: URL not configured" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Return 200 to acknowledge receipt even if delivery is skipped locally
            });
        }

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

