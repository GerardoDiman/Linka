import React from 'react'
import { Loader2, Database, Zap } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'pulse' | 'dots' | 'database'
  message?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600 dark:text-primary-400`} />
        )
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse`} />
        )
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        )
      
      case 'database':
        return (
          <div className="relative">
            <Database className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
            <Zap className={`${sizeClasses[size]} absolute inset-0 text-primary-600 dark:text-primary-400 animate-pulse`} />
          </div>
        )
      
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600 dark:text-primary-400`} />
        )
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderSpinner()}
      {message && (
        <p className={`${textSizes[size]} text-gray-600 dark:text-gray-400 text-center animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )
}

// Componente de página completa para estados de carga
export const FullPageLoader: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
    <div className="text-center">
      <LoadingSpinner size="xl" variant="database" message={message} />
    </div>
  </div>
)

// Componente de skeleton para listas
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Componente de skeleton para tarjetas
export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
      <div className="flex-1">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
    </div>
    <div className="flex flex-wrap gap-1 mt-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
      ))}
    </div>
  </div>
) 