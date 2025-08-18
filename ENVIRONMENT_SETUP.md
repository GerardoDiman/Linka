# Configuración de Variables de Entorno

## Archivo `.env` requerido

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# ========================================
# CONFIGURACION DE NOTION
# ========================================
# Token de integracion de Notion (obtener desde https://www.notion.so/my-integrations)
NOTION_TOKEN=your_notion_token_here

# ID de la base de datos de leads en Notion
NOTION_LEADS_DATABASE_ID=your_notion_database_id_here

# ========================================
# CONFIGURACION DE n8n WEBHOOKS
# ========================================
# URL del webhook de n8n
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/linka

# Secret para verificar webhooks de n8n
N8N_WEBHOOK_SECRET=your_webhook_secret_here

# ========================================
# CONFIGURACION DEL SERVIDOR
# ========================================
# Puerto del servidor
PORT=3000

# URL base de la API para el frontend
VITE_API_BASE_URL=http://localhost:3000/api

# URL del frontend (para enlaces de invitacion)
FRONTEND_URL=http://localhost:3000

# ========================================
# CONFIGURACION DE BASE DE DATOS
# ========================================
# URL de conexion a PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# ========================================
# CONFIGURACION DE JWT
# ========================================
# Secret para firmar tokens JWT (cambiar en produccion)
JWT_SECRET=your_super_secure_jwt_secret_here

# ========================================
# CONFIGURACION DE ENTORNO
# ========================================
# Entorno de ejecucion
NODE_ENV=development
```

## Variables para Vercel (Producción)

En Vercel, configura estas variables de entorno:

- `NOTION_TOKEN`
- `NOTION_LEADS_DATABASE_ID`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `DATABASE_URL` (URL de Neon)
- `JWT_SECRET`
- `ADMIN_PASSWORD`

## Seguridad

⚠️ **IMPORTANTE**: Nunca subas archivos `.env` al repositorio. Ya están incluidos en `.gitignore`. 