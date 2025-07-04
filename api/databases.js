const { Client } = require('@notionhq/client');

module.exports = async function handler(req, res) {
  // Configurar CORS para permitir requests desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verificar que sea GET request
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

    const token = authHeader.substring(7); // Remover "Bearer "
    
    // Validar formato del token
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      res.status(400).json({ 
        error: 'Formato de token inválido. Debe comenzar con ntn_ o secret_' 
      });
      return;
    }

    // Crear cliente de Notion con el token del usuario
    const notion = new Client({
      auth: token
    });

    console.log('🔍 Buscando bases de datos con token del usuario...');

    // Buscar todas las bases de datos
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 100
    });

    console.log(`✅ Encontradas ${response.results.length} bases de datos`);

    // Procesar y enriquecer los datos
    const enrichedDatabases = await Promise.all(
      response.results.map(async (db) => {
        try {
          // Obtener detalles completos de cada base de datos
          const details = await notion.databases.retrieve({
            database_id: db.id
          });
          
          return {
            ...db,
            properties: details.properties || {},
            description: details.description || [],
            title: details.title || db.title || [],
            created_time: details.created_time || db.created_time,
            last_edited_time: details.last_edited_time || db.last_edited_time,
            cover: details.cover || db.cover,
            icon: details.icon || db.icon
          };
        } catch (error) {
          console.warn(`No se pudo obtener detalles de ${db.id}:`, error.message);
          return db; // Retornar datos básicos si hay error
        }
      })
    );

    // Estructura de respuesta compatible con el frontend
    const result = {
      results: enrichedDatabases,
      next_cursor: response.next_cursor,
      has_more: response.has_more,
      type: response.type,
      page_or_database: response.page_or_database,
      request_id: response.request_id
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error en la API:', error);

    // Manejar diferentes tipos de errores
    if (error.code === 'unauthorized') {
      res.status(401).json({
        error: 'Token inválido o sin permisos',
        details: 'Verifica que el token sea correcto y que la integración tenga acceso a las bases de datos'
      });
    } else if (error.code === 'restricted_resource') {
      res.status(403).json({
        error: 'Sin permisos para acceder a los recursos',
        details: 'Asegúrate de haber compartido las bases de datos con tu integración'
      });
    } else if (error.code === 'rate_limited') {
      res.status(429).json({
        error: 'Límite de requests excedido',
        details: 'Intenta de nuevo en unos segundos'
      });
    } else {
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido al conectar con Notion'
      });
    }
  }
} 