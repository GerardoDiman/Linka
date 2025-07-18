# Linka v2.0 - Visualizador de Bases de Datos de Notion

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0.2-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/ReactFlow-11.7.4-green" alt="ReactFlow" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.3.3-blue" alt="TailwindCSS" />
</div>

## 🎯 Descripción
Linka v2.0 es una aplicación web moderna que visualiza las bases de datos de Notion como un diagrama interactivo de nodos conectados, permitiendo explorar las relaciones entre datos de manera visual e intuitiva.

## ✨ Características

### 🎨 Visualización Interactiva
- **Nodos personalizados** para cada base de datos con iconos y estadísticas
- **Conexiones animadas** que muestran relaciones entre bases de datos
- **Layout automático** con posicionamiento inteligente
- **Zoom y pan** con controles avanzados
- **Minimap** para navegación rápida

### 🔍 Panel Lateral Avanzado
- **Filtros inteligentes** por relaciones y tipos de propiedades
- **Búsqueda en tiempo real** por nombre y descripción
- **Contador de resultados** filtrados
- **Detalles expandibles** de cada base de datos
- **Panel colapsable** para maximizar el espacio de visualización

### 📊 Información Detallada
- **Estadísticas** de workspace (bases de datos, relaciones, propiedades)
- **Tipos de propiedades** identificados con iconos
- **Relaciones** visualizadas con conexiones dirigidas
- **Estados de selección** para destacar bases de datos

## 🚀 Instalación y Uso

### 🌐 Despliegue en Vercel (Recomendado)

La forma más fácil de usar Linka v2.0 es desplegarla en Vercel:

1. **Fork o clona** este repositorio en tu cuenta de GitHub
2. Ve a [vercel.com](https://vercel.com) y conéctate con GitHub
3. **Importa el proyecto** desde tu repositorio
4. Vercel detectará automáticamente que es una aplicación React/Vite
5. **¡Listo!** Tu app estará disponible en `https://tu-proyecto.vercel.app`

### 💻 Desarrollo Local

#### Prerrequisitos
- Node.js 16+
- npm o yarn

#### Configuración Inicial
```bash
# Clonar el repositorio
git clone [repositorio]
cd linkav2.0

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🔐 Conexión con Notion

### ✅ Backend Serverless Integrado

**Linka v2.0 incluye un backend serverless integrado** que resuelve automáticamente los problemas de CORS. Solo necesitas tu token de integración de Notion para conectar con datos reales.

### 🎮 Opción 1: Datos de Demostración

La aplicación incluye **5 bases de datos de ejemplo** totalmente funcionales:

- **Projects** - Gestión de proyectos
- **Team Members** - Miembros del equipo  
- **Tasks** - Tareas y asignaciones
- **Resources** - Recursos y materiales
- **Meetings** - Reuniones y eventos

**Características del modo demo:**
- ✅ Todas las funcionalidades disponibles
- ✅ Relaciones reales entre bases de datos
- ✅ Filtros y búsquedas funcionales
- ✅ Sin configuración necesaria
- ✅ Perfecto para evaluación y demostraciones

### 🔧 Opción 2: Datos Reales (Solo Token Requerido)

Para usar datos reales de Notion, simplemente necesitas:

#### 1. Crear Integración en Notion
1. Ve a [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clic en "New integration"
3. Nombra tu integración y selecciona tu workspace
4. Copia el "Internal Integration Token"

#### 2. Compartir Bases de Datos
Para cada base de datos que quieras visualizar:
1. Abre la base de datos en Notion
2. Clic en "..." → "Connections" → "Connect to"
3. Selecciona tu integración
4. Confirma el acceso

#### 3. Usar en Linka
1. Abre Linka v2.0
2. Ve a la pestaña "Conectar"
3. Pega tu token
4. ¡Listo! Nuestro backend serverless se encarga del resto

### 🚀 Características del Backend Integrado

- **Funciones Serverless**: Usa Vercel Functions para máximo rendimiento
- **Sin Configuración**: Funciona automáticamente al desplegar
- **Seguridad**: Tu token nunca se almacena en nuestros servidores
- **Escalabilidad**: Se ajusta automáticamente a la demanda
- **Siempre Disponible**: 99.9% de uptime garantizado

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático
- **ReactFlow** - Visualización de nodos y conexiones
- **TailwindCSS** - Estilos y diseño
- **Lucide React** - Librería de iconos
- **React Hot Toast** - Notificaciones
- **Vite** - Herramienta de construcción

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── DatabaseNode.tsx      # Componente de nodo de base de datos
│   ├── CustomEdge.tsx        # Componente de conexión personalizada
│   ├── SidePanel.tsx         # Panel lateral con filtros
│   ├── SearchPanel.tsx       # Panel de búsqueda avanzada
│   ├── ExportPanel.tsx       # Panel de exportación
│   └── NotionSetup.tsx       # Pantalla de configuración
├── hooks/
│   └── useNotionData.ts      # Hook para manejo de datos
├── types/
│   └── notion.ts             # Definiciones de tipos
├── utils/
│   ├── notionApi.ts          # Cliente API (para backend)
│   ├── notionAuth.ts         # Autenticación y storage
│   ├── notionTransformers.ts # Transformación de datos
│   ├── relationshipDetector.ts # Detección de relaciones
│   └── exportUtils.ts        # Utilidades de exportación
├── App.tsx                   # Componente principal
└── main.tsx                  # Punto de entrada
```

## 🚧 Limitaciones Conocidas

1. **Autenticación**: Requiere token de integración de Notion (no OAuth público)
2. **Permisos**: Solo accede a bases de datos compartidas con la integración  
3. **Límites de API**: Sujeto a los límites de rate limiting de Notion
4. **Datos en Tiempo Real**: No incluye sincronización automática (requiere refresh manual)

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios importantes:

1. Abre un issue para discutir el cambio
2. Haz fork del proyecto
3. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. **Datos de demostración**: Simplemente usa el modo demo incluido para explorar
2. **Conexión con Notion**: Solo necesitas tu token de integración - el backend está incluido
3. **Issues**: Reporta bugs o solicita features en GitHub Issues
4. **Desarrollo local**: Consulta `START_HERE.md` para configuración local

---

<div align="center">
  <strong>¡Explora tus datos de Notion de manera visual con Linka v2.0!</strong>
</div>