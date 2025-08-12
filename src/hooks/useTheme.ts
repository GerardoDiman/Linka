import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'

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
      const saved = (localStorage.getItem('linka-theme') || localStorage.getItem('linkav2-theme')) as Theme
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        globalTheme = saved
        return saved
      }
    }
    globalTheme = 'light'
    return 'light'
  })

  // Determinar si debe usar modo oscuro
  const [isDark, setIsDark] = useState(() => globalIsDark)

  useEffect(() => {
    const newIsDark = theme === 'dark'
    if (newIsDark !== globalIsDark) {
      globalIsDark = newIsDark
      setIsDark(newIsDark)
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
      localStorage.setItem('linka-theme', newTheme)
      localStorage.setItem('linkav2-theme', newTheme)
      document.documentElement.dataset.theme = newTheme
      document.documentElement.style.colorScheme = newTheme === 'dark' ? 'dark' : 'light'
    }
  }, [])

  return {
    theme,
    setTheme,
    isDark
  }
} 