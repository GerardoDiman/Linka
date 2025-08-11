# 🔧 Configuración de n8n en Hostinger

## 📋 Resumen

Este proyecto está configurado para usar **n8n en Hostinger** en lugar de un contenedor local. Esto significa que:

- ✅ **n8n está alojado en Hostinger** (no local)
- ✅ **Los webhooks se envían a tu n8n de Hostinger**
- ✅ **No necesitas ejecutar n8n localmente**

## 🔧 Configuración de Variables

### Variables Requeridas

En tu archivo `.env`, configura estas variables:

```env
# URL de tu n8n en Hostinger
N8N_WEBHOOK_URL=https://tu-n8n-en-hostinger.com/webhook/linka

# Secret para verificar webhooks (debe coincidir con el configurado en n8n)
N8N_WEBHOOK_SECRET=8e723900-53ba-4198-a303-fef0224f2d0a
```

### Ejemplo de Configuración

```env
# Si tu n8n está en: https://n8n.tudominio.com
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/linka

# Secret que configurarás en n8n
N8N_WEBHOOK_SECRET=tu-secret-super-seguro-123
```

## 🎯 Configuración en n8n (Hostinger)

### 1. Crear Webhook en n8n

1. **Accede a tu n8n en Hostinger**
2. **Crea un nuevo workflow**
3. **Agrega un nodo Webhook**
4. **Configura:**
   - **HTTP Method**: POST
   - **Path**: `/webhook/linka`
   - **Response Mode**: Respond to Webhook

### 2. Configurar Secret de Verificación

En tu workflow de n8n, agrega un nodo **Code** después del webhook:

```javascript
// Código para verificar el secret
const webhookData = $input.all()[0].json;
const expectedSecret = "tu-secret-super-seguro-123"; // Mismo que en .env

if (webhookData.secret !== expectedSecret) {
    throw new Error("Secret inválido");
}

return {
    event: webhookData.event,
    data: webhookData.data,
    timestamp: webhookData.timestamp
};
```

### 3. Eventos Disponibles

#### 📧 `new_lead`
Se envía cuando alguien se registra en el landing page.

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
  "secret": "tu-secret-super-seguro-123"
}
```

#### 🔄 `user_status_changed`
Se envía cuando un admin cambia el estado de un usuario.

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
  "secret": "tu-secret-super-seguro-123"
}
```

#### 📨 `invitation_created`
Se envía cuando se crea una invitación.

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
  "secret": "tu-secret-super-seguro-123"
}
```

#### 👤 `user_registered`
Se envía cuando un usuario completa su registro.

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
  "secret": "tu-secret-super-seguro-123"
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

## 🧪 Testing

### 1. Probar Webhook Localmente

Puedes probar el webhook con este comando:

```bash
curl -X POST https://tu-n8n-en-hostinger.com/webhook/linka \
  -H "Content-Type: application/json" \
  -d '{
    "event": "new_lead",
    "data": {
      "email": "test@ejemplo.com",
      "name": "Usuario de Prueba",
      "company": "Empresa Test",
      "role": "CEO",
      "description": "Interesado en el producto",
      "source": "Landing Page",
      "notionId": "test-notion-id-123"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "secret": "tu-secret-super-seguro-123"
  }'
```

### 2. Verificar en n8n

1. **Ve a tu n8n en Hostinger**
2. **Abre el workflow del webhook**
3. **Ejecuta el comando de prueba**
4. **Verifica que llegue el webhook**

## 🔒 Seguridad

- **Verifica el secret** en cada webhook
- **Usa HTTPS** para todas las conexiones
- **Valida los datos** antes de procesarlos
- **Maneja errores** apropiadamente

## 📊 Monitoreo

- **Logs de webhooks** en n8n
- **Métricas de emails** enviados
- **Estado de automatizaciones**
- **Errores y reintentos**

## 🆘 Troubleshooting

### Problema: Webhook no llega
1. **Verifica la URL** en `.env`
2. **Confirma que el secret coincida**
3. **Revisa los logs de n8n**
4. **Prueba con curl localmente**

### Problema: Secret inválido
1. **Verifica que el secret en `.env` coincida con el de n8n**
2. **Revisa el nodo de verificación en n8n**
3. **Asegúrate de que no haya espacios extra**

### Problema: n8n no responde
1. **Verifica que n8n esté funcionando en Hostinger**
2. **Revisa los logs de n8n**
3. **Confirma que el workflow esté activo** 