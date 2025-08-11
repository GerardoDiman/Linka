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

import { initDatabase, getPool } from '../_lib/database.js';
import { hashPassword, generateToken } from '../_lib/auth.js';
import { sendWebhook } from '../_lib/webhook.js';

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  await initDatabase();
  const pool = getPool();

  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rowCount > 0) return res.status(400).json({ error: 'El usuario ya existe' });

  const passwordHash = await hashPassword(password);
  const ins = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, source)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, role, created_at`,
    [email, passwordHash, name || email.split('@')[0], 'pending', 'Landing Page']
  );

  const user = {
    id: ins.rows[0].id,
    email: ins.rows[0].email,
    name: ins.rows[0].name,
    role: ins.rows[0].role,
    createdAt: ins.rows[0].created_at
  };

  const token = generateToken(user.id, user.email, user.role);
  await pool.query('INSERT INTO sessions (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, token, new Date(Date.now() + 7*24*60*60*1000)]);

  await sendWebhook('user_registered', { email: user.email, name: user.name, role: user.role, userId: user.id });

  return res.status(200).json({ success: true, user, token, message: 'Usuario registrado exitosamente' });
}