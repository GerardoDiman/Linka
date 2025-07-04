const NOTION_TOKEN_KEY = 'notion_integration_token'

export const notionAuth = {
  // Guardar token en localStorage
  saveToken: (token: string): void => {
    try {
      localStorage.setItem(NOTION_TOKEN_KEY, token)
    } catch (error) {
      console.error('Error saving Notion token:', error)
    }
  },

  // Obtener token del localStorage
  getToken: (): string | null => {
    try {
      return localStorage.getItem(NOTION_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting Notion token:', error)
      return null
    }
  },

  // Eliminar token
  removeToken: (): void => {
    try {
      localStorage.removeItem(NOTION_TOKEN_KEY)
    } catch (error) {
      console.error('Error removing Notion token:', error)
    }
  },

  // Verificar si hay token
  hasToken: (): boolean => {
    return !!notionAuth.getToken()
  },

  // Verificar formato del token
  isValidTokenFormat: (token: string): boolean => {
    // Nuevo formato de Notion: ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (50 caracteres en total, 46 después de ntn_)
    const newTokenRegex = /^ntn_[a-zA-Z0-9]{46}$/
    // Formato anterior: secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (47 caracteres en total, 43 después de secret_)
    const oldTokenRegex = /^secret_[a-zA-Z0-9]{43}$/
    
    return newTokenRegex.test(token) || oldTokenRegex.test(token)
  }
} 