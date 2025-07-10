import { useState, useEffect } from 'react'

export interface MapPosition {
  x: number
  y: number
}

export interface MapMarker {
  id: string
  name: string
  position: MapPosition
  type: 'player' | 'npc' | 'monster' | 'poi' | 'exit' | 'quest'
  icon?: string
  color?: string
  isVisible?: boolean
}

export interface ZoneInfo {
  id: string
  name: string
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

interface MiniMapProps {
  playerPosition: MapPosition
  zone: ZoneInfo
  markers?: MapMarker[]
  size?: number
  zoom?: number
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onMarkerClick?: (marker: MapMarker) => void
  className?: string
}

const markerStyles: Record<string, string> = {
  player: 'bg-blue-500 border-blue-300',
  npc: 'bg-green-500 border-green-300',
  monster: 'bg-red-500 border-red-300',
  poi: 'bg-yellow-500 border-yellow-300',
  exit: 'bg-purple-500 border-purple-300',
  quest: 'bg-orange-500 border-orange-300'
}

const markerIcons: Record<string, string> = {
  player: '🔵',
  npc: '🟢',
  monster: '🔴',
  poi: '⭐',
  exit: '🚪',
  quest: '❗'
}

export function MiniMap({
  playerPosition,
  zone,
  markers = [],
  size = 150,
  zoom = 1,
  isCollapsed = false,
  onToggleCollapse,
  onMarkerClick,
  className = ''
}: MiniMapProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Convert world coordinates to map coordinates
  const worldToMap = (worldPos: MapPosition): MapPosition => {
    const { bounds } = zone
    const worldWidth = bounds.maxX - bounds.minX
    const worldHeight = bounds.maxY - bounds.minY
    
    const mapX = ((worldPos.x - bounds.minX) / worldWidth) * size
    const mapY = ((worldPos.y - bounds.minY) / worldHeight) * size
    
    return { x: mapX, y: mapY }
  }

  const visibleMarkers = markers.filter(marker => marker.isVisible !== false)

  if (isCollapsed) {
    return (
      <div className={`bg-dark-800 border border-dark-700 rounded-lg p-2 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-white hover:text-amber-400 transition-colors"
        >
          <span className="text-sm font-medium">Map</span>
          <span className="text-lg">🗺️</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className={`
        relative bg-dark-800 border border-dark-700 rounded-lg overflow-hidden
        transition-all duration-300
        ${isHovered ? 'shadow-lg shadow-amber-400/20' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="bg-dark-700 p-2 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white truncate">
            {zone.name}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {Math.round(playerPosition.x)}, {Math.round(playerPosition.y)}
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ▲
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="p-2">
        <div
          className="relative bg-dark-600 border border-dark-500 rounded overflow-hidden"
          style={{ width: size, height: size }}
        >
          {/* Grid Background */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Zone Bounds Indicator */}
          <div className="absolute inset-1 border border-gray-500 rounded opacity-30" />

          {/* Markers */}
          {visibleMarkers.map((marker) => {
            const mapPos = worldToMap(marker.position)
            const style = markerStyles[marker.type] || 'bg-gray-500 border-gray-300'
            
            return (
              <div
                key={marker.id}
                className={`
                  absolute w-3 h-3 rounded-full border-2 cursor-pointer
                  transform -translate-x-1/2 -translate-y-1/2
                  transition-all duration-200 hover:scale-125
                  ${style}
                `}
                style={{
                  left: `${mapPos.x}px`,
                  top: `${mapPos.y}px`,
                  backgroundColor: marker.color
                }}
                onClick={() => onMarkerClick?.(marker)}
                title={marker.name}
              >
                {/* Marker Icon */}
                {marker.icon && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs">
                    {marker.icon}
                  </div>
                )}
              </div>
            )
          })}

          {/* Player Position */}
          {(() => {
            const playerMapPos = worldToMap(playerPosition)
            return (
              <div
                className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${playerMapPos.x}px`,
                  top: `${playerMapPos.y}px`
                }}
              >
                {/* Player Dot */}
                <div className="w-full h-full bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
                
                {/* Player Direction Indicator */}
                <div className="absolute -top-1 left-1/2 w-0 h-0 transform -translate-x-1/2 border-l-2 border-r-2 border-b-4 border-transparent border-b-blue-300" />
              </div>
            )
          })()}

          {/* Zoom Level Indicator */}
          {zoom !== 1 && (
            <div className="absolute top-1 right-1 bg-dark-700 text-white text-xs px-1 py-0.5 rounded">
              {zoom.toFixed(1)}x
            </div>
          )}
        </div>

        {/* Legend */}
        {isHovered && visibleMarkers.length > 0 && (
          <div className="mt-2 text-xs">
            <div className="text-gray-400 mb-1">Legend:</div>
            <div className="grid grid-cols-2 gap-1">
              {Array.from(new Set(visibleMarkers.map(m => m.type))).map(type => (
                <div key={type} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full border ${markerStyles[type] || 'bg-gray-500'}`} />
                  <span className="text-gray-300 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}