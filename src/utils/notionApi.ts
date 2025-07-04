// Cliente API que usa nuestro backend serverless integrado
// El usuario solo necesita su token de Notion

// Determinar la URL base de la API según el entorno
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    console.log('🔍 Detectando entorno:', {
      hostname: window.location.hostname,
      port: window.location.port,
      origin: window.location.origin
    })
    
    // En desarrollo local, SIEMPRE usar servidor proxy
    if (window.location.hostname === 'localhost') {
      const devApiBase = 'http://localhost:3003/notion'
      console.log('🏗️ Usando API de desarrollo:', devApiBase)
      return devApiBase
    }
    // En producción, usar funciones serverless integradas
    return window.location.origin + '/api'
  }
  // Fallback para SSR
  return '/api'
}

const API_BASE = getApiBase()

interface ApiError {
  error: string
  details?: string
  success?: boolean
}

export class NotionApiClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE}${endpoint}`
    
    console.log(`🔗 Making request to: ${url}`)
    
    const defaultHeaders = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      mode: 'cors'
    }

    console.log('📋 Request config:', {
      url,
      method: config.method || 'GET'
    })

    try {
      const response = await fetch(url, config)
      
      console.log(`📊 Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        })) as ApiError
        
        console.error('❌ Error response:', errorData)
        
        // Crear mensajes de error más descriptivos basados en el status
        let errorMessage = errorData.error || 'Error desconocido'
        
        if (response.status === 401) {
          errorMessage = 'Token inválido o sin permisos. Verifica que el token sea correcto y esté activo.'
        } else if (response.status === 403) {
          errorMessage = 'Sin permisos para acceder a los recursos. Asegúrate de haber compartido las bases de datos con tu integración.'
        } else if (response.status === 429) {
          errorMessage = 'Límite de requests excedido. Intenta de nuevo en unos segundos.'
        } else if (errorData.details) {
          errorMessage = `${errorData.error}: ${errorData.details}`
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ Response successful:', {
        type: data.type,
        resultsCount: data.results?.length || 0,
        hasMore: data.has_more
      })
      return data
      
    } catch (error) {
      console.error('💥 Request failed:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.')
      }
      
      // Si ya es un Error personalizado, re-lanzarlo
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error desconocido al procesar la solicitud')
    }
  }

  async search(query: any = {}): Promise<any> {
    console.log('🔍 Searching databases...')
    // Nuestro backend maneja la búsqueda automáticamente
    return this.makeRequest('/databases')
  }

  async getDatabase(databaseId: string): Promise<any> {
    console.log(`📖 Getting database: ${databaseId}`)
    return this.makeRequest(`/databases/${databaseId}`)
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing connection to Notion via our backend...')
      const response = await this.makeRequest('/test-connection')
      
      const isValid = response && response.success === true
      console.log('🎯 Connection test result:', isValid ? 'SUCCESS' : 'FAILED')
      return isValid
    } catch (error) {
      console.error('🚫 Connection test failed:', error)
      return false
    }
  }

  // Método adicional para obtener información del bot/integración
  async getBotInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/test-connection')
      return response.bot || null
    } catch (error) {
      console.error('Error getting bot info:', error)
      return null
    }
  }
} 