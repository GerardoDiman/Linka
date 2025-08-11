import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { firstName, lastName, email, company, role, description, source } = req.body;

    // Validar campos requeridos
    if (!firstName || !lastName || !email || !role || !description) {
      return res.status(400).json({ 
        error: 'Campos requeridos: firstName, lastName, email, role, description' 
      });
    }

    // Configurar cliente de Notion
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // ID de la base de datos de leads (se debe configurar en variables de entorno)
    const databaseId = process.env.NOTION_LEADS_DATABASE_ID;

    if (!databaseId) {
      console.error('❌ NOTION_LEADS_DATABASE_ID no configurado');
      return res.status(500).json({ 
        error: 'Configuración de base de datos no encontrada' 
      });
    }

    // Crear entrada en Notion
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        'Nombre': {
          title: [
            {
              text: {
                content: `${firstName} ${lastName}`,
              },
            },
          ],
        },
        'Email': {
          email: email,
        },
        'Empresa': {
          rich_text: [
            {
              text: {
                content: company || 'No especificada',
              },
            },
          ],
        },
        'Rol/Cargo': {
          select: {
            name: role,
          },
        },
        'Descripción': {
          rich_text: [
            {
              text: {
                content: description,
              },
            },
          ],
        },
        'Estado': {
          select: {
            name: 'Pendiente',
          },
        },
        'Fecha de Registro': {
          date: {
            start: new Date().toISOString(),
          },
        },
        'Fuente': {
          select: {
            name: source || 'Landing Page',
          },
        },
      },
    });

    console.log('✅ Lead creado en Notion:', {
      id: response.id,
      name: `${firstName} ${lastName}`,
      email: email,
      company: company,
      role: role
    });

    return res.status(200).json({
      success: true,
      message: 'Lead enviado exitosamente',
      leadId: response.id
    });

  } catch (error) {
    console.error('❌ Error creando lead en Notion:', error);

    if (error.code === 'unauthorized') {
      return res.status(401).json({
        error: 'Token de Notion inválido o sin permisos',
        details: 'Verifica que el token tenga acceso a la base de datos de leads'
      });
    }

    if (error.code === 'object_not_found') {
      return res.status(404).json({
        error: 'Base de datos de leads no encontrada',
        details: 'Verifica que el NOTION_LEADS_DATABASE_ID sea correcto'
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
} 