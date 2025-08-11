import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 días

// Función para hashear contraseña
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Función para verificar contraseña
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Función para generar JWT token
export function generateToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Función para verificar JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Función para registrar usuario
export async function registerUser(userData) {
  const { email, password, name, notionLeadId, company, roleTitle, description, source } = userData;
  
  try {
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('El usuario ya existe');
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, notion_lead_id, company, role_title, description, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, notionLeadId, company, roleTitle, description, source]
    );

    const user = result.rows[0];
    
    // Generar token
    const token = generateToken(user.id, user.email, user.role);

    // Guardar sesión
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 días
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };

  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    throw error;
  }
}

// Función para login
export async function loginUser(email, password) {
  try {
    // Buscar usuario
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas');
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken(user.id, user.email, user.role);

    // Guardar sesión
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 días
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };

  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

// Función para verificar token
export async function verifyUserToken(token) {
  try {
    // Verificar JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Verificar si la sesión existe y no ha expirado
    const sessionResult = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    // Obtener datos del usuario
    const userResult = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return userResult.rows[0];

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return null;
  }
}

// Función para logout
export async function logoutUser(token) {
  try {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    return { success: true };
  } catch (error) {
    console.error('❌ Error en logout:', error);
    throw error;
  }
}

// Función para limpiar sesiones expiradas
export async function cleanupExpiredSessions() {
  try {
    await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
  } catch (error) {
    console.error('❌ Error limpiando sesiones:', error);
  }
} 