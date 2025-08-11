// api/auth/update-user-status.js

import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log("Método recibido:", req.method);
  console.log("Body recibido:", req.body);
  
  // Siempre agregar los headers de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

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

    // Preparar las propiedades a actualizar
    const propertiesToUpdate = {
      'Estado': {
        select: {
          name: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) // Capitalizar primera letra
        }
      }
    };

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