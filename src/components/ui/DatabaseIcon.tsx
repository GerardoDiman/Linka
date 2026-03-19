import { Database } from "lucide-react"

interface DatabaseIconProps {
    icon?: string
    color?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const SIZE_CLASSES = {
    sm: { container: 'w-4 h-4', icon: 14 },
    md: { container: 'w-[18px] h-[18px]', icon: 18 },
    lg: { container: 'w-5 h-5', icon: 20 },
} as const

export function DatabaseIcon({ icon, color, size = 'md', className = '' }: DatabaseIconProps) {
    const { container, icon: iconSize } = SIZE_CLASSES[size]

    if (icon?.startsWith('http')) {
        return (
            <div className={`${container} flex items-center justify-center ${className}`}>
                <img src={icon} alt="" className="w-full h-full object-contain" loading="lazy" />
            </div>
        )
    }

    if (icon) {
        return (
            <div className={`${container} flex items-center justify-center text-sm ${className}`}>
                <span>{icon}</span>
            </div>
        )
    }

    return <Database size={iconSize} className={`${container} flex-shrink-0 ${className}`} style={{ color }} />
}
