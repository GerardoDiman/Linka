import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@notionhq/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint called');
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Simular base de datos de usuarios
const users = [];

// ===== RUTAS DE AUTENTICACIÓN =====
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }
  
  const user = { 
    id: Date.now(), 
    email, 
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  console.log(`✅ Usuario registrado: ${user.email}`);
  
  res.json({ 
    success: true, 
    user,
    message: 'Usuario registrado exitosamente' 
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }
  
  console.log(`✅ Usuario logueado: ${user.email}`);
  
  res.json({ 
    success: true, 
    user,
    message: 'Login exitoso' 
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('✅ Usuario deslogueado');
  res.json({ success: true, message: 'Logout exitoso' });
});

// ===== RUTAS SIN PREFIJO /api PARA DESARROLLO LOCAL =====
app.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }
  
  const user = { 
    id: Date.now(), 
    email, 
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  console.log(`✅ Usuario registrado (local): ${user.email}`);
  
  res.json({ 
    success: true, 
    user,
    message: 'Usuario registrado exitosamente' 
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }
  
  console.log(`✅ Usuario logueado (local): ${user.email}`);
  
  res.json({ 
    success: true, 
    user,
    message: 'Login exitoso' 
  });
});

app.post('/auth/logout', (req, res) => {
  console.log('✅ Usuario deslogueado (local)');
  res.json({ success: true, message: 'Logout exitoso' });
});

app.get('/test-auth', (req, res) => {
  console.log('✅ Test auth endpoint called (local)');
  res.json({ 
    message: 'Auth API is working!',
    timestamp: new Date().toISOString(),
    environment: 'local'
  });
});

// ===== RUTAS DE NOTION =====
app.get('/notion/databases', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido. Formato: Bearer tu_token_aqui' 
      });
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      return res.status(400).json({ 
        error: 'Formato de token inválido. Debe comenzar con ntn_ o secret_' 
      });
    }

    console.log('🔍 Buscando bases de datos con token del usuario...');

    const notion = new Client({
      auth: token
    });

    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 100
    });

    console.log(`✅ Encontradas ${response.results.length} bases de datos`);

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
          console.warn(`No se pudo obtener detalles de ${db.id}:`, error.message);
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

    res.json(result);

  } catch (error) {
    console.error('❌ Error en la API de Notion:', error);

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

app.get('/notion/database', async (req, res) => {
  try {
    const { id } = req.query;
    const authHeader = req.headers.authorization;
    
    if (!id) {
      return res.status(400).json({ error: 'ID de base de datos requerido' });
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorización requerido' 
      });
    }

    const token = authHeader.substring(7);
    
    if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
      return res.status(400).json({ 
        error: 'Formato de token inválido' 
      });
    }

    console.log(`🔍 Obteniendo detalles de base de datos: ${id}`);

    const notion = new Client({
      auth: token
    });

    const database = await notion.databases.retrieve({
      database_id: id
    });

    console.log(`✅ Detalles obtenidos para: ${database.title?.[0]?.plain_text || id}`);

    res.json(database);

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
});

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

    console.log('🧪 Probando conexión con Notion...');

    const notion = new Client({
      auth: token
    });

    const botInfo = await notion.users.me();
    
    console.log('✅ Conexión exitosa:', botInfo.name || 'Bot sin nombre');

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
    console.error('❌ Error al probar conexión:', error);
    
    if (error.code === 'unauthorized') {
      res.status(401).json({
        error: 'Token inválido o sin permisos',
        success: false
      });
    } else if (error.code === 'restricted_resource') {
      res.status(403).json({
        error: 'Sin permisos para acceder a los recursos',
        success: false
      });
    } else {
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido al conectar con Notion',
        success: false
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor unificado corriendo en http://localhost:${PORT}`);
  console.log(`📱 API de autenticación: http://localhost:${PORT}/api/auth`);
  console.log(`🔗 API de Notion: http://localhost:${PORT}/notion`);
});

// Catch-all handler for unmatched routes
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/auth/logout',
      'GET /notion/databases',
      'GET /notion/database',
      'GET /notion/test-connection'
    ]
  });
}); 