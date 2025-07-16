// Datos de demo para mostrar las capacidades de la app
export const demoDatabases = [
  {
    id: 'demo-projects',
    title: [{ plain_text: 'Proyectos de Desarrollo' }],
    description: [{ plain_text: 'Gestión de proyectos de software y desarrollo web' }],
    created_time: '2024-01-15T10:00:00.000Z',
    last_edited_time: '2024-07-15T14:30:00.000Z',
    icon: { type: 'emoji', emoji: '🚀' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' } },
    properties: {
      'Nombre': { type: 'title', title: {} },
      'Estado': { type: 'select', select: { options: [
        { name: 'Planificación', color: 'blue' },
        { name: 'En Desarrollo', color: 'yellow' },
        { name: 'Testing', color: 'orange' },
        { name: 'Completado', color: 'green' }
      ]}},
      'Prioridad': { type: 'select', select: { options: [
        { name: 'Alta', color: 'red' },
        { name: 'Media', color: 'yellow' },
        { name: 'Baja', color: 'green' }
      ]}},
      'Fecha Inicio': { type: 'date', date: {} },
      'Fecha Fin': { type: 'date', date: {} },
      'Presupuesto': { type: 'number', number: { format: 'dollar' } },
      'Equipo': { type: 'multi_select', multi_select: { options: [
        { name: 'Frontend', color: 'blue' },
        { name: 'Backend', color: 'green' },
        { name: 'Design', color: 'pink' },
        { name: 'QA', color: 'orange' }
      ]}},
      'Cliente': { type: 'relation', relation: { database_id: 'demo-clients', type: 'single_property' }},
      'Tareas': { type: 'relation', relation: { database_id: 'demo-tasks', type: 'single_property' }},
      'Documentos': { type: 'relation', relation: { database_id: 'demo-documents', type: 'single_property' }}
    }
  },
  {
    id: 'demo-clients',
    title: [{ plain_text: 'Clientes' }],
    description: [{ plain_text: 'Base de datos de clientes y contactos' }],
    created_time: '2024-01-10T09:00:00.000Z',
    last_edited_time: '2024-07-14T16:45:00.000Z',
    icon: { type: 'emoji', emoji: '👥' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400' } },
    properties: {
      'Nombre': { type: 'title', title: {} },
      'Email': { type: 'email', email: {} },
      'Teléfono': { type: 'phone_number', phone_number: {} },
      'Empresa': { type: 'rich_text', rich_text: {} },
      'Industria': { type: 'select', select: { options: [
        { name: 'Tecnología', color: 'blue' },
        { name: 'Finanzas', color: 'green' },
        { name: 'Salud', color: 'red' },
        { name: 'Educación', color: 'yellow' },
        { name: 'Retail', color: 'pink' }
      ]}},
      'Estado': { type: 'select', select: { options: [
        { name: 'Activo', color: 'green' },
        { name: 'Inactivo', color: 'gray' },
        { name: 'Prospecto', color: 'yellow' }
      ]}},
      'Fecha Registro': { type: 'date', date: {} },
      'Proyectos': { type: 'relation', relation: { database_id: 'demo-projects', type: 'single_property' }},
      'Facturas': { type: 'relation', relation: { database_id: 'demo-invoices', type: 'single_property' }}
    }
  },
  {
    id: 'demo-tasks',
    title: [{ plain_text: 'Tareas y Actividades' }],
    description: [{ plain_text: 'Seguimiento de tareas y actividades del proyecto' }],
    created_time: '2024-01-20T11:00:00.000Z',
    last_edited_time: '2024-07-15T12:20:00.000Z',
    icon: { type: 'emoji', emoji: '✅' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400' } },
    properties: {
      'Título': { type: 'title', title: {} },
      'Descripción': { type: 'rich_text', rich_text: {} },
      'Estado': { type: 'select', select: { options: [
        { name: 'Pendiente', color: 'gray' },
        { name: 'En Progreso', color: 'yellow' },
        { name: 'Revisión', color: 'orange' },
        { name: 'Completado', color: 'green' }
      ]}},
      'Prioridad': { type: 'select', select: { options: [
        { name: 'Crítica', color: 'red' },
        { name: 'Alta', color: 'orange' },
        { name: 'Media', color: 'yellow' },
        { name: 'Baja', color: 'green' }
      ]}},
      'Asignado a': { type: 'people', people: {} },
      'Fecha Vencimiento': { type: 'date', date: {} },
      'Tiempo Estimado': { type: 'number', number: { format: 'number' }},
      'Tiempo Real': { type: 'number', number: { format: 'number' }},
      'Proyecto': { type: 'relation', relation: { database_id: 'demo-projects', type: 'single_property' }},
      'Subtareas': { type: 'relation', relation: { database_id: 'demo-subtasks', type: 'single_property' }}
    }
  },
  {
    id: 'demo-documents',
    title: [{ plain_text: 'Documentos y Recursos' }],
    description: [{ plain_text: 'Almacenamiento de documentos, especificaciones y recursos' }],
    created_time: '2024-01-25T14:00:00.000Z',
    last_edited_time: '2024-07-15T10:15:00.000Z',
    icon: { type: 'emoji', emoji: '📄' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400' } },
    properties: {
      'Título': { type: 'title', title: {} },
      'Tipo': { type: 'select', select: { options: [
        { name: 'Especificación', color: 'blue' },
        { name: 'Manual', color: 'green' },
        { name: 'Contrato', color: 'red' },
        { name: 'Presentación', color: 'yellow' },
        { name: 'Reporte', color: 'purple' }
      ]}},
      'Versión': { type: 'number', number: { format: 'number' }},
      'Autor': { type: 'people', people: {} },
      'Fecha Creación': { type: 'date', date: {} },
      'Fecha Modificación': { type: 'date', date: {} },
      'Estado': { type: 'select', select: { options: [
        { name: 'Borrador', color: 'gray' },
        { name: 'En Revisión', color: 'yellow' },
        { name: 'Aprobado', color: 'green' },
        { name: 'Obsoleto', color: 'red' }
      ]}},
      'Proyecto': { type: 'relation', relation: { database_id: 'demo-projects', type: 'single_property' }},
      'Archivos': { type: 'files', files: {} }
    }
  },
  {
    id: 'demo-invoices',
    title: [{ plain_text: 'Facturas y Pagos' }],
    description: [{ plain_text: 'Gestión de facturas, pagos y finanzas del proyecto' }],
    created_time: '2024-02-01T08:00:00.000Z',
    last_edited_time: '2024-07-14T18:30:00.000Z',
    icon: { type: 'emoji', emoji: '💰' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1554224154-26032cdc-3044?w=400' } },
    properties: {
      'Número Factura': { type: 'title', title: {} },
      'Cliente': { type: 'relation', relation: { database_id: 'demo-clients', type: 'single_property' }},
      'Proyecto': { type: 'relation', relation: { database_id: 'demo-projects', type: 'single_property' }},
      'Monto': { type: 'number', number: { format: 'dollar' }},
      'Estado': { type: 'select', select: { options: [
        { name: 'Pendiente', color: 'yellow' },
        { name: 'Enviada', color: 'blue' },
        { name: 'Pagada', color: 'green' },
        { name: 'Vencida', color: 'red' }
      ]}},
      'Fecha Emisión': { type: 'date', date: {} },
      'Fecha Vencimiento': { type: 'date', date: {} },
      'Fecha Pago': { type: 'date', date: {} },
      'Método Pago': { type: 'select', select: { options: [
        { name: 'Transferencia', color: 'blue' },
        { name: 'Tarjeta', color: 'green' },
        { name: 'Efectivo', color: 'yellow' }
      ]}}
    }
  },
  {
    id: 'demo-subtasks',
    title: [{ plain_text: 'Subtareas' }],
    description: [{ plain_text: 'Desglose detallado de tareas en subtareas más pequeñas' }],
    created_time: '2024-02-05T13:00:00.000Z',
    last_edited_time: '2024-07-15T09:45:00.000Z',
    icon: { type: 'emoji', emoji: '📋' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400' } },
    properties: {
      'Descripción': { type: 'title', title: {} },
      'Estado': { type: 'select', select: { options: [
        { name: 'Pendiente', color: 'gray' },
        { name: 'En Progreso', color: 'yellow' },
        { name: 'Completado', color: 'green' }
      ]}},
      'Tiempo Estimado': { type: 'number', number: { format: 'number' }},
      'Tiempo Real': { type: 'number', number: { format: 'number' }},
      'Tarea Padre': { type: 'relation', relation: { database_id: 'demo-tasks', type: 'single_property' }}
    }
  },
  {
    id: 'demo-hidden',
    title: [{ plain_text: 'Base de Datos Oculta' }],
    description: [{ plain_text: 'Esta base de datos está oculta para demostrar la funcionalidad de visibilidad' }],
    created_time: '2024-02-10T16:00:00.000Z',
    last_edited_time: '2024-07-15T11:20:00.000Z',
    icon: { type: 'emoji', emoji: '🔒' },
    cover: { type: 'external', external: { url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400' } },
    properties: {
      'Título': { type: 'title', title: {} },
      'Categoría': { type: 'select', select: { options: [
        { name: 'Confidencial', color: 'red' },
        { name: 'Interno', color: 'orange' },
        { name: 'Archivado', color: 'gray' }
      ]}},
      'Fecha': { type: 'date', date: {} },
      'Notas': { type: 'rich_text', rich_text: {} }
    },
    isHidden: true // Esta base de datos aparecerá como oculta
  }
];

// Relaciones entre las bases de datos para el demo
export const demoRelations = [
  {
    source: 'demo-projects',
    target: 'demo-clients',
    relationName: 'Cliente',
    relationType: 'single_property',
    strength: 'strong'
  },
  {
    source: 'demo-projects',
    target: 'demo-tasks',
    relationName: 'Tareas',
    relationType: 'single_property',
    strength: 'strong'
  },
  {
    source: 'demo-projects',
    target: 'demo-documents',
    relationName: 'Documentos',
    relationType: 'single_property',
    strength: 'medium'
  },
  {
    source: 'demo-clients',
    target: 'demo-invoices',
    relationName: 'Facturas',
    relationType: 'single_property',
    strength: 'strong'
  },
  {
    source: 'demo-projects',
    target: 'demo-invoices',
    relationName: 'Facturas',
    relationType: 'single_property',
    strength: 'medium'
  },
  {
    source: 'demo-tasks',
    target: 'demo-subtasks',
    relationName: 'Subtareas',
    relationType: 'single_property',
    strength: 'strong'
  }
];

// Función para obtener datos de demo
export const getDemoData = () => {
  return {
    databases: demoDatabases,
    relations: demoRelations,
    hiddenDatabases: demoDatabases.filter(db => db.isHidden)
  };
}; 