// Script de prueba rápido para la detección de relaciones
const { RelationshipDetector } = require('./src/utils/relationshipDetector')

// Datos demo simplificados para prueba
const MOCK_DATABASES = [
  {
    id: '1',
    title: 'Projects',
    properties: {
      'Team': { type: 'relation', relation: { database_id: '2' } },
      'Tasks': { type: 'relation', relation: { database_id: '3' } }
    }
  },
  {
    id: '2', 
    title: 'Team Members',
    properties: {
      'Projects': { type: 'relation', relation: { database_id: '1' } }
    }
  },
  {
    id: '3',
    title: 'Tasks', 
    properties: {
      'Project': { type: 'relation', relation: { database_id: '1' } }
    }
  },
  {
    id: '4',
    title: 'Resources',
    properties: {
      'Name': { type: 'title' }
    }
  }
]

try {
  console.log('🧪 Testing Relationship Detector...')
  
  const detector = new RelationshipDetector(MOCK_DATABASES)
  const result = detector.detectRelations()
  
  console.log('\n📊 Results:')
  console.log('Relations found:', result.relations.length)
  console.log('Clusters found:', result.clusters.length)
  console.log('Isolated databases:', result.isolatedDatabases.length)
  console.log('Strong connections:', result.strongConnections.length)
  
  console.log('\n🔗 Relations details:')
  result.relations.forEach(rel => {
    console.log(`  ${rel.sourceId} → ${rel.targetId} (${rel.sourceProperty}, strength: ${rel.strength})`)
  })
  
  console.log('\n🎯 SUCCESS: Relationship detection is working!')
  
} catch (error) {
  console.error('❌ ERROR:', error.message)
  process.exit(1)
} 