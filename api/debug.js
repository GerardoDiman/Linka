export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Información de debug
  const debugInfo = {
    method: req.method,
    url: req.url,
    path: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: {
      region: process.env.VERCEL_REGION,
      function: process.env.VERCEL_FUNCTION_NAME,
      deployment: process.env.VERCEL_DEPLOYMENT_ID
    }
  };

  console.log('🔍 Debug request:', debugInfo);

  return res.status(200).json({
    message: 'Debug endpoint working',
    debug: debugInfo,
    availableEndpoints: [
      'GET /api/hello',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/databases',
      'GET /api/database',
      'GET /api/test-connection'
    ]
  });
} 