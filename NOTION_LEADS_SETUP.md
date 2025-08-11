# Configuración de Base de Datos de Leads en Notion

## 🎯 Propósito
Base de datos para gestionar leads interesados en la aplicación Linka v2.0

## 📋 Estructura de la Base de Datos

### Propiedades principales:

1. **Nombre** (Title)
   - Tipo: Title
   - Descripción: Nombre completo del lead

2. **Email** (Email)
   - Tipo: Email
   - Descripción: Correo electrónico del lead

3. **Empresa** (Text)
   - Tipo: Rich text
   - Descripción: Empresa u organización del lead

4. **Rol/Cargo** (Select)
   - Tipo: Select
   - Opciones:
     - Desarrollador
     - Project Manager
     - Product Manager
     - CEO/Founder
     - Consultor
     - Otro

5. **Descripción** (Text)
   - Tipo: Rich text
   - Descripción: Descripción del caso de uso o interés

6. **Estado** (Select)
   - Tipo: Select
   - Opciones:
     - Pendiente (gris)
     - Aprobado (verde)
     - Rechazado (rojo)
     - Contactado (azul)

7. **Fecha de Registro** (Date)
   - Tipo: Date
   - Descripción: Fecha cuando se registró el lead

8. **Notas** (Text)
   - Tipo: Rich text
   - Descripción: Notas internas sobre el lead

9. **Fuente** (Select)
   - Tipo: Select
   - Opciones:
     - Landing Page
     - Demo
     - Referido
     - Otro

## 🔧 Pasos para crear la base de datos:

1. **Crear nueva base de datos en Notion**
   - Ir a tu workspace de Notion
   - Crear nueva página
   - Agregar base de datos (tabla)

2. **Configurar propiedades**
   - Agregar cada propiedad según la estructura arriba
   - Configurar colores y opciones de select

3. **Compartir con la integración**
   - Ir a Settings & members
   - Connections
   - Agregar tu integración de Linka v2.0

4. **Obtener Database ID**
   - Copiar el ID de la URL de la base de datos
   - Formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## 📝 Ejemplo de URL de base de datos:
```
https://notion.so/workspace/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?v=...
```

## 🔑 Token de integración:
- Usar el mismo token que ya tienes configurado para Linka v2.0
- Asegurarse de que tenga permisos de escritura en la nueva base de datos

## 🎨 Personalización opcional:
- Agregar icono a la base de datos
- Configurar vista por defecto (tabla o kanban)
- Agregar filtros automáticos por estado
- Configurar templates para respuestas rápidas 