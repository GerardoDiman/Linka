import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS básico (mismo dominio o explícito si es cross-origin)
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  // Password robusta por entorno (configurable en Vercel)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'L1nk@Admin_2025!';
  const JWT_SECRET = process.env.JWT_SECRET || 'linka-secret-change-in-prod';

  // Usuarios demo + admin real
  const users = [
    { id: 1, email: 'demo@example.com', name: 'Usuario Demo', role: 'approved', createdAt: '2024-01-01T00:00:00.000Z', leadId: 'demo-lead-1' },
    { id: 2, email: 'test@example.com', name: 'Usuario Test', role: 'pending', createdAt: '2024-01-01T00:00:00.000Z', leadId: 'test-lead-1' },
    { id: 3, email: 'admin@example.com', name: 'Administrador', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
    // Admin solicitado
    { id: 54, email: 'admin@linka.com', name: 'Administrador', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 4, email: 'rejected@example.com', name: 'Usuario Rechazado', role: 'rejected', createdAt: '2024-01-01T00:00:00.000Z', leadId: 'rejected-lead-1' }
  ];

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }

  // Reglas de password
  if (email === 'admin@linka.com') {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } else {
    // Para usuarios demo, cualquier password no vacía
    if (!password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
  }

  // Emitir token compatible con el frontend
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log(`✅ Usuario logueado: ${user.email} (role: ${user.role})`);

  return res.status(200).json({
    success: true,
    user,
    token,
    message: 'Login exitoso'
  });
}