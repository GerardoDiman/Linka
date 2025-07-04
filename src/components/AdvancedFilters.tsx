import React, { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Database, Link, Hash, Users, Unlink, Calendar, FileText } from 'lucide-react'

interface AdvancedFiltersProps {
  databases: any[]
  relationshipMap: any
  onFilterChange: (filteredDatabases: any[]) => void
  className?: string
}

interface FilterState {
  connectionType: 'all' | 'isolated' | 'connected' | 'strong'
  propertyCount: { min: number; max: number }
  relationCount: { min: number; max: number }
  propertyTypes: string[]
  hasDescription: boolean | null
  recentlyModified: boolean | null
  textSearch: string
}

const initialFilterState: FilterState = {
  connectionType: 'all',
  propertyCount: { min: 0, max: 100 },
  relationCount: { min: 0, max: 50 },
  propertyTypes: [],
  hasDescription: null,
  recentlyModified: null,
  textSearch: ''
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  databases,
  relationshipMap,
  onFilterChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>(initialFilterState)

  // Obtener todos los tipos de propiedades únicos
  const allPropertyTypes = [...new Set(
    databases.flatMap(db => Object.values(db.properties).map((prop: any) => prop.type))
  )].sort()

  // Aplicar filtros
  const applyFilters = (newFilters: FilterState) => {
    let filtered = databases

    // Filtro por tipo de conexión
    if (newFilters.connectionType !== 'all' && relationshipMap) {
      switch (newFilters.connectionType) {
        case 'isolated':
          filtered = filtered.filter(db => relationshipMap.isolatedDatabases.includes(db.id))
          break
        case 'connected':
          filtered = filtered.filter(db => !relationshipMap.isolatedDatabases.includes(db.id))
          break
        case 'strong':
          filtered = filtered.filter(db => 
            relationshipMap.strongConnections.some((rel: any) => 
              rel.sourceId === db.id || rel.targetId === db.id
            )
          )
          break
      }
    }

    // Filtro por conteo de propiedades
    filtered = filtered.filter(db => {
      const propCount = Object.keys(db.properties).length
      return propCount >= newFilters.propertyCount.min && propCount <= newFilters.propertyCount.max
    })

    // Filtro por conteo de relaciones
    if (relationshipMap) {
      filtered = filtered.filter(db => {
        const relCount = relationshipMap.relations.filter((rel: any) => 
          rel.sourceId === db.id || rel.targetId === db.id
        ).length
        return relCount >= newFilters.relationCount.min && relCount <= newFilters.relationCount.max
      })
    }

    // Filtro por tipos de propiedades
    if (newFilters.propertyTypes.length > 0) {
      filtered = filtered.filter(db => {
        const dbPropertyTypes = Object.values(db.properties).map((prop: any) => prop.type)
        return newFilters.propertyTypes.every(type => dbPropertyTypes.includes(type))
      })
    }

    // Filtro por descripción
    if (newFilters.hasDescription !== null) {
      filtered = filtered.filter(db => {
        const hasDesc = !!(db.description && db.description.trim())
        return newFilters.hasDescription ? hasDesc : !hasDesc
      })
    }

    // Filtro por modificación reciente (últimos 30 días)
    if (newFilters.recentlyModified !== null) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(db => {
        const lastModified = new Date(db.last_edited_time)
        const isRecent = lastModified > thirtyDaysAgo
        return newFilters.recentlyModified ? isRecent : !isRecent
      })
    }

    // Filtro por búsqueda de texto
    if (newFilters.textSearch.trim()) {
      const searchTerm = newFilters.textSearch.toLowerCase()
      filtered = filtered.filter(db => 
        db.title.toLowerCase().includes(searchTerm) ||
        (db.description && db.description.toLowerCase().includes(searchTerm)) ||
        Object.values(db.properties).some((prop: any) => 
          prop.name.toLowerCase().includes(searchTerm) ||
          prop.type.toLowerCase().includes(searchTerm)
        )
      )
    }

    onFilterChange(filtered)
  }

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters(initialFilterState)
    onFilterChange(databases)
  }

  const hasActiveFilters = () => {
    return filters.connectionType !== 'all' ||
           filters.propertyCount.min > 0 ||
           filters.propertyCount.max < 100 ||
           filters.relationCount.min > 0 ||
           filters.relationCount.max < 50 ||
           filters.propertyTypes.length > 0 ||
           filters.hasDescription !== null ||
           filters.recentlyModified !== null ||
           filters.textSearch.trim() !== ''
  }

  const getFilterSummary = () => {
    const activeCount = [
      filters.connectionType !== 'all',
      filters.propertyCount.min > 0 || filters.propertyCount.max < 100,
      filters.relationCount.min > 0 || filters.relationCount.max < 50,
      filters.propertyTypes.length > 0,
      filters.hasDescription !== null,
      filters.recentlyModified !== null,
      filters.textSearch.trim() !== ''
    ].filter(Boolean).length

    return activeCount
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <Filter className="w-4 h-4" />
          <span>Advanced Filters</span>
          {hasActiveFilters() && (
            <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
              {getFilterSummary()}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filtros expandibles */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Búsqueda de texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔍 Text search
            </label>
            <input
              type="text"
              value={filters.textSearch}
              onChange={(e) => updateFilters({ textSearch: e.target.value })}
              placeholder="Search in names, descriptions and properties..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Tipo de conexión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔗 Connection type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'All', icon: Database },
                { value: 'isolated', label: 'Isolated', icon: Unlink },
                { value: 'connected', label: 'Connected', icon: Link },
                { value: 'strong', label: 'Strong', icon: Users }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateFilters({ connectionType: value as any })}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-md transition-colors ${
                    filters.connectionType === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-2 gap-4">
            {/* Conteo de propiedades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📊 Properties ({filters.propertyCount.min}-{filters.propertyCount.max})
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">Min:</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.propertyCount.min}
                    onChange={(e) => updateFilters({ 
                      propertyCount: { ...filters.propertyCount, min: parseInt(e.target.value) }
                    })}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-8">{filters.propertyCount.min}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">Max:</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.propertyCount.max}
                    onChange={(e) => updateFilters({ 
                      propertyCount: { ...filters.propertyCount, max: parseInt(e.target.value) }
                    })}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-8">{filters.propertyCount.max}</span>
                </div>
              </div>
            </div>

            {/* Conteo de relaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔗 Relations ({filters.relationCount.min}-{filters.relationCount.max})
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">Min:</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.relationCount.min}
                    onChange={(e) => updateFilters({ 
                      relationCount: { ...filters.relationCount, min: parseInt(e.target.value) }
                    })}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-8">{filters.relationCount.min}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">Max:</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.relationCount.max}
                    onChange={(e) => updateFilters({ 
                      relationCount: { ...filters.relationCount, max: parseInt(e.target.value) }
                    })}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-8">{filters.relationCount.max}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de propiedades */}
          {allPropertyTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🏷️ Required property types ({filters.propertyTypes.length} selected)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                <div className="grid grid-cols-2 gap-1">
                  {allPropertyTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.propertyTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.propertyTypes, type]
                            : filters.propertyTypes.filter(t => t !== type)
                          updateFilters({ propertyTypes: newTypes })
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtros booleanos */}
          <div className="grid grid-cols-2 gap-4">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Description
              </label>
              <div className="space-y-1">
                {[
                  { value: null, label: 'All' },
                  { value: true, label: 'With description' },
                  { value: false, label: 'Without description' }
                ].map(({ value, label }) => (
                  <label key={String(value)} className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="hasDescription"
                      checked={filters.hasDescription === value}
                      onChange={() => updateFilters({ hasDescription: value })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modificación reciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Recent modification
              </label>
              <div className="space-y-1">
                {[
                  { value: null, label: 'All' },
                  { value: true, label: 'Last 30 days' },
                  { value: false, label: 'Older' }
                ].map(({ value, label }) => (
                  <label key={String(value)} className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="recentlyModified"
                      checked={filters.recentlyModified === value}
                      onChange={() => updateFilters({ recentlyModified: value })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 