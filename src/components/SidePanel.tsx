import { Search, RefreshCw, Database, ExternalLink, AlertCircle, Loader2, ChevronLeft, Filter, X, Settings, Hash, FileText, Tag, Link, ArrowLeft, ArrowUpDown, SortAsc, SortDesc, Info, Calendar, Hash as HashIcon, Clock } from 'lucide-react'
import { NotionDatabase } from '../types/notion'
import { RelationshipMap, DatabaseRelation } from '../utils/relationshipDetector'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

interface SidePanelProps {
  databases: NotionDatabase[]
  selectedDatabase: NotionDatabase | null
  onSelectDatabase: (database: NotionDatabase) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  isConnected?: boolean
  onConnectToNotion?: () => void
  hiddenDatabases?: Set<string>
  isolatedDatabases?: string[]
  explicitlyShownDatabases?: Set<string>
  showIsolatedNodes?: boolean
  relationshipMap?: RelationshipMap | null
}

interface Filters {
  hasRelations: boolean | null
  propertyTypes: string[]
  minProperties: number
  maxProperties: number
}

interface PropertyFilters {
  searchQuery: string
  propertyTypes: string[]
  sortBy: 'name' | 'type' | 'id'
  sortOrder: 'asc' | 'desc'
}

export default function SidePanel({
  databases,
  selectedDatabase,
  onSelectDatabase,
  searchQuery,
  onSearchChange,
  isLoading,
  error,
  onRefresh,
  isConnected = false,
  onConnectToNotion,
  hiddenDatabases = new Set(),
  isolatedDatabases = [],
  explicitlyShownDatabases = new Set(),
  showIsolatedNodes = false,
  relationshipMap = null
}: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [detailMode, setDetailMode] = useState(false)
  const [showPropertyFilters, setShowPropertyFilters] = useState(false)
  const [showDatabaseInfo, setShowDatabaseInfo] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    hasRelations: null,
    propertyTypes: [],
    minProperties: 0,
    maxProperties: 100
  })
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({
    searchQuery: '',
    propertyTypes: [],
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Shared visibility logic (synchronized with DatabaseVisibilityManager)
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

  // Filter databases using the same logic as the visibility manager
  const visibleDatabases = databases.filter(db => isReallyVisible(db.id))

  // Calculate visibility stats for display
  const visibilityStats = {
    total: databases.length,
    visible: visibleDatabases.length,
    hidden: databases.length - visibleDatabases.length,
    isolated: isolatedDatabases.length,
    explicitlyShown: explicitlyShownDatabases.size,
    manuallyHidden: hiddenDatabases.size
  }

  // Get all unique property types from visible databases
  const allPropertyTypes = [...new Set(
    visibleDatabases.flatMap(db => Object.values(db.properties).map(prop => prop.type))
  )].sort()

  // Intelligent search with scoring on visible databases
  const searchResults = visibleDatabases.map(db => {
    const query = searchQuery.toLowerCase().trim()
    let score = 0
    let matchType = ''
    let matchText = ''

    if (!query) {
      return { database: db, score: 1, matchType: 'all', matchText: db.title }
    }

    // Title match (highest priority)
    if (db.title.toLowerCase().includes(query)) {
      if (db.title.toLowerCase().startsWith(query)) {
        score = 10
      } else {
        score = 8
      }
      matchType = 'title'
      matchText = db.title
    }

    // Description match
    if (db.description?.toLowerCase().includes(query)) {
      if (score < 6) {
        score = 6
        matchType = 'description'
        matchText = db.description
      }
    }

    // Property name match
    const matchingProperty = Object.values(db.properties).find(prop => 
      prop.name.toLowerCase().includes(query)
    )
    if (matchingProperty && score < 5) {
      score = 5
      matchType = 'property'
      matchText = matchingProperty.name
    }

    // Property type match
    const matchingType = Object.values(db.properties).find(prop => 
      prop.type.toLowerCase().includes(query)
    )
    if (matchingType && score < 3) {
      score = 3
      matchType = 'type'
      matchText = `${matchingType.name} (${matchingType.type})`
    }

    return { database: db, score, matchType, matchText }
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score)

  // Apply filters to search results
  const filteredDatabases = searchResults.filter(result => {
    const db = result.database

    // Relations filter
    if (filters.hasRelations !== null) {
      const hasRelations = db.relations && db.relations.length > 0
      if (filters.hasRelations && !hasRelations) return false
      if (!filters.hasRelations && hasRelations) return false
    }

    // Property count filter
    const propertyCount = Object.keys(db.properties).length
    if (propertyCount < filters.minProperties || propertyCount > filters.maxProperties) {
      return false
    }

    // Property types filter
    if (filters.propertyTypes.length > 0) {
      const dbPropertyTypes = Object.values(db.properties).map(prop => prop.type)
      const hasRequiredTypes = filters.propertyTypes.every(type => 
        dbPropertyTypes.includes(type)
      )
      if (!hasRequiredTypes) return false
    }

    return true
  }).map(result => result.database)

  // Function to highlight search matches
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded text-yellow-800">
          {part}
        </mark>
      ) : part
    )
  }

  // Get match info for a database
  const getMatchInfo = (database: NotionDatabase) => {
    const result = searchResults.find(r => r.database.id === database.id)
    return result || { matchType: 'all', matchText: database.title, score: 1 }
  }

  // Get icon for match type
  const getMatchIcon = (matchType: string) => {
    switch (matchType) {
      case 'title': return Database
      case 'description': return FileText
      case 'property': return Hash
      case 'type': return Tag
      default: return Database
    }
  }

  // Get color for match type
  const getMatchColor = (matchType: string) => {
    switch (matchType) {
      case 'title': return 'text-blue-600 bg-blue-50'
      case 'description': return 'text-green-600 bg-green-50'
      case 'property': return 'text-purple-600 bg-purple-50'
      case 'type': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const clearFilters = () => {
    setFilters({
      hasRelations: null,
      propertyTypes: [],
      minProperties: 0,
      maxProperties: 100
    })
  }

  const hasActiveFilters = filters.hasRelations !== null || 
    filters.propertyTypes.length > 0 || 
    filters.minProperties > 0 || 
    filters.maxProperties < 100

  const hasActivePropertyFilters = propertyFilters.searchQuery.trim() !== '' || 
    propertyFilters.propertyTypes.length > 0

  // Get all unique property types from selected database
  const getSelectedDatabasePropertyTypes = () => {
    if (!selectedDatabase) return []
    return [...new Set(
      Object.values(selectedDatabase.properties).map(prop => prop.type)
    )].sort()
  }

  // Filter and sort properties
  const getFilteredAndSortedProperties = () => {
    if (!selectedDatabase) return []
    
    let properties = Object.entries(selectedDatabase.properties)
    
    // Apply search filter
    if (propertyFilters.searchQuery.trim()) {
      const query = propertyFilters.searchQuery.toLowerCase().trim()
      properties = properties.filter(([key, property]) => 
        property.name.toLowerCase().includes(query) ||
        property.type.toLowerCase().includes(query) ||
        property.id.toLowerCase().includes(query)
      )
    }
    
    // Apply type filter
    if (propertyFilters.propertyTypes.length > 0) {
      properties = properties.filter(([key, property]) => 
        propertyFilters.propertyTypes.includes(property.type)
      )
    }
    
    // Apply sorting
    properties.sort(([keyA, propertyA], [keyB, propertyB]) => {
      let comparison = 0
      
      switch (propertyFilters.sortBy) {
        case 'name':
          comparison = propertyA.name.localeCompare(propertyB.name)
          break
        case 'type':
          comparison = propertyA.type.localeCompare(propertyB.type)
          break
        case 'id':
          comparison = propertyA.id.localeCompare(propertyB.id)
          break
        default:
          comparison = propertyA.name.localeCompare(propertyB.name)
      }
      
      return propertyFilters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return properties
  }

  const clearPropertyFilters = () => {
    setPropertyFilters({
      searchQuery: '',
      propertyTypes: [],
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  // Get detailed relations for selected database
  const getSelectedDatabaseRelations = (): DatabaseRelation[] => {
    if (!selectedDatabase || !relationshipMap) return []
    
    return relationshipMap.relations.filter(relation => 
      relation.sourceId === selectedDatabase.id || relation.targetId === selectedDatabase.id
    )
  }

  // Get target database for a relation
  const getTargetDatabase = (relation: DatabaseRelation): NotionDatabase | null => {
    const targetId = relation.sourceId === selectedDatabase?.id ? relation.targetId : relation.sourceId
    return databases.find(db => db.id === targetId) || null
  }

  // Get relation display name
  const getRelationDisplayName = (relation: DatabaseRelation): string => {
    if (relation.sourceId === selectedDatabase?.id) {
      return relation.sourceProperty
    } else {
      return relation.targetProperty || relation.sourceProperty
    }
  }

  const renderDatabaseIcon = (database: NotionDatabase) => {
    if (database.icon?.emoji) {
      return <span className="text-lg">{database.icon.emoji}</span>
    }
    if (database.icon?.file?.url || database.icon?.external?.url) {
      return (
        <div className="relative w-5 h-5">
          <img 
            src={database.icon.file?.url || database.icon.external?.url} 
            alt="" 
            className="w-5 h-5 rounded"
            onError={(e) => {
              // Replace with fallback icon on CORS/403 errors
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = parent.querySelector('.fallback-icon') as HTMLElement
                if (fallback) fallback.style.display = 'block'
              }
            }}
          />
          <Database className="fallback-icon w-5 h-5 text-gray-400 absolute top-0 left-0 hidden" />
        </div>
      )
    }
    return <Database className="w-5 h-5 text-gray-400" />
  }

  // Handle database selection
  const handleDatabaseSelect = (database: NotionDatabase) => {
    onSelectDatabase(database)
    setDetailMode(true)
  }

  // Handle database selection without entering detail mode
  const handleDatabaseSelectOnly = (database: NotionDatabase) => {
    onSelectDatabase(database)
    // Don't set detail mode - just select for workspace highlighting
  }

  // Handle back to list
  const handleBackToList = () => {
    setDetailMode(false)
    onSelectDatabase(null as any)
  }

  // Auto-scroll to selected database in list mode
  useEffect(() => {
    if (selectedDatabase && !detailMode && !isCollapsed) {
      // Find the selected database in the filtered list
      const selectedIndex = filteredDatabases.findIndex(db => db.id === selectedDatabase.id)
      if (selectedIndex !== -1) {
        // Scroll to the selected database
        const element = document.querySelector(`[data-database-id="${selectedDatabase.id}"]`)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }
      }
    }
  }, [selectedDatabase, detailMode, isCollapsed, filteredDatabases])

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-80'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {detailMode ? 'Database Details' : 'Notion Databases'}
            </h2>
          )}
          <div className="flex items-center space-x-2">
            {!isCollapsed && detailMode && (
              <button
                onClick={handleBackToList}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Back to list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {!isCollapsed && !detailMode && (
              <>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  title="Refresh databases"
                >
                  <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={clsx(
                    'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                    showFilters || hasActiveFilters 
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  )}
                  title="Toggle filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={clsx('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
            </button>
          </div>
        </div>

        {!isCollapsed && !detailMode && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, description, properties..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search results indicator */}
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{filteredDatabases.length}</span> result{filteredDatabases.length !== 1 ? 's' : ''} found
                {filteredDatabases.length > 0 && (
                  <span className="ml-2 text-xs">
                    ({searchResults.filter(r => r.matchType === 'title').length} title, {' '}
                    {searchResults.filter(r => r.matchType === 'description').length} description, {' '}
                    {searchResults.filter(r => r.matchType === 'property').length} property)
                  </span>
                )}
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Relations Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relations
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="relations"
                        checked={filters.hasRelations === null}
                        onChange={() => setFilters(prev => ({ ...prev, hasRelations: null }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="relations"
                        checked={filters.hasRelations === true}
                        onChange={() => setFilters(prev => ({ ...prev, hasRelations: true }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">With relations</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="relations"
                        checked={filters.hasRelations === false}
                        onChange={() => setFilters(prev => ({ ...prev, hasRelations: false }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Without relations</span>
                    </label>
                  </div>
                </div>

                {/* Property Types Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Types
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {allPropertyTypes.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.propertyTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                propertyTypes: [...prev.propertyTypes, type]
                              }))
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                propertyTypes: prev.propertyTypes.filter(t => t !== type)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Property Count Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Properties
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        min="0"
                        value={filters.minProperties}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          minProperties: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        min="0"
                        value={filters.maxProperties}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          maxProperties: parseInt(e.target.value) || 100
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isCollapsed ? (
          <div className="p-2 space-y-2">
            {visibleDatabases.slice(0, 8).map((database) => (
              <button
                key={database.id}
                onClick={() => handleDatabaseSelect(database)}
                className={clsx(
                  'w-full p-2 rounded-lg transition-colors flex items-center justify-center',
                  selectedDatabase?.id === database.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}
                title={database.title}
              >
                {renderDatabaseIcon(database)}
              </button>
            ))}
          </div>
        ) : detailMode && selectedDatabase ? (
          // Detail Mode - Full database details
          <div className="overflow-y-auto h-full p-4">
            {/* Header */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0">
                {renderDatabaseIcon(selectedDatabase)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {selectedDatabase.title}
                </h3>
                {selectedDatabase.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                    {selectedDatabase.description}
                  </p>
                )}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Database className="w-3 h-3" />
                    <span>{Object.keys(selectedDatabase.properties).length} properties</span>
                  </div>
                  {getSelectedDatabaseRelations().length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Link className="w-3 h-3" />
                      <span>{getSelectedDatabaseRelations().length} relations</span>
                    </div>
                  )}
                  <button
                    onClick={() => window.open(selectedDatabase.url, '_blank')}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    title="Open in Notion"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Database Info Button */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowDatabaseInfo(true)}
                className="flex items-center space-x-2 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="View database information"
              >
                <Info className="w-4 h-4" />
                <span>Database Info</span>
              </button>
            </div>

            {/* Properties */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Properties ({getFilteredAndSortedProperties().length} of {Object.keys(selectedDatabase.properties).length})
                </h4>
                <div className="flex items-center space-x-2">
                  {hasActivePropertyFilters && (
                    <button
                      onClick={clearPropertyFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Clear filters"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowPropertyFilters(!showPropertyFilters)}
                    className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1"
                    title="Filter and sort properties"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Property Filters Panel */}
              {showPropertyFilters && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <div className="space-y-3">
                    {/* Search */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Properties
                      </label>
                      <input
                        type="text"
                        value={propertyFilters.searchQuery}
                        onChange={(e) => setPropertyFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        placeholder="Search by name, type, or ID..."
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Sort by:
                      </label>
                      <select
                        value={propertyFilters.sortBy}
                        onChange={(e) => setPropertyFilters(prev => ({ ...prev, sortBy: e.target.value as 'name' | 'type' | 'id' }))}
                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="name">Name</option>
                        <option value="type">Type</option>
                        <option value="id">ID</option>
                      </select>
                      <button
                        onClick={() => setPropertyFilters(prev => ({ 
                          ...prev, 
                          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                        }))}
                        className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        title={`Sort ${propertyFilters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        {propertyFilters.sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Property Type Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filter by Type
                      </label>
                      <div className="max-h-20 overflow-y-auto space-y-1">
                        {getSelectedDatabasePropertyTypes().map(type => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={propertyFilters.propertyTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPropertyFilters(prev => ({
                                    ...prev,
                                    propertyTypes: [...prev.propertyTypes, type]
                                  }))
                                } else {
                                  setPropertyFilters(prev => ({
                                    ...prev,
                                    propertyTypes: prev.propertyTypes.filter(t => t !== type)
                                  }))
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                {getFilteredAndSortedProperties().map(([key, property]) => (
                  <div key={property.id} className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {property.name}
                      </h5>
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-medium capitalize">
                        {property.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {property.id}
                    </div>
                  </div>
                ))}
              </div>

              {/* No properties found message */}
              {getFilteredAndSortedProperties().length === 0 && hasActivePropertyFilters && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-xs">No properties match your filters</p>
                  <button
                    onClick={clearPropertyFilters}
                    className="mt-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Relations */}
            {(() => {
              const relations = getSelectedDatabaseRelations()
              return relations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Link className="w-4 h-4 mr-2" />
                    Relations ({relations.length})
                  </h4>
                  <div className="grid gap-2">
                    {relations.map((relation, index) => {
                      const targetDb = getTargetDatabase(relation)
                      const relationName = getRelationDisplayName(relation)
                      
                      return (
                        <div key={`${relation.sourceId}-${relation.targetId}`} className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {relationName}
                            </h5>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium">
                                {relation.isReciprocal ? 'Bidirectional' : 'Unidirectional'}
                              </span>
                              <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-medium capitalize">
                                {relation.relationType}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {targetDb && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Connected to:</span> {targetDb.title}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Strength:</span> {relation.strength}/10
                            </div>
                            {relation.isReciprocal && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                ✓ Reciprocal connection
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}


          </div>
        ) : error ? (
          <div className="p-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
            <button
              onClick={onRefresh}
              className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading databases...</span>
            </div>
          </div>
        ) : (
          // List Mode - Database list
          <div className="overflow-y-auto h-full">
            {filteredDatabases.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Database className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">
                  {searchQuery || hasActiveFilters ? 'No databases match your criteria' : 'No databases found'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredDatabases.length} of {visibleDatabases.length} visible
                    {hiddenDatabases.size > 0 && (
                      <span className="ml-1 text-amber-600 dark:text-amber-400">
                        ({hiddenDatabases.size} hidden)
                      </span>
                    )}
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={() => setShowFilters(true)}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
                    >
                      Filtered
                    </button>
                  )}
                </div>
                {filteredDatabases.map((database) => {
                  const matchInfo = getMatchInfo(database)
                  const MatchIcon = getMatchIcon(matchInfo.matchType)
                  const isSelected = selectedDatabase?.id === database.id
                  
                  return (
                    <div
                      key={database.id}
                      data-database-id={database.id}
                      className={clsx(
                        'p-3 rounded-lg cursor-pointer transition-colors mb-2',
                        'hover:bg-gray-50 dark:hover:bg-gray-700',
                        isSelected
                          ? 'bg-transparent border-2 border-primary-300 dark:border-primary-600 shadow-sm'
                          : 'border border-transparent'
                      )}
                      onClick={() => handleDatabaseSelectOnly(database)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {renderDatabaseIcon(database)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {highlightMatch(database.title, searchQuery)}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {isSelected && (
                                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full font-medium">
                                  Selected
                                </span>
                              )}
                              {searchQuery && matchInfo.matchType !== 'all' && (
                                <div className={clsx(
                                  'match-badge flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                                  getMatchColor(matchInfo.matchType)
                                )}>
                                  <MatchIcon className="w-3 h-3" />
                                  <span className="capitalize">{matchInfo.matchType}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {database.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {highlightMatch(database.description, searchQuery)}
                            </p>
                          )}
                          {searchQuery && matchInfo.matchType === 'property' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                              Found in property: {highlightMatch(matchInfo.matchText, searchQuery)}
                            </p>
                          )}
                          {searchQuery && matchInfo.matchType === 'type' && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                              Found in type: {highlightMatch(matchInfo.matchText, searchQuery)}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-3 text-xs text-gray-400">
                              <span>{Object.keys(database.properties).length} fields</span>
                              {database.relations && database.relations.length > 0 && (
                                <span>{database.relations.length} relations</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDatabaseSelect(database)
                                }}
                                className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                                title="View details"
                              >
                                <Database className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(database.url, '_blank')
                                }}
                                className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                                title="Open in Notion"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Database Info Modal */}
      {showDatabaseInfo && selectedDatabase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDatabaseInfo(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {renderDatabaseIcon(selectedDatabase)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Database Information
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDatabase.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDatabaseInfo(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <HashIcon className="w-4 h-4" />
                  <span className="font-medium">Database ID:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{selectedDatabase.id}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Created:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(selectedDatabase.createdTime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Last updated:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(selectedDatabase.lastEditedTime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Object.keys(selectedDatabase.properties).length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Properties
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {getSelectedDatabaseRelations().length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Relations
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Features
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cover image</span>
                    <span className={selectedDatabase.cover ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}>
                      {selectedDatabase.cover ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Custom icon</span>
                    <span className={selectedDatabase.icon ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}>
                      {selectedDatabase.icon ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description</span>
                    <span className={selectedDatabase.description ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}>
                      {selectedDatabase.description ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedDatabase.description && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedDatabase.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    window.open(selectedDatabase.url, '_blank')
                    setShowDatabaseInfo(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Notion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 