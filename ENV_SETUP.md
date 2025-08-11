# 🔧 Configuración de Variables de Entorno

## 📁 **Crear el archivo .env**

Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
# ===== CONFIGURACIÓN DE NOTION =====

# Token de integración de Notion
# Obtener en: https://www.notion.so/my-integrations
NOTION_TOKEN=your_notion_integration_token_here

# ID de la base de datos de leads
# Obtener de la URL de tu base de datos en Notion
NOTION_LEADS_DATABASE_ID=your_leads_database_id_here

# ===== CONFIGURACIÓN DEL SERVIDOR =====

# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# ===== CONFIGURACIÓN DE DESARROLLO =====

# URL base de la API para desarrollo local
VITE_API_BASE_URL=http://localhost:3000/api

# ===== CONFIGURACIÓN DE PRODUCCIÓN =====

# URL base de la API para producción (Vercel)
# VITE_API_BASE_URL=https://tu-app.vercel.app/api

# ===== CONFIGURACIÓN DE SEGURIDAD =====

# JWT Secret (para producción)
JWT_SECRET=your_jwt_secret_here

# ===== CONFIGURACIÓN DE EMAIL (FUTURO) =====

# SMTP Configuration para notificaciones
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
```

## 🔑 **Cómo Obtener las Variables**

### **1. NOTION_TOKEN**

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click en "New integration"
3. Dale un nombre como "Sistema de Acceso"
4. Selecciona el workspace donde está tu base de datos
5. Click en "Submit"
6. Copia el "Internal Integration Token"
7. Reemplaza `your_notion_integration_token_here` con el token

### **2. NOTION_LEADS_DATABASE_ID**

1. Abre tu base de datos de leads en Notion
2. Copia la URL completa
3. El ID está en la URL: `https://notion.so/workspace/[DATABASE_ID]?v=...`
4. Copia solo el ID (sin los guiones)
5. Reemplaza `your_leads_database_id_here` con el ID

### **3. JWT_SECRET (Opcional para producción)**

```bash
# Generar un secret aleatorio
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 **Verificación de Configuración**

### **Paso 1: Crear el archivo**
```bash
# En la raíz del proyecto
touch .env
# O en Windows:
# echo. > .env
```

### **Paso 2: Editar el archivo**
```bash
# Abrir con tu editor preferido
code .env
# O
notepad .env
```

### **Paso 3: Verificar que funciona**
```bash
# Reiniciar el servidor
npm run dev:simple

# Probar la conexión
curl http://localhost:3000/test-connection
```

## 🚨 **Importante: Seguridad**

### **✅ Lo que SÍ hacer:**
- Crear el archivo `.env` en la raíz del proyecto
- Agregar `.env` al `.gitignore` (ya está incluido)
- Usar valores reales para producción
- Mantener el token seguro

### **❌ Lo que NO hacer:**
- NO subir el archivo `.env` a Git
- NO compartir el token públicamente
- NO usar valores de ejemplo en producción
- NO hardcodear las variables en el código

## 🔧 **Configuración por Entorno**

### **Desarrollo Local:**
```env
NOTION_TOKEN=secret_abc123...
NOTION_LEADS_DATABASE_ID=abc123def456...
PORT=3000
VITE_API_BASE_URL=http://localhost:3000/api
```

### **Producción (Vercel):**
```env
NOTION_TOKEN=secret_abc123...
NOTION_LEADS_DATABASE_ID=abc123def456...
VITE_API_BASE_URL=https://tu-app.vercel.app/api
JWT_SECRET=tu_jwt_secret_aqui
```

## 🧪 **Testing de Configuración**

### **1. Verificar que el archivo existe:**
```bash
ls -la .env
# Debe mostrar el archivo
```

### **2. Verificar que las variables se cargan:**
```bash
# En el servidor, deberías ver logs como:
# ✅ Configuración de Notion cargada
# ✅ Database ID configurado: abc123...
```

### **3. Probar la conexión con Notion:**
```bash
# El servidor debería poder conectarse a Notion
# y obtener/actualizar datos sin errores
```

## 🆘 **Solución de Problemas**

### **Error: "NOTION_TOKEN no configurado"**
- Verificar que el archivo `.env` existe
- Verificar que la variable está escrita correctamente
- Reiniciar el servidor después de cambios

### **Error: "NOTION_LEADS_DATABASE_ID no configurado"**
- Verificar que el ID de la base de datos es correcto
- Verificar que la integración tiene acceso a la base de datos

### **Error: "Token inválido"**
- Verificar que el token es correcto
- Verificar que la integración tiene permisos en la base de datos
- Regenerar el token si es necesario

## 📊 **Ejemplo Completo**

### **Archivo .env final:**
```env
# Notion Configuration
NOTION_TOKEN=secret_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
NOTION_LEADS_DATABASE_ID=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# Server Configuration
PORT=3000
VITE_API_BASE_URL=http://localhost:3000/api

# Security (for production)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_123456789
```

Una vez configurado, el sistema podrá:
- ✅ Conectarse a Notion
- ✅ Leer usuarios de la base de datos
- ✅ Actualizar estados de usuarios
- ✅ Sincronizar cambios bidireccionalmente 