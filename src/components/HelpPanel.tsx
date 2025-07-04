import React, { useState } from 'react'
import { HelpCircle, X, ChevronUp, ChevronDown } from 'lucide-react'

interface HelpPanelProps {
  className?: string
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Recordar estado expandido del panel
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('helpPanel-expanded')
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })
  
  const [isVisible, setIsVisible] = useState(() => {
    // Recordar visibilidad del panel
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('helpPanel-visible')
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })

  // Funciones para manejar cambios de estado con persistencia
  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    if (typeof window !== 'undefined') {
      localStorage.setItem('helpPanel-expanded', JSON.stringify(newExpanded))
    }
  }

  const handleToggleVisible = (visible: boolean) => {
    setIsVisible(visible)
    if (typeof window !== 'undefined') {
      localStorage.setItem('helpPanel-visible', JSON.stringify(visible))
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => handleToggleVisible(true)}
        className="absolute bottom-4 left-4 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-50"
        title="Mostrar ayuda"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className={`absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all z-40 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleToggleExpanded}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Feature Guide</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={() => handleToggleVisible(false)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          title="Ocultar ayuda"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content with smooth animation */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1 max-w-sm">
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">🚀 Smart Features:</div>
          <div>• <span className="text-blue-600 dark:text-blue-400">Blue lines</span>: Strong relationships</div>
          <div>• <span className="text-green-600 dark:text-green-400">Green lines</span>: Bidirectional links</div>
          <div>• <span className="text-gray-500 dark:text-gray-400">Dashed lines</span>: One-way relations</div>
          <div>• Nodes auto-cluster by connections</div>
          <div>• Central nodes have most relationships</div>
          <div>• ✨ <span className="text-purple-600 dark:text-purple-400">Isolated DBs hidden</span> for clarity</div>
          
          <div className="font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">🎮 Controls:</div>
          <div>• Click nodes to select databases</div>
          <div>• Toggle isolated DBs with "Mostrar" button</div>
          <div>• Drag to rearrange layout</div>
          <div>• Mouse wheel to zoom in/out (0.05x to 3x)</div>
          <div>• 24 hybrid connection points per node for optimal routing</div>
          
          <div className="font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">✨ New Features:</div>
          <div>• <span className="text-primary-600 dark:text-primary-400">🌙 Dark Mode</span>: Toggle in top-right</div>
          <div>• <span className="text-primary-600 dark:text-primary-400">🔍 Advanced Filters</span>: In sidebar</div>
          <div>• <span className="text-primary-600 dark:text-primary-400">📊 Export Options</span>: JSON & Mermaid</div>
          
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="text-gray-400 dark:text-gray-500 text-center text-xs">
              💡 <em>Integrated panel in the workspace</em><br/>
              <span className="text-xs">Remembers your preferences automatically</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 