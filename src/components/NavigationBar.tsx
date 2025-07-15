import React, { useState, useCallback, memo } from 'react'
import { 
  File, 
  Download, 
  RefreshCw, 
  Settings, 
  HelpCircle, 
  Database, 
  Eye, 
  EyeOff, 
  ChevronDown,
  ExternalLink,
  Filter,
  Zap,
  Info,
  User,
  LogOut
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface NavigationBarProps {
  onExport: () => void
  onRefresh: () => void
  onShowSetup: () => void
  onToggleIsolated: () => void
  onShowVisibilityManager?: () => void
  showIsolatedNodes: boolean
  isConnected: boolean
  databaseCount: number
  relationCount: number
  onShowFilters?: () => void
  className?: string
  user?: { email?: string };
  onLogout?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = memo(({
  onExport,
  onRefresh,
  onShowSetup,
  onToggleIsolated,
  onShowVisibilityManager,
  showIsolatedNodes,
  isConnected,
  databaseCount,
  relationCount,
  onShowFilters,
  user,
  onLogout,
  className = ''
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleMenuClick = useCallback((menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId)
  }, [activeMenu])

  const closeMenu = useCallback(() => setActiveMenu(null), [])
  
  const handleMenuAction = useCallback((action: () => void) => {
    action()
    closeMenu()
  }, [closeMenu])

  // Handlers memoized para evitar re-renders
  const handleExport = useCallback(() => handleMenuAction(onExport), [handleMenuAction, onExport])
  const handleRefresh = useCallback(() => handleMenuAction(onRefresh), [handleMenuAction, onRefresh])
  const handleShowSetup = useCallback(() => handleMenuAction(onShowSetup), [handleMenuAction, onShowSetup])
  const handleToggleIsolated = useCallback(() => handleMenuAction(onToggleIsolated), [handleMenuAction, onToggleIsolated])
  const handleShowFilters = useCallback(() => onShowFilters && handleMenuAction(onShowFilters), [handleMenuAction, onShowFilters])
  const handleShowVisibilityManager = useCallback(() => onShowVisibilityManager && handleMenuAction(onShowVisibilityManager), [handleMenuAction, onShowVisibilityManager])
  const handleOpenNotion = useCallback(() => handleMenuAction(() => window.open('https://notion.so', '_blank')), [handleMenuAction])
  const handleOpenGitHub = useCallback(() => handleMenuAction(() => window.open('https://github.com', '_blank')), [handleMenuAction])

  return (
    <nav className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 ${className}`}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo y título */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">LinkAv2.0</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notion Database Visualizer</p>
            </div>
          </div>
        </div>

        {/* Menús principales */}
        <div className="flex items-center space-x-1 flex-1 justify-center">
          {/* Menú Archivo */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('file')}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <File className="w-4 h-4" />
              <span>File</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 dropdown-menu">
                <div className="py-1">
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Diagram</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Update Data</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <button
                    onClick={handleOpenNotion}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Notion</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menú Vista */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('view')}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {activeMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 dropdown-menu">
                <div className="py-1">
                  <button
                    onClick={handleToggleIsolated}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    {showIsolatedNodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showIsolatedNodes ? 'Hide' : 'Show'} Isolated Databases</span>
                  </button>
                  {onShowFilters && (
                    <button
                      onClick={handleShowFilters}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Advanced Filters</span>
                    </button>
                  )}
                  {onShowVisibilityManager && (
                    <button
                      onClick={handleShowVisibilityManager}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Manage Visibility</span>
                    </button>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <div className="px-4 py-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Databases:</span>
                        <span className="font-medium">{databaseCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relations:</span>
                        <span className="font-medium">{relationCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menú Configuración */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('settings')}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {activeMenu === 'settings' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 dropdown-menu">
                <div className="py-1">
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                      <div className="ml-2 flex-shrink-0">
                        <ThemeToggle isInDropdown={true} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menú Ayuda */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('help')}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {activeMenu === 'help' && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 dropdown-menu">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Main Features</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div>• <span className="text-blue-600 dark:text-blue-400">Blue lines</span>: Strong relationships</div>
                      <div>• <span className="text-green-600 dark:text-green-400">Green lines</span>: Bidirectional links</div>
                      <div>• <span className="text-gray-500">Dotted lines</span>: Unidirectional relationships</div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Keyboard Shortcuts</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + R</kbd> Update</div>
                      <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + E</kbd> Export</div>
                      <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Space</kbd> Center view</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={handleOpenGitHub}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <Info className="w-4 h-4" />
                      <span>About LinkAv2.0</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usuario y logout alineados a la derecha */}
        <div className="flex items-center space-x-3">
          {/* Menú Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => handleMenuClick('profile')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">{user.email?.split('@')[0] || 'User'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {activeMenu === 'profile' && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 dropdown-menu">
                  <div className="py-1">
                    {/* Header del perfil */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.email?.split('@')[0] || 'Usuario'}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del perfil */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          // Aquí podrías agregar navegación a la página de perfil
                          closeMenu()
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      
                      <button
                        onClick={() => {
                          handleShowSetup()
                          closeMenu()
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Configure Notion</span>
                      </button>
                      
                      <div className="px-4 py-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Notion Status: {isConnected ? (
                            <span className="text-green-600 dark:text-green-400">🟢 Connected</span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">🔴 Demo</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      
                      <button
                        onClick={() => {
                          if (onLogout) {
                            onLogout()
                            closeMenu()
                          }
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Overlay para cerrar menús al hacer clic fuera */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenu}
        />
      )}
    </nav>
  )
})

NavigationBar.displayName = 'NavigationBar' 