# 🔧 Guía Completa: Variables de Entorno

## 📁 **Paso 1: Crear el archivo .env**

Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`):

```bash
# En la raíz del proyecto
touch .env
# O en Windows:
echo. > .env
```

## 📝 **Paso 2: Configurar las variables**

Abre el archivo `.env` y agrega el siguiente contenido:

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

# ===== CONFIGURACIÓN DE SEGURIDAD =====

# JWT Secret (para producción)
JWT_SECRET=your_jwt_secret_here
```

## 🔑 **Paso 3: Obtener las variables de Notion**

### **Obtener NOTION_TOKEN:**

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click en "New integration"
3. Dale un nombre como "Sistema de Acceso"
4. Selecciona tu workspace
5. Click en "Submit"
6. Copia el "Internal Integration Token"
7. Reemplaza `your_notion_integration_token_here` con el token

### **Obtener NOTION_LEADS_DATABASE_ID:**

1. Abre tu base de datos de leads en Notion
2. Copia la URL completa
3. El ID está en la URL: `https://notion.so/workspace/[DATABASE_ID]?v=...`
4. Copia solo el ID (sin los guiones)
5. Reemplaza `your_leads_database_id_here` con el ID

## ✅ **Paso 4: Verificar la configuración**

Ejecuta el comando de verificación:

```bash
npm run check-env
```

**Respuesta esperada si está bien configurado:**
```
✅ NOTION_TOKEN: Configurado
✅ NOTION_LEADS_DATABASE_ID: Configurado
✅ Todas las variables requeridas están configuradas
🚀 El sistema puede conectarse a Notion
```

## 🧪 **Paso 5: Probar el sistema**

### **Reiniciar el servidor:**
```bash
npm run dev:simple
```

### **Verificar logs del servidor:**
```
🚀 Servidor unificado ejecutándose en http://localhost:3000
✅ NOTION_TOKEN configurado
✅ NOTION_LEADS_DATABASE_ID configurado
```

### **Probar en el navegador:**
1. Abrir `http://localhost:3000`
2. Login con `admin@example.com`
3. Ir al panel de administración
4. Verificar que los datos vienen de Notion

## 🚨 **Solución de Problemas**

### **Error: "Archivo .env encontrado: No"**
- Verificar que el archivo `.env` existe en la raíz del proyecto
- Verificar que el nombre es exactamente `.env` (no `.env.txt`)

### **Error: "NOTION_TOKEN: No configurado"**
- Verificar que el token está copiado correctamente
- Verificar que no hay espacios extra
- Verificar que la integración tiene permisos en la base de datos

### **Error: "NOTION_LEADS_DATABASE_ID: No configurado"**
- Verificar que el ID de la base de datos es correcto
- Verificar que la integración tiene acceso a la base de datos
- Compartir la base de datos con la integración

### **Error: "Token inválido"**
- Regenerar el token en Notion
- Verificar que la integración tiene permisos correctos
- Verificar que el workspace es el correcto

## 📊 **Ejemplo de archivo .env completo**

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

## 🔧 **Comandos Útiles**

### **Verificar configuración:**
```bash
npm run check-env
```

### **Iniciar servidor con configuración:**
```bash
npm run dev:simple
```

### **Verificar que el servidor carga las variables:**
```bash
node unified-server.js
# Deberías ver:
# ✅ NOTION_TOKEN configurado
# ✅ NOTION_LEADS_DATABASE_ID configurado
```

## 🎯 **Estados del Sistema**

### **✅ Modo Real (Configurado):**
- Conecta directamente a Notion
- Lee y escribe datos reales
- Sincronización bidireccional
- Panel de administración funcional

### **⚠️ Modo Simulado (No configurado):**
- Usa datos de prueba
- Funciona para desarrollo
- No conecta a Notion real
- Panel de administración con datos simulados

## 📈 **Próximos Pasos**

Una vez configurado correctamente:

1. **Probar el flujo completo:**
   - Registro de usuarios
   - Login y verificación de estado
   - Panel de administración
   - Cambio de roles

2. **Configurar la base de datos de Notion:**
   - Crear la estructura sugerida
   - Agregar usuarios de prueba
   - Configurar vistas y filtros

3. **Desplegar en producción:**
   - Configurar variables en Vercel
   - Probar en entorno de producción

## 🎉 **Beneficios de la Configuración**

- ✅ **Datos reales** desde Notion
- ✅ **Sincronización automática** de cambios
- ✅ **Panel de administración** funcional
- ✅ **Sistema de roles** operativo
- ✅ **Integración completa** con tu workflow

¡Con esto tendrás un sistema completamente funcional conectado a Notion! 