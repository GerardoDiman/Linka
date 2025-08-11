# 🚀 Configuración Rápida - Linka v2.0

## 📋 Resumen del Proyecto

Linka v2.0 es una aplicación completa que incluye:
- **Frontend React** con visualización de bases de datos de Notion
- **Backend Node.js** con autenticación y gestión de usuarios
- **Base de datos PostgreSQL** para usuarios y sesiones
- **n8n** para automatizaciones y webhooks
- **pgAdmin** para gestión de base de datos

## 🔧 Configuración Paso a Paso

### 1. 📝 Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
# Copiar archivo de ejemplo
copy env-complete.example .env

# Editar .env con tus valores reales
notepad .env
```

**Variables obligatorias:**
```env
# Notion (obtener desde https://www.notion.so/my-integrations)
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_LEADS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# n8n (configurar en tu n8n de Hostinger)
N8N_WEBHOOK_URL=https://tu-n8n-en-hostinger.com/webhook/linka
N8N_WEBHOOK_SECRET=8e723900-53ba-4198-a303-fef0224f2d0a

# Servidor
PORT=3000
VITE_API_BASE_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:3000

# Base de datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/linka

# JWT (cambiar en producción)
JWT_SECRET=tu-jwt-secret-super-seguro-cambiar-en-produccion
```

### 2. 🐳 Iniciar Contenedores

```bash
# Iniciar todos los servicios
docker-compose up -d

# Verificar que estén funcionando
docker-compose ps
```

**Servicios incluidos:**
- **PostgreSQL** (puerto 5432) - Base de datos principal
- **pgAdmin** (puerto 8080) - Gestión de base de datos
- **n8n** - Configurado en Hostinger (no local)

### 3. 📦 Instalar Dependencias

```bash
npm install
```

### 4. 🚀 Iniciar Desarrollo

```bash
npm run dev
```

## 🌐 Accesos

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Aplicación** | http://localhost:3000 | - |
| **pgAdmin** | http://localhost:8080 | admin@linka.com / admin123 |
| **n8n** | Tu URL de Hostinger | Tus credenciales |

## 🔍 Verificación

Ejecuta el script de verificación para comprobar que todo esté configurado:

```bash
node check-all-config.cjs
```

## 📊 Funcionalidades

### Frontend (React + TypeScript)
- ✅ Visualización de bases de datos de Notion
- ✅ Autenticación de usuarios
- ✅ Panel de administración
- ✅ Gestión de leads y usuarios
- ✅ Sistema de invitaciones

### Backend (Node.js)
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Integración con Notion
- ✅ Webhooks para n8n
- ✅ Base de datos PostgreSQL

### Automatizaciones (n8n)
- ✅ Email de confirmación de leads
- ✅ Email de aprobación de usuarios
- ✅ Email de invitaciones
- ✅ Email de bienvenida
- ✅ Notificaciones al admin

## 🛠️ Comandos Útiles

```bash
# Verificar configuración
node check-all-config.cjs

# Iniciar contenedores
docker-compose up -d

# Detener contenedores
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔧 Troubleshooting

### Problema: Contenedores no inician
```bash
# Verificar Docker
docker --version
docker-compose --version

# Limpiar y reiniciar
docker-compose down
docker system prune -f
docker-compose up -d
```

### Problema: Variables de entorno no cargan
```bash
# Verificar archivo .env
node check-all-config.js

# Recargar variables
npm run dev
```

### Problema: Base de datos no conecta
```bash
# Verificar PostgreSQL
docker-compose logs postgres

# Conectar manualmente
docker exec -it linka-postgres psql -U postgres -d linka
```

## 📚 Documentación Adicional

- [N8N_SETUP.md](./N8N_SETUP.md) - Configuración detallada de n8n
- [NOTION_SETUP_GUIDE.md](./NOTION_SETUP_GUIDE.md) - Configuración de Notion
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guía de desarrollo
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas

## 🆘 Soporte

Si tienes problemas:
1. Ejecuta `node check-all-config.js`
2. Revisa los logs: `docker-compose logs -f`
3. Consulta la documentación específica
4. Verifica que todas las variables estén configuradas 