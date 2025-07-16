import { NotionDatabase, NotionProperty } from '../types/notion'

export interface DatabaseRelation {
  sourceId: string
  targetId: string
  sourceProperty: string
  targetProperty?: string
  relationType: 'one-to-many' | 'many-to-many' | 'one-to-one'
  isReciprocal: boolean
  strength: number // 1-10 basado en el número de propiedades que conectan
}

export interface RelationshipMap {
  relations: DatabaseRelation[]
  clusters: DatabaseCluster[]
  isolatedDatabases: string[]
  strongConnections: DatabaseRelation[]
}

export interface DatabaseCluster {
  id: string
  databases: string[]
  centerDatabase?: string // La base de datos con más conexiones
  connections: number
}

export class RelationshipDetector {
  private databases: NotionDatabase[]

  constructor(databases: NotionDatabase[]) {
    this.databases = databases
  }

  /**
   * Detecta todas las relaciones entre bases de datos
   */
  detectRelations(): RelationshipMap {
    const relations = this.extractRelations()
    const processedRelations = this.processRelations(relations)
    const clusters = this.detectClusters(processedRelations)
    const isolatedDatabases = this.findIsolatedDatabases(processedRelations)
    const strongConnections = this.findStrongConnections(processedRelations)

    return {
      relations: processedRelations,
      clusters,
      isolatedDatabases,
      strongConnections
    }
  }

  /**
   * Extrae relaciones de las propiedades de las bases de datos
   */
  private extractRelations(): DatabaseRelation[] {
    const relations: DatabaseRelation[] = []

    this.databases.forEach(sourceDb => {
      Object.entries(sourceDb.properties).forEach(([propName, property]) => {
        // Manejar tanto el formato real de Notion como el formato de demo
        let targetId: string | null = null
        
        if (property.type === 'relation') {
          // Formato real de Notion
          if (property.relation?.database_id) {
            targetId = property.relation.database_id
          }
          // Formato de demo (cuando la propiedad tiene un ID que corresponde a otra base de datos)
          else if (property.id && this.isValidDatabaseId(property.id)) {
            targetId = property.id
          }
        }
        
        if (targetId) {
          const targetDb = this.databases.find(db => db.id === targetId)
          
          if (targetDb) {
            // Buscar la propiedad recíproca en la base de datos objetivo
            const reciprocalProperty = this.findReciprocalProperty(targetDb, sourceDb.id)
            
            relations.push({
              sourceId: sourceDb.id,
              targetId: targetId,
              sourceProperty: propName,
              targetProperty: reciprocalProperty?.name,
              relationType: this.determineRelationType(property, reciprocalProperty?.property),
              isReciprocal: !!reciprocalProperty,
              strength: this.calculateRelationStrength(sourceDb, targetDb)
            })
          }
        }
      })
    })

    return relations
  }

  /**
   * Verifica si un ID podría ser un ID de base de datos válido
   */
  private isValidDatabaseId(id: string): boolean {
    // En demo, los IDs tienen el formato 'demo-*'
    if (id.startsWith('demo-')) {
      return this.databases.some(db => db.id === id)
    }
    
    // Para IDs reales de Notion, verificar que existe en las bases de datos
    return this.databases.some(db => db.id === id)
  }

  /**
   * Procesa las relaciones para evitar duplicados y mejorar la información
   */
  private processRelations(rawRelations: DatabaseRelation[]): DatabaseRelation[] {
    const processed: DatabaseRelation[] = []
    const seen = new Set<string>()

    rawRelations.forEach(relation => {
      // Crear una clave única para esta relación (independiente de la dirección)
      const key1 = `${relation.sourceId}-${relation.targetId}`
      const key2 = `${relation.targetId}-${relation.sourceId}`
      
      if (!seen.has(key1) && !seen.has(key2)) {
        seen.add(key1)
        seen.add(key2)
        processed.push(relation)
      } else {
        // Si ya existe la relación inversa, actualizar la información
        const existingIndex = processed.findIndex(r => 
          (r.sourceId === relation.targetId && r.targetId === relation.sourceId) ||
          (r.sourceId === relation.sourceId && r.targetId === relation.targetId)
        )
        
        if (existingIndex !== -1) {
          const existing = processed[existingIndex]
          // Combinar información de ambas direcciones
          processed[existingIndex] = {
            ...existing,
            isReciprocal: true,
            strength: Math.max(existing.strength, relation.strength),
            targetProperty: existing.targetProperty || relation.sourceProperty
          }
        }
      }
    })

    return processed
  }

  /**
   * Busca la propiedad recíproca en la base de datos objetivo
   */
  private findReciprocalProperty(targetDb: NotionDatabase, sourceDbId: string): { name: string, property: NotionProperty } | null {
    for (const [propName, property] of Object.entries(targetDb.properties)) {
      if (property.type === 'relation') {
        // Verificar tanto el formato real como el de demo
        const hasRelation = property.relation?.database_id === sourceDbId || 
                           (property.id && property.id === sourceDbId)
        
        if (hasRelation) {
          return { name: propName, property }
        }
      }
    }
    return null
  }

  /**
   * Determina el tipo de relación basado en las propiedades
   */
  private determineRelationType(
    sourceProp: NotionProperty, 
    targetProp?: NotionProperty
  ): 'one-to-many' | 'many-to-many' | 'one-to-one' {
    // Por defecto, Notion maneja relaciones como many-to-many
    // Pero podemos hacer inferencias basadas en nombres y contexto
    
    if (!targetProp) {
      return 'one-to-many'
    }

    // Si ambas propiedades existen, generalmente es many-to-many
    return 'many-to-many'
  }

  /**
   * Calcula la fuerza de la relación basada en varios factores
   */
  private calculateRelationStrength(sourceDb: NotionDatabase, targetDb: NotionDatabase): number {
    let strength = 1

    // Factor 1: Número de propiedades de relación entre estas bases de datos
    const relationCount = Object.values(sourceDb.properties).filter(prop => {
      if (prop.type === 'relation') {
        return prop.relation?.database_id === targetDb.id || prop.id === targetDb.id
      }
      return false
    }).length

    const reverseRelationCount = Object.values(targetDb.properties).filter(prop => {
      if (prop.type === 'relation') {
        return prop.relation?.database_id === sourceDb.id || prop.id === sourceDb.id
      }
      return false
    }).length

    strength += (relationCount + reverseRelationCount) * 2

    // Factor 2: Similaridad en nombres (heurística)
    if (this.haveSimilarNames(sourceDb.title, targetDb.title)) {
      strength += 2
    }

    // Factor 3: Complejidad de las bases de datos (más propiedades = más importante)
    const complexity = (Object.keys(sourceDb.properties).length + Object.keys(targetDb.properties).length) / 10
    strength += Math.min(complexity, 3)

    return Math.min(Math.round(strength), 10)
  }

  /**
   * Detecta clusters de bases de datos relacionadas
   */
  private detectClusters(relations: DatabaseRelation[]): DatabaseCluster[] {
    const clusters: DatabaseCluster[] = []
    const visited = new Set<string>()

    this.databases.forEach(db => {
      if (!visited.has(db.id)) {
        const cluster = this.buildCluster(db.id, relations, visited)
        if (cluster.databases.length > 1) {
          clusters.push(cluster)
        }
      }
    })

    return clusters
  }

  /**
   * Construye un cluster a partir de una base de datos inicial
   */
  private buildCluster(startId: string, relations: DatabaseRelation[], visited: Set<string>): DatabaseCluster {
    const cluster: DatabaseCluster = {
      id: `cluster-${startId}`,
      databases: [],
      connections: 0
    }

    const queue = [startId]
    const connectionCount = new Map<string, number>()

    while (queue.length > 0) {
      const currentId = queue.shift()!
      
      if (visited.has(currentId)) continue
      
      visited.add(currentId)
      cluster.databases.push(currentId)

      // Encontrar todas las conexiones de esta base de datos
      const connections = relations.filter(r => 
        r.sourceId === currentId || r.targetId === currentId
      )

      connectionCount.set(currentId, connections.length)
      cluster.connections += connections.length

      // Agregar bases de datos conectadas a la cola
      connections.forEach(relation => {
        const connectedId = relation.sourceId === currentId ? relation.targetId : relation.sourceId
        if (!visited.has(connectedId)) {
          queue.push(connectedId)
        }
      })
    }

    // Encontrar la base de datos central (con más conexiones)
    let maxConnections = 0
    let centerDatabase = startId

    connectionCount.forEach((count, dbId) => {
      if (count > maxConnections) {
        maxConnections = count
        centerDatabase = dbId
      }
    })

    cluster.centerDatabase = centerDatabase
    cluster.connections = Math.floor(cluster.connections / 2) // Evitar doble conteo

    return cluster
  }

  /**
   * Encuentra bases de datos aisladas (sin conexiones)
   */
  private findIsolatedDatabases(relations: DatabaseRelation[]): string[] {
    const connectedIds = new Set<string>()
    
    relations.forEach(relation => {
      connectedIds.add(relation.sourceId)
      connectedIds.add(relation.targetId)
    })

    return this.databases
      .filter(db => !connectedIds.has(db.id))
      .map(db => db.id)
  }

  /**
   * Encuentra conexiones fuertes (fuerza >= 7)
   */
  private findStrongConnections(relations: DatabaseRelation[]): DatabaseRelation[] {
    return relations.filter(relation => relation.strength >= 7)
  }

  /**
   * Verifica si dos nombres son similares (heurística simple)
   */
  private haveSimilarNames(name1: string, name2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/s$/, '') // Remover plural
    
    const n1 = normalize(name1)
    const n2 = normalize(name2)
    
    // Verificar si uno contiene al otro o viceversa
    return n1.includes(n2) || n2.includes(n1) || this.calculateSimilarity(n1, n2) > 0.6
  }

  /**
   * Calcula similaridad entre strings usando distancia de Levenshtein simplificada
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Calcula la distancia de Levenshtein entre dos strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Obtiene estadísticas del análisis de relaciones
   */
  getRelationshipStats(relationshipMap: RelationshipMap) {
    const { relations, clusters, isolatedDatabases, strongConnections } = relationshipMap

    return {
      totalRelations: relations.length,
      reciprocalRelations: relations.filter(r => r.isReciprocal).length,
      totalClusters: clusters.length,
      largestCluster: clusters.reduce((max, cluster) => 
        cluster.databases.length > max ? cluster.databases.length : max, 0
      ),
      isolatedDatabases: isolatedDatabases.length,
      strongConnections: strongConnections.length,
      averageStrength: relations.length > 0 
        ? Math.round((relations.reduce((sum, r) => sum + r.strength, 0) / relations.length) * 10) / 10
        : 0,
      connectionDensity: this.databases.length > 1 
        ? Math.round((relations.length / (this.databases.length * (this.databases.length - 1) / 2)) * 100)
        : 0
    }
  }
} 