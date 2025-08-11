// api/auth/get-all-users.js

import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log("Método recibido:", req.method);
  
  // Siempre agregar los headers de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
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

    // Obtener todos los leads de la base de datos
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Fecha de Registro',
          direction: 'descending'
        }
      ],
      page_size: 100 // Máximo 100 usuarios por página
    });

    // Transformar los resultados a formato de usuario
    const users = response.results.map(lead => {
      const properties = lead.properties;
      
      return {
        id: lead.id,
        email: properties.Email?.email || '',
        name: properties.Nombre?.title?.[0]?.plain_text || '',
        role: properties.Estado?.select?.name?.toLowerCase() || 'pending',
        createdAt: properties['Fecha de Registro']?.date?.start || lead.created_time,
        leadId: lead.id,
        company: properties.Empresa?.rich_text?.[0]?.plain_text || '',
        roleTitle: properties['Rol/Cargo']?.select?.name || '',
        description: properties.Descripción?.rich_text?.[0]?.plain_text || '',
        source: properties.Fuente?.select?.name || 'Landing Page',
        notes: properties.Notas?.rich_text?.[0]?.plain_text || ''
      };
    });

    console.log(`✅ Usuarios obtenidos desde Notion: ${users.length} usuarios`);

    // Calcular estadísticas
    const stats = {
      total: users.length,
      pending: users.filter(u => u.role === 'pending').length,
      approved: users.filter(u => u.role === 'approved').length,
      rejected: users.filter(u => u.role === 'rejected').length,
      admin: users.filter(u => u.role === 'admin').length
    };

    return res.status(200).json({
      success: true,
      users,
      stats,
      message: `${users.length} usuarios encontrados`
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuarios desde Notion:', error);
    
    if (error.code === 'unauthorized') {
      return res.status(401).json({
        error: 'Token de Notion inválido o sin permisos',
        details: 'Verifica que el token tenga acceso a la base de datos de leads'
      });
    }

    if (error.code === 'object_not_found') {
      return res.status(404).json({
        error: 'Base de datos no encontrada',
        details: 'Verifica que el NOTION_LEADS_DATABASE_ID sea correcto'
      });
    }

    // Fallback a datos simulados si hay error de conexión
    const mockUsers = [
      {
        id: '1',
        email: 'demo@example.com',
        name: 'Usuario Demo',
        role: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z',
        leadId: 'demo-lead-1',
        company: 'Demo Company',
        roleTitle: 'Desarrollador',
        description: 'Usuario de demostración',
        source: 'Demo',
        notes: ''
      },
      {
        id: '2',
        email: 'test@example.com',
        name: 'Usuario Test',
        role: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z',
        leadId: 'test-lead-1',
        company: 'Test Company',
        roleTitle: 'Project Manager',
        description: 'Usuario de prueba',
        source: 'Landing Page',
        notes: ''
      },
      {
        id: '3',
        email: 'admin@example.com',
        name: 'Administrador',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        leadId: 'admin-lead-1',
        company: 'Admin Company',
        roleTitle: 'CEO/Founder',
        description: 'Administrador del sistema',
        source: 'Demo',
        notes: ''
      },
      {
        id: '4',
        email: 'rejected@example.com',
        name: 'Usuario Rechazado',
        role: 'rejected',
        createdAt: '2024-01-01T00:00:00.000Z',
        leadId: 'rejected-lead-1',
        company: 'Rejected Company',
        roleTitle: 'Consultor',
        description: 'Usuario rechazado',
        source: 'Landing Page',
        notes: 'No cumple con los criterios'
      }
    ];

    const stats = {
      total: mockUsers.length,
      pending: mockUsers.filter(u => u.role === 'pending').length,
      approved: mockUsers.filter(u => u.role === 'approved').length,
      rejected: mockUsers.filter(u => u.role === 'rejected').length,
      admin: mockUsers.filter(u => u.role === 'admin').length
    };

    console.log(`✅ Usuarios obtenidos (fallback): ${mockUsers.length} usuarios`);
    
    return res.status(200).json({
      success: true,
      users: mockUsers,
      stats,
      message: `${mockUsers.length} usuarios encontrados`,
      note: 'Usando datos de respaldo - verifica la configuración de Notion'
    });
  }
} 