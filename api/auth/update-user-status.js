// api/auth/update-user-status.js

import { Client } from '@notionhq/client';
import { initDatabase, getPool } from '../_lib/database.js';
import { verifyUserToken } from '../_lib/auth.js';
import { sendWebhook } from '../_lib/webhook.js';

export default async function handler(req, res) {
  console.log("Método recibido:", req.method);
  console.log("Body recibido:", req.body);
  
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

  await initDatabase();
  const pool = getPool();

  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token) token = req.query.token;
  if (!token && req.body && typeof req.body.token === 'string') token = req.body.token;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const authUser = await verifyUserToken(token);
  if (!authUser || authUser.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });

  const { leadId, newStatus, adminNotes } = req.body;

  if (!leadId || !newStatus) {
    return res.status(400).json({ error: 'leadId y newStatus son requeridos' });
  }

  // Validar que el nuevo estado sea válido
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser: pending, approved, o rejected' });
  }

  try {
    // Configurar cliente de Notion
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    const databaseId = process.env.NOTION_LEADS_DATABASE_ID;

    if (!databaseId) {
      console.error('❌ NOTION_LEADS_DATABASE_ID no configurado');
      return res.status(500).json({ 
        error: 'Configuración de base de datos no encontrada' 
      });
    }

    // Detectar clave real y opciones del select de estado
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const props = db.properties || {};
    const statusKey = Object.prototype.hasOwnProperty.call(props, 'Estado') ? 'Estado' : (Object.prototype.hasOwnProperty.call(props, 'Status') ? 'Status' : 'Estado');
    const options = props[statusKey]?.select?.options?.map(o => o.name) || [];
    const mapDesired = (val) => {
      const candidates = { approved: ['Approved','Aprobado'], pending: ['Pending','Pendiente'], rejected: ['Rejected','Rechazado'], admin: ['Admin','Administrador'] }[val] || [];
      for (const c of candidates) if (options.includes(c)) return c;
      return options[0] || val.charAt(0).toUpperCase() + val.slice(1);
    };
    const notionStatus = mapDesired(newStatus);

    const propertiesToUpdate = { [statusKey]: { select: { name: notionStatus } } };

    // Agregar notas del administrador si se proporcionan
    if (adminNotes) {
      propertiesToUpdate['Notas'] = {
        rich_text: [
          {
            text: {
              content: `${new Date().toLocaleString()}: ${adminNotes}`
            }
          }
        ]
      };
    }

    // Actualizar la página en Notion
    const response = await notion.pages.update({
      page_id: leadId,
      properties: propertiesToUpdate
    });

    console.log(`✅ Estado actualizado en Notion: ${leadId} → ${newStatus}`);

    // Sincronizar en Neon (si existe el usuario)
    await pool.query(
      `UPDATE users SET role=$1, updated_at=NOW() WHERE notion_lead_id=$2`,
      [newStatus, leadId]
    );

    await sendWebhook('user_status_changed', {
      email: userData.email,
      name: userData.name,
      oldStatus: 'pending',
      newStatus,
      adminNotes,
      notionId: leadId
    });

    // Obtener la información actualizada del usuario
    const updatedPage = await notion.pages.retrieve({
      page_id: leadId
    });

    const properties = updatedPage.properties;
    const userData = {
      id: updatedPage.id,
      email: properties.Email?.email || '',
      name: properties.Nombre?.title?.[0]?.plain_text || '',
      role: properties.Estado?.select?.name?.toLowerCase() || 'pending',
      createdAt: properties['Fecha de Registro']?.date?.start || updatedPage.created_time,
      leadId: updatedPage.id,
      company: properties.Empresa?.rich_text?.[0]?.plain_text || '',
      roleTitle: properties['Rol/Cargo']?.select?.name || '',
      description: properties.Descripción?.rich_text?.[0]?.plain_text || ''
    };

    return res.status(200).json({
      success: true,
      user: userData,
      message: `Estado actualizado exitosamente a: ${newStatus}`
    });

  } catch (error) {
    console.error('❌ Error actualizando estado en Notion:', error);
    
    if (error.code === 'unauthorized') {
      return res.status(401).json({
        error: 'Token de Notion inválido o sin permisos',
        details: 'Verifica que el token tenga acceso a la base de datos de leads'
      });
    }

    if (error.code === 'object_not_found') {
      return res.status(404).json({
        error: 'Lead no encontrado',
        details: 'El ID del lead proporcionado no existe en la base de datos'
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
} 