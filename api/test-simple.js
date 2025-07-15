export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Respuesta simple para cualquier método
  res.json({ 
    message: 'Simple test working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
} 