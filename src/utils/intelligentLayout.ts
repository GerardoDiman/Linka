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
  connections: string[]
  cluster?: string
  isIsolated: boolean
  isCenter: boolean
}

export class IntelligentLayoutEngine {
  private databases: NotionDatabase[]
  private relationshipMap: RelationshipMap
  private layoutNodes: Map<string, LayoutNode> = new Map()

  constructor(databases: NotionDatabase[], relationshipMap: RelationshipMap) {
    this.databases = databases
    this.relationshipMap = relationshipMap
    this.initializeNodes()
  }

  /**
   * Calcula el layout óptimo minimizando cruces de líneas
   */
  calculateOptimalLayout(): Map<string, LayoutPosition> {
    // Paso 1: Agrupar por clusters
    this.positionClusters()
    
    // Paso 2: Posicionar bases aisladas
    this.positionIsolatedDatabases()
    
    // Paso 3: Optimizar posiciones para minimizar cruces
    this.optimizeToReduceCrossings()
    
    // Paso 4: Aplicar espaciado final
    this.applyFinalSpacing()

    const positions = new Map<string, LayoutPosition>()
    this.layoutNodes.forEach((node, id) => {
      positions.set(id, node.position)
    })
    
    return positions
  }

  private initializeNodes() {
    this.databases.forEach(db => {
      const connections = this.getConnectionsForDatabase(db.id)
      const cluster = this.relationshipMap.clusters.find(c => c.databases.includes(db.id))
      
      this.layoutNodes.set(db.id, {
        id: db.id,
        database: db,
        position: { x: 0, y: 0 },
        connections,
        cluster: cluster?.id,
        isIsolated: this.relationshipMap.isolatedDatabases.includes(db.id),
        isCenter: cluster?.centerDatabase === db.id
      })
    })
  }

  private getConnectionsForDatabase(databaseId: string): string[] {
    return this.relationshipMap.relations
      .filter(rel => rel.sourceId === databaseId || rel.targetId === databaseId)
      .map(rel => rel.sourceId === databaseId ? rel.targetId : rel.sourceId)
  }

  private positionClusters() {
    const clusters = this.relationshipMap.clusters
    
    clusters.forEach((cluster, clusterIndex) => {
      // Determinar posición base del cluster
      const clustersPerRow = Math.min(2, Math.ceil(Math.sqrt(clusters.length)))
      const clusterRow = Math.floor(clusterIndex / clustersPerRow)
      const clusterCol = clusterIndex % clustersPerRow
      
      const baseX = clusterCol * 1600 + 500 // Más espacio para layout inteligente
      const baseY = clusterRow * 1200 + 400
      
      // Usar layout circular inteligente para el cluster
      this.positionClusterNodes(cluster, baseX, baseY)
    })
  }

  private positionClusterNodes(cluster: any, baseX: number, baseY: number) {
    const clusterNodes = cluster.databases.map((id: string) => this.layoutNodes.get(id)!).filter(Boolean)
    
    if (clusterNodes.length === 1) {
      clusterNodes[0].position = { x: baseX, y: baseY }
      return
    }

    // Encontrar el nodo central
    const centerNode = clusterNodes.find(node => node.isCenter)
    if (centerNode) {
      centerNode.position = { x: baseX, y: baseY }
    }

    // Posicionar otros nodos usando algoritmo de minimización de cruces
    const otherNodes = clusterNodes.filter(node => !node.isCenter)
    this.positionNodesAroundCenter(otherNodes, baseX, baseY)
  }

  private positionNodesAroundCenter(nodes: LayoutNode[], centerX: number, centerY: number) {
    if (nodes.length === 0) return

    // Calcular el radio óptimo basado en número de conexiones
    const baseRadius = 400
    const radius = baseRadius + Math.min(50, nodes.length * 25)

    // Agrupar nodos por número de conexiones para posicionamiento inteligente
    const nodesByConnections = nodes.sort((a: LayoutNode, b: LayoutNode) => b.connections.length - a.connections.length)

    // Posicionamiento angular optimizado
    nodesByConnections.forEach((node: LayoutNode, index: number) => {
      // Calcular ángulo optimizado para minimizar cruces
      const angle = (index * 2 * Math.PI) / nodesByConnections.length
      
      node.position = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      }
    })
  }

  private positionIsolatedDatabases() {
    const isolatedNodes = Array.from(this.layoutNodes.values()).filter(node => node.isIsolated)
    
    isolatedNodes.forEach((node, index) => {
      const nodesPerRow = 3
      const row = Math.floor(index / nodesPerRow)
      const col = index % nodesPerRow
      
      node.position = {
        x: col * 700 + 500, // Espaciado generoso
        y: row * 350 + 150  // Fila superior
      }
    })
  }

  private optimizeToReduceCrossings() {
    // Implementación simplificada de optimización de cruces
    // En una implementación completa, usaríamos algoritmos como simulated annealing
    
    const maxIterations = 5
    for (let i = 0; i < maxIterations; i++) {
      this.detectAndReduceCrossings()
    }
  }

  private detectAndReduceCrossings() {
    const relations = this.relationshipMap.relations
    const crossings: Array<{rel1: DatabaseRelation, rel2: DatabaseRelation}> = []

    // Detectar cruces entre relaciones
    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        if (this.doRelationsCross(relations[i], relations[j])) {
          crossings.push({ rel1: relations[i], rel2: relations[j] })
        }
      }
    }

    // Intentar resolver cruces moviendo nodos ligeramente
    crossings.forEach(crossing => {
      this.resolveCrossing(crossing.rel1, crossing.rel2)
    })
  }

  private doRelationsCross(rel1: DatabaseRelation, rel2: DatabaseRelation): boolean {
    const node1A = this.layoutNodes.get(rel1.sourceId)
    const node1B = this.layoutNodes.get(rel1.targetId)
    const node2A = this.layoutNodes.get(rel2.sourceId)
    const node2B = this.layoutNodes.get(rel2.targetId)

    if (!node1A || !node1B || !node2A || !node2B) return false

    // Usar algoritmo de intersección de líneas
    return this.linesIntersect(
      node1A.position, node1B.position,
      node2A.position, node2B.position
    )
  }

  private linesIntersect(p1: LayoutPosition, p2: LayoutPosition, p3: LayoutPosition, p4: LayoutPosition): boolean {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
    
    if (denominator === 0) return false // Líneas paralelas

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
  }

  private resolveCrossing(rel1: DatabaseRelation, rel2: DatabaseRelation) {
    // Estrategia simple: mover uno de los nodos menos conectados
    const nodes = [rel1.sourceId, rel1.targetId, rel2.sourceId, rel2.targetId]
      .map(id => this.layoutNodes.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.connections.length - b.connections.length)

    const nodeToMove = nodes[0]
    if (nodeToMove && !nodeToMove.isCenter) {
      // Mover ligeramente en dirección perpendicular
      const angle = Math.random() * 2 * Math.PI
      const distance = 100
      
      nodeToMove.position.x += Math.cos(angle) * distance
      nodeToMove.position.y += Math.sin(angle) * distance
    }
  }

  private applyFinalSpacing() {
    // Asegurar espaciado mínimo entre nodos
    const minDistance = 300
    const nodes = Array.from(this.layoutNodes.values())

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = this.calculateDistance(nodes[i].position, nodes[j].position)
        
        if (distance < minDistance) {
          // Separar nodos manteniendo sus posiciones relativas
          const angle = Math.atan2(
            nodes[j].position.y - nodes[i].position.y,
            nodes[j].position.x - nodes[i].position.x
          )
          
          const adjustment = (minDistance - distance) / 2
          
          nodes[i].position.x -= Math.cos(angle) * adjustment
          nodes[i].position.y -= Math.sin(angle) * adjustment
          nodes[j].position.x += Math.cos(angle) * adjustment
          nodes[j].position.y += Math.sin(angle) * adjustment
        }
      }
    }
  }

  private calculateDistance(pos1: LayoutPosition, pos2: LayoutPosition): number {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Obtiene estadísticas del layout generado
   */
  getLayoutStats() {
    const relations = this.relationshipMap.relations
    let totalCrossings = 0
    
    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        if (this.doRelationsCross(relations[i], relations[j])) {
          totalCrossings++
        }
      }
    }

    return {
      totalNodes: this.layoutNodes.size,
      totalRelations: relations.length,
      crossings: totalCrossings,
      clusters: this.relationshipMap.clusters.length,
      isolatedNodes: this.relationshipMap.isolatedDatabases.length
    }
  }
} 