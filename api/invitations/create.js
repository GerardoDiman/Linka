import { initDatabase, getPool } from '../_lib/database.js';
import { verifyUserToken } from '../_lib/auth.js';
import { sendWebhook } from '../_lib/webhook.js';
import crypto from 'crypto';

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

  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token) token = req.query.token;
  if (!token && req.body && typeof req.body.token === 'string') token = req.body.token;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const user = await verifyUserToken(token);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email es requerido' });

  // Evitar invitar usuarios existentes
  const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (exists.rowCount > 0) return res.status(400).json({ error: 'El usuario ya existe' });

  const invitationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7*24*60*60*1000);

  const ins = await pool.query(
    `INSERT INTO invitations (email, token, invited_by, expires_at)
     VALUES ($1,$2,$3,$4)
     RETURNING email, token, expires_at`,
    [email, invitationToken, user.id, expiresAt]
  );

  const invitationLink = `${process.env.FRONTEND_URL || 'https://linka-nine.vercel.app'}/register?token=${invitationToken}`;

  await sendWebhook('invitation_created', {
    email,
    invitedBy: user.id,
    invitationLink,
    expiresAt
  });

  return res.status(200).json({
    success: true,
    message: 'Invitación creada exitosamente',
    invitation: { email, token: invitationToken, link: invitationLink, expiresAt }
  });
}


