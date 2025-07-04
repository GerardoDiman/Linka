import { useState } from 'react'
import { Settings, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle, Loader2, Globe, Server, Code, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

interface NotionSetupProps {
  onTokenSubmit: (token: string) => void
  isLoading: boolean
  error: string | null
  isConnected: boolean
  onDisconnect: () => void
  onUseDemoData: () => void
}

export default function NotionSetup({ 
  onTokenSubmit, 
  isLoading, 
  error, 
  isConnected, 
  onDisconnect,
  onUseDemoData
}: NotionSetupProps) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'demo' | 'backend' | 'instructions'>('demo')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      onTokenSubmit(token.trim())
    }
  }

  if (isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-900">Connected to Notion!</h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Your Notion workspace is connected correctly. You can start visualizing your databases.
          </p>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Linka v2.0
        </h2>
        <p className="text-gray-600">
          Visualize your Notion databases as interactive diagrams
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedTab('demo')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedTab === 'demo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Demo
          </button>
          <button
            onClick={() => setSelectedTab('backend')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedTab === 'backend'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Server className="w-4 h-4 inline mr-2" />
            Connect
          </button>
          <button
            onClick={() => setSelectedTab('instructions')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedTab === 'instructions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Help
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'demo' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Use Demo Data
              </h3>
              <p className="text-blue-800 mb-4">
                Explore all the features of Linka v2.0 with 5 example databases
                that show relationships, filters and interactive visualizations.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-blue-700">
                <div>
                  <div className="font-medium">✅ Includes:</div>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• 5 connected databases</li>
                    <li>• Real relationships</li>
                    <li>• All features</li>
                    <li>• No configuration</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">🎯 Perfect for:</div>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Evaluating the tool</li>
                    <li>• Demonstrations</li>
                    <li>• Understanding features</li>
                    <li>• Quick tests</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={onUseDemoData}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Globe className="w-5 h-5" />
                <span>Use Demo Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'backend' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Integrated Backend!
                </h3>
                <p className="text-green-800 mb-4">
                  Linka v2.0 now includes an integrated serverless backend that automatically handles
                  communication with Notion. You only need your integration token.
                </p>
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-2">✅ CORS Problem Solved:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• Serverless functions included</li>
                      <li>• No additional configuration</li>
                      <li>• Optimized security and performance</li>
                      <li>• You only need your Notion token</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect with Real Data
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Server className="w-4 h-4 mr-2 text-green-600" />
                  Integrated Serverless Backend
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  We use Vercel serverless functions that run automatically in the cloud
                </p>
                <div className="text-xs text-gray-500 grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Advantages:</div>
                    <ul className="mt-1 space-y-1">
                      <li>• No servers to maintain</li>
                      <li>• Automatic scalability</li>
                      <li>• Always available</li>
                      <li>• Optimized security</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">What you need:</div>
                    <ul className="mt-1 space-y-1">
                      <li>• Notion integration token</li>
                      <li>• Share databases</li>
                      <li>• That's it!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'instructions' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How to Get your Notion Token
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                Create a Notion Integration
              </h4>
              <div className="ml-8 space-y-2">
                <p className="text-sm text-gray-600">
                  Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notion.so/my-integrations</a>
                </p>
                <p className="text-sm text-gray-600">
                  Click <strong>"New integration"</strong> and complete the basic information
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                Copy the Token
              </h4>
              <div className="ml-8 space-y-2">
                <p className="text-sm text-gray-600">
                  Copy the <strong>"Internal Integration Token"</strong>
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-xs text-gray-700">
                    ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
                Share Databases
              </h4>
              <div className="ml-8 space-y-2">
                <p className="text-sm text-gray-600">
                  For each database you want to visualize:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Open the database in Notion</li>
                  <li>• Click the three dots (...) → <strong>Connections</strong></li>
                  <li>• Find and select your integration</li>
                  <li>• Confirm access</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-900">Ready!</h5>
                  <p className="text-sm text-green-700">
                    Once you have your token and have shared the databases,
                    simply paste it in the form and our backend will do the rest.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://developers.notion.com/docs/create-a-notion-integration"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Official Notion Guide</span>
              </a>
              <span className="text-sm text-gray-500">
                Complete documentation with screenshots
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Connection form */}
      {selectedTab === 'backend' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Connect with your Notion Workspace
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Enter your Notion integration token and our backend will take care of the rest:
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-blue-900 mb-2">
                Notion Integration Token
              </label>
              <div className="relative">
                <input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!token.trim() || isLoading}
              className={clsx(
                'w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2',
                !token.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Notion...</span>
                </>
              ) : (
                <>
                  <Server className="w-5 h-5" />
                  <span>Connect with Real Data</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Your token is sent securely to our serverless backend
              and is never stored on our servers.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 