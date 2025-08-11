import crypto from 'crypto';
import pool from './database.js';

// Función para generar token de invitación
export function generateInvitationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Función para crear invitación
export async function createInvitation(email, invitedByUserId) {
  try {
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    
    const result = await pool.query(
      `INSERT INTO invitations (email, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, token, expires_at`,
      [email, token, invitedByUserId, expiresAt]
    );
    
    console.log(`📧 Invitación creada para: ${email}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando invitación:', error);
    throw error;
  }
}

// Función para verificar invitación
export async function verifyInvitation(token) {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as invited_by_name 
       FROM invitations i 
       LEFT JOIN users u ON i.invited_by = u.id 
       WHERE i.token = $1 AND i.status = 'pending' AND i.expires_at > NOW()`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error verificando invitación:', error);
    return null;
  }
}

// Función para marcar invitación como usada
export async function markInvitationAsUsed(token) {
  try {
    await pool.query(
      'UPDATE invitations SET status = $1, used_at = NOW() WHERE token = $2',
      ['used', token]
    );
    
    console.log(`✅ Invitación marcada como usada: ${token}`);
  } catch (error) {
    console.error('❌ Error marcando invitación como usada:', error);
    throw error;
  }
}

// Función para obtener invitaciones de un admin
export async function getInvitationsByAdmin(adminId) {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as invited_by_name 
       FROM invitations i 
       LEFT JOIN users u ON i.invited_by = u.id 
       WHERE i.invited_by = $1 
       ORDER BY i.created_at DESC`,
      [adminId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error obteniendo invitaciones:', error);
    throw error;
  }
}

// Función para limpiar invitaciones expiradas
export async function cleanupExpiredInvitations() {
  try {
    const result = await pool.query(
      'DELETE FROM invitations WHERE expires_at < NOW() AND status = $1',
      ['pending']
    );
    
    if (result.rowCount > 0) {
      console.log(`🧹 ${result.rowCount} invitaciones expiradas eliminadas`);
    }
  } catch (error) {
    console.error('❌ Error limpiando invitaciones expiradas:', error);
  }
} 