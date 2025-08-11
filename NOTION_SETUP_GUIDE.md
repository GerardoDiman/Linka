# 🚀 Guía de Configuración de Notion - Paso a Paso

## 📋 Resumen de lo que vamos a hacer:

1. ✅ Crear base de datos de leads en Notion
2. ✅ Obtener Database ID
3. ✅ Compartir con la integración
4. ✅ Configurar variables de entorno
5. ✅ Probar la configuración

---

## 🎯 Paso 1: Crear Base de Datos de Leads

### 1.1 Ir a Notion
- Abre tu workspace de Notion
- Crea una nueva página
- Dale un nombre como "Leads - Linka v2.0"

### 1.2 Crear Base de Datos
- En la página nueva, escribe `/table` y presiona Enter
- Se creará una base de datos vacía

### 1.3 Configurar Propiedades
Agrega estas propiedades exactamente como se muestran:

#### **Propiedades principales:**

1. **Nombre** (ya viene por defecto)
   - Tipo: Title
   - No cambiar nada

2. **Email** (nueva propiedad)
   - Tipo: Email
   - Nombre: "Email"

3. **Empresa** (nueva propiedad)
   - Tipo: Text
   - Nombre: "Empresa"

4. **Rol/Cargo** (nueva propiedad)
   - Tipo: Select
   - Nombre: "Rol/Cargo"
   - Opciones:
     - Desarrollador
     - Project Manager
     - Product Manager
     - CEO/Founder
     - Consultor
     - Otro

5. **Descripción** (nueva propiedad)
   - Tipo: Text
   - Nombre: "Descripción"

6. **Estado** (nueva propiedad)
   - Tipo: Select
   - Nombre: "Estado"
   - Opciones:
     - Pendiente (color gris)
     - Aprobado (color verde)
     - Rechazado (color rojo)
     - Contactado (color azul)

7. **Fecha de Registro** (nueva propiedad)
   - Tipo: Date
   - Nombre: "Fecha de Registro"

8. **Notas** (nueva propiedad)
   - Tipo: Text
   - Nombre: "Notas"

9. **Fuente** (nueva propiedad)
   - Tipo: Select
   - Nombre: "Fuente"
   - Opciones:
     - Landing Page
     - Demo
     - Referido
     - Otro

---

## 🔍 Paso 2: Obtener Database ID

### 2.1 Abrir la Base de Datos
- Haz clic en la base de datos para abrirla en pantalla completa

### 2.2 Copiar la URL
- Copia la URL completa de la barra de direcciones
- Se ve así: `https://notion.so/workspace/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX?v=...`

### 2.3 Extraer el ID
- El ID es la parte: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
- Guárdalo, lo necesitarás en el siguiente paso

---

## 🔗 Paso 3: Compartir con la Integración

### 3.1 Abrir Configuración
- En la esquina superior derecha, haz clic en "Share"
- Luego haz clic en "Connections"

### 3.2 Agregar Integración
- Busca tu integración de "Linka v2.0"
- Haz clic en "Add connection"
- Asegúrate de que tenga permisos de escritura

### 3.3 Verificar Permisos
- La integración debe aparecer en la lista de conexiones
- Debe tener acceso de "Full access"

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Crear Archivo .env.local
- En la raíz del proyecto, crea un archivo llamado `.env.local`
- Copia el contenido del archivo `config.example.env`

### 4.2 Llenar Variables
```env
# Token de integración de Notion (el mismo que usas para la app)
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ID de la base de datos de leads en Notion
NOTION_LEADS_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4.3 Reemplazar Valores
- `NOTION_TOKEN`: Tu token de integración de Notion
- `NOTION_LEADS_DATABASE_ID`: El ID que obtuviste en el Paso 2

---

## 🧪 Paso 5: Probar la Configuración

### 5.1 Ejecutar Script de Prueba
```bash
npm run test:notion
```

### 5.2 Verificar Resultado
Si todo está bien, verás:
```
✅ Variables de entorno encontradas
✅ Conexión exitosa
✅ Base de datos accesible
✅ Configuración correcta! El sistema de leads está listo.
```

### 5.3 Probar Formulario
1. Ve a `http://localhost:3001/interest`
2. Llena el formulario con datos de prueba
3. Envía el formulario
4. Verifica que se cree la entrada en Notion

---

## 🚨 Solución de Problemas

### Error: "Token inválido"
- Verifica que el token sea correcto
- Asegúrate de que comience con `secret_`

### Error: "Base de datos no encontrada"
- Verifica que el Database ID sea correcto
- Copia exactamente la parte del ID de la URL

### Error: "Sin permisos"
- Comparte la base de datos con tu integración
- Verifica que tenga permisos de escritura

### Error: "Variables no encontradas"
- Verifica que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor después de crear el archivo

---

## 🎉 ¡Listo!

Una vez que hayas completado todos los pasos:

1. ✅ Los leads se guardarán automáticamente en Notion
2. ✅ Podrás ver todos los leads en tu base de datos
3. ✅ El sistema estará listo para la siguiente fase (n8n)

### Próximo paso: Configurar n8n para automatización de emails 