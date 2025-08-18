import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { initDatabase, pool } from './database.js';
import { 
  registerUser, 
  loginUser, 
  verifyUserToken, 
  logoutUser,
  cleanupExpiredSessions 
} from './auth-db.js';
import { 
  syncAllUsersFromNotion, 
  syncUserByEmail, 
  getSyncStats,
  isNotionConfigured 
} from './notion-sync.js';
import {
  createInvitation,
  verifyInvitation,
  markInvitationAsUsed,
  getInvitationsByAdmin,
  cleanupExpiredInvitations
} from './invitations.js';

// Utilidad simple para leer cookies sin dependencias
function getCookie(req, name) {
  try {
    const header = req.headers['cookie'];
    if (!header) return null;
    const cookies = header.split(';').map(v => v.trim());
    for (const c of cookies) {
      const idx = c.indexOf('=');
      if (idx === -1) continue;
      const key = c.slice(0, idx);
      const val = decodeURIComponent(c.slice(idx + 1));
      if (key === name) return val;
    }
    return null;
  } catch {
    return null;
  }
}

// Configuración de webhooks
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-webhook-secret';

// Función para enviar webhook a n8n (siempre activa)
async function sendWebhook(event, data) {
  // URL de n8n desde variables de entorno
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv858616.hstgr.cloud/webhook/linka';
  const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET || '';

  try {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      secret: n8nWebhookSecret,
      environment: process.env.NODE_ENV || 'development',
      source: 'linkav2.0'
    };

    console.log(`📤 Enviando webhook a n8n: ${event}`);
    console.log(`🌐 URL: ${n8nWebhookUrl}`);
    console.log(`📋 Payload:`, payload);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Linka-Webhook/1.0',
        'X-API-Key': n8nWebhookSecret
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`✅ Webhook enviado exitosamente: ${event}`);
      const responseData = await response.text();
      console.log(`📄 Respuesta de n8n: ${responseData}`);
    } else {
      console.error(`❌ Error enviando webhook: ${response.status}`);
      const responseText = await response.text();
      console.error(`📄 Respuesta del servidor: ${responseText}`);
    }
  } catch (error) {
    console.error('❌ Error enviando webhook:', error);
    console.error('🔍 Detalles del error:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
  }
}

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar base de datos
async function startServer() {
  try {
    console.log('🔧 Inicializando base de datos...');
    await initDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    
    // Limpiar sesiones expiradas cada hora
    setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
    
    // Limpiar invitaciones expiradas cada día
    setInterval(cleanupExpiredInvitations, 24 * 60 * 60 * 1000);
    
    // Sincronizar desde Notion al inicio
    if (isNotionConfigured()) {
      console.log('🔄 Sincronizando usuarios desde Notion...');
      await syncAllUsersFromNotion();
    }
    
    // Sincronizar desde Notion cada 5 minutos
    setInterval(async () => {
      if (isNotionConfigured()) {
        console.log('🔄 Sincronización automática desde Notion...');
        await syncAllUsersFromNotion();
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    // Middleware
    // Configuración de CORS
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://linkav2-0.vercel.app',
      'https://linkav2-0-git-main-gerardodiman.vercel.app'
    ];

    app.use(cors({
      origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log('🚫 CORS bloqueado para:', origin);
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    app.use(express.json());
    app.use(express.static('dist')); // Servir archivos estáticos del build

// ===== RUTAS DE API =====

// Simulación de base de datos en memoria
const users = [
  { id: 1, email: 'demo@example.com', name: 'Usuario Demo', role: 'approved', createdAt: '2024-01-01T00:00:00.000Z', leadId: 'demo-lead-1' },
  { id: 2, email: 'test@example.com', name: 'Usuario Test', role: 'pending', createdAt: '2024-01-01T00:00:00.000Z', leadId: 'test-lead-1' },
  { id: 3, email: 'admin@example.com', name: 'Administrador', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 4, email: 'rejected@example.com', name: 'Usuario Rechazado', role: 'rejected', createdAt: '2024-01-01T00:00:00.000Z', leadId: 'rejected-lead-1' }
];

// Ruta de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: '¡Hola desde el servidor unificado!' });
});

// Ruta de prueba de conexión
app.get('/api/test-connection', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Conexión exitosa al servidor unificado',
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar webhooks manualmente
app.post('/api/test-webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (!event) {
      return res.status(400).json({ error: 'Evento requerido' });
    }

    console.log('🧪 Probando webhook manualmente...');
    console.log('📋 Evento:', event);
    console.log('📋 Datos:', data);

    await sendWebhook(event, data || {});

    res.json({ 
      success: true, 
      message: 'Webhook enviado exitosamente',
      event,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en test webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, notionLeadId } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    // Verificar si el usuario ya existe en PostgreSQL
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const userData = {
      email,
      password,
      name: name || email.split('@')[0],
      role: 'pending',
      notionLeadId
    };

    const result = await registerUser(userData);
    
    console.log(`✅ Usuario registrado: ${email} (role: ${result.user.role})`);
    
    // Enviar webhook para nuevo usuario registrado
    await sendWebhook('user_registered', {
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      userId: result.user.id
    });
    
    res.json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(400).json({ error: error.message });
  }
});

// Ruta para login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Si no hay password, verificar si es primer login
    if (!password) {
      const user = await pool.query(
        'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (user.rows.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const userData = user.rows[0];
      
      // Verificar si tiene contraseña temporal (empieza con 'temp_')
      if (userData.password_hash && userData.password_hash.includes('temp_')) {
        return res.json({
          success: true,
          requiresPasswordSetup: true,
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          }
        });
      }

      return res.status(400).json({ error: 'Password es requerido' });
    }

    // Login normal con password
    const result = await loginUser(email, password);
    
    console.log(`✅ Usuario logueado: ${email} (role: ${result.user.role})`);
    
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(401).json({ error: error.message });
  }
});

// Ruta para verificar estado
app.post('/api/auth/check-status', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
  }

  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log('❌ Usuario no encontrado para verificación:', email);
    return res.status(404).json({ 
      error: 'Usuario no encontrado',
      message: 'No encontramos una solicitud con este email. ¿Ya enviaste tu solicitud?'
    });
  }

  console.log(`✅ Estado verificado: ${user.email} (role: ${user.role})`);
  
  res.json({
    success: true,
    user,
    message: `Estado actual: ${user.role}`
  });
});

// Ruta para obtener todos los usuarios desde Notion
app.get('/api/auth/get-all-users', async (req, res) => {
  try {
    console.log('🔍 Obteniendo usuarios desde Notion...');
    
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_LEADS_DATABASE_ID) {
      return res.status(500).json({ 
        error: 'Configuración de Notion no disponible',
        users: [],
        stats: { total: 0, pending: 0, approved: 0, rejected: 0, admin: 0 }
      });
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // Obtener todos los leads de la base de datos
    const response = await notion.databases.query({
      database_id: process.env.NOTION_LEADS_DATABASE_ID,
      sorts: [
        {
          property: 'Fecha de Registro',
          direction: 'descending'
        }
      ]
    });

    // Transformar los datos de Notion al formato esperado
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
        roleTitle: properties['Rol / Cargo']?.select?.name || '',
        description: properties.Descripción?.rich_text?.[0]?.plain_text || '',
        source: properties.Fuente?.select?.name || 'Landing Page',
        notes: properties.Notas?.rich_text?.[0]?.plain_text || ''
      };
    });

    // Calcular estadísticas
    const stats = {
      total: users.length,
      pending: users.filter(u => u.role === 'pending').length,
      approved: users.filter(u => u.role === 'approved').length,
      rejected: users.filter(u => u.role === 'rejected').length,
      admin: users.filter(u => u.role === 'admin').length
    };

    console.log(`✅ ${users.length} usuarios obtenidos desde Notion`);
    console.log('📊 Estadísticas:', stats);

    res.json({
      success: true,
      users,
      stats,
      message: `${users.length} usuarios encontrados en Notion`
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuarios desde Notion:', error);
    
    // Fallback con datos simulados si hay error
    const mockUsers = [
      {
        id: '1',
        email: 'demo@example.com',
        name: 'Usuario Demo',
        role: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z',
        leadId: 'demo-lead-1',
        company: 'Demo Company',
        roleTitle: 'Project Manager',
        description: 'Usuario de demostración',
        source: 'Landing Page',
        notes: ''
      }
    ];

    const stats = {
      total: mockUsers.length,
      pending: 0,
      approved: mockUsers.length,
      rejected: 0,
      admin: 0
    };

    res.json({
      success: false,
      users: mockUsers,
      stats,
      message: 'Error conectando con Notion. Mostrando datos de demostración.',
      error: error.message
    });
  }
});

// Ruta para actualizar estado de usuario en Notion
app.post('/api/auth/update-user-status', async (req, res) => {
  try {
    const { leadId, newStatus, adminNotes } = req.body;

    if (!leadId || !newStatus) {
      return res.status(400).json({ error: 'leadId y newStatus son requeridos' });
    }

    // Validar que el nuevo estado sea válido
    const validStatuses = ['pending', 'approved', 'rejected', 'admin'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser: pending, approved, rejected, o admin' });
    }

    if (!process.env.NOTION_TOKEN || !process.env.NOTION_LEADS_DATABASE_ID) {
      return res.status(500).json({ error: 'Configuración de Notion no disponible' });
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // Preparar las propiedades a actualizar
    const propertiesToUpdate = {
      'Estado': {
        select: {
          name: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
        }
      }
    };

    // Agregar notas si se proporcionan
    if (adminNotes) {
      const currentTime = new Date().toLocaleString();
      const newNote = `${currentTime}: ${adminNotes}`;
      
      propertiesToUpdate['Notas'] = {
        rich_text: [
          {
            text: {
              content: newNote
            }
          }
        ]
      };
    }

    // Actualizar la página en Notion
    const updatedPage = await notion.pages.update({
      page_id: leadId,
      properties: propertiesToUpdate
    });

    // Obtener los datos actualizados del usuario
    const page = await notion.pages.retrieve({
      page_id: leadId
    });

    const properties = page.properties;
    const updatedUser = {
      id: page.id,
      email: properties.Email?.email || '',
      name: properties.Nombre?.title?.[0]?.plain_text || '',
      role: properties.Estado?.select?.name?.toLowerCase() || 'pending',
      createdAt: properties['Fecha de Registro']?.date?.start || page.created_time,
      leadId: page.id,
      company: properties.Empresa?.rich_text?.[0]?.plain_text || '',
      roleTitle: properties['Rol / Cargo']?.select?.name || '',
      description: properties.Descripción?.rich_text?.[0]?.plain_text || '',
      source: properties.Fuente?.select?.name || 'Landing Page',
      notes: properties.Notas?.rich_text?.[0]?.plain_text || ''
    };

    console.log(`✅ Estado actualizado en Notion: ${leadId} → ${newStatus}`);
    if (adminNotes) {
      console.log(`📝 Notas del administrador: ${adminNotes}`);
    }

    // Enviar webhook para cambio de estado
    await sendWebhook('user_status_changed', {
      email: updatedUser.email,
      name: updatedUser.name,
      oldStatus: 'pending',
      newStatus,
      adminNotes,
      notionId: leadId
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `Estado actualizado exitosamente a: ${newStatus}`
    });

  } catch (error) {
    console.error('❌ Error actualizando estado en Notion:', error);
    res.status(500).json({ 
      error: 'Error actualizando estado en Notion',
      details: error.message 
    });
  }
});

// Submit lead endpoint
app.post('/api/leads/submit', async (req, res) => {
  try {
    console.log('📝 Recibiendo nuevo lead:', req.body);
    
    // Debug: Verificar variables de entorno
    console.log('🔧 Debug - Variables de entorno:');
    console.log('  NOTION_TOKEN:', process.env.NOTION_TOKEN ? 'Configurado' : 'No configurado');
    console.log('  NOTION_LEADS_DATABASE_ID:', process.env.NOTION_LEADS_DATABASE_ID ? 'Configurado' : 'No configurado');
    
    const {
      firstName,
      lastName,
      email,
      company,
      role,
      description,
      source = 'Landing Page'
    } = req.body;

    // Validar campos requeridos
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: firstName, lastName, email'
      });
    }

    // Si tenemos configuración de Notion, guardar ahí
    if (process.env.NOTION_TOKEN && process.env.NOTION_LEADS_DATABASE_ID) {
      console.log('✅ Intentando guardar en Notion...');
      try {
        const notion = new Client({
          auth: process.env.NOTION_TOKEN,
        });

        const fullName = `${firstName} ${lastName}`;
        
        const response = await notion.pages.create({
          parent: {
            database_id: process.env.NOTION_LEADS_DATABASE_ID,
          },
          properties: {
            'Nombre': {
              title: [
                {
                  text: {
                    content: fullName
                  }
                }
              ]
            },
            'Email': {
              email: email
            },
            'Empresa': {
              rich_text: [
                {
                  text: {
                    content: company || 'No especificada'
                  }
                }
              ]
            },
            'Rol / Cargo': {
              select: {
                name: role || 'No especificado'
              }
            },
            'Descripción': {
              rich_text: [
                {
                  text: {
                    content: description || 'Sin descripción'
                  }
                }
              ]
            },
            'Estado': {
              select: {
                name: 'Pending'
              }
            },
            'Fuente': {
              select: {
                name: source
              }
            },
            'Fecha de Registro': {
              date: {
                start: new Date().toISOString()
              }
            }
          }
        });

        console.log('✅ Lead guardado en Notion:', response.id);
        
        // Enviar webhook para nuevo lead
        await sendWebhook('new_lead', {
          email,
          name: `${firstName} ${lastName}`,
          company,
          role,
          description,
          source,
          notionId: response.id
        });
        
        res.json({
          success: true,
          message: 'Lead enviado exitosamente',
          leadId: response.id,
          storedIn: 'Notion'
        });

      } catch (notionError) {
        console.error('❌ Error guardando en Notion:', notionError);
        
        // Fallback: guardar en memoria local
        const mockLead = {
          id: `mock-${Date.now()}`,
          firstName,
          lastName,
          email,
          company,
          role,
          description,
          source,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Agregar a la lista de usuarios mock
        if (!global.users) global.users = [];
        global.users.push(mockLead);
        
        res.json({
          success: true,
          message: 'Lead enviado exitosamente (modo fallback)',
          leadId: mockLead.id,
          storedIn: 'Local Memory',
          error: notionError.message
        });
      }
    } else {
      console.log('⚠️ No hay configuración de Notion, usando modo fallback');
      // Modo fallback sin Notion
      const mockLead = {
        id: `mock-${Date.now()}`,
        firstName,
        lastName,
        email,
        company,
        role,
        description,
        source,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      if (!global.users) global.users = [];
      global.users.push(mockLead);
      
      res.json({
        success: true,
        message: 'Lead enviado exitosamente (modo fallback)',
        leadId: mockLead.id,
        storedIn: 'Local Memory'
      });
    }

  } catch (error) {
    console.error('❌ Error procesando lead:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Test Notion connection endpoint
app.get('/api/test-notion', async (req, res) => {
  try {
    console.log('🔍 Probando conexión con Notion...');
    
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_LEADS_DATABASE_ID) {
      return res.json({
        success: false,
        error: 'Variables de entorno no configuradas',
        config: {
          hasToken: !!process.env.NOTION_TOKEN,
          hasDatabaseId: !!process.env.NOTION_LEADS_DATABASE_ID
        }
      });
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // Test 1: Get database info
    console.log('📊 Obteniendo información de la base de datos...');
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_LEADS_DATABASE_ID
    });

    // Test 2: Query database
    console.log('🔍 Consultando base de datos...');
    const response = await notion.databases.query({
      database_id: process.env.NOTION_LEADS_DATABASE_ID,
      page_size: 5
    });

    res.json({
      success: true,
      message: '✅ Conexión con Notion exitosa',
      database: {
        id: database.id,
        title: database.title?.[0]?.plain_text || 'Sin título',
        properties: Object.keys(database.properties)
      },
      sampleData: response.results.map(page => {
        const properties = page.properties;
        return {
          id: page.id,
          email: properties.Email?.email || 'No email',
          name: properties.Nombre?.title?.[0]?.plain_text || 'Sin nombre',
          status: properties.Estado?.select?.name || 'Sin estado',
          role: properties['Rol / Cargo']?.select?.name || 'Sin rol',
          createdAt: properties['Fecha de Registro']?.date?.start || page.created_time
        };
      }),
      totalResults: response.results.length
    });

  } catch (error) {
    console.error('❌ Error conectando con Notion:', error);
    res.json({
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
});

// Get database properties endpoint
app.get('/api/notion-properties', async (req, res) => {
  try {
    console.log('🔍 Obteniendo propiedades de la base de datos...');
    
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_LEADS_DATABASE_ID) {
      return res.json({
        success: false,
        error: 'Variables de entorno no configuradas'
      });
    }

    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_LEADS_DATABASE_ID
    });

    const properties = database.properties;
    const propertyDetails = {};

    for (const [key, value] of Object.entries(properties)) {
      propertyDetails[key] = {
        type: value.type,
        name: key
      };
    }

    res.json({
      success: true,
      database: {
        id: database.id,
        title: database.title?.[0]?.plain_text || 'Sin título',
        properties: propertyDetails
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo propiedades:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// ===== RUTAS SIN PREFIJO /api PARA DESARROLLO LOCAL =====

// Ruta de prueba sin prefijo
app.get('/test-connection', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Conexión exitosa al servidor unificado (sin prefijo)',
    timestamp: new Date().toISOString()
  });
});

// Ruta de registro sin prefijo
app.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  const user = { 
    id: Date.now(), 
    email, 
    name: name || email.split('@')[0],
    role: 'pending',
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  console.log(`✅ Usuario registrado (sin prefijo): ${email} (role: ${user.role})`);
  
  res.json({ 
    success: true, 
    message: 'Usuario registrado exitosamente',
    user: { ...user, password: undefined }
  });
});

// Ruta de login sin prefijo
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  console.log(`✅ Usuario logueado (sin prefijo): ${email} (role: ${user.role})`);
  
  res.json({ 
    success: true, 
    message: 'Login exitoso',
    user: result.user,
    token: result.token
  });
});

// Ruta para logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    await logoutUser(token);
    
    console.log('✅ Usuario deslogueado exitosamente');
    
    res.json({ 
      success: true, 
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Debug
    console.log('🔐 Auth middleware:', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : null,
    });

    // Fallbacks: X-Auth-Token header, token en body, cookie 'auth_token'
    if (!token) {
      const altHeader = req.headers['x-auth-token'];
      if (altHeader && typeof altHeader === 'string') {
        token = altHeader;
      }
    }

    if (!token && req.body && typeof req.body.token === 'string') {
      token = req.body.token;
    }

    if (!token) {
      const cookieToken = getCookie(req, 'auth_token');
      if (cookieToken) token = cookieToken;
    }

    if (!token && req.query && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      console.log('🚫 Token ausente (Authorization/X-Auth-Token/body/cookie/query)');
      return res.status(401).json({ error: 'Token requerido' });
    }

    const user = await verifyUserToken(token);
    if (!user) {
      console.log('🚫 Token inválido o sesión expirada');
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Ruta protegida para verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  });
});

// Ruta para sincronización manual
app.post('/api/sync/notion', async (req, res) => {
  try {
    if (!isNotionConfigured()) {
      return res.status(400).json({ error: 'Notion no está configurado' });
    }
    
    await syncAllUsersFromNotion();
    
    res.json({ 
      success: true, 
      message: 'Sincronización completada exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error en sincronización manual:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para sincronizar usuario específico
app.post('/api/sync/user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }
    
    if (!isNotionConfigured()) {
      return res.status(400).json({ error: 'Notion no está configurado' });
    }
    
    const result = await syncUserByEmail(email);
    
    if (result) {
      res.json({ 
        success: true, 
        message: 'Usuario sincronizado exitosamente',
        user: result
      });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado en Notion' });
    }
  } catch (error) {
    console.error('❌ Error sincronizando usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener estadísticas de sincronización
app.get('/api/sync/stats', async (req, res) => {
  try {
    const stats = await getSyncStats();
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para configurar contraseña (primer login)
app.post('/api/auth/setup-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que el usuario existe y tiene contraseña temporal
    const user = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userData = user.rows[0];
    
    // Verificar que tiene contraseña temporal
    if (!userData.password_hash || !userData.password_hash.includes('temp_')) {
      return res.status(400).json({ error: 'Este usuario ya tiene contraseña configurada' });
    }

    // Hashear nueva contraseña
    const { hashPassword } = await import('./auth-db.js');
    const passwordHash = await hashPassword(password);

    // Actualizar contraseña
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [passwordHash, email]
    );

    // Generar token de login
    const { generateToken } = await import('./auth-db.js');
    const token = generateToken(userData.id, userData.email, userData.role);

    // Eliminar sesiones existentes del usuario
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userData.id]);

    // Guardar nueva sesión
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userData.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 días
    );

    console.log(`✅ Contraseña configurada para: ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Contraseña configurada exitosamente',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Error configurando contraseña:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== RUTAS DE INVITACIONES =====

// Ruta para crear invitación
app.post('/api/invitations/create', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const adminId = req.user?.id; // Asumiendo middleware de autenticación
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }
    
    if (!adminId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    // Crear invitación
    const invitation = await createInvitation(email, adminId);
    
    // Generar link de invitación
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${invitation.token}`;
    
    console.log(`📧 Invitación creada: ${invitationLink}`);
    
    // Enviar webhook para nueva invitación
    await sendWebhook('invitation_created', {
      email: invitation.email,
      invitedBy: adminId,
      invitationLink,
      expiresAt: invitation.expires_at
    });
    
    res.json({
      success: true,
      message: 'Invitación creada exitosamente',
      invitation: {
        email: invitation.email,
        token: invitation.token,
        link: invitationLink,
        expiresAt: invitation.expires_at
      }
    });
  } catch (error) {
    console.error('❌ Error creando invitación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para verificar invitación
app.get('/api/invitations/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await verifyInvitation(token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitación inválida o expirada' });
    }
    
    res.json({
      success: true,
      invitation: {
        email: invitation.email,
        invitedBy: invitation.invited_by_name,
        expiresAt: invitation.expires_at
      }
    });
  } catch (error) {
    console.error('❌ Error verificando invitación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener invitaciones de un admin
app.get('/api/invitations', async (req, res) => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const invitations = await getInvitationsByAdmin(adminId);
    
    res.json({
      success: true,
      invitations
    });
  } catch (error) {
    console.error('❌ Error obteniendo invitaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta de verificación de estado sin prefijo
app.post('/auth/check-status', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
  }

  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log('❌ Usuario no encontrado para verificación (sin prefijo):', email);
    return res.status(404).json({ 
      error: 'Usuario no encontrado',
      message: 'No encontramos una solicitud con este email. ¿Ya enviaste tu solicitud?'
    });
  }

  console.log(`✅ Estado verificado (sin prefijo): ${user.email} (role: ${user.role})`);
  
  res.json({
    success: true,
    user,
    message: `Estado actual: ${user.role}`
  });
});

// ===== SERVIR FRONTEND =====

    // Ruta para servir el frontend (SPA)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor unificado ejecutándose en http://localhost:${PORT}`);
      console.log(`📁 Frontend: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🧪 Test: http://localhost:${PORT}/test-connection`);
      console.log(`🗄️ PostgreSQL: Conectado y funcionando`);
      
      // Verificar configuración de Notion
      if (process.env.NOTION_TOKEN) {
        console.log(`✅ NOTION_TOKEN configurado`);
      } else {
        console.log(`⚠️ NOTION_TOKEN no configurado - usando modo simulado`);
      }
      
      if (process.env.NOTION_LEADS_DATABASE_ID) {
        console.log(`✅ NOTION_LEADS_DATABASE_ID configurado`);
      } else {
        console.log(`⚠️ NOTION_LEADS_DATABASE_ID no configurado - usando modo simulado`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error inicializando servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();