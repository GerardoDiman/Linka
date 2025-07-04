const http = require('http');
const url = require('url');
const { Client } = require('@notionhq/client');

const PORT = 3003;

// Función para manejar CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Función para parsear el body de la request
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

// Función para manejar búsqueda de bases de datos
async function handleDatabases(req, res) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.end(JSON.stringify({ 
        error: 'Token de autorización requerido. Formato: Bearer tu_token_aqui' 
      }));
      return;
    }

    const token = authHeader.substring(7);
    
    // Validar formato del token
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      res.statusCode = 400;
      res.end(JSON.stringify({ 
        error: 'Formato de token inválido. Debe comenzar con ntn_ o secret_' 
      }));
      return;
    }

    console.log('🔍 [SIMPLE] Buscando bases de datos con token del usuario...');

    // Crear cliente de Notion
    const notion = new Client({
      auth: token
    });

    // Buscar bases de datos
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 100
    });

    console.log(`✅ [SIMPLE] Encontradas ${response.results.length} bases de datos`);

    // Enriquecer datos
    const enrichedDatabases = await Promise.all(
      response.results.map(async (db) => {
        try {
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
          console.warn(`[SIMPLE] No se pudo obtener detalles de ${db.id}:`, error.message);
          return db;
        }
      })
    );

    const result = {
      results: enrichedDatabases,
      next_cursor: response.next_cursor,
      has_more: response.has_more,
      type: response.type,
      page_or_database: response.page_or_database,
      request_id: response.request_id
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));

  } catch (error) {
    console.error('❌ [SIMPLE] Error en la API:', error);

    if (error.code === 'unauthorized') {
      res.statusCode = 401;
      res.end(JSON.stringify({
        error: 'Token inválido o sin permisos',
        details: 'Verifica que el token sea correcto y que la integración tenga acceso a las bases de datos'
      }));
    } else if (error.code === 'restricted_resource') {
      res.statusCode = 403;
      res.end(JSON.stringify({
        error: 'Sin permisos para acceder a los recursos',
        details: 'Asegúrate de haber compartido las bases de datos con tu integración'
      }));
    } else if (error.code === 'rate_limited') {
      res.statusCode = 429;
      res.end(JSON.stringify({
        error: 'Límite de requests excedido',
        details: 'Intenta de nuevo en unos segundos'
      }));
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido al conectar con Notion'
      }));
    }
  }
}

// Función para obtener una base de datos específica
async function handleSingleDatabase(req, res, databaseId) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.end(JSON.stringify({ 
        error: 'Token de autorización requerido. Formato: Bearer tu_token_aqui' 
      }));
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      res.statusCode = 400;
      res.end(JSON.stringify({ 
        error: 'Formato de token inválido. Debe comenzar con ntn_ o secret_' 
      }));
      return;
    }

    console.log(`🔍 [SIMPLE] Obteniendo detalles de base de datos: ${databaseId}`);

    const notion = new Client({
      auth: token
    });

    // Obtener detalles de la base de datos específica
    const database = await notion.databases.retrieve({
      database_id: databaseId
    });

    console.log(`✅ [SIMPLE] Detalles obtenidos para: ${database.title?.[0]?.plain_text || databaseId}`);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(database));

  } catch (error) {
    console.error(`❌ [SIMPLE] Error obteniendo base de datos ${databaseId}:`, error);

    if (error.code === 'object_not_found') {
      res.statusCode = 404;
      res.end(JSON.stringify({
        error: 'Base de datos no encontrada',
        details: `No se pudo encontrar la base de datos con ID: ${databaseId}`
      }));
    } else if (error.code === 'unauthorized') {
      res.statusCode = 401;
      res.end(JSON.stringify({
        error: 'Sin permisos para acceder a esta base de datos',
        details: 'Asegúrate de haber compartido esta base de datos con tu integración'
      }));
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido al obtener la base de datos'
      }));
    }
  }
}

// Función para probar conexión
async function handleTestConnection(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.end(JSON.stringify({ 
        error: 'Token de autorización requerido',
        success: false 
      }));
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      res.statusCode = 400;
      res.end(JSON.stringify({ 
        error: 'Formato de token inválido',
        success: false 
      }));
      return;
    }

    console.log('🧪 [SIMPLE] Probando conexión con Notion...');

    const notion = new Client({
      auth: token
    });

    const botInfo = await notion.users.me();
    
    console.log('✅ [SIMPLE] Conexión exitosa:', botInfo.name || 'Bot sin nombre');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      bot: {
        id: botInfo.id,
        name: botInfo.name || 'Integración de Notion',
        type: botInfo.type,
        avatar_url: botInfo.avatar_url
      },
      message: 'Conexión exitosa con Notion'
    }));

  } catch (error) {
    console.error('❌ [SIMPLE] Error al probar conexión:', error);

    if (error.code === 'unauthorized') {
      res.statusCode = 401;
      res.end(JSON.stringify({
        success: false,
        error: 'Token inválido',
        details: 'El token proporcionado no es válido o ha expirado'
      }));
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({
        success: false,
        error: 'Error de conexión',
        details: error.message || 'No se pudo conectar con Notion'
      }));
    }
  }
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
  // Configurar CORS
  setCORSHeaders(res);

  // Parsear URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`📝 [SIMPLE] ${method} ${path}`);

  // Manejar OPTIONS (CORS preflight)
  if (method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Enrutar requests
  if (method === 'GET' && path === '/notion/databases') {
    await handleDatabases(req, res);
  } else if (method === 'GET' && path === '/notion/test-connection') {
    await handleTestConnection(req, res);
  } else if (method === 'GET' && path.startsWith('/notion/databases/')) {
    // Manejar requests específicos de base de datos: /notion/databases/{id}
    const databaseId = path.split('/notion/databases/')[1];
    await handleSingleDatabase(req, res, databaseId);
  } else {
    // 404 - Not found
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Endpoint no encontrado',
      availableEndpoints: [
        'GET /notion/databases',
        'GET /notion/databases/{id}',
        'GET /notion/test-connection'
      ]
    }));
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 [SIMPLE] Servidor proxy corriendo en http://localhost:${PORT}`);
  console.log(`📊 [SIMPLE] Frontend debería conectarse a: http://localhost:${PORT}/notion`);
  console.log(`💡 [SIMPLE] Este servidor usa HTTP nativo (sin Express)`);
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log(`   GET http://localhost:${PORT}/notion/databases`);
  console.log(`   GET http://localhost:${PORT}/notion/databases/{id}`);
  console.log(`   GET http://localhost:${PORT}/notion/test-connection`);
}); 