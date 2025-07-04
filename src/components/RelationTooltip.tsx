import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
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

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl max-w-xs z-50 animate-in fade-in-0 zoom-in-95"
            sideOffset={8}
          >
            {/* Header */}
            <div className="flex items-center space-x-2 mb-3">
              <RelationIcon className={`w-5 h-5 ${isReciprocal ? 'text-green-600' : 'text-blue-600'}`} />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
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

            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
} 