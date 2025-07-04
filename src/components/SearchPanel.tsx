import React, { useState, useMemo } from 'react'
import { Search, Filter, X, Database, Link, Hash } from 'lucide-react'
import { NotionDatabase } from '../types/notion'

interface SearchPanelProps {
  databases: NotionDatabase[]
  onDatabaseSelect: (database: NotionDatabase) => void
  relationshipMap?: any
}

interface SearchResult {
  database: NotionDatabase
  matchType: 'name' | 'description' | 'property' | 'relation'
  matchText: string
  score: number
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  databases,
  onDatabaseSelect,
  relationshipMap
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const filterCategories = [
    { id: 'isolated', label: 'Isolated', icon: Database },
    { id: 'connected', label: 'Connected', icon: Link },
    { id: 'strong', label: 'Strongly Connected', icon: Hash },
    { id: 'hasDescription', label: 'With Description', icon: Database },
  ]

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) {
      return databases.map(db => ({
        database: db,
        matchType: 'name' as const,
        matchText: db.title,
        score: 1
      }))
    }

    const query = searchQuery.toLowerCase().trim()
    const results: SearchResult[] = []

    databases.forEach(database => {
      const scores: { type: SearchResult['matchType'], text: string, score: number }[] = []

      // Search in title (highest priority)
      if (database.title.toLowerCase().includes(query)) {
        const score = database.title.toLowerCase().startsWith(query) ? 10 : 8
        scores.push({ type: 'name', text: database.title, score })
      }

      // Search in description
      if (database.description?.toLowerCase().includes(query)) {
        scores.push({ type: 'description', text: database.description, score: 6 })
      }

      // Search in property names
      Object.values(database.properties).forEach(prop => {
        if (prop.name.toLowerCase().includes(query)) {
          scores.push({ type: 'property', text: prop.name, score: 4 })
        }
      })

      // Search in property types
      Object.values(database.properties).forEach(prop => {
        if (prop.type.toLowerCase().includes(query)) {
          scores.push({ type: 'property', text: `${prop.name} (${prop.type})`, score: 3 })
        }
      })

      // Add best match to results
      if (scores.length > 0) {
        const bestMatch = scores.reduce((best, current) => 
          current.score > best.score ? current : best
        )
        results.push({
          database,
          matchType: bestMatch.type,
          matchText: bestMatch.text,
          score: bestMatch.score
        })
      }
    })

    return results.sort((a, b) => b.score - a.score)
  }, [searchQuery, databases])

  const filteredResults = useMemo(() => {
    if (activeFilters.length === 0) {
      return searchResults
    }

    return searchResults.filter(result => {
      const db = result.database
      return activeFilters.every(filter => {
        switch (filter) {
          case 'isolated':
            return relationshipMap?.isolatedDatabases.includes(db.id)
          case 'connected':
            return !relationshipMap?.isolatedDatabases.includes(db.id)
          case 'strong':
            return relationshipMap?.strongConnections.some((rel: any) => 
              rel.sourceId === db.id || rel.targetId === db.id
            )
          case 'hasDescription':
            return !!db.description
          default:
            return true
        }
      })
    })
  }, [searchResults, activeFilters, relationshipMap])

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveFilters([])
  }

  const getMatchTypeIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'name': return Database
      case 'description': return Database
      case 'property': return Hash
      case 'relation': return Link
      default: return Database
    }
  }

  const getMatchTypeColor = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'name': return 'text-blue-600 bg-blue-50'
      case 'description': return 'text-green-600 bg-green-50'
      case 'property': return 'text-purple-600 bg-purple-50'
      case 'relation': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search databases, properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {(searchQuery || activeFilters.length > 0) && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 pb-3">
        <div className="flex items-center space-x-1 mb-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Filters:</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="flex flex-wrap gap-1">
            {filterCategories.map(filter => {
              const FilterIcon = filter.icon
              const isActive = activeFilters.includes(filter.id)
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FilterIcon className="w-3 h-3" />
                  <span>{filter.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Results */}
      {searchQuery && (
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <div className="text-xs text-gray-500 mb-2">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filteredResults.slice(0, 10).map((result, index) => {
              const MatchIcon = getMatchTypeIcon(result.matchType)
              return (
                <button
                  key={`${result.database.id}-${index}`}
                  onClick={() => onDatabaseSelect(result.database)}
                  className="w-full text-left p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {result.database.icon?.emoji ? (
                        <span className="text-sm">{result.database.icon.emoji}</span>
                      ) : (
                        <Database className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.matchType === 'name' 
                          ? highlightMatch(result.database.title, searchQuery)
                          : result.database.title
                        }
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium ${getMatchTypeColor(result.matchType)}`}>
                          <MatchIcon className="w-3 h-3" />
                          <span>
                            {result.matchType === 'name' ? 'Name' :
                             result.matchType === 'description' ? 'Description' :
                             result.matchType === 'property' ? 'Property' : 'Relation'}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {result.matchType !== 'name' && highlightMatch(result.matchText, searchQuery)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 