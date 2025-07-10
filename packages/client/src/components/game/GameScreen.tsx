import { useState, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'
import { useIsMobile } from '../../utils/responsive'

export function GameScreen() {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 })
  const [isConnected, setIsConnected] = useState(true)
  const isMobile = useIsMobile()
  
  const { gestureHandler, hapticFeedback } = useTouch({
    onTap: ({ point }) => {
      hapticFeedback('light')
      console.log('Tap at:', point)
    },
    onDoubleTap: ({ point }) => {
      hapticFeedback('medium')
      console.log('Double tap at:', point)
    },
    onSwipeUp: ({ distance }) => {
      hapticFeedback('light')
      console.log('Swipe up:', distance)
    },
    onSwipeDown: ({ distance }) => {
      hapticFeedback('light')
      console.log('Swipe down:', distance)
    },
    onSwipeLeft: ({ distance }) => {
      hapticFeedback('light')
      console.log('Swipe left:', distance)
    },
    onSwipeRight: ({ distance }) => {
      hapticFeedback('light')
      console.log('Swipe right:', distance)
    },
    onPullToRefresh: () => {
      hapticFeedback('medium')
      console.log('Pull to refresh')
    },
  })

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1) // 90% uptime
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="h-full bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden"
      {...gestureHandler()}
    >
      {/* Game World */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-green-900/20">
        {/* Player character */}
        <div
          className="absolute w-8 h-8 bg-primary-500 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
          }}
        />
        
        {/* Environment elements */}
        <div className="absolute bottom-10 left-10 w-6 h-6 bg-green-600 rounded-full opacity-60" />
        <div className="absolute bottom-20 right-15 w-4 h-4 bg-brown-600 rounded-full opacity-60" />
        <div className="absolute top-20 left-20 w-5 h-5 bg-gray-600 rounded-full opacity-60" />
      </div>

      {/* HUD Elements */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Health/Mana bars */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-sm">❤️</span>
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }} />
            </div>
            <span className="text-xs text-white">85/100</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 text-sm">💧</span>
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
            </div>
            <span className="text-xs text-white">60/100</span>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-white">{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-2">
        <button
          className="btn-touch bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
          onClick={() => hapticFeedback('heavy')}
        >
          ⚔️
        </button>
        <button
          className="btn-touch bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
          onClick={() => hapticFeedback('medium')}
        >
          🛡️
        </button>
        <button
          className="btn-touch bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
          onClick={() => hapticFeedback('light')}
        >
          🧪
        </button>
      </div>

      {/* Mobile-specific touch instructions */}
      {isMobile && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-dark-400">
            Tap to interact • Swipe to move • Double tap for special actions
          </p>
        </div>
      )}
    </div>
  )
}