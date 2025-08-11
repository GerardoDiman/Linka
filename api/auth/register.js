// api/auth/register.js

// Simulación de base de datos en memoria (persistente entre invocaciones en serverless)
if (!global.users) {
  global.users = [
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
}

export default async function handler(req, res) {
  console.log("Método recibido:", req.method);
  console.log("Body recibido:", req.body);
  
  // Siempre agregar los headers de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Verificar si el usuario ya existe
  const existingUser = global.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  // Simular creación de usuario con rol pending por defecto
  const user = {
    id: Date.now(),
    email,
    name: name || email.split('@')[0],
    role: 'pending', // Por defecto, todos los nuevos usuarios son pending
    createdAt: new Date().toISOString()
  };
  
  global.users.push(user);

  console.log(`✅ Usuario registrado: ${user.email} (role: ${user.role})`);

  return res.status(200).json({
    success: true,
    user,
    message: 'Usuario registrado exitosamente. Tu solicitud está en revisión.'
  });
}