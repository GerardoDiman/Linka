import { toPng, toJpeg, toSvg } from 'html-to-image'
import type { ReactFlowInstance } from 'reactflow'

// Simple export options
export interface SimpleExportOptions {
  format: 'png' | 'svg' | 'jpg' | 'json' | 'mermaid'
  filename: string
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

// Helper function to download text files
const downloadTextFile = (content: string, filename: string, format: string) => {
  const mimeTypes = {
    'json': 'application/json',
    'mermaid': 'text/plain'
  }
  
  const blob = new Blob([content], { type: mimeTypes[format as keyof typeof mimeTypes] || 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL
  URL.revokeObjectURL(url)
}

// Helper function to generate JSON export
const generateJsonExport = (reactFlowInstance: ReactFlowInstance): string => {
  const nodes = reactFlowInstance.getNodes()
  const edges = reactFlowInstance.getEdges()

  console.log('📊 Generating JSON export...')
  console.log('📝 Nodes found:', nodes.length)
  console.log('🔗 Edges found:', edges.length)
  
  // Debug: log first node structure for JSON
  if (nodes.length > 0) {
    console.log('🔍 First node for JSON:', nodes[0])
    console.log('🔍 First node data for JSON:', nodes[0].data)
  }

  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      tool: 'LinkAv2.0 - Notion Database Visualizer',
      totalDatabases: nodes.length,
      totalRelations: edges.length
    },
    databases: nodes.map((node, index) => {
      // Try different data access patterns - check database object first
      const title = node.data?.database?.title || 
                    node.data?.title || 
                    node.data?.label || 
                    node.data?.name ||
                    (typeof node.data === 'string' ? node.data : '') ||
                    `Database ${index + 1}`
      
      const description = node.data?.database?.description || 
                          node.data?.description || 
                          node.data?.desc || 
                          ''
      
      const properties = node.data?.database?.properties || node.data?.properties || []
      const propertyCount = node.data?.database?.properties ? Object.keys(node.data.database.properties).length :
                           node.data?.propertyCount || 
                           node.data?.properties?.length || 
                           node.data?.propCount || 
                           0
      
      const relationsCount = node.data?.relationCount ||
                            node.data?.relationsCount || 
                            node.data?.relations?.length ||
                            0

      console.log(`📝 JSON Node ${index}: ${title} (${propertyCount} props, ${relationsCount} rels)`)

      return {
        id: node.id,
        title: title,
        description: description,
        position: {
          x: node.position.x,
          y: node.position.y
        },
        properties: properties,
        propertyCount: propertyCount,
        relationsCount: relationsCount,
        lastModified: node.data?.lastModified || null,
        cluster: node.data?.cluster || null,
        isIsolated: node.data?.isIsolated || false
      }
    }),
    relationships: edges.map((edge, index) => {
      console.log(`🔗 JSON Edge ${index}: ${edge.source} -> ${edge.target}`)
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceDatabase: edge.data?.sourceDb || 'Unknown',
        targetDatabase: edge.data?.targetDb || 'Unknown',
        strength: edge.data?.strength || 1,
        relationType: edge.data?.relationType || 'unknown',
        isReciprocal: edge.data?.isReciprocal || false,
        isStrong: edge.data?.isStrong || false
      }
    }),
    statistics: {
      strongConnections: edges.filter(e => e.data?.isStrong).length,
      reciprocalConnections: edges.filter(e => e.data?.isReciprocal).length,
      isolatedDatabases: nodes.filter(n => n.data?.isIsolated).length,
      averageConnectionStrength: edges.length > 0 
        ? (edges.reduce((sum, e) => sum + (e.data?.strength || 1), 0) / edges.length).toFixed(2)
        : 0
    }
  }

  console.log('✅ JSON generation complete')
  return JSON.stringify(exportData, null, 2)
}

// Helper function to generate Mermaid export
const generateMermaidExport = (reactFlowInstance: ReactFlowInstance): string => {
  const nodes = reactFlowInstance.getNodes()
  const edges = reactFlowInstance.getEdges()

  console.log('🌊 Generating Mermaid export...')
  console.log('📊 Nodes found:', nodes.length)
  console.log('🔗 Edges found:', edges.length)
  
  // Debug: log first node structure
  if (nodes.length > 0) {
    console.log('🔍 First node structure:', nodes[0])
    console.log('🔍 First node data:', nodes[0].data)
  }

  let mermaid = 'flowchart TD\n'
  mermaid += '    %% LinkAv2.0 - Notion Database Visualizer Export\n'
  mermaid += `    %% Generated: ${new Date().toISOString()}\n\n`

  // Add nodes
  nodes.forEach((node, index) => {
    // Try different data access patterns - check database object first
    const title = node.data?.database?.title || 
                  node.data?.title || 
                  node.data?.label || 
                  node.data?.name ||
                  (typeof node.data === 'string' ? node.data : '') ||
                  `Database ${index + 1}`
    
    const propCount = node.data?.database?.properties ? Object.keys(node.data.database.properties).length :
                      node.data?.propertyCount || 
                      node.data?.properties?.length || 
                      node.data?.propCount || 
                      0
    
    const relCount = node.data?.relationCount ||
                     node.data?.relationsCount || 
                     node.data?.relations?.length ||
                     0
    
    console.log(`📝 Node ${index}: ${title} (${propCount} props, ${relCount} rels)`)
    
    // Clean the title for Mermaid syntax
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, ' ').trim()
    const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '')
    
    // Different node styles based on properties
    if (node.data?.isIsolated) {
      mermaid += `    ${nodeId}["🔒 ${cleanTitle}<br/>Props: ${propCount}"]:::isolated\n`
    } else if (node.data?.isStrong || relCount > 5) {
      mermaid += `    ${nodeId}["⭐ ${cleanTitle}<br/>Props: ${propCount} | Rels: ${relCount}"]:::strong\n`
    } else {
      mermaid += `    ${nodeId}["📊 ${cleanTitle}<br/>Props: ${propCount} | Rels: ${relCount}"]:::normal\n`
    }
  })

  mermaid += '\n'

  // Add edges
  edges.forEach((edge, index) => {
    const sourceId = edge.source.replace(/[^a-zA-Z0-9]/g, '')
    const targetId = edge.target.replace(/[^a-zA-Z0-9]/g, '')
    const strength = edge.data?.strength || 1
    const isReciprocal = edge.data?.isReciprocal || false
    const isStrong = edge.data?.isStrong || false

    console.log(`🔗 Edge ${index}: ${sourceId} -> ${targetId} (strength: ${strength}, reciprocal: ${isReciprocal}, strong: ${isStrong})`)

    // Different arrow types based on relationship properties
    if (isStrong) {
      mermaid += `    ${sourceId} ===> ${targetId}\n`
    } else if (isReciprocal) {
      mermaid += `    ${sourceId} <--> ${targetId}\n`
    } else if (strength > 5) {
      mermaid += `    ${sourceId} --> ${targetId}\n`
    } else {
      mermaid += `    ${sourceId} -.-> ${targetId}\n`
    }
  })

  // Add styling
  mermaid += '\n'
  mermaid += '    %% Node Styling\n'
  mermaid += '    classDef normal fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#000\n'
  mermaid += '    classDef strong fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000\n'
  mermaid += '    classDef isolated fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000\n'

  console.log('✅ Mermaid generation complete')
  return mermaid
}

// Simple, reliable export function
export const exportDiagramSimple = async (
  reactFlowInstance: ReactFlowInstance,
  options: SimpleExportOptions
): Promise<void> => {
  // Store current viewport to restore later (outside try-catch for access in catch)
  let currentViewport = reactFlowInstance.getViewport()
  
  try {
    console.log('🚀 Simple export starting:', options.format)
    
    // Handle text-based exports (JSON and Mermaid) without viewport manipulation
    if (options.format === 'json' || options.format === 'mermaid') {
      console.log('📝 Generating text-based export:', options.format)
      
      let content: string
      
      if (options.format === 'json') {
        content = generateJsonExport(reactFlowInstance)
        console.log('📊 Generated JSON export')
      } else {
        content = generateMermaidExport(reactFlowInstance)
        console.log('🌊 Generated Mermaid export')
      }
      
      downloadTextFile(content, options.filename, options.format)
      console.log('✅ Text export successful!')
      return
    }
    
    // Rest of the function handles image exports (PNG, JPG, SVG)
    const reactFlowWrapper = document.querySelector('.reactflow-wrapper') as HTMLElement
    if (!reactFlowWrapper) {
      throw new Error('ReactFlow wrapper not found')
    }

    const reactFlowElement = reactFlowWrapper.querySelector('.react-flow') as HTMLElement
    const targetElement = reactFlowElement || reactFlowWrapper
    
    // Check nodes for image exports
    const nodes = reactFlowInstance.getNodes()
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    console.log('📊 Exporting', nodes.length, 'nodes as image')
    
    // Log initial viewport
    console.log('🔍 Initial viewport:', currentViewport)
    
    // Store current viewport
    const currentTransform = reactFlowInstance.getViewport()
    
    // ULTRA-PRECISE framing - almost zero padding
    reactFlowInstance.fitView({ 
      padding: 0.005,  // Reduced to 0.5% padding - ultra-tight
      includeHiddenNodes: false,
      duration: 0,     // No animation
      minZoom: 0.05,   // Allow very zoomed out view if needed
      maxZoom: 3.0     // Higher max zoom for tighter framing
    })

    // Wait for initial framing
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const viewport1 = reactFlowInstance.getViewport()
    console.log('🎯 After first fitView (0.5% padding):', viewport1)
    
    // ULTRA-TIGHT second pass - almost no padding at all
    reactFlowInstance.fitView({ 
      padding: 0.001,  // Just 0.1% padding - virtually zero
      includeHiddenNodes: false,
      duration: 0
    })
    
    // Third pass for absolute precision
    await new Promise(resolve => setTimeout(resolve, 200))
    const viewport2 = reactFlowInstance.getViewport()
    console.log('🎯 After second fitView (0.1% padding):', viewport2)
    
    reactFlowInstance.fitView({ 
      padding: 0,      // ZERO padding - absolute tight fit
      includeHiddenNodes: false,
      duration: 0
    })
    
    // Final wait to ensure perfect framing
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const finalViewport = reactFlowInstance.getViewport()
    console.log('🎯 Final viewport (ZERO padding):', finalViewport)
    console.log('🔥 Total zoom change:', finalViewport.zoom / currentViewport.zoom)

    // Calculate content bounds to determine optimal export size
    const visibleNodes = reactFlowInstance.getNodes().filter(node => !node.hidden)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    visibleNodes.forEach(node => {
      const nodeLeft = node.position.x
      const nodeTop = node.position.y
      const nodeWidth = node.width || 300
      const nodeHeight = node.height || 200
      
      minX = Math.min(minX, nodeLeft)
      minY = Math.min(minY, nodeTop)
      maxX = Math.max(maxX, nodeLeft + nodeWidth)
      maxY = Math.max(maxY, nodeTop + nodeHeight)
    })

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const contentCenterX = minX + contentWidth / 2
    const contentCenterY = minY + contentHeight / 2
    const contentAspectRatio = contentWidth / contentHeight

    console.log('📏 Content bounds:', { minX, minY, maxX, maxY })
    console.log('📐 Content size:', { width: contentWidth, height: contentHeight, aspectRatio: contentAspectRatio })

    // ADAPTIVE resolution based on content aspect ratio
    let exportWidth, exportHeight
    
    if (contentAspectRatio > 1.5) {
      // Wide content - use landscape orientation
      exportWidth = 1920
      exportHeight = Math.round(1920 / contentAspectRatio)
    } else if (contentAspectRatio < 0.75) {
      // Tall content - use portrait orientation  
      exportHeight = 1920
      exportWidth = Math.round(1920 * contentAspectRatio)
    } else {
      // Square-ish content - use balanced dimensions
      exportWidth = 1600
      exportHeight = 1200
    }

    // Ensure minimum dimensions for readability
    exportWidth = Math.max(exportWidth, 1200)
    exportHeight = Math.max(exportHeight, 900)

    console.log('🖼️ Adaptive export dimensions:', { width: exportWidth, height: exportHeight })

    // CALCULATE PERFECT ZOOM to fit 100% of content in export dimensions
    const scaleX = exportWidth / contentWidth
    const scaleY = exportHeight / contentHeight
    const perfectZoom = Math.min(scaleX, scaleY) * 0.95  // 95% to leave tiny margin

    // APPLY PERFECT ZOOM for 100% content fit
    const perfectViewport = {
      x: exportWidth / 2 - contentCenterX * perfectZoom,
      y: exportHeight / 2 - contentCenterY * perfectZoom,
      zoom: perfectZoom
    }
    
    reactFlowInstance.setViewport(perfectViewport)
    console.log('🎯 PERFECT viewport for 100% content fit:', perfectViewport)
    console.log('📊 Scale calculations:', { scaleX, scaleY, chosenScale: Math.min(scaleX, scaleY) })
    
    // Wait for perfect viewport to apply
    await new Promise(resolve => setTimeout(resolve, 300))

    // HIDE UI ELEMENTS (minimap, controls, background grid) during export
    const minimap = document.querySelector('.react-flow__minimap') as HTMLElement
    const controls = document.querySelector('.react-flow__controls') as HTMLElement
    const attribution = document.querySelector('.react-flow__attribution') as HTMLElement
    const background = document.querySelector('.react-flow__background') as HTMLElement
    
    const originalMinimapDisplay = minimap?.style.display || ''
    const originalControlsDisplay = controls?.style.display || ''
    const originalAttributionDisplay = attribution?.style.display || ''
    const originalBackgroundDisplay = background?.style.display || ''
    
    if (minimap) {
      minimap.style.display = 'none'
      console.log('🙈 Hidden minimap for export')
    }
    if (controls) {
      controls.style.display = 'none'
      console.log('🙈 Hidden controls for export')
    }
    if (attribution) {
      attribution.style.display = 'none'
      console.log('🙈 Hidden attribution for export')
    }
    if (background) {
      background.style.display = 'none'
      console.log('🙈 Hidden background grid for export')
    }
    
    // Wait for UI elements to be hidden
    await new Promise(resolve => setTimeout(resolve, 100))

    // ADAPTIVE export settings - optimized for content visibility
    const exportConfig = {
      width: exportWidth,   // Adaptive width based on content
      height: exportHeight, // Adaptive height based on content
      backgroundColor: options.format === 'png' ? 'transparent' : '#ffffff',
      pixelRatio: 2.5,      // Higher pixel ratio for crisp quality
      quality: 0.95,        // Maximum quality
      useCORS: false,
      allowTaint: true,
      filter: (node: Element) => {
        // Skip external images that cause problems
        if (node.tagName === 'IMG') {
          const img = node as HTMLImageElement
          if (img.src && (img.src.includes('amazonaws.com') || img.src.includes('googleapi'))) {
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

    console.log('📸 Capturing...', exportConfig)

    let dataUrl: string

    // Export with simple, working methods
    if (options.format === 'png') {
      dataUrl = await toPng(targetElement, exportConfig)
    } else if (options.format === 'jpg') {
      dataUrl = await toJpeg(targetElement, exportConfig)
    } else {
      dataUrl = await toSvg(targetElement, exportConfig)
    }

    console.log('✅ Export successful!')

    // Download
    downloadImage(dataUrl, options.filename, options.format)

    // Restore viewport
    reactFlowInstance.setViewport(currentTransform)

    // Restore UI elements
    if (minimap) {
      minimap.style.display = originalMinimapDisplay
    }
    if (controls) {
      controls.style.display = originalControlsDisplay
    }
    if (attribution) {
      attribution.style.display = originalAttributionDisplay
    }
    if (background) {
      background.style.display = originalBackgroundDisplay
    }

  } catch (error) {
    console.error('❌ Simple export failed:', error)
    
    // Restore UI elements even on error
    const minimap = document.querySelector('.react-flow__minimap') as HTMLElement
    const controls = document.querySelector('.react-flow__controls') as HTMLElement
    const attribution = document.querySelector('.react-flow__attribution') as HTMLElement
    const background = document.querySelector('.react-flow__background') as HTMLElement
    
    if (minimap) {
      minimap.style.display = ''
    }
    if (controls) {
      controls.style.display = ''
    }
    if (attribution) {
      attribution.style.display = ''
    }
    if (background) {
      background.style.display = ''
    }
    
    // Restore viewport even on error
    try {
      if (reactFlowInstance) {
        reactFlowInstance.setViewport(currentViewport)
      }
    } catch (viewportError) {
      console.warn('Could not restore viewport:', viewportError)
    }
    
    throw error
  }
}

// Validation
export const validateSimpleExportOptions = (options: SimpleExportOptions): string[] => {
  const errors: string[] = []
  
  if (!options.filename.trim()) {
    errors.push('Filename is required')
  }
  
  return errors
} 