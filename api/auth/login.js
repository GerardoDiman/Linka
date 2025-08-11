import { initDatabase, getPool } from '../_lib/database.js';
import { hashPassword, generateToken } from '../_lib/auth.js';

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

  await initDatabase();
  const pool = getPool();

  // Password robusta por entorno (configurable en Vercel)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'L1nk@Admin_2025!';

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

  // Si es admin@linka.com, asegúrate de que exista en DB
  if (email === 'admin@linka.com') {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount === 0) {
      const passwordHash = await hashPassword(ADMIN_PASSWORD);
      await pool.query(
        `INSERT INTO users (email, password_hash, name, role, source, notes)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [email, passwordHash, 'Administrador', 'admin', 'Sistema', 'Admin creado en login serverless']
      );
    }
    const row = await pool.query('SELECT id, email, name, role FROM users WHERE email=$1', [email]);
    const u = row.rows[0];
    const token = generateToken(u.id, u.email, u.role);
    await pool.query('DELETE FROM sessions WHERE user_id=$1', [u.id]);
    await pool.query('INSERT INTO sessions (user_id, token, expires_at) VALUES ($1,$2,$3)', [u.id, token, new Date(Date.now() + 7*24*60*60*1000)]);
    console.log(`✅ Usuario logueado: ${u.email} (role: ${u.role})`);
    return res.status(200).json({ success: true, user: u, token, message: 'Login exitoso' });
  }

  // Usuarios demo: emitir token simulado sin DB
  const token = generateToken(user.id, user.email, user.role);

  console.log(`✅ Usuario logueado: ${user.email} (role: ${user.role})`);

  return res.status(200).json({
    success: true,
    user,
    token,
    message: 'Login exitoso'
  });
}