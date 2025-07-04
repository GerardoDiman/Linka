# Solución al Problema de CORS con la API de Notion

## 🚨 El Problema

Cuando intentas conectar Linka v2.0 directamente a la API de Notion desde el navegador, obtienes este error:

```
Access to fetch at 'https://api.notion.com/v1/search' from origin 'http://localhost:3001' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ❓ ¿Por Qué Ocurre Esto?

### CORS (Cross-Origin Resource Sharing)
- Es una **medida de seguridad** implementada por los navegadores
- Previene que sitios web maliciosos accedan a APIs sin autorización
- Las APIs serias **intencionalmente** bloquean solicitudes directas desde navegadores
- Es **normal y esperado** en aplicaciones de producción

### Por Qué Notion Bloquea CORS
1. **Seguridad**: Protege tokens de API de exposición en código cliente
2. **Control**: Asegura que las aplicaciones implementen autenticación adecuada
3. **Estándar de la Industria**: Similar a Google, Facebook, Twitter, etc.

## ✅ Soluciones Técnicas

### 1. Backend Proxy con Express.js

Esta es la solución más directa y recomendada:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite dev server
  credentials: true
}));
app.use(express.json());

// Cliente de Notion
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

// Ruta para buscar bases de datos
app.get('/api/databases', async (req, res) => {
  try {
    console.log('Buscando bases de datos...');
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 100
    });
    
    console.log(`Encontradas ${response.results.length} bases de datos`);
    res.json(response);
  } catch (error) {
    console.error('Error al buscar bases de datos:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
});

// Ruta para obtener detalles de una base de datos
app.get('/api/databases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Obteniendo detalles de base de datos: ${id}`);
    
    const response = await notion.databases.retrieve({
      database_id: id
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error al obtener base de datos:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
});

// Ruta para probar conexión
app.get('/api/test', async (req, res) => {
  try {
    const response = await notion.users.me();
    res.json({ 
      success: true, 
      bot: response 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Proxy server running on port ${port}`);
  console.log(`📊 Frontend should connect to: http://localhost:${port}/api`);
});
```

#### Instalación y Configuración

```bash
# 1. Crear directorio del servidor
mkdir linka-backend
cd linka-backend

# 2. Inicializar proyecto Node.js
npm init -y

# 3. Instalar dependencias
npm install express cors @notionhq/client dotenv

# 4. Crear archivo .env
echo "NOTION_TOKEN=tu_token_aqui" > .env

# 5. Agregar scripts al package.json
npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="nodemon server.js"

# 6. Instalar nodemon para desarrollo (opcional)
npm install -D nodemon

# 7. Ejecutar servidor
npm run dev
```

#### Modificar Frontend

En `src/utils/notionApi.ts`, cambiar la URL base:

```typescript
// Cambiar de:
const NOTION_API_BASE = 'https://api.notion.com/v1'

// A:
const NOTION_API_BASE = 'http://localhost:3001/api'

// También simplificar las llamadas:
export class NotionApiClient {
  async search(): Promise<any> {
    const response = await fetch(`${NOTION_API_BASE}/databases`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getDatabase(id: string): Promise<any> {
    const response = await fetch(`${NOTION_API_BASE}/databases/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${NOTION_API_BASE}/test`);
      const data = await response.json();
      return data.success;
    } catch {
      return false;
    }
  }
}
```

### 2. Funciones Serverless

#### Vercel Functions

```javascript
// api/databases.js
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await notion.search({
      filter: { value: 'database', property: 'object' }
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### Configuración en vercel.json

```json
{
  "functions": {
    "api/databases.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NOTION_TOKEN": "@notion-token"
  }
}
```

#### Netlify Functions

```javascript
// netlify/functions/databases.js
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const response = await notion.search({
      filter: { value: 'database', property: 'object' }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 3. Proxy de Desarrollo (Solo para Testing)

⚠️ **NO recomendado para producción**

```bash
# Instalar proxy CORS local
npm install -g local-cors-proxy

# Ejecutar proxy
lcp --proxyUrl https://api.notion.com --port 8010
```

Luego cambiar la URL base a `http://localhost:8010`.

## 🔒 Configuración de Notion

### 1. Crear Integración

1. Ve a [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clic en "New integration"
3. Nombra tu integración (ej: "Linka Backend")
4. Selecciona tu workspace
5. Copia el "Internal Integration Token"

### 2. Permisos de Bases de Datos

Para cada base de datos que quieras visualizar:

1. Abre la base de datos en Notion
2. Clic en "..." (menú)
3. Selecciona "Connections" → "Connect to"
4. Busca y selecciona tu integración
5. Clic en "Confirm"

### 3. Variables de Entorno

```bash
# .env
NOTION_TOKEN=secret_tu_token_de_integracion_aqui
# O para tokens nuevos:
NOTION_TOKEN=ntn_tu_token_de_integracion_aqui
```

## 🚀 Deployment

### Backend en Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar proyecto
railway init

# 4. Configurar variables de entorno
railway variables set NOTION_TOKEN=tu_token_aqui

# 5. Deploy
railway up
```

### Frontend en Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Configurar variable de entorno
vercel env add VITE_API_URL production
# Valor: https://tu-backend.railway.app/api
```

## 📊 Monitoreo y Debugging

### Logs del Backend

```javascript
// Agregar logging detallado
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/api/databases', async (req, res) => {
  console.log('🔍 Iniciando búsqueda de bases de datos...');
  try {
    const response = await notion.search({
      filter: { value: 'database', property: 'object' }
    });
    console.log(`✅ Encontradas ${response.results.length} bases de datos`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error en búsqueda:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    res.status(500).json({ error: error.message });
  }
});
```

### Verificación de CORS

```bash
# Probar CORS manualmente
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3001/api/databases
```

## 🔧 Troubleshooting

### Token Inválido
```
Error: API key is invalid
```
**Solución**: Verifica que el token esté correcto y sea de tipo "Internal Integration"

### Sin Permisos
```
Error: The integration does not have permission to perform this action
```
**Solución**: Comparte las bases de datos con tu integración

### Error de CORS Persistente
```
CORS error even with backend
```
**Solución**: Verifica que el frontend apunte a la URL correcta del backend

### Límite de Rate
```
Error: Rate limited
```
**Solución**: Implementa retry logic con backoff exponencial

## 📚 Recursos Adicionales

- [Documentación oficial de Notion API](https://developers.notion.com/)
- [Guía de CORS de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express.js CORS middleware](https://github.com/expressjs/cors)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

---

**💡 Consejo**: Usa siempre el modo demo para desarrollar y probar funcionalidades antes de implementar el backend. 