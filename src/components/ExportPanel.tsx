import React, { useState } from 'react'
import { Download, X, Image, FileText, Settings, Palette, Zap, Check, Code, Workflow } from 'lucide-react'
import { clsx } from 'clsx'

interface ExportPanelProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
  isExporting: boolean
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'jpg' | 'json' | 'mermaid'
  filename: string
}

const BACKGROUND_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Transparent', value: 'transparent' }
]

export default function ExportPanel({ isOpen, onClose, onExport, isExporting }: ExportPanelProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    filename: 'notion-database-diagram'
  })

  const handleExport = () => {
    onExport(options)
  }

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Export Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            
            {/* Image Formats */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2 font-medium">Image Formats</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'png', label: 'PNG', icon: Image, desc: 'High quality with transparency' },
                  { value: 'jpg', label: 'JPG', icon: Image, desc: 'Smaller file size' },
                  { value: 'svg', label: 'SVG', icon: Image, desc: 'Vector format, scalable' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => updateOptions({ format: format.value as any })}
                    className={clsx(
                      'p-3 rounded-lg border-2 transition-all text-left',
                      options.format === format.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <format.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{format.label}</span>
                      {options.format === format.value && (
                        <Check className="w-3 h-3 text-primary-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{format.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Formats */}
            <div>
              <div className="text-xs text-gray-500 mb-2 font-medium">Data Formats</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'json', label: 'JSON', icon: Code, desc: 'Structured data export' },
                  { value: 'mermaid', label: 'Mermaid', icon: Workflow, desc: 'Diagram as code' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => updateOptions({ format: format.value as any })}
                    className={clsx(
                      'p-3 rounded-lg border-2 transition-all text-left',
                      options.format === format.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <format.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{format.label}</span>
                      {options.format === format.value && (
                        <Check className="w-3 h-3 text-primary-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{format.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filename</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={options.filename}
                onChange={(e) => updateOptions({ filename: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">.{options.format}</span>
            </div>
          </div>

          {/* Simple Info */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Multi-Format Export</span>
            </div>
            <div className="text-sm text-green-600 space-y-1">
              {options.format === 'json' && (
                <>
                  <p>• <span className="font-medium">Structured Data:</span> Complete database and relationship information</p>
                  <p>• <span className="font-medium">JSON Format:</span> Compatible with APIs, databases, and analysis tools</p>
                  <p>• <span className="font-medium">Includes:</span> Metadata, statistics, positions, and properties</p>
                </>
              )}
              {options.format === 'mermaid' && (
                <>
                  <p>• <span className="font-medium">Diagram as Code:</span> Mermaid flowchart syntax</p>
                  <p>• <span className="font-medium">GitHub Ready:</span> Renders in README files and documentation</p>
                  <p>• <span className="font-medium">Visual Styles:</span> Different node types and connection styles</p>
                </>
              )}
              {(options.format === 'png' || options.format === 'jpg' || options.format === 'svg') && (
                <>
                  <p>• <span className="font-medium">100% Fit:</span> Mathematical calculation for perfect content fit</p>
                  <p>• <span className="font-medium">Pure Diagram:</span> No grid, minimap, controls, or UI elements</p>
                  <p>• <span className="font-medium">Adaptive Size:</span> Auto-calculates optimal dimensions</p>
                  <p>• <span className="font-medium">High Quality:</span> 2.5x pixel ratio, 95% quality</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !options.filename.trim()}
            className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Diagram</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 