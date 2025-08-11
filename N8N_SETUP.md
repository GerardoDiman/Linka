# 🚀 Configuración de n8n con Webhooks

## 📋 Variables de Entorno Necesarias

Agrega estas variables a tu archivo `.env`:

```env
# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://tu-n8n-en-hostinger.com/webhook/linka
N8N_WEBHOOK_SECRET=tu-webhook-secret-super-seguro
```

## 🔧 Configuración en n8n

### 1. Crear Webhook Trigger
1. Ve a tu n8n en Hostinger
2. Crea un nuevo workflow
3. Agrega un nodo **Webhook**
4. Configura:
   - **HTTP Method**: POST
   - **Path**: `/webhook/linka`
   - **Response Mode**: Respond to Webhook

### 2. Eventos Disponibles

#### 📧 `new_lead`
Se envía cuando alguien se registra en el landing page.

**Datos recibidos:**
```json
{
  "event": "new_lead",
  "data": {
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "company": "Empresa ABC",
    "role": "CEO",
    "description": "Interesado en el producto",
    "source": "Landing Page",
    "notionId": "23e23882-4ec5-8103-a078-c692ddcaedc4"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "secret": "tu-webhook-secret"
}
```

#### 🔄 `user_status_changed`
Se envía cuando un admin cambia el estado de un usuario.

**Datos recibidos:**
```json
{
  "event": "user_status_changed",
  "data": {
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "oldStatus": "pending",
    "newStatus": "approved",
    "adminNotes": "Usuario aprobado para acceso",
    "notionId": "23e23882-4ec5-8103-a078-c692ddcaedc4"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "secret": "tu-webhook-secret"
}
```

#### 📨 `invitation_created`
Se envía cuando se crea una invitación.

**Datos recibidos:**
```json
{
  "event": "invitation_created",
  "data": {
    "email": "usuario@ejemplo.com",
    "invitedBy": 1,
    "invitationLink": "http://localhost:3000/register?token=abc123",
    "expiresAt": "2024-01-22T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "secret": "tu-webhook-secret"
}
```

#### 👤 `user_registered`
Se envía cuando un usuario completa su registro.

**Datos recibidos:**
```json
{
  "event": "user_registered",
  "data": {
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "approved",
    "userId": 123
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "secret": "tu-webhook-secret"
}
```

## 🎯 Automatizaciones Recomendadas

### 1. Email de Confirmación de Lead
```
Trigger: new_lead
→ Gmail/SendGrid
→ Template: "Gracias por tu interés"
```

### 2. Email de Aprobación
```
Trigger: user_status_changed (newStatus = "approved")
→ Gmail/SendGrid
→ Template: "Tu solicitud ha sido aprobada"
```

### 3. Email de Invitación
```
Trigger: invitation_created
→ Gmail/SendGrid
→ Template: "Has sido invitado a Linka v2.0"
```

### 4. Email de Bienvenida
```
Trigger: user_registered
→ Gmail/SendGrid
→ Template: "Bienvenido a Linka v2.0"
```

### 5. Notificación al Admin
```
Trigger: new_lead
→ Gmail/SendGrid
→ Template: "Nuevo lead registrado"
```

## 🔒 Seguridad

- **Verifica el secret** en cada webhook
- **Usa HTTPS** para todas las conexiones
- **Valida los datos** antes de procesarlos
- **Maneja errores** apropiadamente

## 🧪 Testing

Para probar los webhooks:

1. **Configura las variables de entorno**
2. **Crea el webhook en n8n**
3. **Registra un lead** en el landing page
4. **Verifica que llegue el webhook** en n8n
5. **Configura las automatizaciones** de email

## 📊 Monitoreo

- **Logs de webhooks** en n8n
- **Métricas de emails** enviados
- **Estado de automatizaciones**
- **Errores y reintentos** 