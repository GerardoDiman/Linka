# 📧 Templates de Email para n8n

## 🎨 Template Base (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Linka v2.0</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Linka v2.0</h1>
        </div>
        <div class="content">
            {{CONTENT}}
        </div>
        <div class="footer">
            <p>© 2024 Linka v2.0. Todos los derechos reservados.</p>
            <p>Si tienes preguntas, contacta a nuestro equipo de soporte.</p>
        </div>
    </div>
</body>
</html>
```

## 📝 **1. Email de Confirmación de Lead**

**Asunto:** `¡Gracias por tu interés en Linka v2.0!`

**Contenido:**
```html
<h2>¡Gracias por tu interés en Linka v2.0! 🎉</h2>

<p>Hola <strong>{{$json.data.name}}</strong>,</p>

<p>Hemos recibido tu solicitud de acceso a <strong>Linka v2.0</strong> y estamos emocionados de que te interese nuestra plataforma.</p>

<div class="highlight">
    <h3>📋 Detalles de tu solicitud:</h3>
    <ul>
        <li><strong>Empresa:</strong> {{$json.data.company}}</li>
        <li><strong>Cargo:</strong> {{$json.data.role}}</li>
        <li><strong>Descripción:</strong> {{$json.data.description}}</li>
        <li><strong>Fuente:</strong> {{$json.data.source}}</li>
    </ul>
</div>

<p>Nuestro equipo revisará tu solicitud cuidadosamente y te contactaremos pronto con más información sobre el acceso a la plataforma.</p>

<p><strong>¿Qué sigue?</strong></p>
<ul>
    <li>Revisaremos tu perfil y necesidades</li>
    <li>Te enviaremos información detallada sobre Linka v2.0</li>
    <li>Te contactaremos para coordinar el acceso</li>
</ul>

<p>Mientras tanto, puedes explorar más sobre nuestras funcionalidades en nuestro sitio web.</p>

<p>Saludos,<br>
<strong>El equipo de Linka v2.0</strong></p>
```

## ✅ **2. Email de Aprobación**

**Asunto:** `¡Tu solicitud ha sido aprobada! 🎉`

**Contenido:**
```html
<h2>¡Excelentes noticias! 🎉</h2>

<p>Hola <strong>{{$json.data.name}}</strong>,</p>

<p>¡Nos complace informarte que tu solicitud de acceso a <strong>Linka v2.0</strong> ha sido <strong>APROBADA</strong>!</p>

<div class="highlight">
    <h3>📊 Estado de tu solicitud:</h3>
    <ul>
        <li><strong>Estado anterior:</strong> <span style="color: #ffc107;">{{$json.data.oldStatus}}</span></li>
        <li><strong>Estado actual:</strong> <span style="color: #28a745;">{{$json.data.newStatus}}</span></li>
        <li><strong>Notas del administrador:</strong> {{$json.data.adminNotes}}</li>
    </ul>
</div>

<p><strong>¡Ya puedes acceder a la plataforma!</strong></p>

<p>Para comenzar a usar Linka v2.0:</p>
<ol>
    <li>Ve a <a href="https://tu-dominio.com/login">nuestra plataforma</a></li>
    <li>Inicia sesión con tu cuenta</li>
    <li>Explora todas las funcionalidades disponibles</li>
</ol>

<p>Si tienes alguna pregunta o necesitas ayuda para comenzar, no dudes en contactarnos.</p>

<p>¡Bienvenido a la comunidad de Linka v2.0!</p>

<p>Saludos,<br>
<strong>El equipo de Linka v2.0</strong></p>
```

## 📨 **3. Email de Invitación**

**Asunto:** `¡Has sido invitado a Linka v2.0! 🚀`

**Contenido:**
```html
<h2>¡Has sido invitado a Linka v2.0! 🚀</h2>

<p>Hola,</p>

<p>Has sido invitado a unirte a <strong>Linka v2.0</strong>, nuestra plataforma avanzada de gestión y visualización de datos.</p>

<div class="highlight">
    <h3>📋 Información de tu invitación:</h3>
    <ul>
        <li><strong>Email invitado:</strong> {{$json.data.email}}</li>
        <li><strong>Invitado por:</strong> Administrador del sistema</li>
        <li><strong>Expira:</strong> {{$json.data.expiresAt}}</li>
    </ul>
</div>

<p><strong>Para completar tu registro:</strong></p>

<a href="{{$json.data.invitationLink}}" class="button">🎯 Completar Registro</a>

<p><strong>O copia y pega este enlace en tu navegador:</strong><br>
<code>{{$json.data.invitationLink}}</code></p>

<p><strong>⚠️ Importante:</strong> Este enlace expira el {{$json.data.expiresAt}}. Asegúrate de completar tu registro antes de esa fecha.</p>

<p>Una vez que completes tu registro, tendrás acceso completo a todas las funcionalidades de Linka v2.0.</p>

<p>¡Esperamos verte pronto en la plataforma!</p>

<p>Saludos,<br>
<strong>El equipo de Linka v2.0</strong></p>
```

## 👋 **4. Email de Bienvenida**

**Asunto:** `¡Bienvenido a Linka v2.0! 🎉`

**Contenido:**
```html
<h2>¡Bienvenido a Linka v2.0! 🎉</h2>

<p>Hola <strong>{{$json.data.name}}</strong>,</p>

<p>¡Nos complace darte la bienvenida a <strong>Linka v2.0</strong>!</p>

<p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar todas las funcionalidades de nuestra plataforma.</p>

<div class="highlight">
    <h3>🎯 Información de tu cuenta:</h3>
    <ul>
        <li><strong>Email:</strong> {{$json.data.email}}</li>
        <li><strong>Rol:</strong> {{$json.data.role}}</li>
        <li><strong>ID de usuario:</strong> {{$json.data.userId}}</li>
    </ul>
</div>

<p><strong>¿Qué puedes hacer ahora?</strong></p>
<ul>
    <li>🔍 Explorar la visualización de datos</li>
    <li>📊 Crear dashboards personalizados</li>
    <li>🔗 Conectar tus bases de datos</li>
    <li>📈 Analizar métricas en tiempo real</li>
</ul>

<p>Para comenzar, te recomendamos:</p>
<ol>
    <li>Revisar nuestro <a href="#">tutorial de inicio</a></li>
    <li>Explorar las <a href="#">funcionalidades principales</a></li>
    <li>Configurar tu <a href="#">primer dashboard</a></li>
</ol>

<p>Si tienes alguna pregunta o necesitas ayuda, nuestro equipo de soporte está aquí para ayudarte.</p>

<p>¡Disfruta explorando Linka v2.0!</p>

<p>Saludos,<br>
<strong>El equipo de Linka v2.0</strong></p>
```

## 📢 **5. Notificación al Admin**

**Asunto:** `Nuevo lead registrado en Linka v2.0 📊`

**Contenido:**
```html
<h2>Nuevo Lead Registrado 📊</h2>

<p>Hola Administrador,</p>

<p>Se ha registrado un nuevo lead en <strong>Linka v2.0</strong>.</p>

<div class="highlight">
    <h3>📋 Detalles del nuevo lead:</h3>
    <ul>
        <li><strong>Nombre:</strong> {{$json.data.name}}</li>
        <li><strong>Email:</strong> {{$json.data.email}}</li>
        <li><strong>Empresa:</strong> {{$json.data.company}}</li>
        <li><strong>Cargo:</strong> {{$json.data.role}}</li>
        <li><strong>Descripción:</strong> {{$json.data.description}}</li>
        <li><strong>Fuente:</strong> {{$json.data.source}}</li>
        <li><strong>ID en Notion:</strong> {{$json.data.notionId}}</li>
    </ul>
</div>

<p><strong>Acciones recomendadas:</strong></p>
<ol>
    <li>Revisar el perfil del lead en el panel de administración</li>
    <li>Evaluar la solicitud según los criterios establecidos</li>
    <li>Contactar al lead si es necesario</li>
    <li>Actualizar el estado en el sistema</li>
</ol>

<p>Puedes acceder al panel de administración para gestionar este lead.</p>

<p>Saludos,<br>
<strong>Sistema de Notificaciones - Linka v2.0</strong></p>
```

## 🔧 **Configuración en n8n**

### **Variables de entorno para n8n:**
```env
# Configuración de email
EMAIL_FROM=noreply@tuempresa.com
EMAIL_REPLY_TO=soporte@tuempresa.com
ADMIN_EMAIL=admin@tuempresa.com

# URLs de la aplicación
APP_URL=https://tu-dominio.com
ADMIN_PANEL_URL=https://tu-dominio.com/admin
```

### **Configuración de nodos en n8n:**
1. **Webhook** → **Code (verificación)** → **Switch (router)** → **Email (Gmail/SendGrid)**
2. **Configurar templates** con las variables de n8n
3. **Agregar manejo de errores** y logs
4. **Configurar reintentos** para emails fallidos 