import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTouch } from '../../hooks/useTouch'
import { useIsMobile } from '../../utils/responsive'

interface HeaderProps {
  showBackButton?: boolean
  onBackClick?: () => void
  title?: string
  rightActions?: React.ReactNode
}

export function Header({ 
  showBackButton = false, 
  onBackClick,
  title,
  rightActions 
}: HeaderProps) {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  // Get page title from route
  const getPageTitle = () => {
    if (title) return title
    
    const pathTitles: Record<string, string> = {
      '/game': 'Aeturnis Online',
      '/inventory': 'Inventory',
      '/character': 'Character',
      '/map': 'World Map',
      '/settings': 'Settings',
    }
    
    return pathTitles[location.pathname] || 'Aeturnis Online'
  }

  const handleMenuToggle = () => {
    hapticFeedback('light')
    setIsMenuOpen(!isMenuOpen)
  }

  const handleBackClick = () => {
    hapticFeedback('light')
    if (onBackClick) {
      onBackClick()
    } else {
      window.history.back()
    }
  }

  return (
    <header className="bg-dark-800 border-b border-dark-700 safe-area-padding">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Back button or Menu */}
        <div className="flex items-center">
          {showBackButton ? (
            <button
              onClick={handleBackClick}
              className="btn-touch btn-secondary mr-2"
              aria-label="Go back"
            >
              <span className="text-lg">←</span>
            </button>
          ) : (
            <button
              onClick={handleMenuToggle}
              className="btn-touch btn-secondary mr-2"
              aria-label="Menu"
            >
              <span className="text-lg">☰</span>
            </button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-white text-shadow truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {rightActions}
          
          {/* Connection status indicator */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-dark-400">Online</span>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-dark-900 bg-opacity-50 z-50"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 w-64 h-full bg-dark-800 shadow-lg"
          >
            <div className="p-4 safe-area-padding">
              <h2 className="text-xl font-bold text-white mb-4">Menu</h2>
              
              {/* Menu items */}
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg hover:bg-dark-700 text-white">
                  Profile
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-dark-700 text-white">
                  Achievements
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-dark-700 text-white">
                  Friends
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-dark-700 text-white">
                  Help
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}