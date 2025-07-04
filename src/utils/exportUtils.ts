import { toPng, toJpeg, toSvg } from 'html-to-image'
import { ExportOptions } from '../components/ExportPanel'
import type { ReactFlowInstance } from 'reactflow'

// Helper function to add watermark to canvas
const addWatermarkToCanvas = (
  canvas: HTMLCanvasElement,
  options: ExportOptions
): HTMLCanvasElement => {
  if (!options.includeWatermark) return canvas

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Configure watermark styling
  const fontSize = Math.max(12, canvas.width / 80) // Responsive font size
  ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = `rgba(0, 0, 0, ${options.watermarkOpacity})`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // Calculate position
  const textMetrics = ctx.measureText(options.watermarkText)
  const textWidth = textMetrics.width
  const textHeight = fontSize

  let x = 20, y = 20

  switch (options.watermarkPosition) {
    case 'top-left':
      x = 20
      y = 20
      break
    case 'top-right':
      x = canvas.width - textWidth - 20
      y = 20
      break
    case 'bottom-left':
      x = 20
      y = canvas.height - textHeight - 20
      break
    case 'bottom-right':
      x = canvas.width - textWidth - 20
      y = canvas.height - textHeight - 20
      break
    case 'center':
      x = (canvas.width - textWidth) / 2
      y = (canvas.height - textHeight) / 2
      break
  }

  // Add semi-transparent background for better readability
  ctx.fillStyle = `rgba(255, 255, 255, ${options.watermarkOpacity * 0.8})`
  ctx.fillRect(x - 8, y - 4, textWidth + 16, textHeight + 8)

  // Add watermark text
  ctx.fillStyle = `rgba(0, 0, 0, ${options.watermarkOpacity})`
  ctx.fillText(options.watermarkText, x, y)

  return canvas
}

// Main export function - SIMPLIFIED
export const exportDiagram = async (
  reactFlowInstance: ReactFlowInstance,
  options: ExportOptions
): Promise<void> => {
  // Get the ReactFlow wrapper element
  const reactFlowWrapper = document.querySelector('.reactflow-wrapper') as HTMLElement
  if (!reactFlowWrapper) {
    throw new Error('ReactFlow wrapper not found')
  }

  const reactFlowElement = reactFlowWrapper.querySelector('.react-flow') as HTMLElement
  const targetElement = reactFlowElement || reactFlowWrapper
  
  try {
    console.log('🚀 Starting SIMPLE export with format:', options.format)

    // Store current viewport to restore later
    const currentTransform = reactFlowInstance.getViewport()
    
    // Check if we have nodes to export
    const nodes = reactFlowInstance.getNodes()
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    console.log('📊 Found', nodes.length, 'nodes to export')
    
    // Apply SIMPLE auto-framing using ReactFlow's built-in method
    reactFlowInstance.fitView({ 
      padding: 0.1,           // 10% padding - simple and effective
      includeHiddenNodes: false,
      maxZoom: 1.5,           // Reasonable max zoom
      minZoom: 0.1,           // Allow wide view if needed
      duration: 0             // No animation for export
    })

    // Wait for viewport to apply
    await new Promise(resolve => setTimeout(resolve, 200))

    // Fixed high-quality settings that work
    const exportConfig = {
      width: 2560,              // Fixed QHD width
      height: 1440,             // Fixed QHD height  
      backgroundColor: options.format === 'png' ? 'transparent' : '#ffffff',
      pixelRatio: 2,            // Good quality without being too heavy
      quality: 0.95,            // High quality
      useCORS: false,
      allowTaint: true,
      scale: 1,
      logging: false,
      filter: (node: Element) => {
        // Skip problematic external resources
        if (node.tagName === 'IMG') {
          const img = node as HTMLImageElement
          if (img.src && img.src.includes('amazonaws.com')) {
            return false
          }
        }
        if (node.tagName === 'LINK') {
          const link = node as HTMLLinkElement
          if (link.href && link.href.includes('googleapis.com')) {
            return false
          }
        }
        return true
      }
    }

    console.log('📸 Capturing with config:', {
      format: options.format,
      size: `${exportConfig.width}x${exportConfig.height}`,
      pixelRatio: exportConfig.pixelRatio,
      quality: exportConfig.quality
    })

    let dataUrl: string

    // Export based on format with consistent settings
    switch (options.format) {
      case 'png':
        dataUrl = await toPng(targetElement, exportConfig)
        break
      case 'jpg':
        dataUrl = await toJpeg(targetElement, {
          ...exportConfig,
          backgroundColor: '#ffffff' // JPG needs solid background
        })
        break
      case 'svg':
        dataUrl = await toSvg(targetElement, {
          ...exportConfig,
          backgroundColor: 'transparent'
        })
        break
      default:
        throw new Error(`Unsupported format: ${options.format}`)
    }

    console.log('✅ Export successful! Data URL length:', dataUrl.length)

    // Download the image
    downloadImage(dataUrl, options.filename, options.format)

    // Restore original viewport
    reactFlowInstance.setViewport(currentTransform)

  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  }
}

// Helper function to download the image
const downloadImage = (dataUrl: string, filename: string, format: string) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${filename}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export function with progress tracking
export const exportWithProgress = async (
  reactFlowInstance: ReactFlowInstance,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const steps = [
    { name: 'Preparing export...', progress: 10 },
    { name: 'Calculating dimensions...', progress: 20 },
    { name: 'Adjusting viewport...', progress: 40 },
    { name: 'Generating image...', progress: 70 },
    { name: 'Adding watermark...', progress: 90 },
    { name: 'Downloading...', progress: 100 }
  ]

  try {
    for (const step of steps) {
      onProgress?.(step.progress)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    await exportDiagram(reactFlowInstance, options)
  } catch (error) {
    throw error
  }
}

// Utility to validate export options
export const validateExportOptions = (options: ExportOptions): string[] => {
  const errors: string[] = []
  
  if (!options.filename.trim()) {
    errors.push('Filename is required')
  }
  
  if (options.resolution === 'custom') {
    if (!options.customWidth || options.customWidth < 100 || options.customWidth > 10000) {
      errors.push('Custom width must be between 100 and 10000 pixels')
    }
    if (!options.customHeight || options.customHeight < 100 || options.customHeight > 10000) {
      errors.push('Custom height must be between 100 and 10000 pixels')
    }
  }
  
  if (options.quality < 10 || options.quality > 100) {
    errors.push('Quality must be between 10 and 100')
  }
  
  if (options.pixelRatio < 1 || options.pixelRatio > 4) {
    errors.push('Pixel ratio must be between 1x and 4x')
  }
  
  if (options.padding < 5 || options.padding > 25) {
    errors.push('Padding must be between 5% and 25%')
  }
  
  if (options.includeWatermark && !options.watermarkText.trim()) {
    errors.push('Watermark text is required when watermark is enabled')
  }
  
  return errors
}
