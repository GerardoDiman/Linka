export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  // Simulación: acepta cualquier email y password no vacíos
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  // Simulación de usuario autenticado
  const user = { 
    id: Date.now(),
    email,
    name: email.split('@')[0],
    createdAt: new Date().toISOString()
  };

  return res.status(200).json({ 
    success: true,
    user,
    message: 'Login exitoso'
  });
} 