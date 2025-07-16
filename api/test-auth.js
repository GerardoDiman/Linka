export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🧪 Test Auth Endpoint:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });

  return res.status(200).json({ 
    success: true,
    message: 'Auth APIs funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    method: req.method
  });
} 