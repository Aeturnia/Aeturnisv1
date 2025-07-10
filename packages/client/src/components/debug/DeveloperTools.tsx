import { useState } from 'react'
import { DevTouchDebugger } from './TouchDebugOverlay'
import { DeviceEmulator } from './DeviceEmulator'
import { PerformanceMonitor } from './PerformanceMonitor'

export function DeveloperTools() {
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      {/* Main developer tools button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-4 right-4 z-[10000] p-3 rounded-full shadow-lg
          ${isOpen ? 'bg-purple-500' : 'bg-gray-700'}
          text-white transition-colors group
        `}
        aria-label="Developer Tools"
      >
        <span className="group-hover:animate-spin inline-block">⚙️</span>
      </button>

      {/* Developer tools panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9999] bg-dark-900 rounded-lg shadow-xl border border-dark-700 p-4 w-80">
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

            {/* Environment Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-1">Environment</h4>
              <div className="px-3 py-2 bg-dark-800 rounded-lg text-xs font-mono text-gray-300">
                <div>Mode: {process.env.NODE_ENV}</div>
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