import { Client } from '@notionhq/client';
import pool from './database.js';
import dotenv from 'dotenv';
import { hashPassword } from './auth-db.js';

dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_LEADS_DATABASE_ID;

// Función para sincronizar un usuario desde Notion a PostgreSQL
export async function syncUserFromNotion(notionPageId) {
  try {
    console.log(`🔄 Sincronizando usuario desde Notion: ${notionPageId}`);
    
    // Obtener datos del usuario desde Notion
    const response = await notion.pages.retrieve({ page_id: notionPageId });
    const properties = response.properties;
    
    // Extraer datos del usuario
    const email = properties['Email']?.email || properties['Email']?.rich_text?.[0]?.plain_text;
    const name = properties['Nombre']?.rich_text?.[0]?.plain_text || 
                 properties['Name']?.rich_text?.[0]?.plain_text ||
                 email?.split('@')[0];
    const role = properties['Estado']?.select?.name || 'pending';
    const company = properties['Empresa']?.rich_text?.[0]?.plain_text || '';
    const roleTitle = properties['Rol / Cargo']?.rich_text?.[0]?.plain_text || '';
    const description = properties['Descripción']?.rich_text?.[0]?.plain_text || '';
    const source = properties['Origen']?.select?.name || 'Landing Page';
    const notes = properties['Notas Admin']?.rich_text?.[0]?.plain_text || '';
    
    if (!email) {
      console.log('⚠️ Email no encontrado en Notion, saltando sincronización');
      return null;
    }
    
    // Verificar si el usuario ya existe en PostgreSQL
    const existingUser = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length === 0) {
      // Crear nuevo usuario en PostgreSQL
      console.log(`✅ Creando nuevo usuario en PostgreSQL: ${email}`);
      
      // Generar contraseña temporal para usuarios de Notion
      const tempPassword = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await hashPassword(tempPassword);
      
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, notion_lead_id, company, role_title, description, source, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, email, name, role`,
        [email, passwordHash, name, role, notionPageId, company, roleTitle, description, source, notes]
      );
      
      console.log(`✅ Usuario creado en PostgreSQL: ${result.rows[0].email} (role: ${result.rows[0].role})`);
      return result.rows[0];
      
    } else {
      // Actualizar usuario existente
      const currentRole = existingUser.rows[0].role;
      
      if (currentRole !== role) {
        console.log(`🔄 Actualizando rol de usuario: ${email} (${currentRole} → ${role})`);
        
        await pool.query(
          `UPDATE users 
           SET role = $1, name = $2, company = $3, role_title = $4, description = $5, source = $6, notes = $7, updated_at = NOW()
           WHERE email = $8`,
          [role, name, company, roleTitle, description, source, notes, email]
        );
        
        console.log(`✅ Rol actualizado en PostgreSQL: ${email} (${currentRole} → ${role})`);
      }
      
      return existingUser.rows[0];
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando usuario desde Notion:', error);
    throw error;
  }
}

// Función para sincronizar todos los usuarios desde Notion
export async function syncAllUsersFromNotion() {
  try {
    console.log('🔄 Iniciando sincronización completa desde Notion...');
    
    if (!DATABASE_ID) {
      console.log('⚠️ NOTION_LEADS_DATABASE_ID no configurado, saltando sincronización');
      return;
    }
    
    if (!process.env.NOTION_TOKEN) {
      console.log('⚠️ NOTION_TOKEN no configurado, saltando sincronización');
      return;
    }
    
    // Obtener todos los leads desde Notion
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });
    
    console.log(`📊 Encontrados ${response.results.length} leads en Notion`);
    
    let syncedCount = 0;
    let updatedCount = 0;
    
    for (const page of response.results) {
      try {
        const result = await syncUserFromNotion(page.id);
        if (result) {
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Error sincronizando página ${page.id}:`, error);
      }
    }
    
    console.log(`✅ Sincronización completada: ${syncedCount} usuarios procesados`);
    
  } catch (error) {
    console.error('❌ Error en sincronización completa:', error);
    
    // Manejar errores de red específicamente
    if (error.code === 'ENOTFOUND' || error.message?.includes('fetch failed')) {
      console.log('⚠️ Error de conexión a Notion. Verificando configuración de red...');
      return;
    }
    
    throw error;
  }
}

// Función para sincronizar un usuario específico por email
export async function syncUserByEmail(email) {
  try {
    console.log(`🔄 Buscando usuario por email en Notion: ${email}`);
    
    if (!DATABASE_ID) {
      console.log('⚠️ NOTION_LEADS_DATABASE_ID no configurado');
      return null;
    }
    
    // Buscar en Notion por email
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Email',
        email: {
          equals: email
        }
      }
    });
    
    if (response.results.length === 0) {
      console.log(`⚠️ Usuario no encontrado en Notion: ${email}`);
      return null;
    }
    
    // Sincronizar el primer resultado encontrado
    const page = response.results[0];
    return await syncUserFromNotion(page.id);
    
  } catch (error) {
    console.error('❌ Error sincronizando usuario por email:', error);
    throw error;
  }
}

// Función para verificar si Notion está configurado
export function isNotionConfigured() {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_LEADS_DATABASE_ID);
}

// Función para obtener estadísticas de sincronización
export async function getSyncStats() {
  try {
    const pgUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const pgSessions = await pool.query('SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()');
    
    let notionUsers = 0;
    if (isNotionConfigured()) {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
      });
      notionUsers = response.results.length;
    }
    
    return {
      postgresUsers: pgUsers.rows[0].count,
      postgresActiveSessions: pgSessions.rows[0].count,
      notionUsers,
      notionConfigured: isNotionConfigured()
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return null;
  }
} 