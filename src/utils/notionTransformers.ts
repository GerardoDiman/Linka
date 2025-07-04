import { NotionDatabase, NotionProperty } from '../types/notion'

// Transformar database de la API de Notion a nuestro formato
export function transformNotionDatabase(apiDatabase: any): NotionDatabase {
  const properties: Record<string, NotionProperty> = {}
  
  // Transformar propiedades
  if (apiDatabase.properties) {
    Object.entries(apiDatabase.properties).forEach(([key, prop]: [string, any]) => {
      properties[key] = {
        id: prop.id || key,
        name: key,
        type: prop.type,
        ...prop
      }
    })
  }

  // Extraer relaciones
  const relations: string[] = []
  Object.values(properties).forEach((prop: NotionProperty) => {
    if (prop.type === 'relation' && prop.relation) {
      if (prop.relation.database_id) {
        relations.push(prop.relation.database_id)
      }
    }
  })

  return {
    id: apiDatabase.id,
    title: extractTitle(apiDatabase.title),
    description: extractDescription(apiDatabase.description),
    url: apiDatabase.url,
    cover: apiDatabase.cover,
    icon: apiDatabase.icon,
    properties,
    relations: relations.length > 0 ? relations : undefined,
    createdTime: apiDatabase.created_time,
    lastEditedTime: apiDatabase.last_edited_time
  }
}

// Extraer título del objeto rich text de Notion
function extractTitle(titleArray: any[]): string {
  if (!titleArray || !Array.isArray(titleArray)) {
    return 'Untitled Database'
  }
  
  return titleArray
    .map(item => item.plain_text || item.text?.content || '')
    .join('')
    .trim() || 'Untitled Database'
}

// Extraer descripción del objeto rich text de Notion
function extractDescription(descriptionArray: any[]): string | undefined {
  if (!descriptionArray || !Array.isArray(descriptionArray)) {
    return undefined
  }
  
  const description = descriptionArray
    .map(item => item.plain_text || item.text?.content || '')
    .join('')
    .trim()
    
  return description || undefined
}

// Transformar error de la API de Notion a mensaje amigable
export function transformNotionError(error: any): string {
  // Si el error ya es un string procesado, devolverlo
  if (typeof error === 'string') {
    return error
  }

  // Manejar errores de nuestro cliente personalizado
  if (error.message) {
    if (error.message.includes('Notion API Error:')) {
      return error.message.replace('Notion API Error: ', '')
    }
    
    if (error.message.includes('Failed to fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet y que no haya bloqueos de CORS.'
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('net::ERR_')) {
      return 'Error de red. Verifica tu conexión a internet.'
    }
  }

  // Manejar códigos de error específicos de Notion
  if (error.code) {
    switch (error.code) {
      case 'unauthorized':
        return 'Token de autenticación inválido. Verifica que hayas copiado correctamente el token de integración.'
      case 'forbidden':
        return 'Sin permisos para acceder. Asegúrate de haber compartido las bases de datos con tu integración.'
      case 'rate_limited':
        return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.'
      case 'internal_server_error':
        return 'Error interno de Notion. Intenta de nuevo en unos minutos.'
      case 'service_unavailable':
        return 'Servicio de Notion no disponible temporalmente.'
      case 'object_not_found':
        return 'Base de datos no encontrada. Verifica que la base de datos existe y está compartida con tu integración.'
      case 'invalid_request':
        return 'Solicitud inválida. Verifica la configuración de tu integración.'
    }
  }

  // Manejar errores de respuesta HTTP
  if (error.status) {
    switch (error.status) {
      case 401:
        return 'Token de autenticación inválido. Verifica que hayas copiado correctamente el token.'
      case 403:
        return 'Sin permisos. Asegúrate de haber compartido las bases de datos con tu integración.'
      case 404:
        return 'Recurso no encontrado. Verifica que las bases de datos existen.'
      case 429:
        return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.'
      case 500:
        return 'Error interno del servidor de Notion.'
      case 503:
        return 'Servicio de Notion no disponible temporalmente.'
    }
  }

  // Error por defecto
  return error.message || 'Error desconocido al conectar con Notion. Verifica tu token y conexión.'
}

// Validar respuesta de la API
export function validateNotionResponse(response: any): boolean {
  return response && 
         typeof response === 'object' && 
         'results' in response && 
         Array.isArray(response.results)
}

// Obtener estadísticas del workspace
export function getWorkspaceStats(databases: NotionDatabase[]) {
  const totalProperties = databases.reduce((acc, db) => acc + Object.keys(db.properties).length, 0)
  const totalRelations = databases.reduce((acc, db) => acc + (db.relations?.length || 0), 0)
  
  const propertyTypes = new Set<string>()
  databases.forEach(db => {
    Object.values(db.properties).forEach(prop => {
      propertyTypes.add(prop.type)
    })
  })
  
  const databasesWithRelations = databases.filter(db => db.relations && db.relations.length > 0).length
  
  return {
    totalDatabases: databases.length,
    totalProperties,
    totalRelations,
    uniquePropertyTypes: propertyTypes.size,
    databasesWithRelations,
    databasesWithoutRelations: databases.length - databasesWithRelations
  }
} 