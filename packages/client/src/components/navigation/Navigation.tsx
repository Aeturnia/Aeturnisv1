import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTouch } from '../../hooks/useTouch'

interface NavItem {
  id: string
  path: string
  label: string
  icon: string
  description: string
}

const navItems: NavItem[] = [
  { id: 'game', path: '/game', label: 'Game', icon: '⚔️', description: 'Main game area' },
  { id: 'inventory', path: '/inventory', label: 'Inventory', icon: '🎒', description: 'Items & equipment' },
  { id: 'character', path: '/character', label: 'Character', icon: '👤', description: 'Stats & progression' },
  { id: 'map', path: '/map', label: 'Map', icon: '🗺️', description: 'World exploration' },
  { id: 'settings', path: '/settings', label: 'Settings', icon: '⚙️', description: 'Game settings' },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState<string>(() => {
    const currentPath = location.pathname
    return navItems.find(item => item.path === currentPath)?.id || 'game'
  })

  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  const handleNavigation = (item: NavItem) => {
    if (item.id === activeItem) return
    
    hapticFeedback('light')
    setActiveItem(item.id)
    navigate(item.path)
  }

  return (
    <nav className="bg-dark-800 border-t border-dark-700 safe-area-padding">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeItem === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg
                min-w-touch min-h-touch relative transition-all duration-150
                ${isActive 
                  ? 'text-primary-400' 
                  : 'text-dark-400 hover:text-dark-300'
                }
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500
                no-tap-highlight touch-manipulation
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={item.description}
            >
              {/* Icon */}
              <div className="text-xl mb-1">
                {item.icon}
              </div>
              
              {/* Label */}
              <div className="text-xs font-medium">
                {item.label}
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full"
                  layoutId="activeIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              {/* Notification badge (example) */}
              {item.id === 'inventory' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}