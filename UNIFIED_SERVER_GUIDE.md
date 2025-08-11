# 🚀 Servidor Unificado - Guía de Uso

## 📋 **¿Por qué un servidor unificado?**

### **Problema Anterior:**
- **Servidor de Desarrollo (Vite)**: Puerto 5173 - Solo frontend
- **Servidor de API (Express)**: Puerto 3000 - Solo backend
- **Configuración Compleja**: CORS, múltiples puertos, configuración separada

### **Solución Actual:**
- **Un Solo Servidor**: Puerto 3000 - Frontend + Backend
- **Configuración Simple**: Un solo comando para iniciar todo
- **Sin CORS**: Todo en el mismo origen

## 🎯 **Ventajas del Servidor Unificado**

### ✅ **Simplicidad**
- Un solo comando para iniciar todo
- No más problemas de CORS
- Configuración centralizada

### ✅ **Desarrollo Más Rápido**
- Hot reload automático
- Menos configuración
- Debugging más fácil

### ✅ **Producción Lista**
- Mismo servidor para desarrollo y producción
- Despliegue simplificado
- Menos dependencias

## 🚀 **Cómo Usar**

### **1. Desarrollo Rápido**
```bash
# Construir frontend
npm run build

# Iniciar servidor unificado
node unified-server.js
```

### **2. Script Automático (Windows)**
```bash
# Usar el script que hace todo automáticamente
start-unified.bat
```

### **3. Comandos NPM**
```bash
# Construir e iniciar
npm run start:unified

# Solo iniciar servidor
npm run start
```

## 📁 **Estructura del Servidor**

### **Rutas de API (`/api/*`)**
- `/api/auth/register` - Registro de usuarios
- `/api/auth/login` - Login de usuarios
- `/api/auth/check-status` - Verificar estado
- `/api/auth/get-all-users` - Obtener todos los usuarios
- `/api/auth/update-user-status` - Actualizar estado

### **Rutas de Desarrollo (`/*`)**
- `/test-connection` - Prueba de conexión
- `/auth/register` - Registro (sin prefijo)
- `/auth/login` - Login (sin prefijo)
- `/auth/check-status` - Verificar estado (sin prefijo)

### **Frontend (`/*`)**
- Todas las demás rutas sirven el frontend React

## 🔧 **Configuración**

### **Variables de Entorno**
```env
# Puerto del servidor (opcional)
PORT=3000

# Para producción con Notion
NOTION_TOKEN=your_token_here
NOTION_LEADS_DATABASE_ID=your_database_id_here
```

### **Archivos de Configuración**
- `unified-server.js` - Servidor principal
- `start-unified.bat` - Script de Windows
- `package.json` - Scripts NPM

## 🧪 **Testing**

### **Pruebas de API**
```bash
# Probar conexión
curl http://localhost:3000/test-connection

# Probar API de auth
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"test"}'
```

### **Usuarios de Prueba**
- **demo@example.com** - Aprobado
- **test@example.com** - Pendiente
- **admin@example.com** - Administrador
- **rejected@example.com** - Rechazado

## 📊 **Monitoreo**

### **Logs del Servidor**
```
🚀 Servidor unificado ejecutándose en http://localhost:3000
📁 Frontend: http://localhost:3000
🔗 API: http://localhost:3000/api
🧪 Test: http://localhost:3000/test-connection
```

### **Logs de Operaciones**
- ✅ Usuario registrado
- ✅ Usuario logueado
- ✅ Estado verificado
- ✅ Usuarios obtenidos
- ✅ Estado actualizado

## 🔄 **Flujo de Desarrollo**

### **1. Desarrollo Local**
```bash
# Terminal 1: Construir frontend
npm run build

# Terminal 2: Iniciar servidor
node unified-server.js
```

### **2. Desarrollo con Hot Reload**
```bash
# Para desarrollo con cambios automáticos
npm run dev  # Frontend en puerto 5173
# + Servidor unificado en puerto 3000
```

### **3. Producción**
```bash
# Construir y desplegar
npm run build
node unified-server.js
```

## 🚨 **Troubleshooting**

### **Error: "Puerto ya en uso"**
```bash
# Cambiar puerto
PORT=3001 node unified-server.js
```

### **Error: "Build falló"**
```bash
# Limpiar y reconstruir
rm -rf dist/
npm run build
```

### **Error: "Módulo no encontrado"**
```bash
# Reinstalar dependencias
npm install
```

## 📈 **Próximos Pasos**

### **1. Optimizaciones**
- Compresión de archivos estáticos
- Cache de API responses
- Logging estructurado

### **2. Funcionalidades**
- WebSocket para actualizaciones en tiempo real
- Rate limiting
- Autenticación JWT

### **3. Despliegue**
- Docker container
- PM2 para producción
- Load balancing

## 🎉 **Beneficios Logrados**

### ✅ **Un Solo Comando**
```bash
node unified-server.js
```

### ✅ **Sin Configuración CORS**
- Todo en el mismo origen
- Sin problemas de preflight

### ✅ **Desarrollo Más Rápido**
- Menos configuración
- Debugging más fácil

### ✅ **Producción Lista**
- Mismo servidor para dev y prod
- Despliegue simplificado 