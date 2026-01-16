export function populateTemplate(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        result = result.replaceAll(placeholder, value || "");
    }
    return result;
}

const logoUrl = "https://gnuedinkyheevdkfyujm.supabase.co/storage/v1/object/public/assets/linka_logo.png";

const baseStyle = `
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 40px 20px; }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background: #ffffff; 
        border-radius: 12px; 
        border: 1px solid #e2e8f0; 
        overflow: hidden; 
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        animation: fadeIn 0.6s ease-out;
    }

    .header { padding: 32px; text-align: center; }
    .logo-img { width: 80px; height: auto; margin-bottom: 8px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; opacity: 1; }
    
    .content { padding: 40px; color: #1e293b; line-height: 1.6; }
    .content h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; }
    
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { 
        display: inline-block; 
        padding: 14px 32px; 
        color: #ffffff !important; 
        text-decoration: none; 
        border-radius: 8px; 
        font-weight: 600; 
        transition: all 0.2s ease;
    }

    .footer { padding: 24px; background-color: #f8fafc; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .link-alt { word-break: break-all; font-size: 11px; color: #94a3b8; margin-top: 24px; padding: 12px; background: #f8fafc; border-radius: 6px; }

    @media (prefers-color-scheme: dark) {
        body { background-color: #0f172a !important; }
        .container { background-color: #1e293b !important; border-color: #334155 !important; }
        .content { color: #e2e8f0 !important; }
        .content h2 { color: #ffffff !important; }
        .footer { background-color: #1e293b !important; color: #94a3b8 !important; border-color: #334155 !important; }
        .link-alt { background-color: #0f172a !important; color: #64748b !important; }
    }
`;

const headerHtml = `
    <div class="header">
        <img src="${logoUrl}" alt="Linka Logo" class="logo-img">
        <h1>LINKA</h1>
    </div>
`;

export const templates = {
    user_registration: `
<!DOCTYPE html>
<html>
<head><style>${baseStyle} .header { background-color: #2563eb; } .btn { background-color: #2563eb; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
    <h2>Welcome to Linka, {{fullName}}!</h2>
    <p>We're excited to have you on board. Please confirm your email address to start exploring your data.</p>
    <div class="btn-container"><a href="{{link}}" class="btn">Verify Account</a></div>
</div><div class="footer"><p>&copy; 2024 Linka. All rights reserved.</p></div></div></div></body></html>`,

    password_recovery: `
<!DOCTYPE html>
<html>
<head><style>${baseStyle} .header { background-color: #dc2626; } .btn { background-color: #dc2626; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
    <div class="btn-container"><a href="{{link}}" class="btn">Reset Password</a></div>
</div><div class="footer"><p>&copy; 2024 Linka. Security first.</p></div></div></div></body></html>`,

    waitlist_request: `
<!DOCTYPE html>
<html>
<head><style>${baseStyle} .header { background-color: #d97706; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
    <h2>You're on the list, {{fullName}}!</h2>
    <p>Thank you for your interest. We've received your request to join the waitlist. We'll notify you as soon as a spot becomes available.</p>
    <p>In the meantime, stay tuned for updates!</p>
</div><div class="footer"><p>&copy; 2024 Linka. All rights reserved.</p></div></div></div></body></html>`,

    user_approval: `
<!DOCTYPE html>
<html>
<head><style>${baseStyle} .header { background-color: #16a34a; } .btn { background-color: #16a34a; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
    <h2>You've been approved, {{fullName}}!</h2>
    <p>Great news! Your account has been reviewed and approved. You can now access all of Linka's platform features.</p>
    <div class="btn-container"><a href="https://linka-six.vercel.app/register" class="btn">Sign Up Now</a></div>
</div><div class="footer"><p>&copy; 2024 Linka. Welcome aboard!</p></div></div></div></body></html>`,

    user_rejected: `
<!DOCTYPE html>
<html>
<head><style>${baseStyle} .header { background-color: #475569; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
    <h2>Update Regarding Your Request</h2>
    <p>Hello {{fullName}}, thank you for your interest in Linka. Unfortunately, we are unable to approve your request at this time due to limited capacity.</p>
    <p>We appreciate your understanding.</p>
</div><div class="footer"><p>&copy; 2024 Linka. Best regards.</p></div></div></div></body></html>`,

    special_invitation: `
<!DOCTYPE html>
<html>
<head><style>${baseStyle} .header { background-color: #4f46e5; } .btn { background-color: #4f46e5; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
    <h2>Special Invitation!</h2>
    <p>Hello {{fullName}}, you've been selected for exclusive early access to Linka's latest features.</p>
    <div class="btn-container"><a href="https://linka-six.vercel.app/register" class="btn">Claim Your Access</a></div>
</div><div class="footer"><p>&copy; 2024 Linka. Exclusive Invitation.</p></div></div></div></body></html>`
};
