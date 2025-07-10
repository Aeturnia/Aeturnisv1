import { useState, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'
import { useZone, useCharacter } from '../../hooks/useServices'
import { Zone } from '@aeturnis/shared'

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

// Map zone types to display types
const getZoneDisplayType = (zone: Zone): 'town' | 'dungeon' | 'boss' | 'resource' => {
  if (zone.type === 'city') return 'town'
  if (zone.type === 'dungeon') return 'dungeon'
  if (zone.features?.includes('boss')) return 'boss'
  if (zone.features?.includes('resources')) return 'resource'
  return 'town'
}

export function MapScreen() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [mapScale, setMapScale] = useState(1)
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number } | null>(null)
  
  const { zoneList, currentZone, getZones, getCharacterPosition, moveToZone } = useZone()
  const { currentCharacter } = useCharacter()
  
  // Load zones on mount
  useEffect(() => {
    loadData()
  }, [])
  
  // Update player position when current zone changes
  useEffect(() => {
    if (currentZone) {
      setPlayerPosition({
        x: currentZone.coordinates.x,
        y: currentZone.coordinates.y
      })
    }
  }, [currentZone])
  
  const loadData = async () => {
    try {
      setLoading(true)
      await getZones()
      
      // Get current character position if available
      if (currentCharacter?.id) {
        const position = await getCharacterPosition(currentCharacter.id)
        if (position) {
          setPlayerPosition({
            x: position.coordinates.x,
            y: position.coordinates.y
          })
        }
      }
    } catch (error) {
      console.error('Failed to load map data:', error)
    } finally {
      setLoading(false)
    }
  }
  
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

  const getLocationIcon = (zone: Zone) => {
    const type = getZoneDisplayType(zone)
    switch (type) {
      case 'town': return '🏘️'
      case 'dungeon': return '🕳️'
      case 'boss': return '🐉'
      case 'resource': return '⛏️'
      default: return '📍'
    }
  }

  const getLocationColor = (zone: Zone) => {
    if (zone.locked) return 'bg-gray-600'
    
    const type = getZoneDisplayType(zone)
    switch (type) {
      case 'town': return 'bg-blue-600'
      case 'dungeon': return 'bg-purple-600'
      case 'boss': return 'bg-red-600'
      case 'resource': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }
  
  const handleTravel = async (zone: Zone) => {
    if (!currentCharacter?.id || zone.locked) return
    
    try {
      await moveToZone(currentCharacter.id, zone.id)
      setSelectedZone(null)
      hapticFeedback('success')
    } catch (error) {
      console.error('Failed to travel:', error)
      hapticFeedback('error')
    }
  }
  
  if (loading) {
    return (
      <div className="h-full bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🗺️</div>
          <p className="text-white">Loading world map...</p>
        </div>
      </div>
    )
  }
  
  const zones = zoneList ? Array.from(zoneList.values()) : []

  return (
    <div
      className="h-full bg-dark-900 relative overflow-hidden"
    >
      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex justify-between items-center">
          <div className="card p-2">
            <h2 className="text-lg font-bold text-white">World Map</h2>
            <p className="text-xs text-dark-400">{zones.length} Zones Available</p>
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

        {/* Zones */}
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`absolute w-12 h-12 rounded-full ${getLocationColor(zone)} 
              border-2 border-white shadow-lg cursor-pointer flex items-center justify-center`}
            style={{
              left: `${zone.coordinates.x}%`,
              top: `${zone.coordinates.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: zone.locked ? 0.3 : 1
            }}
            onClick={() => {
              setSelectedZone(zone)
              hapticFeedback('medium')
            }}
          >
            <span className="text-lg">{getLocationIcon(zone)}</span>
          </div>
        ))}

        {/* Current player position */}
        {playerPosition && (
          <div
            className="absolute w-4 h-4 bg-primary-500 rounded-full border-2 border-white shadow-lg animate-pulse"
            style={{
              left: `${playerPosition.x}%`,
              top: `${playerPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
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

      {/* Zone Details Modal */}
      {selectedZone && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedZone(null)}
        >
          <div
            className="card p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{getLocationIcon(selectedZone)}</div>
              <h3 className="text-xl font-bold text-white">{selectedZone.displayName}</h3>
              <p className="text-sm text-dark-400 capitalize">
                {selectedZone.levelRequirement && `Level ${selectedZone.levelRequirement} `}
                {selectedZone.type} Zone
              </p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-dark-400">Status:</span>
                <span className={`text-sm ${selectedZone.locked ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedZone.locked ? 'Locked' : 'Available'}
                </span>
              </div>
              {selectedZone.description && (
                <div className="text-sm text-dark-400 italic">
                  "{selectedZone.description}"
                </div>
              )}
              {selectedZone.features && selectedZone.features.length > 0 && (
                <div>
                  <span className="text-dark-400 text-sm">Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedZone.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-dark-700 rounded text-xs text-white capitalize">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="btn-touch btn-primary flex-1"
                disabled={selectedZone.locked || !currentCharacter}
                onClick={() => handleTravel(selectedZone)}
              >
                {selectedZone.locked ? 'Locked' : 'Travel'}
              </button>
              <button 
                className="btn-touch btn-secondary"
                onClick={() => setSelectedZone(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}