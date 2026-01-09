
export default async function handler(req, res) {
    // Notion endpoint
    const NOTION_URL = 'https://api.notion.com/v1/search';

    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    try {
        const response = await fetch(NOTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': req.headers.authorization || '',
                'Notion-Version': req.headers['notion-version'] || '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        // Forward the status from Notion
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
