import { useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { NotionDatabase } from '../types/notion'
import { notionAuth } from '../utils/notionAuth'
import { transformNotionDatabase, transformNotionError, validateNotionResponse } from '../utils/notionTransformers'
import { NotionApiClient } from '../utils/notionApi'
import { getDemoData } from '../utils/demoData'

interface UseNotionDataReturn {
  databases: NotionDatabase[]
  loading: boolean
  error: string | null
  isConnected: boolean
  isDemoMode: boolean
  fetchDatabases: () => Promise<void>
  connectWithToken: (token: string) => Promise<void>
  disconnect: () => void
  loadDemoData: () => void
}

// Transformar datos de demo al formato de NotionDatabase
const transformDemoDatabase = (demoDb: any): NotionDatabase => {
  const relations = Object.entries(demoDb.properties)
    .filter(([_, prop]: [string, any]) => prop.type === 'relation')
    .map(([name, prop]: [string, any]) => prop.relation?.database_id)
    .filter(Boolean);

  return {
    id: demoDb.id,
    title: demoDb.title?.[0]?.plain_text || 'Sin título',
    description: demoDb.description?.[0]?.plain_text || '',
    url: `https://notion.so/${demoDb.id}`,
    icon: demoDb.icon,
    cover: demoDb.cover,
    properties: Object.entries(demoDb.properties).reduce((acc, [name, prop]: [string, any]) => {
      acc[name] = {
        id: prop.type === 'relation' ? prop.relation?.database_id : name.toLowerCase().replace(/\s+/g, '_'),
        name,
        type: prop.type,
        options: prop.select?.options || prop.multi_select?.options || [],
        relation: prop.relation
      };
      return acc;
    }, {} as any),
    relations,
    createdTime: demoDb.created_time,
    lastEditedTime: demoDb.last_edited_time,
    isHidden: demoDb.isHidden || false
  };
};

export function useNotionData(): UseNotionDataReturn {
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [notionClient, setNotionClient] = useState<NotionApiClient | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Cargar datos de demo
  const loadDemoData = useCallback(() => {
    console.log('🎭 Iniciando carga de datos de demo...')
    setLoading(true)
    setError(null)
    
    try {
      const demoData = getDemoData()
      const transformedDatabases = demoData.databases.map(transformDemoDatabase)
      
      setDatabases(transformedDatabases)
      setIsDemoMode(true)
      setIsConnected(false)
      setNotionClient(null)
      
      toast.success('Modo demo activado - Mostrando datos de demostración')
      console.log('✅ Demo mode activated with', transformedDatabases.length, 'databases')
    } catch (err) {
      console.error('❌ Error cargando datos de demo:', err)
      setError('Error cargando datos de demostración')
      toast.error('Error cargando datos de demostración')
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar bases de datos con un cliente específico
  const fetchDatabasesWithClient = useCallback(async (client: NotionApiClient) => {
    try {
      setError(null)

      const searchResponse = await client.search({
        filter: {
          value: 'database',
          property: 'object'
        },
        page_size: 100
      })

      if (!validateNotionResponse(searchResponse)) {
        throw new Error('Respuesta inválida de la API de Notion')
      }

      const databasePromises = searchResponse.results.map(async (db: any) => {
        try {
          const databaseDetails = await client.getDatabase(db.id)
          return transformNotionDatabase(databaseDetails)
        } catch (error) {
          console.error(`Error fetching database ${db.id}:`, error)
          return null
        }
      })

      const databaseDetails = await Promise.all(databasePromises)
      const validDatabases = databaseDetails.filter((db): db is NotionDatabase => db !== null)

      setDatabases(validDatabases)
      
      if (validDatabases.length === 0) {
        setError('No se encontraron bases de datos. Asegúrate de haber compartido las bases de datos con tu integración.')
      } else {
        toast.success(`${validDatabases.length} bases de datos cargadas`)
      }

    } catch (err: any) {
      const errorMessage = transformNotionError(err)
      setError(errorMessage)
      throw err
    }
  }, [])

  // Conectar con token
  const connectWithToken = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!notionAuth.isValidTokenFormat(token)) {
        throw new Error('Formato de token inválido. Debe tener 50 caracteres en total comenzando con "ntn_" o 47 caracteres comenzando con "secret_".')
      }

      const client = new NotionApiClient(token)
      const isValid = await client.testConnection()
      
      if (!isValid) {
        throw new Error('No se pudo conectar con Notion. Verifica que el token sea válido y que hayas compartido bases de datos con tu integración.')
      }

      notionAuth.saveToken(token)
      setNotionClient(client)
      setIsConnected(true)
      setIsDemoMode(false)
      
      toast.success('¡Conectado exitosamente a Notion!')
      
      await fetchDatabasesWithClient(client)

    } catch (err: any) {
      const errorMessage = transformNotionError(err)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error connecting to Notion:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchDatabasesWithClient])

  // Desconectar
  const disconnect = useCallback(() => {
    console.log('🔒 Iniciando proceso de desconexión...')
    
    // Mantener token en localStorage para reconexión automática
    console.log('💾 Token mantenido en localStorage para reconexión automática')
    
    setNotionClient(null)
    setIsConnected(false)
    setIsDemoMode(false)
    setDatabases([])
    setError(null)
    console.log('🧹 Estado de conexión limpiado')
    
    toast.success('Desconectado de Notion')
  }, [])

  // Buscar bases de datos
  const fetchDatabases = useCallback(async () => {
    if (!notionClient) {
      loadDemoData()
      return
    }

    setLoading(true)
    try {
      await fetchDatabasesWithClient(notionClient)
    } catch (err) {
      console.error('Error fetching databases:', err)
    } finally {
      setLoading(false)
    }
  }, [notionClient, fetchDatabasesWithClient, loadDemoData])

  // Inicialización única
  useEffect(() => {
    if (isInitialized) return

    const initializeApp = async () => {
      console.log('🚀 Iniciando aplicación...')
      setLoading(true)
      setError(null)
      
      const savedToken = notionAuth.getToken()
      
      if (savedToken && notionAuth.isValidTokenFormat(savedToken)) {
        console.log('🔑 Token encontrado, probando conexión...')
        
        try {
          const client = new NotionApiClient(savedToken)
          const isValid = await client.testConnection()
          
          if (isValid) {
            console.log('✅ Conexión exitosa con token guardado')
            setNotionClient(client)
            setIsConnected(true)
            setIsDemoMode(false)
            await fetchDatabasesWithClient(client)
          } else {
            console.log('❌ Token guardado inválido, cargando demo...')
            notionAuth.removeToken()
            loadDemoData()
          }
        } catch (error) {
          console.log('❌ Error probando conexión con token guardado:', error)
          notionAuth.removeToken()
          loadDemoData()
        }
      } else {
        console.log('🎭 No hay token válido, cargando demo...')
        loadDemoData()
      }
      
      setIsInitialized(true)
      setLoading(false)
    }
    
    initializeApp()
  }, [isInitialized, loadDemoData, fetchDatabasesWithClient])

  return {
    databases,
    loading,
    error,
    isConnected,
    isDemoMode,
    fetchDatabases,
    connectWithToken,
    disconnect,
    loadDemoData
  }
} 