import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Database, ExternalLink, Eye, Zap, Users, Unlink } from 'lucide-react'
import { DatabaseNodeData } from '../types/notion'
import { DatabaseTooltip } from './DatabaseTooltip'
import { clsx } from 'clsx'

const DatabaseNode = memo(({ data, selected }: NodeProps<DatabaseNodeData>) => {
  const { database, onSelect, isIsolated, isStronglyConnected, relationCount = 0, cluster } = data
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    onSelect(database)
  }

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(database.url, '_blank')
  }

  const renderIcon = () => {
    if (database.icon?.emoji) {
      return <span className="text-2xl">{database.icon.emoji}</span>
    }
    if ((database.icon?.file?.url || database.icon?.external?.url) && !imageError) {
      return (
        <img 
          src={database.icon.file?.url || database.icon.external?.url} 
          alt="" 
          className="w-8 h-8 rounded"
          onError={() => {
            // Gracefully handle CORS errors with fallback icon
            setImageError(true)
          }}
        />
      )
    }
    return <Database className="w-6 h-6 text-primary-600" />
  }

  const propertyTypes = Object.values(database.properties).map(prop => prop.type)
  const uniqueTypes = [...new Set(propertyTypes)]

  // Determinar el estilo del nodo basado en las relaciones
  const getNodeStyle = () => {
    if (isIsolated) {
      return 'border-orange-300 bg-orange-50'
    }
    if (isStronglyConnected) {
      return 'border-blue-300 bg-blue-50'
    }
    if (cluster && cluster.centerDatabase === database.id) {
      return 'border-purple-300 bg-purple-50'
    }
    return 'border-gray-300 bg-white'
  }

  return (
    <DatabaseTooltip
      database={database}
      relationCount={relationCount}
      isIsolated={isIsolated || false}
      isStronglyConnected={isStronglyConnected || false}
      cluster={cluster}
    >
      <div 
        className={clsx(
          'custom-node cursor-pointer transition-all duration-200',
          'min-w-[250px] max-w-[300px] border-2',
          getNodeStyle(),
          selected && 'selected ring-2 ring-primary-400'
        )}
        onClick={handleClick}
      >
      {/* 24 Puntos de Conexión Híbridos - Cada posición tiene source Y target */}
      
      {/* Left side - source y target en cada posición */}
      <Handle type="source" position={Position.Left} id="left-top-s" style={{ top: '25%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Left} id="left-top-t" style={{ top: '25%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Left} id="left-center-s" style={{ top: '50%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Left} id="left-center-t" style={{ top: '50%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Left} id="left-bottom-s" style={{ top: '75%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Left} id="left-bottom-t" style={{ top: '75%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      
      {/* Right side - source y target en cada posición */}
      <Handle type="source" position={Position.Right} id="right-top-s" style={{ top: '25%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Right} id="right-top-t" style={{ top: '25%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Right} id="right-center-s" style={{ top: '50%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Right} id="right-center-t" style={{ top: '50%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Right} id="right-bottom-s" style={{ top: '75%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Right} id="right-bottom-t" style={{ top: '75%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      
      {/* Top side - source y target en cada posición */}
      <Handle type="source" position={Position.Top} id="top-left-s" style={{ left: '25%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Top} id="top-left-t" style={{ left: '25%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Top} id="top-center-s" style={{ left: '50%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Top} id="top-center-t" style={{ left: '50%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Top} id="top-right-s" style={{ left: '75%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Top} id="top-right-t" style={{ left: '75%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      
      {/* Bottom side - source y target en cada posición */}
      <Handle type="source" position={Position.Bottom} id="bottom-left-s" style={{ left: '25%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Bottom} id="bottom-left-t" style={{ left: '25%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-center-s" style={{ left: '50%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Bottom} id="bottom-center-t" style={{ left: '50%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-right-s" style={{ left: '75%' }} className="w-2 h-2 bg-blue-400 border-2 border-white" />
      <Handle type="target" position={Position.Bottom} id="bottom-right-t" style={{ left: '75%' }} className="w-2 h-2 bg-green-400 border-2 border-white opacity-0" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {renderIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {database.title}
              </h3>
              {/* Indicadores de estado de relación */}
              {isIsolated && (
                <Unlink className="w-4 h-4 text-orange-500" />
              )}
              {isStronglyConnected && (
                <Zap className="w-4 h-4 text-blue-500" />
              )}
              {cluster && cluster.centerDatabase === database.id && (
                <Users className="w-4 h-4 text-purple-500" />
              )}
            </div>
            {cluster && cluster.centerDatabase !== database.id && (
              <div className="text-xs text-gray-500">
                Part of {cluster.databases.length}-db cluster
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={handleClick}
            className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenLink}
            className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"
            title="Open in Notion"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {database.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {database.description}
        </p>
      )}

      {/* Properties Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>{Object.keys(database.properties).length} properties</span>
        {database.relations && database.relations.length > 0 && (
          <span>{database.relations.length} relations</span>
        )}
      </div>

      {/* Property Types */}
      <div className="flex flex-wrap gap-1">
        {uniqueTypes.slice(0, 4).map(type => (
          <span
            key={type}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
          >
            {type}
          </span>
        ))}
        {uniqueTypes.length > 4 && (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
            +{uniqueTypes.length - 4} more
          </span>
        )}
      </div>
    </div>
    </DatabaseTooltip>
  )
})

DatabaseNode.displayName = 'DatabaseNode'

export default DatabaseNode 