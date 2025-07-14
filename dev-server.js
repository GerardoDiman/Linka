import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';

const app = express();
const PORT = 3002;

// Configurar CORS y middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Ruta para buscar bases de datos (simula /api/databases)
app.get('/notion/databases', async (req, res) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido. Formato: Bearer tu_token_aqui' 
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    
    // Validar formato del token
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      return res.status(400).json({ 
        error: 'Formato de token inválido. Debe comenzar con ntn_ o secret_' 
      });
    }

    console.log('🔍 [DEV] Buscando bases de datos con token del usuario...');

    // Crear cliente de Notion con el token del usuario
    const notion = new Client({
      auth: token
    });

    // Buscar todas las bases de datos
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 100
    });

    console.log(`✅ [DEV] Encontradas ${response.results.length} bases de datos`);

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
          console.warn(`[DEV] No se pudo obtener detalles de ${db.id}:`, error.message);
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

    res.json(result);

  } catch (error) {
    console.error('❌ [DEV] Error en la API:', error);

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
});

// Ruta para probar conexión (simula /api/test-connection)
app.get('/notion/test-connection', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido',
        success: false 
      });
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      return res.status(400).json({ 
        error: 'Formato de token inválido',
        success: false 
      });
    }

    console.log('🧪 [DEV] Probando conexión con Notion...');

    const notion = new Client({
      auth: token
    });

    // Intentar obtener información del bot/integración
    const botInfo = await notion.users.me();
    
    console.log('✅ [DEV] Conexión exitosa:', botInfo.name || 'Bot sin nombre');

    res.json({
      success: true,
      bot: {
        id: botInfo.id,
        name: botInfo.name || 'Integración de Notion',
        type: botInfo.type,
        avatar_url: botInfo.avatar_url
      },
      message: 'Conexión exitosa con Notion'
    });

  } catch (error) {
    console.error('❌ [DEV] Error al probar conexión:', error);

    if (error.code === 'unauthorized') {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
        details: 'El token proporcionado no es válido o ha expirado'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error de conexión',
        details: error.message || 'No se pudo conectar con Notion'
      });
    }
  }
});

// Manejar OPTIONS para CORS
app.options('/notion/*', (req, res) => {
  res.status(200).end();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 [DEV] Servidor proxy corriendo en http://localhost:${PORT}`);
  console.log(`📊 [DEV] Frontend debería conectarse a: http://localhost:${PORT}/notion`);
  console.log(`💡 [DEV] Este servidor simula las funciones serverless para desarrollo local`);
});

export default app; 