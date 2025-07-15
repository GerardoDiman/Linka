import React, { useState, useRef, useEffect } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    // Posicionar muy cerca del nodo
    const tooltipWidth = 200 // Mucho más pequeño
    const tooltipHeight = 120 // Mucho más pequeño
    
    let adjustedX = x + 5 // Muy cerca del cursor
    let adjustedY = y - 10 // Justo arriba del cursor
    
    // Asegurar que no se salga de la pantalla
    if (adjustedX + tooltipWidth > window.innerWidth) {
      adjustedX = x - tooltipWidth - 5
    }
    
    if (adjustedY < 0) {
      adjustedY = y + 5
    }
    
    if (adjustedY + tooltipHeight > window.innerHeight) {
      adjustedY = window.innerHeight - tooltipHeight - 5
    }
    
    setPosition({ x: adjustedX, y: adjustedY })
    setIsOpen(true)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>
      
      {isOpen && (
        <div
          ref={tooltipRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-xl z-50 context-tooltip"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(0, 0)',
            width: '200px'
          }}
        >
                      {/* Header */}
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex-shrink-0">
                {database.icon?.emoji ? (
                  <span className="text-lg">{database.icon.emoji}</span>
                ) : database.icon?.file?.url || database.icon?.external?.url ? (
                  <img 
                    src={database.icon.file?.url || database.icon.external?.url} 
                    alt="" 
                    className="w-5 h-5 rounded"
                  />
                ) : (
                  <Database className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                  {database.title}
                </h3>
              </div>
            </div>

                      {/* Description */}
            {database.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                {database.description}
              </p>
            )}

                                  {/* Status */}
            <div className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} mb-1`}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusInfo.text}</span>
            </div>

            {/* Quick stats */}
            <div className="text-xs text-gray-500">
              {propertyCount} props • {relationCount} relations
            </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Close"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
} 