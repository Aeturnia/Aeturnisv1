import { useState, useEffect } from 'react'
import { DevTouchDebugger } from './TouchDebugOverlay'
import { DeviceEmulator } from './DeviceEmulator'
import { PerformanceMonitor } from './PerformanceMonitor'

export function DeveloperTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMockMode, setIsMockMode] = useState(import.meta.env.VITE_USE_MOCKS === 'true')
  const [forceShow, setForceShow] = useState(false)

  // Check for dev mode or force show
  const shouldShow = import.meta.env.MODE === 'development' || 
                     import.meta.env.DEV === true || 
                     forceShow ||
                     localStorage.getItem('SHOW_DEV_TOOLS') === 'true'

  // Add keyboard shortcut to toggle dev tools
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle dev tools
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        const newState = !shouldShow
        localStorage.setItem('SHOW_DEV_TOOLS', newState ? 'true' : 'false')
        setForceShow(newState)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shouldShow])

  // Check localStorage on mount
  useEffect(() => {
    if (localStorage.getItem('SHOW_DEV_TOOLS') === 'true') {
      setForceShow(true)
    }
  }, [])

  if (!shouldShow) return null

  return (
    <>
      {/* Main developer tools button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-20 right-4 z-[10004] p-3 rounded-full shadow-lg
          ${isOpen ? 'bg-purple-500' : 'bg-gray-700'}
          text-white transition-colors group
        `}
        aria-label="Developer Tools"
      >
        <span className="group-hover:animate-spin inline-block">⚙️</span>
      </button>

      {/* Developer tools panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-[10004] bg-dark-900 rounded-lg shadow-xl border border-dark-700 p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg">Developer Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Quick Actions</h4>
              
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.reload()
                }}
                className="w-full text-left px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-white transition-colors"
              >
                🗑️ Clear Storage & Reload
              </button>

              <button
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name))
                    })
                  }
                  window.location.reload()
                }}
                className="w-full text-left px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-white transition-colors"
              >
                🔄 Clear Cache & Reload
              </button>

              <button
                onClick={() => {
                  console.log('=== App State Debug ===')
                  console.log('Local Storage:', { ...localStorage })
                  console.log('Session Storage:', { ...sessionStorage })
                  console.log('Service Worker:', navigator.serviceWorker.controller)
                  console.log('Window:', window)
                }}
                className="w-full text-left px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-white transition-colors"
              >
                🐛 Log App State
              </button>
            </div>

            {/* Tools Status */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Debug Tools</h4>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center px-3 py-1">
                  <span className="text-gray-300">Touch Debug</span>
                  <span className="text-xs text-gray-500">Ctrl+Shift+T</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1">
                  <span className="text-gray-300">Device Emulator</span>
                  <span className="text-xs text-gray-500">Ctrl+Shift+D</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1">
                  <span className="text-gray-300">Performance Monitor</span>
                  <span className="text-xs text-gray-500">Ctrl+Shift+P</span>
                </div>
              </div>
            </div>

            {/* Service Mode Toggle */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Service Mode</h4>
              <div className="px-3 py-2 bg-dark-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {isMockMode ? '🎭 Mock Services' : '🔌 Real Services'}
                  </span>
                  <button
                    onClick={() => {
                      // Toggle mock mode (requires page reload)
                      const newMockMode = !isMockMode
                      localStorage.setItem('VITE_USE_MOCKS', newMockMode.toString())
                      window.location.reload()
                    }}
                    className="px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    Switch to {isMockMode ? 'Real' : 'Mock'}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {isMockMode 
                    ? 'Using local mock data with simulated delays'
                    : 'Connected to backend API'}
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Environment</h4>
              <div className="px-3 py-2 bg-dark-800 rounded-lg text-xs font-mono text-gray-300">
                <div>Mode: {import.meta.env.MODE}</div>
                <div>API: {import.meta.env.VITE_API_URL || 'http://localhost:3000'}</div>
                <div>PWA: {('serviceWorker' in navigator) ? 'Supported' : 'Not Supported'}</div>
                <div>Touch: {('ontouchstart' in window) ? 'Yes' : 'No'}</div>
                <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
              </div>
            </div>

            {/* Links */}
            <div className="pt-2 border-t border-dark-700">
              <div className="text-xs text-gray-500 text-center">
                Press ESC to close all debug tools
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Include all debug components */}
      <DevTouchDebugger />
      <DeviceEmulator />
      <PerformanceMonitor />
    </>
  )
}