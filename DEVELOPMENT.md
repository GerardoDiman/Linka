# Guía de Desarrollo - Linka v2.0

## 🚀 Configuración de Desarrollo

### Requisitos Previos
- Node.js 16+ 
- npm o yarn
- Token de integración de Notion (opcional, para probar con datos reales)

### Instalación

```bash
# Clonar el repositorio
git clone [repositorio]
cd linkav2.0

# Instalar dependencias
npm install
```

## 🛠️ Comandos de Desarrollo

### Desarrollo Completo (Recomendado)
```bash
npm run dev:full
```
Este comando ejecuta simultáneamente:
- **Servidor Proxy** (puerto 3001): Simula las funciones serverless para desarrollo local
- **Frontend Vite** (puerto 5173): Aplicación React con hot reload

### Comandos Individuales
```bash
# Solo frontend (sin API real)
npm run dev

# Solo servidor proxy API
npm run dev:api

# Linting
npm run lint

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🏗️ Arquitectura de Desarrollo

### Desarrollo Local
```
Frontend (5173) → Servidor Proxy (3001) → Notion API
```

### Producción
```
Frontend → Vercel Functions → Notion API
```

## 📁 Estructura del Proyecto

```
linkav2.0/
├── api/                      # Funciones serverless (Vercel)
│   ├── databases.js          # Endpoint para obtener bases de datos
│   └── test-connection.js    # Endpoint para probar conexión
├── src/                      # Código fuente del frontend
│   ├── components/           # Componentes React
│   ├── hooks/               # Hooks personalizados
│   ├── types/               # Definiciones TypeScript
│   └── utils/               # Utilidades y clientes API
├── dev-server.js            # Servidor proxy para desarrollo
├── vercel.json              # Configuración de Vercel
└── package.json             # Dependencias y scripts
```

## 🔧 Configuración de API

### Desarrollo Local
El archivo `dev-server.js` simula las funciones serverless de Vercel:
- **Puerto**: 3001
- **CORS**: Configurado para localhost
- **Endpoints**: `/api/databases` y `/api/test-connection`

### Detección Automática
El cliente API detecta automáticamente el entorno:
```typescript
// En src/utils/notionApi.ts
const getApiBase = () => {
  if (window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'http://localhost:3001/api'  // Desarrollo
  }
  return window.location.origin + '/api'  // Producción
}
```

## 🧪 Testing con Notion

### 1. Obtener Token de Prueba
1. Ve a [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Crea una nueva integración
3. Copia el token de integración

### 2. Configurar Bases de Datos
Para cada base de datos que quieras probar:
1. Abre la base de datos en Notion
2. Clic en "..." → "Connections" → "Connect to"
3. Selecciona tu integración de prueba

### 3. Probar en la Aplicación
1. Ejecuta `npm run dev:full`
2. Ve a [http://localhost:5173](http://localhost:5173)
3. Selecciona la pestaña "Conectar"
4. Pega tu token de prueba

## 🐛 Debugging

### Logs del Servidor Proxy
```bash
# Terminal donde ejecutaste npm run dev:full
🔍 [DEV] Buscando bases de datos con token del usuario...
✅ [DEV] Encontradas 3 bases de datos
```

### Logs del Frontend
```bash
# Consola del navegador (F12)
🔗 Making request to: http://localhost:3001/api/databases
✅ Response successful: { type: "page_or_database", resultsCount: 3 }
```

### Errores Comunes

#### Error: "Failed to fetch"
- **Causa**: El servidor proxy no está ejecutándose
- **Solución**: Asegúrate de usar `npm run dev:full`

#### Error: "Token inválido"
- **Causa**: Token mal formateado o sin permisos
- **Solución**: Verifica que el token comience con `ntn_` o `secret_`

#### Error: "Sin bases de datos"
- **Causa**: No has compartido ninguna base de datos con la integración
- **Solución**: Comparte al menos una base de datos con tu integración

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Las funciones serverless se despliegan automáticamente
```

### Variables de Entorno
En producción, las funciones serverless usan el token enviado por el frontend.
No necesitas configurar variables de entorno.

## 🔄 Flujo de Desarrollo

1. **Desarrollo**: Usa `npm run dev:full` para desarrollo completo
2. **Testing**: Prueba con datos demo y datos reales de Notion
3. **Build**: `npm run build` para verificar el build
4. **Deploy**: `vercel` para desplegar a producción

## 🛡️ Seguridad

### Desarrollo Local
- El token se envía via header Authorization
- CORS configurado solo para localhost
- No se almacenan tokens permanentemente

### Producción
- Funciones serverless aisladas
- Token procesado en runtime, nunca almacenado
- CORS configurado para todos los orígenes

## 📚 Recursos Adicionales

- [Documentación de Notion API](https://developers.notion.com/)
- [Guía de Vercel Functions](https://vercel.com/docs/functions)
- [Documentación de Vite](https://vitejs.dev/)
- [ReactFlow Docs](https://reactflow.dev/)

---

**💡 Tip**: Usa siempre `npm run dev:full` para desarrollo completo con funcionalidad API. 