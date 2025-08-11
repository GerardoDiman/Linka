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

    // Detectar nombres reales de propiedades en la DB (variantes: 'Rol / Cargo' vs 'Rol/Cargo', 'Estado' vs 'Status', etc.)
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const props = db.properties || {};

    const pickProp = (...candidates) => candidates.find(k => Object.prototype.hasOwnProperty.call(props, k));

    const nameKey = pickProp('Nombre', 'Name') || 'Nombre';
    const emailKey = pickProp('Email', 'Correo', 'E-mail') || 'Email';
    const companyKey = pickProp('Empresa', 'Company') || 'Empresa';
    const roleKey = pickProp('Rol / Cargo', 'Rol/Cargo', 'Cargo', 'Rol');
    const descriptionKey = pickProp('Descripción', 'Descripcion', 'Description') || 'Descripción';
    const statusKey = pickProp('Estado', 'Status') || 'Estado';
    const dateKey = pickProp('Fecha de Registro', 'Fecha', 'Fecha registro') || 'Fecha de Registro';
    const sourceKey = pickProp('Fuente', 'Source') || 'Fuente';

    // Determinar valores válidos para selects
    const statusOptions = props[statusKey]?.select?.options?.map(o => o.name) || [];
    const pendingValue = statusOptions.includes('Pending')
      ? 'Pending'
      : (statusOptions.includes('Pendiente') ? 'Pendiente' : (statusOptions[0] || 'Pending'));

    const roleOptions = props[roleKey]?.select?.options?.map(o => o.name) || [];
    const roleValue = roleOptions.includes(role) ? role : (roleOptions[0] || 'No especificado');

    // Crear entrada en Notion con los nombres detectados
    const properties = {};
    properties[nameKey] = {
      title: [{ text: { content: `${firstName} ${lastName}` } }]
    };
    properties[emailKey] = { email };
    properties[companyKey] = { rich_text: [{ text: { content: company || 'No especificada' } }] };
    if (roleKey) {
      properties[roleKey] = { select: { name: roleValue } };
    }
    properties[descriptionKey] = { rich_text: [{ text: { content: description } }] };
    properties[statusKey] = { select: { name: pendingValue } };
    properties[dateKey] = { date: { start: new Date().toISOString() } };
    properties[sourceKey] = { select: { name: source || 'Landing Page' } };

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties
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