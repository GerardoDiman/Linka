// api/auth/check-status.js

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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
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

    // Buscar el lead en Notion por email
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Email',
        email: {
          equals: email
        }
      }
    });

    if (response.results.length === 0) {
      console.log('❌ Usuario no encontrado para verificación:', email);
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'No encontramos una solicitud con este email. ¿Ya enviaste tu solicitud?'
      });
    }

    const lead = response.results[0];
    const properties = lead.properties;

    // Extraer información del lead
    const userData = {
      id: lead.id,
      email: properties.Email?.email || email,
      name: properties.Nombre?.title?.[0]?.plain_text || email.split('@')[0],
      role: properties.Estado?.select?.name?.toLowerCase() || 'pending',
      createdAt: properties['Fecha de Registro']?.date?.start || lead.created_time,
      leadId: lead.id,
      company: properties.Empresa?.rich_text?.[0]?.plain_text || '',
      roleTitle: properties['Rol/Cargo']?.select?.name || '',
      description: properties.Descripción?.rich_text?.[0]?.plain_text || ''
    };

    console.log(`✅ Estado verificado desde Notion: ${userData.email} (role: ${userData.role})`);

    return res.status(200).json({
      success: true,
      user: userData,
      message: `Estado actual: ${userData.role}`
    });

  } catch (error) {
    console.error('❌ Error verificando estado en Notion:', error);
    
    // Fallback a datos simulados si hay error de conexión
    const mockUsers = [
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

    const mockUser = mockUsers.find(u => u.email === email);
    
    if (mockUser) {
      console.log(`✅ Estado verificado (fallback): ${mockUser.email} (role: ${mockUser.role})`);
      return res.status(200).json({
        success: true,
        user: mockUser,
        message: `Estado actual: ${mockUser.role}`,
        note: 'Usando datos de respaldo - verifica la configuración de Notion'
      });
    }

    return res.status(404).json({ 
      error: 'Usuario no encontrado',
      message: 'No encontramos una solicitud con este email. ¿Ya enviaste tu solicitud?'
    });
  }
} 