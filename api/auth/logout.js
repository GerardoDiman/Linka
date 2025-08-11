import { initDatabase, getPool } from '../_lib/database.js';

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

  const { token } = req.body || {};
  const header = req.headers['authorization'];
  const bearer = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const t = token || bearer;
  if (!t) return res.status(400).json({ error: 'Token requerido' });

  await pool.query('DELETE FROM sessions WHERE token=$1', [t]);

  return res.status(200).json({ success: true, message: 'Logout exitoso' });
}