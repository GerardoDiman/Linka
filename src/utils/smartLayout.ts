import { RelationshipMap, DatabaseRelation } from './relationshipDetector'
import { NotionDatabase } from '../types/notion'

export interface LayoutPosition {
  x: number
  y: number
}

export interface LayoutNode {
  id: string
  database: NotionDatabase
  position: LayoutPosition
  velocity: LayoutPosition
  connections: string[]
  degree: number
}

export interface DynamicLayoutParams {
  canvasWidth: number
  canvasHeight: number
  minDistance: number
  initialRadius: number
  forceStrength: number
  iterations: number
  annealingIterations: number
  initialTemperature: number
  isolatedSpacing: number
  density: 'sparse' | 'normal' | 'dense' | 'packed'
}

export class SmartLayoutEngine {
  private databases: NotionDatabase[]
  private relationshipMap: RelationshipMap
  private layoutNodes: Map<string, LayoutNode> = new Map()
  private width: number
  private height: number
  private dynamicParams: DynamicLayoutParams

  constructor(databases: NotionDatabase[], relationshipMap: RelationshipMap) {
    this.databases = databases
    this.relationshipMap = relationshipMap
    this.dynamicParams = this.calculateDynamicParams(databases.length, relationshipMap.relations.length)
    this.width = this.dynamicParams.canvasWidth
    this.height = this.dynamicParams.canvasHeight
    console.log('🎯 Parámetros dinámicos calculados:', this.dynamicParams)
    this.initializeNodes()
  }

  /**
   * Calcula parámetros dinámicos basados en el número de bases de datos y relaciones
   */
  private calculateDynamicParams(numDatabases: number, numRelations: number): DynamicLayoutParams {
    // Clasificar densidad del workspace
    const relationRatio = numDatabases > 0 ? numRelations / numDatabases : 0
    const density = this.classifyDensity(numDatabases, relationRatio)
    
    // Calcular área base adaptativa
    const baseArea = numDatabases * 150000 // 150k píxeles por base de datos
    const aspectRatio = 1.5 // Width/Height ratio
    const canvasWidth = Math.sqrt(baseArea * aspectRatio)
    const canvasHeight = Math.sqrt(baseArea / aspectRatio)
    
    // Parámetros adaptativos por rango de bases de datos
    let params: DynamicLayoutParams
    
    if (numDatabases <= 5) {
      // Pocas bases: espaciado cómodo
      params = {
        canvasWidth: Math.max(1800, canvasWidth * 0.8),
        canvasHeight: Math.max(1200, canvasHeight * 0.8),
        minDistance: 400,
        initialRadius: 300,
        forceStrength: 1.2,
        iterations: 200,
        annealingIterations: 200,
        initialTemperature: 30,
        isolatedSpacing: 500,
        density
      }
    } else if (numDatabases <= 15) {
      // Cantidad media: balance entre espaciado y eficiencia
      params = {
        canvasWidth: Math.max(2500, canvasWidth),
        canvasHeight: Math.max(1800, canvasHeight),
        minDistance: 320,
        initialRadius: Math.max(400, numDatabases * 35),
        forceStrength: 1.0,
        iterations: 300,
        annealingIterations: 400,
        initialTemperature: 40,
        isolatedSpacing: 400,
        density
      }
    } else if (numDatabases <= 30) {
      // Muchas bases: optimizar espacio
      params = {
        canvasWidth: Math.max(3500, canvasWidth * 1.1),
        canvasHeight: Math.max(2500, canvasHeight * 1.1),
        minDistance: 280,
        initialRadius: Math.max(500, numDatabases * 25),
        forceStrength: 0.9,
        iterations: 400,
        annealingIterations: 600,
        initialTemperature: 50,
        isolatedSpacing: 350,
        density
      }
    } else {
      // Workspace muy grande: máxima eficiencia
      params = {
        canvasWidth: Math.max(4500, canvasWidth * 1.2),
        canvasHeight: Math.max(3200, canvasHeight * 1.2),
        minDistance: 250,
        initialRadius: Math.max(600, numDatabases * 20),
        forceStrength: 0.8,
        iterations: 500,
        annealingIterations: 800,
        initialTemperature: 60,
        isolatedSpacing: 300,
        density
      }
    }
    
    // Ajustes adicionales basados en densidad de conexiones
    if (relationRatio > 3) {
      // Muy conectado: necesita más espacio
      params.canvasWidth *= 1.3
      params.canvasHeight *= 1.3
      params.minDistance *= 1.2
      params.iterations += 100
    } else if (relationRatio < 1) {
      // Poco conectado: puede ser más compacto
      params.canvasWidth *= 0.8
      params.canvasHeight *= 0.8
      params.minDistance *= 0.9
    }
    
    return params
  }

  private classifyDensity(numDatabases: number, relationRatio: number): 'sparse' | 'normal' | 'dense' | 'packed' {
    if (numDatabases <= 5 && relationRatio <= 1) return 'sparse'
    if (numDatabases <= 15 && relationRatio <= 2) return 'normal'
    if (numDatabases <= 30 && relationRatio <= 3) return 'dense'
    return 'packed'
  }

  calculateOptimalLayout(): Map<string, LayoutPosition> {
    console.log('🧠 Iniciando layout ultra-inteligente...')
    
    this.initialStrategicPositioning()
    this.runForceDirectedLayout()
    this.optimizeWithSimulatedAnnealing()
    this.finalOptimization()

    const positions = new Map<string, LayoutPosition>()
    this.layoutNodes.forEach((node, id) => {
      positions.set(id, node.position)
    })
    
    const stats = this.getDetailedStats()
    console.log('✅ Layout ultra-inteligente completado:', stats)
    
    return positions
  }

  private initializeNodes() {
    console.log(`🔧 Inicializando ${this.databases.length} nodos...`)
    
    this.databases.forEach(db => {
      if (!db || !db.id) {
        console.warn(`⚠️ Base de datos inválida encontrada:`, db)
        return
      }
      
      const connections = this.getConnectionsForDatabase(db.id)
      
      const node: LayoutNode = {
        id: db.id,
        database: db,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        connections,
        degree: connections.length
      }
      
      this.layoutNodes.set(db.id, node)
    })
    
    console.log(`✅ ${this.layoutNodes.size} nodos inicializados correctamente`)
  }

  private getConnectionsForDatabase(databaseId: string): string[] {
    return this.relationshipMap.relations
      .filter(rel => rel.sourceId === databaseId || rel.targetId === databaseId)
      .map(rel => rel.sourceId === databaseId ? rel.targetId : rel.sourceId)
  }

  private initialStrategicPositioning() {
    const nodes = Array.from(this.layoutNodes.values())
    
    // Separar nodos por grado
    const isolatedNodes = nodes.filter(n => n.degree === 0)
    const connectedNodes = nodes.filter(n => n.degree > 0)
    
    // Para workspaces grandes (30+ DBs), usar distribución multi-centro
    if (nodes.length >= 30) {
      this.multiCenterDistribution(isolatedNodes, connectedNodes)
    } else {
      this.standardCircularDistribution(isolatedNodes, connectedNodes)
    }
  }

  private multiCenterDistribution(isolatedNodes: LayoutNode[], connectedNodes: LayoutNode[]) {
    console.log('🎯 Usando distribución multi-centro para workspace grande')
    
    // Distribuir nodos aislados en grid superior
    this.distributeIsolatedInGrid(isolatedNodes)
    
    // Crear múltiples centros para aprovechar el espacio
    if (connectedNodes.length > 0) {
      connectedNodes.sort((a, b) => b.degree - a.degree)
      
      // Determinar número de centros basado en la cantidad de nodos
      const numCenters = Math.min(Math.ceil(connectedNodes.length / 15), 6) // Máximo 6 centros
      const centersUsed = Math.min(numCenters, connectedNodes.filter(n => n.degree >= 3).length)
      
      console.log(`📍 Creando ${centersUsed} centros de distribución`)
      
      // Crear posiciones de centros en grid
      const centerPositions = this.createCenterGrid(centersUsed)
      
      // Asignar nodos a centros y distribuir
      this.distributeNodesAroundCenters(connectedNodes, centerPositions)
    }
  }

  private createCenterGrid(numCenters: number): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = []
    
    if (numCenters === 1) {
      positions.push({ x: this.width / 2, y: this.height / 2 })
    } else {
      // Distribuir centros en grid que llene el espacio disponible
      const cols = Math.ceil(Math.sqrt(numCenters))
      const rows = Math.ceil(numCenters / cols)
      
      const usableWidth = this.width * 0.7  // 70% del ancho disponible
      const usableHeight = this.height * 0.6 // 60% de la altura disponible
      const startX = (this.width - usableWidth) / 2
      const startY = this.height * 0.3 // Dejar espacio para aislados arriba
      
      for (let i = 0; i < numCenters; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        
        const x = startX + (col * usableWidth / (cols - 1 || 1))
        const y = startY + (row * usableHeight / (rows - 1 || 1))
        
        positions.push({ x, y })
      }
    }
    
    return positions
  }

  private distributeNodesAroundCenters(connectedNodes: LayoutNode[], centerPositions: Array<{x: number, y: number}>) {
    // Colocar los nodos más conectados en los centros
    const centerNodes = connectedNodes.slice(0, centerPositions.length)
    const otherNodes = connectedNodes.slice(centerPositions.length)
    
    // Posicionar nodos centro
    centerNodes.forEach((node, index) => {
      node.position.x = centerPositions[index].x
      node.position.y = centerPositions[index].y
    })
    
    // Distribuir otros nodos alrededor de los centros
    otherNodes.forEach((node, index) => {
      // Asignar nodo al centro más cercano o distribuir equitativamente
      const centerIndex = index % centerPositions.length
      const center = centerPositions[centerIndex]
      
      // Calcular posición en círculo alrededor del centro
      const nodesPerCenter = Math.ceil(otherNodes.length / centerPositions.length)
      const localIndex = Math.floor(index / centerPositions.length)
      const angle = (localIndex * 2 * Math.PI) / nodesPerCenter
      
      // Radio variable según la densidad local
      const baseRadius = Math.min(300, this.dynamicParams.initialRadius * 0.7)
      const radiusVariation = (Math.random() - 0.5) * 80
      const radius = baseRadius + radiusVariation
      
      node.position.x = center.x + Math.cos(angle) * radius
      node.position.y = center.y + Math.sin(angle) * radius
      
      // Mantener en límites
      node.position.x = Math.max(100, Math.min(this.width - 100, node.position.x))
      node.position.y = Math.max(200, Math.min(this.height - 100, node.position.y))
    })
  }

  private distributeIsolatedInGrid(isolatedNodes: LayoutNode[]) {
    if (isolatedNodes.length === 0) return
    
    // Para muchos nodos aislados, usar grid en lugar de línea
    if (isolatedNodes.length > 10) {
      const cols = Math.min(Math.ceil(Math.sqrt(isolatedNodes.length)), 8)
      const rows = Math.ceil(isolatedNodes.length / cols)
      
      const gridWidth = this.width * 0.8
      const gridHeight = 150
      const startX = (this.width - gridWidth) / 2
      const startY = 50
      
      isolatedNodes.forEach((node, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        
        node.position.x = startX + (col * gridWidth / (cols - 1 || 1))
        node.position.y = startY + (row * gridHeight / (rows - 1 || 1))
      })
    } else {
      // Línea horizontal para pocos nodos aislados
      isolatedNodes.forEach((node, index) => {
        const totalWidth = this.width - 200
        const spacing = isolatedNodes.length > 1 ? totalWidth / (isolatedNodes.length - 1) : totalWidth / 2
        node.position.x = 100 + (index * spacing)
        node.position.y = 100
      })
    }
  }

  private standardCircularDistribution(isolatedNodes: LayoutNode[], connectedNodes: LayoutNode[]) {
    // Distribución original para workspaces pequeños/medianos
    isolatedNodes.forEach((node, index) => {
      const totalWidth = this.width - 200
      const spacing = isolatedNodes.length > 1 ? totalWidth / (isolatedNodes.length - 1) : totalWidth / 2
      node.position.x = 100 + (index * spacing)
      node.position.y = 150
    })
    
    if (connectedNodes.length > 0) {
      connectedNodes.sort((a, b) => b.degree - a.degree)
      
      const centerX = this.width / 2
      const centerY = this.height / 2
      const radius = this.dynamicParams.initialRadius
      const useCentralNode = connectedNodes.length > 3 && connectedNodes[0].degree >= 3
      
      connectedNodes.forEach((node, index) => {
        if (index === 0 && useCentralNode) {
          node.position.x = centerX
          node.position.y = centerY
        } else {
          const adjustedIndex = useCentralNode ? index - 1 : index
          const totalNodes = useCentralNode ? connectedNodes.length - 1 : connectedNodes.length
          const angle = (adjustedIndex * 2 * Math.PI) / totalNodes
          
          const nodeRadius = radius + (Math.random() - 0.5) * 100
          node.position.x = centerX + Math.cos(angle) * nodeRadius
          node.position.y = centerY + Math.sin(angle) * nodeRadius
        }
      })
    }
  }

  private runForceDirectedLayout() {
    const iterations = this.dynamicParams.iterations
    const k = Math.sqrt((this.width * this.height) / this.layoutNodes.size)
    
    // Validar que tenemos nodos para procesar
    const validNodes = Array.from(this.layoutNodes.values()).filter(node => node && node.position)
    if (validNodes.length === 0) {
      console.log(`⚠️ Force-directed layout omitido: sin nodos válidos`)
      return
    }
    
    console.log(`🔄 Ejecutando force-directed layout: ${iterations} iteraciones, ${validNodes.length} nodos`)
    
    for (let i = 0; i < iterations; i++) {
      // Resetear velocidades solo en nodos válidos
      this.layoutNodes.forEach(node => {
        if (node && node.position) {
          node.velocity = { x: 0, y: 0 }
        }
      })
      
      // Fuerzas de repulsión con intensidad adaptativa
      this.calculateRepulsiveForces(k * this.dynamicParams.forceStrength)
      
      // Fuerzas de atracción
      this.calculateAttractiveForces(k)
      
      // Actualizar posiciones
      this.updatePositions(k, i / iterations)
      
      // Log de progreso cada 25%
      if (i % Math.floor(iterations / 4) === 0) {
        const crossings = this.countCrossings()
        console.log(`📊 Progreso ${Math.round((i / iterations) * 100)}%: ${crossings} cruces`)
      }
    }
  }

  private calculateRepulsiveForces(k: number) {
    const nodes = Array.from(this.layoutNodes.values())
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i]
        const nodeB = nodes[j]
        
        const dx = nodeA.position.x - nodeB.position.x
        const dy = nodeA.position.y - nodeB.position.y
        const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy))
        
        const force = (k * k) / distance
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        nodeA.velocity.x += fx
        nodeA.velocity.y += fy
        nodeB.velocity.x -= fx
        nodeB.velocity.y -= fy
      }
    }
  }

  private calculateAttractiveForces(k: number) {
    this.relationshipMap.relations.forEach(relation => {
      const nodeA = this.layoutNodes.get(relation.sourceId)
      const nodeB = this.layoutNodes.get(relation.targetId)
      
      if (!nodeA || !nodeB) return
      
      const dx = nodeB.position.x - nodeA.position.x
      const dy = nodeB.position.y - nodeA.position.y
      const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy))
      
      const force = (distance * distance / k) * (relation.strength / 10)
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      
      nodeA.velocity.x += fx
      nodeA.velocity.y += fy
      nodeB.velocity.x -= fx
      nodeB.velocity.y -= fy
    })
  }

  private updatePositions(k: number, progress: number) {
    const maxDisplacement = k * Math.max(0.1, 1 - progress)
    
    this.layoutNodes.forEach(node => {
      const displacement = Math.sqrt(node.velocity.x * node.velocity.x + node.velocity.y * node.velocity.y)
      if (displacement > maxDisplacement) {
        node.velocity.x = (node.velocity.x / displacement) * maxDisplacement
        node.velocity.y = (node.velocity.y / displacement) * maxDisplacement
      }
      
      node.position.x += node.velocity.x
      node.position.y += node.velocity.y
      
      // Mantener en límites
      const margin = 150
      node.position.x = Math.max(margin, Math.min(this.width - margin, node.position.x))
      node.position.y = Math.max(margin, Math.min(this.height - margin, node.position.y))
    })
  }

  private optimizeWithSimulatedAnnealing() {
    let temperature = this.dynamicParams.initialTemperature
    const coolingRate = 0.98
    const maxIterations = this.dynamicParams.annealingIterations
    
    // Validar que tenemos nodos para optimizar
    const nodes = Array.from(this.layoutNodes.values()).filter(node => node && node.position)
    if (nodes.length === 0) {
      console.log(`⚠️ Simulated annealing omitido: sin nodos válidos`)
      return
    }
    
    console.log(`🔥 Simulated annealing: ${maxIterations} iteraciones, temperatura inicial: ${temperature}, ${nodes.length} nodos`)
    
    for (let i = 0; i < maxIterations && temperature > 0.5; i++) {
      const currentCrossings = this.countCrossings()
      
      // Seleccionar nodo aleatorio para mover - con validación
      const randomIndex = Math.floor(Math.random() * nodes.length)
      const randomNode = nodes[randomIndex]
      
      if (!randomNode || !randomNode.position) {
        console.warn(`⚠️ Nodo inválido en índice ${randomIndex}, saltando iteración`)
        continue
      }
      
      const oldPos = { ...randomNode.position }
      
      // Movimiento aleatorio proporcional a la temperatura
      const moveRange = temperature * (this.dynamicParams.density === 'sparse' ? 2 : 1)
      randomNode.position.x += (Math.random() - 0.5) * moveRange
      randomNode.position.y += (Math.random() - 0.5) * moveRange
      
      // Mantener en límites con margen adaptativo
      const margin = Math.min(150, this.width * 0.05)
      randomNode.position.x = Math.max(margin, Math.min(this.width - margin, randomNode.position.x))
      randomNode.position.y = Math.max(margin, Math.min(this.height - margin, randomNode.position.y))
      
      const newCrossings = this.countCrossings()
      
      // Aceptar o rechazar cambio
      if (newCrossings < currentCrossings || Math.random() < Math.exp(-(newCrossings - currentCrossings) / temperature)) {
        // Aceptar
      } else {
        randomNode.position = oldPos
      }
      
      temperature *= coolingRate
      
      // Log de progreso cada 20%
      if (i % Math.floor(maxIterations / 5) === 0) {
        console.log(`🌡️ Annealing ${Math.round((i / maxIterations) * 100)}%: ${this.countCrossings()} cruces, temp: ${temperature.toFixed(1)}`)
      }
    }
  }

  private finalOptimization() {
    const minDistance = this.dynamicParams.minDistance
    const nodes = Array.from(this.layoutNodes.values()).filter(node => node && node.position)
    const maxIterations = Math.min(20, nodes.length)

    if (nodes.length === 0) {
      console.log(`⚠️ Optimización final omitida: sin nodos válidos`)
      return
    }

    console.log(`🔧 Optimización final: distancia mínima ${minDistance}px, ${nodes.length} nodos`)

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let moved = false
      let totalOverlaps = 0
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]
          
          // Validar nodos antes de usar sus posiciones
          if (!nodeA || !nodeB || !nodeA.position || !nodeB.position) {
            continue
          }
          
          const dx = nodeB.position.x - nodeA.position.x
          const dy = nodeB.position.y - nodeA.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < minDistance && distance > 0) {
            moved = true
            totalOverlaps++
            const overlap = minDistance - distance
            const separationX = (dx / distance) * (overlap / 2)
            const separationY = (dy / distance) * (overlap / 2)
            
            nodeA.position.x -= separationX
            nodeA.position.y -= separationY
            nodeB.position.x += separationX
            nodeB.position.y += separationY
            
            // Mantener en límites
            const margin = Math.min(100, this.width * 0.03)
            nodeA.position.x = Math.max(margin, Math.min(this.width - margin, nodeA.position.x))
            nodeA.position.y = Math.max(margin, Math.min(this.height - margin, nodeA.position.y))
            nodeB.position.x = Math.max(margin, Math.min(this.width - margin, nodeB.position.x))
            nodeB.position.y = Math.max(margin, Math.min(this.height - margin, nodeB.position.y))
          }
        }
      }
      
      if (iteration % 5 === 0) {
        console.log(`🎯 Separación iter ${iteration}: ${totalOverlaps} overlaps resueltos`)
      }
      
      if (!moved) {
        console.log(`✅ Separación completada en ${iteration + 1} iteraciones`)
        break
      }
    }
  }

  private countCrossings(): number {
    const relations = this.relationshipMap.relations
    let crossings = 0
    
    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        if (this.doRelationsCross(relations[i], relations[j])) {
          crossings++
        }
      }
    }
    
    return crossings
  }

  private doRelationsCross(rel1: DatabaseRelation, rel2: DatabaseRelation): boolean {
    // No contar como cruce si comparten nodo
    if (rel1.sourceId === rel2.sourceId || rel1.sourceId === rel2.targetId ||
        rel1.targetId === rel2.sourceId || rel1.targetId === rel2.targetId) {
      return false
    }
    
    const node1A = this.layoutNodes.get(rel1.sourceId)
    const node1B = this.layoutNodes.get(rel1.targetId)
    const node2A = this.layoutNodes.get(rel2.sourceId)
    const node2B = this.layoutNodes.get(rel2.targetId)

    if (!node1A || !node1B || !node2A || !node2B) return false

    return this.linesIntersect(
      node1A.position, node1B.position,
      node2A.position, node2B.position
    )
  }

  private linesIntersect(p1: LayoutPosition, p2: LayoutPosition, p3: LayoutPosition, p4: LayoutPosition): boolean {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
    
    if (Math.abs(denominator) < 0.001) return false

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator

    return ua > 0.001 && ua < 0.999 && ub > 0.001 && ub < 0.999
  }

  getDetailedStats() {
    const crossings = this.countCrossings()
    
    return {
      totalNodes: this.layoutNodes.size,
      totalRelations: this.relationshipMap.relations.length,
      crossings,
      clusters: this.relationshipMap.clusters.length,
      isolatedNodes: this.relationshipMap.isolatedDatabases.length,
      layoutQuality: crossings === 0 ? 'Excelente' : crossings <= 2 ? 'Bueno' : crossings <= 5 ? 'Regular' : 'Pobre',
      canvasSize: `${Math.round(this.width)}x${Math.round(this.height)}`,
      density: this.dynamicParams.density,
      minDistance: this.dynamicParams.minDistance,
      iterations: this.dynamicParams.iterations
    }
  }
} 