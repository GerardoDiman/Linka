import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token requerido',
        details: 'Debes proporcionar un token de Notion'
      });
    }

    // Validar formato del token
    if (!token.startsWith('secret_') && !token.startsWith('ntn_')) {
      return res.status(400).json({
        error: 'Formato de token inválido',
        details: 'El token debe empezar con "secret_" o "ntn_"',
        tokenPrefix: token.substring(0, 10) + '...'
      });
    }

    console.log('🧪 Probando token de Notion...');

    const notion = new Client({
      auth: token
    });

    // Paso 1: Probar conexión básica
    console.log('📡 Paso 1: Probando conexión básica...');
    const botInfo = await notion.users.me();
    
    console.log('✅ Conexión básica exitosa:', {
      botId: botInfo.id,
      botName: botInfo.name,
      botType: botInfo.type
    });

    // Paso 2: Probar búsqueda de bases de datos
    console.log('🔍 Paso 2: Buscando bases de datos...');
    const searchResponse = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 10
    });

    console.log('✅ Búsqueda exitosa:', {
      databasesFound: searchResponse.results.length,
      hasMore: searchResponse.has_more
    });

    // Paso 3: Probar acceso a cada base de datos
    console.log('📊 Paso 3: Probando acceso a bases de datos...');
    const databaseTests = [];

    for (const db of searchResponse.results) {
      try {
        const dbDetails = await notion.databases.retrieve({
          database_id: db.id
        });
        
        databaseTests.push({
          id: db.id,
          title: dbDetails.title?.[0]?.plain_text || 'Sin título',
          accessible: true,
          properties: Object.keys(dbDetails.properties || {}).length
        });
        
        console.log(`✅ Base de datos accesible: ${dbDetails.title?.[0]?.plain_text || db.id}`);
      } catch (error) {
        databaseTests.push({
          id: db.id,
          title: db.title?.[0]?.plain_text || 'Sin título',
          accessible: false,
          error: error.message
        });
        
        console.log(`❌ Base de datos no accesible: ${db.id} - ${error.message}`);
      }
    }

    // Resultado final
    const result = {
      success: true,
      message: 'Token válido y funcionando',
      bot: {
        id: botInfo.id,
        name: botInfo.name || 'Integración de Notion',
        type: botInfo.type,
        avatar_url: botInfo.avatar_url
      },
      databases: {
        total: searchResponse.results.length,
        accessible: databaseTests.filter(db => db.accessible).length,
        inaccessible: databaseTests.filter(db => !db.accessible).length,
        details: databaseTests
      },
      recommendations: []
    };

    // Agregar recomendaciones
    if (result.databases.inaccessible > 0) {
      result.recommendations.push(
        'Algunas bases de datos no son accesibles. Asegúrate de compartirlas con tu integración.'
      );
    }

    if (result.databases.total === 0) {
      result.recommendations.push(
        'No se encontraron bases de datos. Verifica que hayas compartido bases de datos con tu integración.'
      );
    }

    if (result.databases.accessible === 0 && result.databases.total > 0) {
      result.recommendations.push(
        'Todas las bases de datos encontradas no son accesibles. Verifica los permisos de tu integración.'
      );
    }

    console.log('🎉 Test completado exitosamente');
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error en test de token:', error);

    let errorMessage = 'Error desconocido';
    let details = '';

    if (error.code === 'unauthorized') {
      errorMessage = 'Token inválido';
      details = 'El token proporcionado no es válido o ha expirado';
    } else if (error.code === 'restricted_resource') {
      errorMessage = 'Sin permisos';
      details = 'La integración no tiene permisos para acceder a los recursos';
    } else if (error.code === 'rate_limited') {
      errorMessage = 'Límite excedido';
      details = 'Se ha excedido el límite de requests. Intenta de nuevo en unos segundos';
    } else {
      details = error.message || 'Error desconocido al conectar con Notion';
    }

    return res.status(400).json({
      success: false,
      error: errorMessage,
      details: details,
      code: error.code
    });
  }
} 