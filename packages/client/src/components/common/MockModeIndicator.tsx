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

  // Only show when mock mode is active
  if (!isMockMode) return null

  return (
    <div className="fixed top-4 left-4 z-[9999] bg-yellow-900/90 text-yellow-100 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-yellow-700/50 flex items-center gap-2 shadow-lg">
      <span className="animate-pulse">🎭</span>
      <span>Mock Mode</span>
    </div>
  )
}