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

  // Base de datos simulada de usuarios con roles
  const users = [
    {
      id: 1,
      email: 'demo@example.com',
      name: 'Usuario Demo',
      role: 'approved',
      createdAt: '2024-01-01T00:00:00.000Z',
      leadId: 'demo-lead-1'
    },
    {
      id: 2,
      email: 'test@example.com',
      name: 'Usuario Test',
      role: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z',
      leadId: 'test-lead-1'
    },
    {
      id: 3,
      email: 'admin@example.com',
      name: 'Administrador',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 4,
      email: 'rejected@example.com',
      name: 'Usuario Rechazado',
      role: 'rejected',
      createdAt: '2024-01-01T00:00:00.000Z',
      leadId: 'rejected-lead-1'
    }
  ];

  // Buscar usuario
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }

  console.log(`✅ Usuario logueado: ${user.email} (role: ${user.role})`);

  return res.status(200).json({ 
    success: true,
    user,
    message: 'Login exitoso'
  });
} 