import { useState, useCallback, useEffect, useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Connection, Node, Edge, NodeChange, EdgeChange, MarkerType, ReactFlowInstance } from 'reactflow'
import 'reactflow/dist/style.css'
import { Toaster, toast } from 'react-hot-toast'

import SidePanel from './SidePanel'
import DatabaseNode from './DatabaseNode'
import CustomEdge from './CustomEdge'
import NotionSetup from './NotionSetup'
import ExportPanel, { ExportOptions } from './ExportPanel'
import NavigationBar from './NavigationBar'
import { LoadingSpinner, FullPageLoader } from './LoadingSpinner'
import { HelpPanel } from './HelpPanel'
import { WorkspaceStats } from './WorkspaceStats'
import { DatabaseVisibilityManager } from './DatabaseVisibilityManager'
import { useNotionData } from '../hooks/useNotionData'
import { useTheme } from '../hooks/useTheme'
import { NotionDatabase } from '../types/notion'
import { RelationshipDetector, RelationshipMap } from '../utils/relationshipDetector'
import { SmartLayoutEngine } from '../utils/smartLayout'
import { exportDiagramSimple, validateSimpleExportOptions } from '../utils/simpleExport'

const nodeTypes = {
  database: DatabaseNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

// Función para calcular puntos de conexión óptimos (movida fuera del componente)
const calculateOptimalConnectionPoints = (sourcePos: {x: number, y: number}, targetPos: {x: number, y: number}) => {
  const dx = targetPos.x - sourcePos.x
  const dy = targetPos.y - sourcePos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Prevenir división por cero
  if (distance < 1) {
    return { sourceHandle: 'right-center-s', targetHandle: 'left-center-t' }
  }
  
  // Normalizar direcciones
  const normalizedDx = dx / distance
  const normalizedDy = dy / distance
  
  let sourceHandle = ''
  let targetHandle = ''
  
  // Determinar el punto de conexión basado en la dirección más eficiente
  if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
    // Conexión principalmente horizontal
    if (normalizedDx > 0) {
      // Target a la derecha
      sourceHandle = 'right-center-s'
      targetHandle = 'left-center-t'
      
      // Ajustar según componente vertical
      if (normalizedDy > 0.2) {
        sourceHandle = 'right-bottom-s'
        targetHandle = 'left-top-t'
      } else if (normalizedDy < -0.2) {
        sourceHandle = 'right-top-s'
        targetHandle = 'left-bottom-t'
      }
    } else {
      // Target a la izquierda
      sourceHandle = 'left-center-s'
      targetHandle = 'right-center-t'
      
      if (normalizedDy > 0.2) {
        sourceHandle = 'left-bottom-s'
        targetHandle = 'right-top-t'
      } else if (normalizedDy < -0.2) {
        sourceHandle = 'left-top-s'
        targetHandle = 'right-bottom-t'
      }
    }
  } else {
    // Conexión principalmente vertical
    if (normalizedDy > 0) {
      // Target abajo
      sourceHandle = 'bottom-center-s'
      targetHandle = 'top-center-t'
      
      // Ajustar según componente horizontal
      if (normalizedDx > 0.2) {
        sourceHandle = 'bottom-right-s'
        targetHandle = 'top-left-t'
      } else if (normalizedDx < -0.2) {
        sourceHandle = 'bottom-left-s'
        targetHandle = 'top-right-t'
      }
    } else {
      // Target arriba
      sourceHandle = 'top-center-s'
      targetHandle = 'bottom-center-t'
      
      if (normalizedDx > 0.2) {
        sourceHandle = 'top-right-s'
        targetHandle = 'bottom-left-t'
      } else if (normalizedDx < -0.2) {
        sourceHandle = 'top-left-s'
        targetHandle = 'bottom-right-t'
      }
    }
  }
  
  // Agregar variación determinística para distribuir conexiones paralelas
  const hash = Math.abs((sourcePos.x * 17 + sourcePos.y * 31 + targetPos.x * 37 + targetPos.y * 41) % 100)
  
  // Introducir variación ocasional para mejor distribución visual
  if (hash < 15) {
    const alternatives = {
      'right-center': ['right-top', 'right-bottom'],
      'left-center': ['left-top', 'left-bottom'],
      'top-center': ['top-left', 'top-right'],
      'bottom-center': ['bottom-left', 'bottom-right']
    }
    
    // Obtener la base del handle (sin -s/-t)
    const sourceBase = sourceHandle.replace('-s', '').replace('-t', '')
    
    if (alternatives[sourceBase as keyof typeof alternatives]) {
      const altIndex = hash < 7 ? 0 : 1
      const newBase = alternatives[sourceBase as keyof typeof alternatives][altIndex]
      sourceHandle = newBase + '-s'
      
      // Ajustar el target handle correspondientemente
      const targetBase = targetHandle.replace('-s', '').replace('-t', '')
      let newTargetBase = targetBase
      
      if (newBase.includes('right') && targetBase.includes('left')) {
        newTargetBase = targetBase.replace('left', 'left')
      }
      if (newBase.includes('left') && targetBase.includes('right')) {
        newTargetBase = targetBase.replace('right', 'right')
      }
      if (newBase.includes('top') && targetBase.includes('bottom')) {
        newTargetBase = targetBase.replace('bottom', 'bottom')
      }
      if (newBase.includes('bottom') && targetBase.includes('top')) {
        newTargetBase = targetBase.replace('top', 'top')
      }
      
      targetHandle = newTargetBase + '-t'
    }
  }
  
  // Validar que los handles existen (fallback a defaults seguros)
  const validSourceHandles = [
    'left-top-s', 'left-center-s', 'left-bottom-s',
    'right-top-s', 'right-center-s', 'right-bottom-s',
    'top-left-s', 'top-center-s', 'top-right-s',
    'bottom-left-s', 'bottom-center-s', 'bottom-right-s'
  ]
  
  const validTargetHandles = [
    'left-top-t', 'left-center-t', 'left-bottom-t',
    'right-top-t', 'right-center-t', 'right-bottom-t',
    'top-left-t', 'top-center-t', 'top-right-t',
    'bottom-left-t', 'bottom-center-t', 'bottom-right-t'
  ]
  
  if (!validSourceHandles.includes(sourceHandle)) {
    console.warn(`⚠️ sourceHandle inválido: ${sourceHandle}, usando fallback`)
    sourceHandle = 'right-center-s'
  }
  
  if (!validTargetHandles.includes(targetHandle)) {
    console.warn(`⚠️ targetHandle inválido: ${targetHandle}, usando fallback`)
    targetHandle = 'left-center-t'
  }
  
  return { sourceHandle, targetHandle }
}

interface NotionVisualizerProps {
  user?: { 
    email?: string;
    name?: string;
    role?: string;
  };
  onLogout?: () => void;
}

const NotionVisualizer = ({ user, onLogout }: NotionVisualizerProps) => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<NotionDatabase | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [relationshipMap, setRelationshipMap] = useState<RelationshipMap | null>(null)
  const [layoutStats, setLayoutStats] = useState<any>(null)
  const [showIsolatedNodes, setShowIsolatedNodes] = useState(false)
  const [hiddenDatabases, setHiddenDatabases] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('linkav2-hidden-databases')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [explicitlyShownDatabases, setExplicitlyShownDatabases] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('linkav2-explicitly-shown-databases')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [showVisibilityManager, setShowVisibilityManager] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const reactFlowRef = useRef<ReactFlowInstance | null>(null)

  const { isDark } = useTheme()
  const { 
    databases, 
    loading, 
    error, 
    isConnected, 
    fetchDatabases, 
    connectWithToken, 
    disconnect 
  } = useNotionData()

  // Persistir bases de datos ocultas en localStorage
  useEffect(() => {
    localStorage.setItem('linkav2-hidden-databases', JSON.stringify(Array.from(hiddenDatabases)))
  }, [hiddenDatabases])

  // Persistir bases de datos mostradas explícitamente en localStorage
  useEffect(() => {
    localStorage.setItem('linkav2-explicitly-shown-databases', JSON.stringify(Array.from(explicitlyShownDatabases)))
  }, [explicitlyShownDatabases])

  // Handlers para gestionar bases de datos ocultas
  const hideDatabase = useCallback((databaseId: string) => {
    setHiddenDatabases(prev => new Set([...prev, databaseId]))
    // Remover de explícitamente mostradas si está ahí
    setExplicitlyShownDatabases(prev => {
      const newSet = new Set(prev)
      newSet.delete(databaseId)
      return newSet
    })
  }, [])

  const showDatabase = useCallback((databaseId: string) => {
    setHiddenDatabases(prev => {
      const newSet = new Set(prev)
      newSet.delete(databaseId)
      return newSet
    })
  }, [])

  const toggleDatabaseVisibility = useCallback((databaseId: string) => {
    if (hiddenDatabases.has(databaseId)) {
      showDatabase(databaseId)
      // Si es una base aislada, agregarla a explícitamente mostradas
      if (relationshipMap?.isolatedDatabases.includes(databaseId)) {
        setExplicitlyShownDatabases(prev => new Set([...prev, databaseId]))
      }
    } else {
      hideDatabase(databaseId)
    }
  }, [hiddenDatabases, hideDatabase, showDatabase, relationshipMap])

  const showAllDatabases = useCallback(() => {
    setHiddenDatabases(new Set())
    // Marcar todas las bases aisladas como explícitamente mostradas
    if (relationshipMap?.isolatedDatabases.length) {
      setExplicitlyShownDatabases(new Set(relationshipMap.isolatedDatabases))
    }
  }, [relationshipMap])

  const hideAllDatabases = useCallback(() => {
    setHiddenDatabases(new Set(databases.map(db => db.id)))
    // Limpiar explícitamente mostradas
    setExplicitlyShownDatabases(new Set())
  }, [databases])

  // Mostrar setup si no hay conexión y no hay datos
  useEffect(() => {
    if (!isConnected && databases.length === 0 && !loading) {
      setShowSetup(true)
    } else {
      setShowSetup(false)
    }
  }, [isConnected, databases.length, loading])

  // Transform databases to nodes with better positioning using intelligent relationship detection
  useEffect(() => {
    if (databases.length > 0) {
      // Usar el detector de relaciones inteligente
      const detector = new RelationshipDetector(databases)
      const relMap = detector.detectRelations()
      setRelationshipMap(relMap)

      console.log(`🔍 Análisis de relaciones completo:`)
      console.log(`📊 Total de relaciones detectadas: ${relMap.relations.length}`)
      console.log(`📦 Bases de datos totales: ${databases.length}`)
      console.log(`🏝️ Bases de datos aisladas: ${relMap.isolatedDatabases.length}`)
      console.log(`🔗 Conexiones fuertes: ${relMap.strongConnections.length}`)

      // Filtrar bases de datos según preferencia del usuario
      let filteredDatabases = showIsolatedNodes
        ? databases 
        : databases.filter(db => 
            !relMap.isolatedDatabases.includes(db.id) || 
            explicitlyShownDatabases.has(db.id)
          )

      // Aplicar filtro de bases de datos ocultas
      filteredDatabases = filteredDatabases.filter(db => !hiddenDatabases.has(db.id))

      console.log(`✅ Bases de datos después del filtrado:`)
      console.log(`   - Total original: ${databases.length}`)
      console.log(`   - Después de filtro aisladas: ${showIsolatedNodes ? databases.length : databases.length - relMap.isolatedDatabases.length}`)
      console.log(`   - Después de filtro ocultas: ${filteredDatabases.length}`)
      console.log(`   - Ocultas manualmente: ${hiddenDatabases.size}`)
      console.log(`   - Mostradas explícitamente: ${explicitlyShownDatabases.size}`)

      // Crear un mapa de relaciones filtrado
      const filteredDatabaseIds = new Set(filteredDatabases.map(db => db.id))
      const filteredRelMap: RelationshipMap = {
        relations: relMap.relations.filter(rel => 
          filteredDatabaseIds.has(rel.sourceId) && filteredDatabaseIds.has(rel.targetId)
        ),
        clusters: relMap.clusters.map(cluster => ({
          ...cluster,
          databases: cluster.databases.filter(id => filteredDatabaseIds.has(id))
        })).filter(cluster => cluster.databases.length > 0),
        isolatedDatabases: showIsolatedNodes ? relMap.isolatedDatabases : [],
        strongConnections: relMap.strongConnections.filter(rel => 
          filteredDatabaseIds.has(rel.sourceId) && filteredDatabaseIds.has(rel.targetId)
        )
      }

      console.log(`🎯 Filtrado inteligente: ${filteredDatabases.length}/${databases.length} DBs mostradas, ${filteredRelMap.relations.length}/${relMap.relations.length} relaciones`)
      
      // Mostrar relaciones que se perdieron en el filtrado
      const lostRelations = relMap.relations.filter(rel => 
        !filteredDatabaseIds.has(rel.sourceId) || !filteredDatabaseIds.has(rel.targetId)
      )
      if (lostRelations.length > 0) {
        console.warn(`⚠️ ${lostRelations.length} relaciones ocultas por filtrado de bases aisladas:`)
        lostRelations.forEach(rel => {
          const sourceDb = databases.find(db => db.id === rel.sourceId)
          const targetDb = databases.find(db => db.id === rel.targetId)
          console.warn(`   ${sourceDb?.title} → ${targetDb?.title} (${rel.sourceProperty})`)
        })
      }

      // Usar el motor de layout ultra-inteligente para posicionamiento óptimo
      const layoutEngine = new SmartLayoutEngine(filteredDatabases, filteredRelMap)
      const optimalPositions = layoutEngine.calculateOptimalLayout()
      const layoutStats = layoutEngine.getDetailedStats()
      
      console.log('🧠 Layout inteligente aplicado:', layoutStats)
      
      // Guardar estadísticas del layout para mostrar en la UI
      setLayoutStats(layoutStats)

      // Crear nodos con posicionamiento inteligente (solo DBs filtradas)
      const newNodes: Node[] = filteredDatabases.map((db) => {
        const cluster = filteredRelMap.clusters.find(c => c.databases.includes(db.id))
        const position = optimalPositions.get(db.id) || { x: 0, y: 0 }
        
        // Calcular el número de relaciones para esta base de datos
        const relationCount = filteredRelMap.relations.filter(rel => 
          rel.sourceId === db.id || rel.targetId === db.id
        ).length
        
        return {
          id: db.id,
          type: 'database',
          position: { x: position.x, y: position.y },
          data: { 
            database: db,
            onSelect: setSelectedDatabase,
            isIsolated: filteredRelMap.isolatedDatabases.includes(db.id),
            isStronglyConnected: filteredRelMap.strongConnections.some(r => 
              r.sourceId === db.id || r.targetId === db.id
            ),
            relationCount: relationCount,
            cluster: cluster
          },
        }
      })

      // Crear edges con información enriquecida y verificación mejorada
      const newEdges: Edge[] = filteredRelMap.relations.filter(relation => {
        const sourceDb = filteredDatabases.find(db => db.id === relation.sourceId)
        const targetDb = filteredDatabases.find(db => db.id === relation.targetId)
        
        if (!sourceDb || !targetDb) {
          console.warn(`⚠️ Relación con base de datos inexistente: ${relation.sourceId} -> ${relation.targetId}`)
          return false
        }
        
        const sourcePos = optimalPositions.get(relation.sourceId)
        const targetPos = optimalPositions.get(relation.targetId)
        
        if (!sourcePos || !targetPos) {
          console.warn(`⚠️ Relación sin posiciones calculadas: ${sourceDb.title} -> ${targetDb.title}`)
          // Intentar asignar posiciones por defecto para no perder la relación
          if (!sourcePos) {
            optimalPositions.set(relation.sourceId, { x: Math.random() * 800, y: Math.random() * 600 })
          }
          if (!targetPos) {
            optimalPositions.set(relation.targetId, { x: Math.random() * 800, y: Math.random() * 600 })
          }
          return true // Permitir que se procese con posiciones por defecto
        }
        
        return true
      }).map(relation => {
        const sourceDb = filteredDatabases.find(db => db.id === relation.sourceId)!
        const targetDb = filteredDatabases.find(db => db.id === relation.targetId)!
        
        // Determinar el estilo del edge basado en la fuerza de la relación
        const isStrong = relation.strength >= 7
        const isReciprocal = relation.isReciprocal
        
        // Obtener posiciones calculadas (con fallback si es necesario)
        const sourcePos = optimalPositions.get(relation.sourceId) || { x: 0, y: 0 }
        const targetPos = optimalPositions.get(relation.targetId) || { x: 100, y: 100 }
        
        // Calcular puntos de conexión óptimos
        const { sourceHandle, targetHandle } = calculateOptimalConnectionPoints(sourcePos, targetPos)
        
        console.log(`🔗 Creando edge: ${relation.sourceProperty} | ${relation.sourceId}[${sourceHandle}] -> ${relation.targetId}[${targetHandle}] | Pos: (${sourcePos.x.toFixed(0)},${sourcePos.y.toFixed(0)}) -> (${targetPos.x.toFixed(0)},${targetPos.y.toFixed(0)})`)
        
        return {
          id: `${relation.sourceId}-${relation.targetId}`,
          source: relation.sourceId,
          target: relation.targetId,
          sourceHandle,
          targetHandle,
          type: 'straight',
          animated: isStrong,
          label: `${relation.sourceProperty}${relation.targetProperty ? ` ↔ ${relation.targetProperty}` : ''}`,
          labelStyle: {
            fontSize: 12,
            fontWeight: isStrong ? 600 : 400,
            fill: isStrong ? '#1e40af' : '#4b5563',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          },
          labelBgStyle: {
            fill: 'rgba(255, 255, 255, 0.9)',
            fillOpacity: 0.9
          },
          data: { 
            strength: relation.strength,
            relationType: relation.relationType,
            isReciprocal: isReciprocal,
            isStrong: isStrong,
            sourceDb: sourceDb?.title,
            targetDb: targetDb?.title
          },
          style: {
            strokeWidth: Math.max(2, relation.strength / 2),
            stroke: isStrong ? '#3b82f6' : isReciprocal ? '#10b981' : '#6b7280',
            strokeDasharray: isReciprocal ? '0' : '5 5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isStrong ? '#3b82f6' : isReciprocal ? '#10b981' : '#6b7280'
          }
        }
      })

      console.log(`✅ Edges creados: ${newEdges.length}`)
      console.log(`📊 Resumen final:`)
      console.log(`   - Nodos: ${newNodes.length}`)
      console.log(`   - Edges: ${newEdges.length}`)
      console.log(`   - Relaciones totales: ${relMap.relations.length}`)
      console.log(`   - Relaciones filtradas: ${filteredRelMap.relations.length}`)
      console.log(`   - Relaciones perdidas: ${lostRelations.length}`)
      console.log(`   - Condición botón: ${relMap.relations.length} > ${newEdges.length} = ${relMap.relations.length > newEdges.length}`)

      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [databases, showIsolatedNodes, hiddenDatabases, explicitlyShownDatabases])

  // Focus on selected database node
  const focusOnDatabase = useCallback((database: NotionDatabase) => {
    const node = nodes.find(n => n.id === database.id)
    if (node) {
      // Center the view on the selected node
      const viewportTransform = {
        x: window.innerWidth / 2 - node.position.x - 150, // Offset for node width
        y: window.innerHeight / 2 - node.position.y - 100, // Offset for node height
        zoom: 1.2
      }
      // You could implement a smooth transition here
    }
  }, [nodes])

  const handleSelectDatabase = useCallback((database: NotionDatabase) => {
    setSelectedDatabase(database)
    focusOnDatabase(database)
  }, [focusOnDatabase])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'straight',
      animated: true
    }, eds)),
    [],
  )

  // Función para recalcular conexiones de un nodo específico
  const recalculateNodeConnections = useCallback((nodeId: string, newPosition: {x: number, y: number}) => {
    setEdges((currentEdges) => {
      return currentEdges.map(edge => {
        let needsUpdate = false
        let newSourceHandle = edge.sourceHandle
        let newTargetHandle = edge.targetHandle
        
        // Encontrar la posición del otro nodo para recalcular
        if (edge.source === nodeId) {
          // Este nodo es el source, encontrar target
          const targetNode = nodes.find(n => n.id === edge.target)
          if (targetNode) {
            const connectionPoints = calculateOptimalConnectionPoints(newPosition, targetNode.position)
            newSourceHandle = connectionPoints.sourceHandle
            newTargetHandle = connectionPoints.targetHandle
            needsUpdate = true
          }
        } else if (edge.target === nodeId) {
          // Este nodo es el target, encontrar source
          const sourceNode = nodes.find(n => n.id === edge.source)
          if (sourceNode) {
            const connectionPoints = calculateOptimalConnectionPoints(sourceNode.position, newPosition)
            newSourceHandle = connectionPoints.sourceHandle
            newTargetHandle = connectionPoints.targetHandle
            needsUpdate = true
          }
        }
        
        if (needsUpdate) {
          return {
            ...edge,
            sourceHandle: newSourceHandle,
            targetHandle: newTargetHandle
          }
        }
        
        return edge
      })
    })
  }, [nodes])

  // Manejar cuando un nodo se está arrastrando
  const onNodeDrag = useCallback((_event: React.MouseEvent, node: Node) => {
    // Recalcular conexiones en tiempo real mientras se arrastra
    recalculateNodeConnections(node.id, node.position)
  }, [recalculateNodeConnections])

  // Manejar cuando termina el arrastre de un nodo
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    // Recalcular conexiones finales cuando termina el arrastre
    recalculateNodeConnections(node.id, node.position)
  }, [recalculateNodeConnections])

  // Handle node click to select database
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const database = databases.find(db => db.id === node.id)
    if (database) {
      setSelectedDatabase(database)
    }
  }, [databases])

  // Handle connection/disconnection
  const handleConnect = useCallback(async (token: string) => {
    await connectWithToken(token)
  }, [connectWithToken])

  const handleDisconnect = useCallback(() => {
    disconnect()
    setSelectedDatabase(null)
    setNodes([])
    setEdges([])
  }, [disconnect])

  // Handle opening setup from sidebar
  const handleOpenSetup = useCallback(() => {
    setShowSetup(true)
  }, [])

  // Handle using demo data
  const handleUseDemoData = useCallback(() => {
    // This will trigger the demo data in useNotionData hook
    setShowSetup(false)
    fetchDatabases() // This loads demo data when not connected
  }, [fetchDatabases])

  // Handle export functionality
  const handleExport = useCallback(async (options: ExportOptions) => {
    if (!reactFlowRef.current) {
      console.error('ReactFlow instance not available')
      return
    }

    const errors = validateSimpleExportOptions(options)
    if (errors.length > 0) {
      console.error('Export validation errors:', errors)
      toast.error('Export validation failed: ' + errors.join(', '))
      return
    }

    setIsExporting(true)
    
    try {
      await exportDiagramSimple(reactFlowRef.current, options)
      setShowExportPanel(false)
      toast.success(`Diagram exported successfully as ${options.filename}.${options.format}!`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [])

  // ReactFlow initialization
  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    reactFlowRef.current = reactFlowInstance
  }, [])

  // Navigation bar handlers
  const handleToggleIsolated = useCallback(() => {
    const newShowIsolatedNodes = !showIsolatedNodes
    
    if (newShowIsolatedNodes) {
      // Si vamos a mostrar automáticamente bases aisladas,
      // remover bases aisladas de hiddenDatabases para evitar doble filtro
      if (relationshipMap?.isolatedDatabases.length) {
        setHiddenDatabases(prev => {
          const newHidden = new Set(prev)
          relationshipMap.isolatedDatabases.forEach(id => {
            newHidden.delete(id)
          })
          return newHidden
        })
        // También limpiar explícitamente mostradas ya que ahora se muestran automáticamente
        setExplicitlyShownDatabases(new Set())
      }
    }
    
    setShowIsolatedNodes(newShowIsolatedNodes)
  }, [showIsolatedNodes, relationshipMap])

  const handleShowExportPanel = useCallback(() => {
    setShowExportPanel(true)
  }, [])

  const handleShowVisibilityManager = useCallback(() => {
    setShowVisibilityManager(true)
  }, [])

  // Calculate synchronized visibility stats for UI components
  const getVisibleDatabaseCount = useCallback(() => {
    if (!relationshipMap) return databases.length
    
    return databases.filter(db => {
      // Same logic as SidePanel and DatabaseVisibilityManager
      if (hiddenDatabases.has(db.id)) return false
      if (relationshipMap.isolatedDatabases.includes(db.id)) {
        return showIsolatedNodes || explicitlyShownDatabases.has(db.id)
      }
      return true
    }).length
  }, [databases, hiddenDatabases, relationshipMap, showIsolatedNodes, explicitlyShownDatabases])

  const visibleDatabaseCount = getVisibleDatabaseCount()

  if (loading) {
    return <FullPageLoader />
  }

  // Show setup screen if needed
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <NotionSetup
          onTokenSubmit={handleConnect}
          isLoading={loading}
          error={error}
          isConnected={isConnected}
          onDisconnect={handleDisconnect}
          onUseDemoData={handleUseDemoData}
        />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? '#1f2937' : '#fff',
              color: isDark ? '#f9fafb' : '#374151',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation Bar */}
      <NavigationBar
        onExport={handleShowExportPanel}
        onRefresh={fetchDatabases}
        onShowSetup={handleOpenSetup}
        onToggleIsolated={handleToggleIsolated}
        onShowVisibilityManager={handleShowVisibilityManager}
        showIsolatedNodes={showIsolatedNodes}
        isConnected={isConnected}
        databaseCount={visibleDatabaseCount}
        relationCount={edges.length}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <SidePanel
          databases={databases}
          selectedDatabase={selectedDatabase}
          onSelectDatabase={handleSelectDatabase}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loading}
          error={error}
          onRefresh={fetchDatabases}
          isConnected={isConnected}
          onConnectToNotion={handleOpenSetup}
          hiddenDatabases={hiddenDatabases}
          isolatedDatabases={relationshipMap ? relationshipMap.isolatedDatabases : []}
          explicitlyShownDatabases={explicitlyShownDatabases}
          showIsolatedNodes={showIsolatedNodes}
          relationshipMap={relationshipMap}
        />
        
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onInit={onInit}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            className="reactflow-wrapper"
            defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
            minZoom={0.05}
            maxZoom={3}
            attributionPosition={undefined}
            proOptions={{ hideAttribution: true }}
            fitView
            fitViewOptions={{
              padding: 0.1,
              includeHiddenNodes: false,
              maxZoom: 1.0,
              minZoom: 0.05
            }}
            snapToGrid={false}
            snapGrid={[15, 15]}
          >
            <Background 
              color={isDark ? "#374151" : "#e5e7eb"}
              gap={20} 
              size={1}
            />
            <Controls 
              position="top-right"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap 
              position="bottom-right"
              nodeStrokeWidth={2}
              nodeColor={(node: Node) => {
                return selectedDatabase?.id === node.id ? '#3b82f6' : '#9ca3af'
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              pannable={true}
              zoomable={true}
            />
          </ReactFlow>

          {/* Workspace Stats - Collapsible */}
          <WorkspaceStats
            databases={databases}
            edges={edges}
            relationshipMap={relationshipMap}
            layoutStats={layoutStats}
            hiddenDatabases={hiddenDatabases}
            showIsolatedNodes={showIsolatedNodes}
            explicitlyShownDatabases={explicitlyShownDatabases}
          />

          {/* Help Panel - Integrated in workspace */}
          {databases.length > 0 && <HelpPanel />}
        </div>
      </div>

      {/* Export Panel */}
      <ExportPanel
        isOpen={showExportPanel}
        onClose={() => setShowExportPanel(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Database Visibility Manager */}
      {showVisibilityManager && (
        <DatabaseVisibilityManager
          databases={databases}
          hiddenDatabases={hiddenDatabases}
          isolatedDatabases={relationshipMap ? relationshipMap.isolatedDatabases : []}
          showIsolatedNodes={showIsolatedNodes}
          explicitlyShownDatabases={explicitlyShownDatabases}
          onToggleDatabaseVisibility={toggleDatabaseVisibility}
          onShowAllDatabases={showAllDatabases}
          onHideAllDatabases={hideAllDatabases}
          onToggleIsolatedNodes={handleToggleIsolated}
          onClose={() => setShowVisibilityManager(false)}
        />
      )}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f9fafb' : '#374151',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  )
}

export default NotionVisualizer 