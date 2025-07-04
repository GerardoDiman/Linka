import { useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { NotionDatabase } from '../types/notion'
import { notionAuth } from '../utils/notionAuth'
import { transformNotionDatabase, transformNotionError, validateNotionResponse } from '../utils/notionTransformers'
import { NotionApiClient } from '../utils/notionApi'

interface UseNotionDataReturn {
  databases: NotionDatabase[]
  loading: boolean
  error: string | null
  isConnected: boolean
  fetchDatabases: () => Promise<void>
  connectWithToken: (token: string) => Promise<void>
  disconnect: () => void
}

// Datos mock para desarrollo (movidos fuera del componente para evitar recreación)
const MOCK_DATABASES: NotionDatabase[] = [
  {
    id: '1',
    title: 'Projects',
    description: 'Main projects database',
    url: 'https://notion.so/projects',
    properties: {
      'Name': { id: '1', name: 'Name', type: 'title' },
      'Status': { id: '2', name: 'Status', type: 'select' },
      'Team': { id: '3', name: 'Team', type: 'relation' }
    },
    relations: ['2', '3'],
    createdTime: '2024-01-01T00:00:00.000Z',
    lastEditedTime: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Team Members',
    description: 'Team members and roles',
    url: 'https://notion.so/team',
    icon: { type: 'emoji', emoji: '👥' },
    properties: {
      'Name': { id: '1', name: 'Name', type: 'title' },
      'Role': { id: '2', name: 'Role', type: 'select' },
      'Projects': { id: '3', name: 'Projects', type: 'relation' }
    },
    relations: ['1'],
    createdTime: '2024-01-01T00:00:00.000Z',
    lastEditedTime: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Tasks',
    description: 'Project tasks and assignments',
    url: 'https://notion.so/tasks',
    icon: { type: 'emoji', emoji: '✅' },
    properties: {
      'Name': { id: '1', name: 'Name', type: 'title' },
      'Status': { id: '2', name: 'Status', type: 'select' },
      'Project': { id: '3', name: 'Project', type: 'relation' },
      'Assignee': { id: '4', name: 'Assignee', type: 'relation' }
    },
    relations: ['1', '2'],
    createdTime: '2024-01-01T00:00:00.000Z',
    lastEditedTime: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '4',
    title: 'Resources',
    description: 'Project resources and documents',
    url: 'https://notion.so/resources',
    icon: { type: 'emoji', emoji: '📚' },
    properties: {
      'Name': { id: '1', name: 'Name', type: 'title' },
      'Type': { id: '2', name: 'Type', type: 'select' },
      'URL': { id: '3', name: 'URL', type: 'url' }
    },
    createdTime: '2024-01-01T00:00:00.000Z',
    lastEditedTime: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '5',
    title: 'Meetings',
    description: 'Meeting notes and schedules',
    url: 'https://notion.so/meetings',
    icon: { type: 'emoji', emoji: '📅' },
    properties: {
      'Name': { id: '1', name: 'Name', type: 'title' },
      'Date': { id: '2', name: 'Date', type: 'date' },
      'Attendees': { id: '3', name: 'Attendees', type: 'relation' }
    },
    relations: ['2'],
    createdTime: '2024-01-01T00:00:00.000Z',
    lastEditedTime: '2024-01-02T00:00:00.000Z'
  }
]

export function useNotionData(): UseNotionDataReturn {
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notionClient, setNotionClient] = useState<NotionApiClient | null>(null)

  // Inicializar conexión si hay token guardado
  useEffect(() => {
    const savedToken = notionAuth.getToken()
    if (savedToken && notionAuth.isValidTokenFormat(savedToken)) {
      const client = new NotionApiClient(savedToken)
      setNotionClient(client)
      setIsConnected(true)
    }
  }, [])

  // Conectar con token
  const connectWithToken = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)

    try {
      // Validar formato del token
      if (!notionAuth.isValidTokenFormat(token)) {
        throw new Error('Formato de token inválido. Debe tener 50 caracteres en total comenzando con "ntn_" o 47 caracteres comenzando con "secret_".')
      }

      // Crear cliente de Notion
      const client = new NotionApiClient(token)

      // Probar la conexión
      const isValid = await client.testConnection()
      
      if (!isValid) {
        throw new Error('No se pudo conectar con Notion. Verifica que el token sea válido y que hayas compartido bases de datos con tu integración.')
      }

      // Guardar token y configurar cliente
      notionAuth.saveToken(token)
      setNotionClient(client)
      setIsConnected(true)
      
      toast.success('¡Conectado exitosamente a Notion!')
      
      // Cargar bases de datos automáticamente
      await fetchDatabasesWithClient(client)

    } catch (err: any) {
      const errorMessage = transformNotionError(err)
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error connecting to Notion:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Desconectar
  const disconnect = useCallback(() => {
    notionAuth.removeToken()
    setNotionClient(null)
    setIsConnected(false)
    setDatabases([])
    setError(null)
    toast.success('Desconectado de Notion')
  }, [])

  // Buscar bases de datos con un cliente específico
  const fetchDatabasesWithClient = useCallback(async (client: NotionApiClient) => {
    try {
      setError(null)

      // Buscar todas las bases de datos
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

      // Obtener detalles completos de cada base de datos
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

  // Buscar bases de datos
  const fetchDatabases = useCallback(async () => {
    if (!notionClient) {
      // Usar datos mock si no hay conexión
      setLoading(true)
      setError(null)
      
      try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setDatabases(MOCK_DATABASES)
        toast.success('Usando datos de demostración')
      } catch (err) {
        setError('Error cargando datos de demostración')
      } finally {
        setLoading(false)
      }
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
  }, [notionClient, fetchDatabasesWithClient])

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    let isMounted = true
    
    const loadInitialData = async () => {
      if (isMounted) {
        await fetchDatabases()
      }
    }
    
    loadInitialData()
    
    return () => {
      isMounted = false
    }
  }, [fetchDatabases])

  return {
    databases,
    loading,
    error,
    isConnected,
    fetchDatabases,
    connectWithToken,
    disconnect
  }
} 