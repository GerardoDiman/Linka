import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, BarChart3, Database, GitBranch } from 'lucide-react'

interface WorkspaceStatsProps {
  databases: any[]
  edges: any[]
  relationshipMap: any
  layoutStats: any
  hiddenDatabases: Set<string>
  showIsolatedNodes: boolean
  explicitlyShownDatabases: Set<string>
}

export const WorkspaceStats: React.FC<WorkspaceStatsProps> = ({
  databases,
  edges,
  relationshipMap,
  layoutStats,
  hiddenDatabases,
  showIsolatedNodes,
  explicitlyShownDatabases
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('linkav2-stats-expanded')
    return saved ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('linkav2-stats-expanded', JSON.stringify(isExpanded))
  }, [isExpanded])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Calculate visible database count using same logic as DatabaseVisibilityManager
  const getVisibleDatabaseCount = () => {
    if (!relationshipMap) return databases.length
    
    return databases.filter(db => {
      // Same logic as SidePanel and DatabaseVisibilityManager
      if (hiddenDatabases.has(db.id)) return false
      if (relationshipMap.isolatedDatabases.includes(db.id)) {
        return showIsolatedNodes || explicitlyShownDatabases.has(db.id)
      }
      return true
    }).length
  }

  const visibleDatabaseCount = getVisibleDatabaseCount()
  const totalDatabaseCount = databases.length
  const hiddenDatabaseCount = totalDatabaseCount - visibleDatabaseCount
  
  const isolatedCount = relationshipMap?.isolatedDatabases.length || 0
  const strongConnectionsCount = relationshipMap?.strongConnections.length || 0
  const avgStrength = relationshipMap?.relations.length > 0 
    ? (relationshipMap.relations.reduce((sum: number, r: any) => sum + r.strength, 0) / relationshipMap.relations.length).toFixed(1)
    : '0'

  return (
    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 z-10">
      {/* Header - Siempre visible */}
      <div 
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Workspace Intelligence</span>
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            )}
          </div>
        </div>
        {!isExpanded && (
          <div className="mt-1 ml-7 text-xs text-gray-500 dark:text-gray-400">
            {visibleDatabaseCount} DBs • {edges.length} Relations
          </div>
        )}
      </div>

      {/* Content - Expandible */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-2">
                {/* Estadísticas principales */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>Databases:</span>
                  </span>
                  <span className="font-medium">
                    {visibleDatabaseCount}
                    {hiddenDatabaseCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        /{totalDatabaseCount}
                      </span>
                    )}
                    {isolatedCount > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                        ({isolatedCount} isolated)
                      </span>
                    )}
                  </span>
                </div>

                {hiddenDatabaseCount > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ {hiddenDatabaseCount} databases hidden by visibility filters
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1">
                    <GitBranch className="w-3 h-3" />
                    <span>Relations:</span>
                  </span>
                  <span className="font-medium">
                    {edges.length}
                    {relationshipMap && relationshipMap.relations.length !== edges.length && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                        /{relationshipMap.relations.length}
                      </span>
                    )}
                  </span>
                </div>

                {relationshipMap && relationshipMap.relations.length > edges.length && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                    ⚠️ {relationshipMap.relations.length - edges.length} relationships hidden by visibility filters
                  </div>
                )}

                {relationshipMap && (
                  <>
                    <div className="flex justify-between">
                      <span>Clusters:</span>
                      <span className="font-medium">{relationshipMap.clusters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Strong Connections:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{strongConnectionsCount}</span>
                    </div>
                    
                    {/* Estadísticas avanzadas */}
                    {relationshipMap.relations.length > 0 && (
                      <div className="flex justify-between">
                        <span>Avg. Strength:</span>
                        <span className="font-medium">{avgStrength}</span>
                      </div>
                    )}
                    
                    {layoutStats && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Line Crossings:</span>
                          <span className={`font-medium ${
                            layoutStats.crossings === 0 ? 'text-green-600 dark:text-green-400' : 
                            layoutStats.crossings <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {layoutStats.crossings}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Layout Quality:</span>
                          <span className="font-medium">{layoutStats.layoutQuality}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Canvas Size:</span>
                          <span className="font-medium">{layoutStats.canvasSize}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Density:</span>
                          <span className={`font-medium capitalize ${
                            layoutStats.density === 'sparse' ? 'text-blue-600 dark:text-blue-400' : 
                            layoutStats.density === 'normal' ? 'text-green-600 dark:text-green-400' : 
                            layoutStats.density === 'dense' ? 'text-orange-600 dark:text-orange-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {layoutStats.density}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 