import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Database, Link, Zap, Users, Calendar, Hash } from 'lucide-react'
import { NotionDatabase } from '../types/notion'

interface DatabaseTooltipProps {
  database: NotionDatabase
  relationCount: number
  isIsolated: boolean
  isStronglyConnected: boolean
  cluster?: any
  children: React.ReactNode
}

export const DatabaseTooltip: React.FC<DatabaseTooltipProps> = ({
  database,
  relationCount,
  isIsolated,
  isStronglyConnected,
  cluster,
  children
}) => {
  const propertyTypes = Object.values(database.properties).map(prop => prop.type)
  const uniqueTypes = [...new Set(propertyTypes)]
  const propertyCount = Object.keys(database.properties).length

  const getStatusInfo = () => {
    if (isIsolated) {
      return { icon: Database, text: 'Isolated database', color: 'text-orange-600 bg-orange-50' }
    }
    if (isStronglyConnected) {
      return { icon: Zap, text: 'Strongly connected', color: 'text-blue-600 bg-blue-50' }
    }
    if (cluster && cluster.centerDatabase === database.id) {
      return { icon: Users, text: 'Cluster center', color: 'text-purple-600 bg-purple-50' }
    }
    return { icon: Link, text: 'Connected', color: 'text-green-600 bg-green-50' }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl max-w-sm z-50 animate-in fade-in-0 zoom-in-95"
            sideOffset={8}
          >
            {/* Header */}
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0">
                {database.icon?.emoji ? (
                  <span className="text-2xl">{database.icon.emoji}</span>
                ) : database.icon?.file?.url || database.icon?.external?.url ? (
                  <img 
                    src={database.icon.file?.url || database.icon.external?.url} 
                    alt="" 
                    className="w-8 h-8 rounded"
                  />
                ) : (
                  <Database className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {database.title}
                </h3>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusInfo.text}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {database.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {database.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Properties</div>
                  <div className="font-medium">{propertyCount}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Relations</div>
                  <div className="font-medium">{relationCount}</div>
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Property types:</div>
              <div className="flex flex-wrap gap-1">
                {uniqueTypes.slice(0, 4).map(type => (
                  <span
                    key={type}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {type}
                  </span>
                ))}
                {uniqueTypes.length > 4 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{uniqueTypes.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Cluster info */}
            {cluster && cluster.centerDatabase !== database.id && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>Part of cluster with {cluster.databases.length} databases</span>
              </div>
            )}

            {/* Last modified */}
            {database.lastEditedTime && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <Calendar className="w-3 h-3" />
                <span>
                  Updated: {new Date(database.lastEditedTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
} 