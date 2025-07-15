import { Client } from '@notionhq/client';

// Función para Vercel: /api/test-connection
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Token de autorización requerido',
        success: false 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      res.status(400).json({ 
        error: 'Formato de token inválido',
        success: false 
      });
      return;
    }

    const notion = new Client({
      auth: token
    });

    console.log('🔍 Probando conexión con Notion...');

    // Intentar obtener información del bot/integración
    const botInfo = await notion.users.me();
    
    console.log('✅ Conexión exitosa:', botInfo.name || 'Bot sin nombre');

    res.status(200).json({
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
    console.error('❌ Error al probar conexión:', error);

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
} 