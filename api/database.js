import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Token de autorización requerido. Formato: Bearer tu_token_aqui' 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      res.status(400).json({ 
        error: 'Formato de token inválido. Debe comenzar con ntn_ o secret_' 
      });
      return;
    }

    // Obtener el ID de la base de datos de los parámetros de la URL
    const { id } = req.query;
    
    if (!id) {
      res.status(400).json({
        error: 'ID de base de datos requerido',
        details: 'Debe proporcionar un ID válido de base de datos'
      });
      return;
    }

    console.log(`🔍 Obteniendo base de datos específica: ${id}`);

    const notion = new Client({
      auth: token
    });

    // Obtener detalles de la base de datos específica
    const database = await notion.databases.retrieve({
      database_id: id
    });

    console.log(`✅ Base de datos obtenida: ${database.title?.[0]?.plain_text || id}`);

    res.status(200).json(database);

  } catch (error) {
    console.error(`❌ Error obteniendo base de datos ${req.query.id}:`, error);

    if (error.code === 'object_not_found') {
      res.status(404).json({
        error: 'Base de datos no encontrada',
        details: `No se pudo encontrar la base de datos con ID: ${req.query.id}`
      });
    } else if (error.code === 'unauthorized') {
      res.status(401).json({
        error: 'Sin permisos para acceder a esta base de datos',
        details: 'Asegúrate de haber compartido esta base de datos con tu integración'
      });
    } else {
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido al obtener la base de datos'
      });
    }
  }
} 