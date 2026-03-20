export const ALLOWED_ORIGINS = [
    'https://linka-studio.com',
    'https://linka-six.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

export function getCorsHeaders(req: Request) {
    const origin = req.headers.get('Origin') || ''

    if (!ALLOWED_ORIGINS.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': '',
            'Access-Control-Allow-Headers': '',
            'Access-Control-Allow-Methods': '',
        }
    }

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    }
}
