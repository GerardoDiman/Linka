import { initDatabase, getPool } from '../_lib/database.js';
import { verifyUserToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  await initDatabase();
  const pool = getPool();

  const header = req.headers['authorization'];
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || null);
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const user = await verifyUserToken(token);
  if (!user) return res.status(403).json({ error: 'Token inválido' });

  return res.status(200).json({ success: true, user });
}


