# 🔗 Configuración de Integración con Notion

Esta guía te ayudará a configurar tu integración con Notion para visualizar tus bases de datos reales en Linka v2.0.

## 📋 Requisitos Previos

- Una cuenta de Notion con acceso a workspace
- Permisos para crear integraciones en tu workspace
- Al menos una base de datos en tu workspace de Notion

## 🔧 Paso a Paso: Crear Integración

### 1. Crear la Integración

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Haz clic en **"+ New integration"**
3. Completa los campos:
   - **Name**: `Linka v2.0` (o el nombre que prefieras)
   - **Logo**: Opcional
   - **Associated workspace**: Selecciona tu workspace
4. En **Capabilities**, asegúrate de que esté marcado:
   - ✅ **Read content**
   - ✅ **No user information** (por seguridad)
5. Haz clic en **"Submit"**

### 2. Copiar el Token de Integración

1. En la página de tu integración, busca **"Internal Integration Token"**
2. Haz clic en **"Show"** y luego **"Copy"**
3. ⚠️ **Importante**: Guarda este token de forma segura, lo necesitarás para conectar

### 3. Compartir Bases de Datos

**Muy importante**: La integración solo puede ver las bases de datos que compartas específicamente con ella.

Para cada base de datos que quieras visualizar:

1. Abre la base de datos en Notion
2. Haz clic en **"Share"** (botón en la esquina superior derecha)
3. En el campo de texto, escribe el nombre de tu integración (`Linka v2.0`)
4. Selecciona tu integración de la lista
5. Asegúrate de que tenga permisos de **"Can read"**
6. Haz clic en **"Invite"**

## 🚀 Conectar en Linka v2.0

1. Abre Linka v2.0 en tu navegador
2. Si no estás conectado, verás automáticamente la pantalla de configuración
3. Pega tu token de integración en el campo correspondiente
4. Haz clic en **"Conectar con Notion"**
5. ¡Listo! Tus bases de datos aparecerán en el diagrama

## 🔍 Solución de Problemas

### "Token de autenticación inválido"
- ✅ Verifica que hayas copiado el token completo
- ✅ El token debe comenzar con `secret_`
- ✅ No debe tener espacios al inicio o final

### "Sin permisos para acceder"
- ✅ Asegúrate de haber compartido las bases de datos with tu integración
- ✅ Verifica que la integración tenga permisos de lectura
- ✅ El nombre de la integración debe coincidir exactamente

### "No se encontraron bases de datos"
- ✅ Comparte al menos una base de datos con tu integración
- ✅ Espera unos segundos y vuelve a intentar
- ✅ Verifica que las bases de datos estén en el mismo workspace

### "Error de conexión"
- ✅ Verifica tu conexión a internet
- ✅ Notion podría estar experimentando problemas (revisa status.notion.so)

## 🔐 Seguridad y Privacidad

- 🔒 **Tu token se almacena solo en tu navegador** (localStorage)
- 🔒 **No se envía a ningún servidor externo**
- 🔒 **La integración solo puede leer, no modificar** tus datos
- 🔒 **Solo ve las bases de datos que compartas específicamente**

## 🎯 Mejores Prácticas

### Nomenclatura Clara
- Usa nombres descriptivos para tus bases de datos
- Agrega descripciones para contexto adicional

### Estructura de Relaciones
- Crea relaciones entre bases de datos relacionadas
- Usa propiedades de tipo "Relation" para conectar datos

### Mantenimiento
- Revisa periódicamente qué bases de datos están compartidas
- Actualiza descripciones cuando cambies la estructura

## 🆘 Soporte

Si tienes problemas:

1. **Revisa esta guía** para asegurarte de seguir todos los pasos
2. **Verifica en la consola del navegador** (F12) si hay errores específicos
3. **Intenta desconectar y reconectar** tu integración
4. **Verifica el estado de Notion** en [status.notion.so](https://status.notion.so)

## 🔄 Desconectar

Para desconectar tu integración:

1. En Linka v2.0, haz clic en **"Configurar"** en el indicador de estado
2. Haz clic en **"Desconectar"**
3. Opcional: Revoca la integración en [notion.so/my-integrations](https://www.notion.so/my-integrations)

---

¡Disfruta visualizando tus bases de datos de Notion! 🎉 