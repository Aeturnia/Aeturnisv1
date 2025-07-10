import { useState, useEffect } from 'react'

export function DevToolsToggle() {
  const [showToggle, setShowToggle] = useState(true)
  const [devToolsEnabled, setDevToolsEnabled] = useState(false)

  useEffect(() => {
    // Check if dev tools are already enabled
    const enabled = localStorage.getItem('SHOW_DEV_TOOLS') === 'true'
    setDevToolsEnabled(enabled)
    
    // Hide toggle if dev tools are already showing
    if (enabled || import.meta.env.MODE === 'development') {
      setShowToggle(false)
    }
  }, [])

  if (!showToggle) return null

  return (
    <button
      onClick={() => {
        localStorage.setItem('SHOW_DEV_TOOLS', 'true')
        window.location.reload()
      }}
      className="fixed bottom-4 left-4 z-[9999] px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
    >
      Enable Dev Tools (Ctrl+Shift+D)
    </button>
  )
}