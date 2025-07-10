import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTouch } from '../../hooks/useTouch'

interface MapLocation {
  id: string
  name: string
  x: number
  y: number
  type: 'town' | 'dungeon' | 'boss' | 'resource'
  level: number
  discovered: boolean
  completed?: boolean
}

const mockLocations: MapLocation[] = [
  { id: '1', name: 'Starting Village', x: 20, y: 80, type: 'town', level: 1, discovered: true, completed: true },
  { id: '2', name: 'Goblin Cave', x: 40, y: 60, type: 'dungeon', level: 5, discovered: true, completed: true },
  { id: '3', name: 'Ancient Forest', x: 60, y: 40, type: 'resource', level: 10, discovered: true },
  { id: '4', name: 'Dragon Lair', x: 80, y: 20, type: 'boss', level: 25, discovered: true },
  { id: '5', name: 'Hidden Temple', x: 75, y: 70, type: 'dungeon', level: 15, discovered: false },
  { id: '6', name: 'Crystal Mine', x: 25, y: 30, type: 'resource', level: 8, discovered: true },
]

export function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [mapScale, setMapScale] = useState(1)
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  
  const { gestureHandler, hapticFeedback } = useTouch({
    onTap: ({ point }) => {
      hapticFeedback('light')
      console.log('Map tap at:', point)
    },
    onPinch: ({ scale }) => {
      setMapScale(Math.max(0.5, Math.min(3, scale)))
    },
    onDrag: ({ movement }) => {
      setMapPosition(prev => ({
        x: prev.x + movement[0],
        y: prev.y + movement[1]
      }))
    }
  }, {
    pinchZoomEnabled: true,
    dragScrollEnabled: true
  })

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'town': return '🏘️'
      case 'dungeon': return '🕳️'
      case 'boss': return '🐉'
      case 'resource': return '⛏️'
      default: return '📍'
    }
  }

  const getLocationColor = (type: string, discovered: boolean, completed?: boolean) => {
    if (!discovered) return 'bg-gray-600'
    if (completed) return 'bg-green-600'
    
    switch (type) {
      case 'town': return 'bg-blue-600'
      case 'dungeon': return 'bg-purple-600'
      case 'boss': return 'bg-red-600'
      case 'resource': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <motion.div
      className="h-full bg-dark-900 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex justify-between items-center">
          <div className="card p-2">
            <h2 className="text-lg font-bold text-white">World Map</h2>
            <p className="text-xs text-dark-400">Level 1-25 Areas</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setMapScale(1)
                setMapPosition({ x: 0, y: 0 })
                hapticFeedback('light')
              }}
              className="btn-touch bg-dark-700 text-white rounded-lg px-3 py-2"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-brown-900/20"
        style={{
          transform: `scale(${mapScale}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
          transformOrigin: 'center'
        }}
        {...gestureHandler()}
      >
        {/* Background terrain */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-gray-600 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-green-600 to-transparent" />
          <div className="absolute top-1/3 right-0 w-1/3 h-1/3 bg-gradient-to-l from-brown-600 to-transparent" />
        </div>

        {/* Locations */}
        {mockLocations.map((location) => (
          <motion.div
            key={location.id}
            className={`absolute w-12 h-12 rounded-full ${getLocationColor(location.type, location.discovered, location.completed)} 
              border-2 border-white shadow-lg cursor-pointer flex items-center justify-center`}
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: location.discovered ? 1 : 0.3
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSelectedLocation(location)
              hapticFeedback('medium')
            }}
          >
            <span className="text-lg">{getLocationIcon(location.type)}</span>
          </motion.div>
        ))}

        {/* Current player position */}
        <motion.div
          className="absolute w-4 h-4 bg-primary-500 rounded-full border-2 border-white shadow-lg"
          style={{
            left: '20%',
            top: '80%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 card p-3 max-w-xs">
        <h3 className="text-sm font-semibold text-white mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full" />
            <span className="text-dark-400">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-dark-400">Town</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full" />
            <span className="text-dark-400">Dungeon</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-dark-400">Boss</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="text-dark-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Location Details Modal */}
      {selectedLocation && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedLocation(null)}
        >
          <motion.div
            className="card p-6 max-w-sm w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{getLocationIcon(selectedLocation.type)}</div>
              <h3 className="text-xl font-bold text-white">{selectedLocation.name}</h3>
              <p className="text-sm text-dark-400 capitalize">
                Level {selectedLocation.level} {selectedLocation.type}
              </p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-dark-400">Status:</span>
                <span className={`text-sm ${selectedLocation.discovered ? 'text-green-400' : 'text-gray-400'}`}>
                  {selectedLocation.discovered ? 'Discovered' : 'Undiscovered'}
                </span>
              </div>
              {selectedLocation.completed && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Progress:</span>
                  <span className="text-green-400 text-sm">Completed</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="btn-touch btn-primary flex-1"
                disabled={!selectedLocation.discovered}
              >
                Travel
              </button>
              <button className="btn-touch btn-secondary">
                Info
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}