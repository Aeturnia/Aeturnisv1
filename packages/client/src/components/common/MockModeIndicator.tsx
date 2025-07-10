import { useEffect, useState } from 'react'

export function MockModeIndicator() {
  const [isMockMode, setIsMockMode] = useState(false)

  useEffect(() => {
    // Check if mock mode is enabled
    const localStorageOverride = localStorage.getItem('VITE_USE_MOCKS')
    const mockMode = localStorageOverride !== null 
      ? localStorageOverride === 'true'
      : import.meta.env.VITE_USE_MOCKS === 'true'
    
    setIsMockMode(mockMode)
  }, [])

  // Always show in development for testing
  // if (!isMockMode) return null

  return (
    <div className={`fixed top-6 left-6 z-[10001] px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border flex items-center gap-2 shadow-lg ${
      isMockMode 
        ? 'bg-yellow-900/90 text-yellow-100 border-yellow-700/50' 
        : 'bg-green-900/90 text-green-100 border-green-700/50'
    }`}>
      <span className="animate-pulse">{isMockMode ? '🎭' : '🔌'}</span>
      <span>{isMockMode ? 'Mock Mode' : 'Real Mode'}</span>
    </div>
  )
}