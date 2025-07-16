import React, { useState } from 'react'
import { Eye, EyeOff, Search, Plus, Minus } from 'lucide-react'
import { NotionDatabase } from '../types/notion'

interface DatabaseVisibilityManagerProps {
  databases: NotionDatabase[]
  hiddenDatabases: Set<string>
  isolatedDatabases: string[]
  showIsolatedNodes: boolean
  explicitlyShownDatabases: Set<string>
  isDemoMode?: boolean
  onToggleDatabaseVisibility: (databaseId: string) => void
  onShowAllDatabases: () => void
  onHideAllDatabases: () => void
  onToggleIsolatedNodes: () => void
  onClose: () => void
}

export const DatabaseVisibilityManager: React.FC<DatabaseVisibilityManagerProps> = ({
  databases,
  hiddenDatabases,
  isolatedDatabases,
  showIsolatedNodes,
  explicitlyShownDatabases,
  isDemoMode = false,
  onToggleDatabaseVisibility,
  onShowAllDatabases,
  onHideAllDatabases,
  onToggleIsolatedNodes,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDatabases = databases.filter(db =>
    db.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calcular el estado real de visibilidad (synchronized with SidePanel)
  const isReallyVisible = (databaseId: string): boolean => {
    // If manually hidden, never visible
    if (hiddenDatabases.has(databaseId)) {
      return false
    }
    
    // If it's an isolated database
    if (isolatedDatabases.includes(databaseId)) {
      // Show if global setting is on OR if explicitly shown
      return showIsolatedNodes || explicitlyShownDatabases.has(databaseId)
    }
    
    // Non-isolated databases are visible by default (unless hidden)
    return true
  }

  // Calcular contadores
  const reallyVisibleCount = databases.filter(db => isReallyVisible(db.id)).length
  const reallyHiddenCount = databases.length - reallyVisibleCount

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Manage Visibility
                </h2>
                {isDemoMode && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                    🎭 Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {reallyVisibleCount} visible • {reallyHiddenCount} hidden of {databases.length} total
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="space-y-3">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search databases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Isolated Databases Control */}
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Isolated databases ({isolatedDatabases.length})
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {showIsolatedNodes ? 'Visible automatically' : 'Hidden automatically'}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleIsolatedNodes}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  showIsolatedNodes
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-300 dark:hover:bg-amber-700'
                }`}
              >
                {showIsolatedNodes ? 'Hide auto' : 'Show auto'}
              </button>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Individual control</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredDatabases.length} of {databases.length} databases
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onShowAllDatabases}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Show all</span>
                </button>
                <button
                  onClick={onHideAllDatabases}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Hide all</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Database List */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
          <div 
            className="h-full overflow-y-auto px-6 py-4"
            style={{
              scrollbarWidth: 'auto',
              scrollbarColor: '#cbd5e1 #f8fafc'
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                width: 14px;
              }
              div::-webkit-scrollbar-track {
                background: #f8fafc;
                border-radius: 8px;
                margin: 8px 0;
              }
              div::-webkit-scrollbar-thumb {
                background: linear-gradient(45deg, #cbd5e1, #94a3b8);
                border-radius: 8px;
                border: 2px solid #f8fafc;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
              }
              div::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(45deg, #94a3b8, #64748b);
              }
              .dark div::-webkit-scrollbar-track {
                background: #1e293b;
                border-color: #1e293b;
              }
              .dark div::-webkit-scrollbar-thumb {
                background: linear-gradient(45deg, #475569, #334155);
                border-color: #1e293b;
              }
              .dark div::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(45deg, #64748b, #475569);
              }
            `}</style>

            {filteredDatabases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No databases found' : 'No databases available'}
                </h3>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDatabases.map((database, index) => {
                  const isExplicitlyHidden = hiddenDatabases.has(database.id)
                  const isIsolated = isolatedDatabases.includes(database.id)
                  const isReallyVisibleNow = isReallyVisible(database.id)
                  
                  return (
                    <div
                      key={database.id}
                      className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        !isReallyVisibleNow
                          ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => onToggleDatabaseVisibility(database.id)}
                    >
                      <div className="flex items-center space-x-3">
                        
                        {/* Index */}
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </div>
                        
                        {/* Icon */}
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          isIsolated ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold truncate text-sm ${
                              !isReallyVisibleNow 
                                ? 'text-gray-500 dark:text-gray-400 line-through' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {database.title}
                            </h3>
                            
                            {/* Status indicators */}
                            <div className="flex items-center space-x-1">
                              {isIsolated && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md">
                                  Isolated
                                </span>
                              )}
                              <div className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                isReallyVisibleNow
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                {isReallyVisibleNow ? 'Visible' : 'Hidden'}
                              </div>
                              {explicitlyShownDatabases.has(database.id) && isIsolated && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
                                  Explicit
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              ID: {database.id.slice(0, 8)}...
                            </span>
                            
                            {/* Visibility reason */}
                            {isIsolated && !showIsolatedNodes && !isExplicitlyHidden && !explicitlyShownDatabases.has(database.id) && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                Hidden automatically
                              </span>
                            )}
                            {isExplicitlyHidden && (
                              <span className="text-xs text-red-600 dark:text-red-400">
                                Hidden manually
                              </span>
                            )}
                            {explicitlyShownDatabases.has(database.id) && isIsolated && !showIsolatedNodes && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Shown explicitly
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleDatabaseVisibility(database.id)
                          }}
                          className={`p-2 rounded-lg transition-all transform group-hover:scale-105 ${
                            isExplicitlyHidden
                              ? 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-blue-600 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={isExplicitlyHidden ? 'Show database' : 'Hide database'}
                        >
                          {isExplicitlyHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
                
                {/* Summary */}
                <div className="text-center py-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📊 {filteredDatabases.length} database{filteredDatabases.length !== 1 ? 's' : ''} shown
                    {searchQuery && ` (of ${databases.length} total)`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 