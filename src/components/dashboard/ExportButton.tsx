import { Download, Image as ImageIcon, Palette, Code, Copy, Check } from "lucide-react"
import { toBlob } from "html-to-image"
import download from "downloadjs"
import { Tooltip } from "../ui/Tooltip"
import logger from "../../lib/logger"
import { useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useReactFlow, getNodesBounds } from "reactflow"
import { useToast } from "../../context/ToastContext"
import { useTranslation } from "react-i18next"

type ExportBg = 'transparent' | 'black' | 'white' | 'dark'
type ExportQuality = 'standard' | 'high' | 'ultra'
type ExportType = 'image' | 'mermaid'

export function ExportButton() {
    const { getNodes, getEdges } = useReactFlow()
    const { t } = useTranslation()
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [exportProgress, setExportProgress] = useState('')
    const [selectedBg, setSelectedBg] = useState<ExportBg>('white')
    const [selectedQuality, setSelectedQuality] = useState<ExportQuality>('high')
    const [exportType, setExportType] = useState<ExportType>('image')
    const [mermaidCopied, setMermaidCopied] = useState(false)

    const bgOptions: { id: ExportBg, label: string, color?: string }[] = [
        { id: 'transparent', label: t('dashboard.export.transparent') },
        { id: 'white', label: t('dashboard.export.white'), color: '#ffffff' },
        { id: 'dark', label: t('dashboard.export.dark'), color: '#0f172a' },
        { id: 'black', label: t('dashboard.export.black'), color: '#000000' },
    ]

    const qualityOptions: { id: ExportQuality, label: string, desc: string }[] = [
        { id: 'standard', label: t('dashboard.export.standard'), desc: '1x' },
        { id: 'high', label: t('dashboard.export.high'), desc: '2x' },
        { id: 'ultra', label: t('dashboard.export.ultra'), desc: '4x' },
    ]

    const getBgColor = (bg: ExportBg) => {
        if (bg === 'transparent') return undefined
        if (bg === 'white') return '#ffffff'
        if (bg === 'dark') return '#0f172a'
        if (bg === 'black') return '#000000'
        return '#ffffff'
    }

    const getPixelRatio = (quality: ExportQuality) => {
        if (quality === 'ultra') return 4
        if (quality === 'high') return 2
        return 1
    }

    const handleExport = async () => {
        const nodes = getNodes()
        if (nodes.length === 0) return

        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement
        if (!viewport) return

        const quality = selectedQuality
        setIsExporting(true)
        setExportProgress(t('dashboard.export.preparing'))

        try {
            // Wait for any animations to finish
            await new Promise(resolve => setTimeout(resolve, 500))

            setExportProgress(t('dashboard.export.calculating'))
            await new Promise(resolve => setTimeout(resolve, 200))

            // 1. Calculate the bounding box of the actual graph content
            const bounds = getNodesBounds(nodes)
            const padding = 100

            // 2. Dimensions from bounds
            const contentWidth = bounds.width + padding * 2
            const contentHeight = bounds.height + padding * 2

            const configWidth = contentWidth
            const configHeight = contentHeight

            // 3. Get quality settings
            let pixelRatio = getPixelRatio(quality)

            // Reduce quality for very large graphs
            if (contentWidth * contentHeight > 25000000 && pixelRatio > 2) {
                pixelRatio = 2
                logger.warn('⚠️ Gráfico muy grande, reduciendo calidad a High')
            }

            const bgColor = getBgColor(selectedBg)

            const options: Record<string, unknown> = {
                backgroundColor: bgColor,
                width: configWidth,
                height: configHeight,
                pixelRatio,
                style: {
                    width: `${configWidth}px`,
                    height: `${configHeight}px`,
                    background: bgColor || 'transparent',
                    transform: `translate(${-bounds.x + padding}px, ${-bounds.y + padding}px)`,
                },
                skipFonts: true,
                cacheBust: true,
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                filter: (node: HTMLElement) => {
                    const cls = node.className || ""
                    if (typeof cls === 'string') {
                        return !cls.includes('react-flow__panel') &&
                            !cls.includes('react-flow__controls') &&
                            !cls.includes('react-flow__attribution') &&
                            !cls.includes('react-flow__minimap')
                    }
                    return true
                },
                // Replace external images to avoid CORS errors
                onClone: (clonedDoc: Document) => {
                    const images = clonedDoc.getElementsByTagName('img');
                    for (let i = 0; i < images.length; i++) {
                        const img = images[i];
                        const src = img.src;
                        if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
                            const url = new URL(src);
                            if (url.origin !== window.location.origin) {
                                // Replace with transparent pixel
                                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            }
                        }
                    }
                }
            }

            setExportProgress(t('dashboard.export.capturing'))
            const blob = await toBlob(viewport, options)

            setExportProgress(t('dashboard.export.downloading'))
            if (blob) {
                const qualityLabel = quality === 'ultra' ? 'ultra' : quality === 'high' ? 'hq' : 'std'
                download(blob, `linka-graph-${qualityLabel}-${new Date().getTime()}.png`, "image/png")
            } else {
                throw new Error('PNG export failed')
            }
        } catch (err) {
            logger.error('❌ Error en exportación:', err)

            // Ultra-safe fallback: Capture visible area only
            try {
                const element = document.querySelector('.react-flow') as HTMLElement
                const fallbackOptions = {
                    backgroundColor: getBgColor(selectedBg),
                    pixelRatio: 1,
                    filter: (node: HTMLElement) => {
                        const cls = node.className || ""
                        return typeof cls === "string" && !cls.includes('react-flow__panel')
                    }
                }
                const blob = await toBlob(element, fallbackOptions)
                if (blob) {
                    download(blob, `linka-graph-basic-${new Date().getTime()}.png`)
                    toast.info(t('dashboard.export.fallbackInfo'))
                }
            } catch {
                toast.error(t('dashboard.export.criticalError'))
            }
        } finally {
            setIsExporting(false)
            setIsOpen(false)
        }
    }

    // Generate Mermaid flowchart code from nodes and edges
    const generateMermaid = (): string => {
        const nodes = getNodes()
        const edges = getEdges()

        // Create maps for node data
        const nodeLabels = new Map<string, string>()
        const nodeColors = new Map<string, string>()
        const colorClasses = new Map<string, string>()
        let colorIndex = 0

        nodes.forEach(node => {
            const title = node.data?.title || node.data?.label || node.id
            // Sanitize title for Mermaid (remove special chars, truncate)
            const sanitized = title.replace(/["[\](){}|<>]/g, '').substring(0, 40)
            nodeLabels.set(node.id, sanitized)

            // Get node color (from custom colors or default)
            const color = node.data?.color || '#6366f1'
            if (!colorClasses.has(color)) {
                colorClasses.set(color, `style${colorIndex++}`)
            }
            nodeColors.set(node.id, color)
        })

        let mermaid = 'flowchart LR\n\n'

        // Add style definitions first
        mermaid += '    %% Styles\n'
        colorClasses.forEach((className, color) => {
            // Create contrasting text color (white for dark colors, dark for light)
            const r = parseInt(color.slice(1, 3), 16)
            const g = parseInt(color.slice(3, 5), 16)
            const b = parseInt(color.slice(5, 7), 16)
            const brightness = (r * 299 + g * 587 + b * 114) / 1000
            const textColor = brightness > 128 ? '#1e293b' : '#ffffff'

            mermaid += `    classDef ${className} fill:${color},stroke:${color},color:${textColor}\n`
        })

        mermaid += '\n    %% Nodes\n'

        // Add node definitions with labels
        nodes.forEach(node => {
            if (!node.hidden) {
                const label = nodeLabels.get(node.id) || node.id
                const id = node.id.replace(/[^a-zA-Z0-9]/g, '_')
                const color = nodeColors.get(node.id) || '#6366f1'
                const className = colorClasses.get(color) || 'style0'
                mermaid += `    ${id}["${label}"]:::${className}\n`
            }
        })

        mermaid += '\n    %% Relationships\n'

        // Add edges
        edges.forEach(edge => {
            if (!edge.hidden) {
                const sourceId = edge.source.replace(/[^a-zA-Z0-9]/g, '_')
                const targetId = edge.target.replace(/[^a-zA-Z0-9]/g, '_')
                mermaid += `    ${sourceId} --> ${targetId}\n`
            }
        })

        return mermaid
    }

    const handleCopyMermaid = async () => {
        const mermaid = generateMermaid()
        await navigator.clipboard.writeText(mermaid)
        setMermaidCopied(true)
        toast.success(t('dashboard.export.mermaidCopied'))
        setTimeout(() => setMermaidCopied(false), 2000)
    }

    const handleDownloadMermaid = () => {
        const mermaid = generateMermaid()
        const blob = new Blob([mermaid], { type: 'text/plain' })
        download(blob, `linka-graph-${new Date().getTime()}.mmd`)
        toast.success(t('dashboard.export.mermaidDownloaded'))
    }


    return (
        <>
            <div className="relative">
                <Tooltip content={t('dashboard.export.tooltip')} position="right">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isExporting}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center border-0 bg-transparent outline-none disabled:opacity-50"
                    >
                        <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
                    </button>
                </Tooltip>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 10 }}
                            className="absolute left-full ml-2 bottom-0 flex flex-col gap-2 p-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-xl shadow-xl z-50 min-w-[180px]"
                        >
                            {/* Export Type Tabs */}
                            <div className="flex gap-1 p-0.5 bg-gray-100 dark:bg-slate-700 rounded-lg">
                                <button
                                    onClick={() => setExportType('image')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all
                                        ${exportType === 'image' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                                >
                                    <ImageIcon size={12} />
                                    {t('dashboard.export.image')}
                                </button>
                                <button
                                    onClick={() => setExportType('mermaid')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all
                                        ${exportType === 'mermaid' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                                >
                                    <Code size={12} />
                                    Mermaid
                                </button>
                            </div>

                            {exportType === 'image' ? (
                                <>
                                    <div className="flex flex-col gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-700">
                                        <span className="text-[9px] font-black uppercase text-gray-400 dark:text-slate-500 px-2 tracking-wider">{t('dashboard.export.background')}</span>
                                        <div className="flex items-center gap-1.5 px-1.5">
                                            {bgOptions.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedBg(opt.id)}
                                                    className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden
                                                ${selectedBg === opt.id ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-gray-100 dark:border-slate-700 hover:scale-105'}
                                            `}
                                                    style={{ backgroundColor: opt.color || 'transparent' }}
                                                    title={opt.label}
                                                >
                                                    {opt.id === 'transparent' && <Palette size={10} className="text-gray-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-700">
                                        <span className="text-[9px] font-black uppercase text-gray-400 dark:text-slate-500 px-2 tracking-wider">{t('dashboard.export.quality')}</span>
                                        <div className="flex flex-col gap-1 px-1.5">
                                            {qualityOptions.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedQuality(opt.id)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-between
                                                ${selectedQuality === opt.id
                                                            ? 'bg-primary text-white'
                                                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}
                                            `}
                                                >
                                                    <span>{opt.label}</span>
                                                    <span className="text-[9px] opacity-70">{opt.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-sm"
                                    >
                                        <ImageIcon size={14} />
                                        {t('dashboard.export.button')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-snug">
                                            {t('dashboard.export.mermaidDesc')}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCopyMermaid}
                                        className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-700 dark:text-white bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-all"
                                    >
                                        {mermaidCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        {mermaidCopied ? t('dashboard.export.copied') : t('dashboard.export.copyCode')}
                                    </button>

                                    <button
                                        onClick={handleDownloadMermaid}
                                        className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-sm"
                                    >
                                        <Download size={14} />
                                        {t('dashboard.export.downloadMmd')}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Export Progress Modal - Rendered to document.body via Portal */}
            {isExporting && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[300px]"
                        >
                            {/* Spinner */}
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                            </div>

                            {/* Progress Message */}
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t('dashboard.export.exporting')}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                                    {exportProgress}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}
