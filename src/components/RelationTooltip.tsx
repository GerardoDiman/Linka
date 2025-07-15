import React, { useState, useRef, useEffect } from 'react'
import { ArrowRight, ArrowLeftRight, Zap, Link2, TrendingUp } from 'lucide-react'

interface RelationTooltipProps {
  sourceDb: string
  targetDb: string
  sourceProperty: string
  targetProperty?: string
  strength: number
  relationType: string
  isReciprocal: boolean
  isStrong: boolean
  children: React.ReactNode
}

export const RelationTooltip: React.FC<RelationTooltipProps> = ({
  sourceDb,
  targetDb,
  sourceProperty,
  targetProperty,
  strength,
  relationType,
  isReciprocal,
  isStrong,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const getRelationIcon = () => {
    if (isReciprocal) {
      return ArrowLeftRight
    }
    return ArrowRight
  }

  const getStrengthColor = () => {
    if (strength >= 8) return 'text-green-600 bg-green-50'
    if (strength >= 6) return 'text-blue-600 bg-blue-50'
    if (strength >= 4) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getStrengthLabel = () => {
    if (strength >= 8) return 'Muy fuerte'
    if (strength >= 6) return 'Fuerte'
    if (strength >= 4) return 'Moderada'
    return 'Débil'
  }

  const RelationIcon = getRelationIcon()

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const x = e.clientX
    const y = e.clientY
    
    // Ajustar posición para que el tooltip aparezca más cerca del nodo
    const tooltipWidth = 260 // Reducido de 280
    const tooltipHeight = 280 // Reducido de 300
    
    let adjustedX = x + 10 // Aparecer 10px a la derecha del cursor
    let adjustedY = y - 50 // Aparecer 50px arriba del cursor
    
    // Asegurar que no se salga de la pantalla
    if (adjustedX + tooltipWidth > window.innerWidth) {
      adjustedX = x - tooltipWidth - 10 // Aparecer a la izquierda
    }
    
    if (adjustedY < 0) {
      adjustedY = y + 10 // Aparecer abajo si no hay espacio arriba
    }
    
    if (adjustedY + tooltipHeight > window.innerHeight) {
      adjustedY = window.innerHeight - tooltipHeight - 10
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
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-xl max-w-xs z-50 context-tooltip"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(0, 0)'
          }}
        >
          {/* Header */}
          <div className="flex items-center space-x-2 mb-3">
            <RelationIcon className={`w-5 h-5 ${isReciprocal ? 'text-green-600' : 'text-blue-600'}`} />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {isReciprocal ? 'Bidirectional Relationship' : 'Unidirectional Relationship'}
              </div>
              <div className="text-xs text-gray-500">
                {relationType}
              </div>
            </div>
          </div>

          {/* Connection Flow */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-700 truncate">{sourceDb}</span>
              <RelationIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700 truncate">{targetDb}</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <span className="font-medium">{sourceProperty}</span>
              {targetProperty && (
                <>
                  <span className="mx-1">↔</span>
                  <span className="font-medium">{targetProperty}</span>
                </>
              )}
            </div>
          </div>

          {/* Strength */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Fuerza:</span>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor()}`}>
              <span>{strength}/10</span>
              <span>·</span>
              <span>{getStrengthLabel()}</span>
            </div>
          </div>

          {/* Connection Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Link2 className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Tipo:</span>
              <span className="font-medium">{relationType}</span>
            </div>
            {isStrong && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className="text-blue-600 font-medium">Strong connection</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            {isReciprocal ? (
              <span>Databases reference each other mutually, creating a bidirectional relationship.</span>
            ) : (
              <span>One database references the other unidirectionally.</span>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
} 