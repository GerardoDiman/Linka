import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPool } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'linka-secret-change-in-prod';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function generateToken(userId, email, role) {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyUserToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const pool = getPool();
    const session = await pool.query('SELECT user_id FROM sessions WHERE token=$1 AND expires_at > NOW()', [token]);
    if (session.rowCount === 0) return null;
    const user = await pool.query('SELECT id, email, name, role FROM users WHERE id=$1', [decoded.userId]);
    return user.rows[0] || null;
  } catch (e) {
    return null;
  }
}


