import React, { memo, useCallback, useRef, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme, Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  isInDropdown?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ isInDropdown = false }) => {
  const { theme, setTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  const themes: { value: Theme; icon: React.ComponentType<any>; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Oscuro' }
  ]

  const handleThemeChange = useCallback((newTheme: Theme) => {
    // Cambio inmediato sin animaciones que puedan causar parpadeo
    setTheme(newTheme)
  }, [setTheme])

  // Evitar flash cuando se monta en dropdown
  useEffect(() => {
    if (isInDropdown && containerRef.current) {
      // Estabilizar el componente sin transiciones
      containerRef.current.style.opacity = '1'
    }
  }, [isInDropdown])

  return (
    <div 
      ref={containerRef}
      className={`
        flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg
        ${isInDropdown ? 'p-0.5 transition-opacity duration-100' : 'p-1 transition-colors duration-200'}
      `}
      data-theme-toggle
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        isolation: 'isolate'
      }}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => handleThemeChange(value)}
          className={`
            flex items-center justify-center w-8 h-8 rounded-md transition-all duration-100
            ${theme === value 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          title={label}
          aria-label={`Cambiar a tema ${label.toLowerCase()}`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
})

ThemeToggle.displayName = 'ThemeToggle' 