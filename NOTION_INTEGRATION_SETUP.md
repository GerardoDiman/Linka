# 🔗 Integración Completa con Notion

## 📋 Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Notion API Configuration
NOTION_TOKEN=your_notion_integration_token_here
NOTION_LEADS_DATABASE_ID=your_leads_database_id_here

# Opcional: Para desarrollo local
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Configuración de la Base de Datos de Notion

Tu base de datos de leads debe tener las siguientes propiedades:

#### **Propiedades Requeridas:**
- **Email** (Email) - Email del usuario
- **Nombre** (Title) - Nombre del usuario
- **Estado** (Select) - Estados: Pending, Approved, Rejected, Admin
- **Fecha de Registro** (Date) - Fecha de registro

#### **Propiedades Opcionales:**
- **Empresa** (Rich Text) - Empresa del usuario
- **Rol/Cargo** (Select) - Cargo o rol profesional
- **Descripción** (Rich Text) - Descripción del usuario
- **Fuente** (Select) - Origen del lead (Landing Page, Demo, etc.)
- **Notas** (Rich Text) - Notas del administrador

### 3. Configuración del Token de Notion

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Crea una nueva integración
3. Dale permisos de lectura y escritura a la base de datos de leads
4. Copia el token y agrégalo a tu `.env`

### 4. Obtener el ID de la Base de Datos

1. Abre tu base de datos de leads en Notion
2. Copia la URL
3. El ID está en la URL: `https://notion.so/workspace/[DATABASE_ID]?v=...`

## 🚀 Funcionalidades Implementadas

### ✅ **Verificación de Estado en Tiempo Real**
- Los usuarios pueden verificar su estado desde la página de login
- Se conecta directamente con Notion para obtener el estado actual
- Fallback a datos simulados si hay problemas de conexión

### ✅ **Panel de Administración Completo**
- Vista de todos los usuarios desde Notion
- Estadísticas en tiempo real
- Cambio de roles con actualización automática en Notion
- Sistema de notas para rechazos
- Interfaz moderna y responsive

### ✅ **Sincronización Bidireccional**
- Los cambios en el panel se reflejan inmediatamente en Notion
- Los cambios en Notion se reflejan en el panel al actualizar
- Sistema de fallback robusto

## 🔧 Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Desplegar en Vercel
vercel --prod
```

## 🧪 Testing

### Usuarios de Prueba:
- **demo@example.com** - Aprobado
- **test@example.com** - Pendiente
- **admin@example.com** - Administrador
- **rejected@example.com** - Rechazado

### Flujo de Prueba:
1. Ve a `/admin` como admin@example.com
2. Cambia el estado de test@example.com a "approved"
3. Verifica que el cambio se refleje en las estadísticas
4. Prueba el sistema de notas al rechazar un usuario

## 📊 Monitoreo

### Logs del Servidor:
- ✅ Usuarios cargados desde Notion
- ✅ Estado actualizado en Notion
- ❌ Errores de conexión con Notion
- 📝 Notas del administrador

### Métricas Disponibles:
- Total de usuarios
- Usuarios pendientes
- Usuarios aprobados
- Usuarios rechazados
- Administradores

## 🔒 Seguridad

### Validaciones Implementadas:
- Verificación de roles antes de permitir acceso al panel
- Validación de estados permitidos
- Sanitización de datos de entrada
- Manejo de errores de autenticación

### Permisos de Notion:
- Solo lectura y escritura en la base de datos específica
- No acceso a otras páginas o bases de datos
- Token con permisos mínimos necesarios

## 🚨 Troubleshooting

### Error: "Token de Notion inválido"
- Verifica que el token esté correcto en `.env`
- Asegúrate de que la integración tenga permisos en la base de datos

### Error: "Base de datos no encontrada"
- Verifica que el `NOTION_LEADS_DATABASE_ID` sea correcto
- Asegúrate de que la integración tenga acceso a la base de datos

### Error: "Configuración de base de datos no encontrada"
- Verifica que todas las variables de entorno estén configuradas
- Reinicia el servidor después de cambiar las variables

### Datos de Fallback:
Si hay problemas de conexión con Notion, el sistema usa datos simulados para mantener la funcionalidad.

## 📈 Próximos Pasos

1. **Notificaciones por Email** - Enviar emails automáticos cuando se apruebe/rechace un usuario
2. **Webhooks de Notion** - Recibir actualizaciones en tiempo real desde Notion
3. **Analytics Avanzados** - Métricas de conversión y tiempo de respuesta
4. **Filtros y Búsqueda** - Búsqueda avanzada en el panel de administración
5. **Exportación de Datos** - Exportar reportes en diferentes formatos 