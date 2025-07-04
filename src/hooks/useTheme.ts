import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

// Cache global para evitar re-evaluaciones
let globalTheme: Theme | null = null
let globalIsDark = false

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Usar cache si está disponible
    if (globalTheme) return globalTheme
    
    // Intentar obtener tema guardado del localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linkav2-theme') as Theme
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        globalTheme = saved
        return saved
      }
    }
    globalTheme = 'system'
    return 'system'
  })

  // Determinar si debe usar modo oscuro
  const [isDark, setIsDark] = useState(() => globalIsDark)

  useEffect(() => {
    const updateDarkMode = () => {
      let newIsDark = false
      
      if (theme === 'system') {
        newIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        newIsDark = theme === 'dark'
      }
      
      if (newIsDark !== globalIsDark) {
        globalIsDark = newIsDark
        setIsDark(newIsDark)
      }
    }

    // Actualizar inmediatamente
    updateDarkMode()

    // Escuchar cambios en preferencias del sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      // Usar addEventListener si está disponible, sino usar el método deprecated
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateDarkMode)
        return () => mediaQuery.removeEventListener('change', updateDarkMode)
      } else {
        // Fallback para navegadores más antiguos
        mediaQuery.addListener(updateDarkMode)
        return () => mediaQuery.removeListener(updateDarkMode)
      }
    }
  }, [theme])

  // Aplicar tema al documento de manera optimizada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      // Usar requestAnimationFrame para evitar layout thrashing
      requestAnimationFrame(() => {
        if (isDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      })
    }
  }, [isDark])

  const setTheme = useCallback((newTheme: Theme) => {
    globalTheme = newTheme
    setThemeState(newTheme)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('linkav2-theme', newTheme)
    }
  }, [])

  return {
    theme,
    setTheme,
    isDark
  }
} 