import { useState, useEffect } from 'react'

export function SimpleDevToggle() {
  const [mockMode, setMockMode] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    // Check current mock mode
    const localStorageOverride = localStorage.getItem('VITE_USE_MOCKS')
    const isMock = localStorageOverride === 'true' || import.meta.env.VITE_USE_MOCKS === 'true'
    setMockMode(isMock)
  }, [])

  const toggleMockMode = () => {
    const newMode = !mockMode
    localStorage.setItem('VITE_USE_MOCKS', newMode.toString())
    window.location.reload()
  }

  return (
    <>
      {/* Always visible toggle button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
        aria-label="Toggle Dev Panel"
      >
        <span className="text-xl">⚙️</span>
      </button>

      {/* Dev Panel */}
      {showPanel && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white rounded-lg shadow-xl p-4 w-72 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            Dev Tools
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </h3>

          <div className="space-y-3">
            {/* Mock Mode Toggle */}
            <div className="bg-gray-800 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Service Mode</span>
                <span className={`text-xs px-2 py-1 rounded ${mockMode ? 'bg-yellow-600' : 'bg-green-600'}`}>
                  {mockMode ? '🎭 Mock' : '🔌 Real'}
                </span>
              </div>
              <button
                onClick={toggleMockMode}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
              >
                Switch to {mockMode ? 'Real' : 'Mock'} Mode
              </button>
              <p className="text-xs text-gray-400 mt-2">
                {mockMode 
                  ? 'Using local mock data'
                  : 'Connected to backend API'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-3 rounded space-y-2">
              <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.reload()
                }}
                className="w-full py-1 px-2 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
              >
                Clear All Storage
              </button>
              <button
                onClick={() => {
                  console.log('Current state:', {
                    mockMode,
                    localStorage: { ...localStorage },
                    env: import.meta.env
                  })
                }}
                className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              >
                Log Debug Info
              </button>
            </div>

            {/* Environment Info */}
            <div className="bg-gray-800 p-3 rounded text-xs space-y-1">
              <div>Mode: {import.meta.env.MODE || 'production'}</div>
              <div>API: {import.meta.env.VITE_API_URL || 'Not set'}</div>
              <div>Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}