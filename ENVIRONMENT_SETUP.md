# Configuración de Variables de Entorno

## 🔧 Variables necesarias para el sistema de leads

### Para desarrollo local (.env.local):
```env
# Token de integración de Notion (el mismo que usas para la app)
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ID de la base de datos de leads en Notion
NOTION_LEADS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Para Vercel (Variables de entorno):
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las mismas variables que arriba

## 📋 Pasos para configurar:

### 1. Crear base de datos de leads en Notion
- Sigue la guía en `NOTION_LEADS_SETUP.md`
- Copia el ID de la base de datos de la URL

### 2. Configurar variables de entorno
- **Desarrollo local**: Crear archivo `.env.local` en la raíz del proyecto
- **Vercel**: Agregar en el dashboard de Vercel

### 3. Verificar permisos
- Asegúrate de que tu integración de Notion tenga acceso a la base de datos de leads
- El token debe tener permisos de escritura

## 🔍 Cómo obtener el Database ID:

1. Abre la base de datos en Notion
2. Copia la URL completa
3. El ID está en la URL: `https://notion.so/workspace/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX?v=...`
4. Copia solo la parte del ID: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

## 🧪 Probar la configuración:

1. Reinicia el servidor de desarrollo
2. Ve a `http://localhost:3001/interest`
3. Llena el formulario y envía
4. Verifica en la consola del servidor que se procese correctamente
5. Verifica en Notion que se cree la entrada

## 🚀 Para producción:

- Las variables se configuran automáticamente en Vercel
- El endpoint `/api/leads/submit` usará las variables de entorno de Vercel
- Los leads se guardarán en la base de datos real de Notion 