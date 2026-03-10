export const ALLOWED_ORIGINS = [
    'https://linka-studio.com',
    'https://linka-six.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

export function getCorsHeaders(req: Request) {
    const origin = req.headers.get('Origin') || ''
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    }
}
