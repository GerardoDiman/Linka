    # 🚀 Configuración de Automatizaciones en n8n

    ## 📋 Estructura del Workflow

    ### 1. **Nodo Webhook (Trigger)**
    - **Tipo**: Webhook
    - **HTTP Method**: POST
    - **Path**: `/webhook/linka`
    - **Response Mode**: Respond to Webhook

    ### 2. **Nodo de Verificación de Secret**
    ```javascript
    // Código para el nodo "Code"
    const webhookData = $input.all()[0].json;
    const expectedSecret = "8e723900-53ba-4198-a303-fef0224f2d0a";

    if (webhookData.secret !== expectedSecret) {
    throw new Error("Secret inválido");
    }

    return {
    event: webhookData.event,
    data: webhookData.data,
    timestamp: webhookData.timestamp
    };
    ```

    ### 3. **Nodo Switch (Router)**
    Configurar condiciones para diferentes eventos:
    - `new_lead` → Email de confirmación
    - `user_status_changed` → Email de aprobación
    - `invitation_created` → Email de invitación
    - `user_registered` → Email de bienvenida

    ## 📧 **2. Templates de Email**

    ### **Email de Confirmación (new_lead)**
    ```html
    <h2>¡Gracias por tu interés en Linka v2.0!</h2>
    <p>Hola {{$json.data.name}},</p>
    <p>Hemos recibido tu solicitud de acceso a Linka v2.0.</p>
    <p><strong>Detalles de tu solicitud:</strong></p>
    <ul>
    <li><strong>Empresa:</strong> {{$json.data.company}}</li>
    <li><strong>Cargo:</strong> {{$json.data.role}}</li>
    <li><strong>Descripción:</strong> {{$json.data.description}}</li>
    </ul>
    <p>Nuestro equipo revisará tu solicitud y te contactaremos pronto.</p>
    <p>Saludos,<br>El equipo de Linka</p>
    ```

    ### **Email de Aprobación (user_status_changed)**
    ```html
    <h2>¡Tu solicitud ha sido aprobada! 🎉</h2>
    <p>Hola {{$json.data.name}},</p>
    <p>¡Excelentes noticias! Tu solicitud de acceso a Linka v2.0 ha sido aprobada.</p>
    <p><strong>Estado anterior:</strong> {{$json.data.oldStatus}}</p>
    <p><strong>Estado actual:</strong> {{$json.data.newStatus}}</p>
    <p><strong>Notas del administrador:</strong> {{$json.data.adminNotes}}</p>
    <p>Ya puedes acceder a la plataforma con tu cuenta.</p>
    <p>Saludos,<br>El equipo de Linka</p>
    ```

    ### **Email de Invitación (invitation_created)**
    ```html
    <h2>¡Has sido invitado a Linka v2.0! 🚀</h2>
    <p>Hola,</p>
    <p>Has sido invitado a unirte a Linka v2.0.</p>
    <p><strong>Link de registro:</strong> <a href="{{$json.data.invitationLink}}">{{$json.data.invitationLink}}</a></p>
    <p><strong>Expira:</strong> {{$json.data.expiresAt}}</p>
    <p>Haz clic en el enlace para completar tu registro.</p>
    <p>Saludos,<br>El equipo de Linka</p>
    ```

    ## 🔧 **3. Configuración de Nodos**

    ### **Nodo Gmail/SendGrid**
    - **Tipo**: Gmail o SendGrid
    - **To**: `{{$json.data.email}}`
    - **Subject**: Según el evento
    - **Body**: Template correspondiente

    ### **Nodo de Notificación al Admin**
    ```javascript
    // Para notificar al admin sobre nuevos leads
    const adminEmail = "admin@tuempresa.com";
    const subject = "Nuevo lead registrado en Linka v2.0";
    const body = `
    Nuevo lead registrado:
    - Email: ${$json.data.email}
    - Nombre: ${$json.data.name}
    - Empresa: ${$json.data.company}
    - Cargo: ${$json.data.role}
    - Descripción: ${$json.data.description}
    `;
    ```

    ## 📊 **4. Monitoreo y Logs**

    ### **Nodo de Log**
    ```javascript
    // Guardar logs de webhooks
    const logData = {
    timestamp: new Date().toISOString(),
    event: $json.event,
    email: $json.data.email,
    status: "processed"
    };
    // Guardar en base de datos o archivo
    ```

    ## 🧪 **5. Testing del Workflow**

    ### **Datos de prueba:**
    ```json
    {
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
    "secret": "8e723900-53ba-4198-a303-fef0224f2d0a"
    }
    ``` 