import { useState, useEffect, useRef } from 'react'

interface TouchPoint {
  id: number
  x: number
  y: number
  force: number
  timestamp: number
  type: 'start' | 'move' | 'end'
}

interface TouchDebugOverlayProps {
  enabled?: boolean
  showCoordinates?: boolean
  showGestures?: boolean
  showVelocity?: boolean
  persistTime?: number
}

export function TouchDebugOverlay({
  enabled = true,
  showCoordinates = true,
  showGestures = true,
  showVelocity = true,
  persistTime = 1000
}: TouchDebugOverlayProps) {
  const [touches, setTouches] = useState<Map<number, TouchPoint>>(new Map())
  const [touchHistory, setTouchHistory] = useState<TouchPoint[]>([])
  const [gesture, setGesture] = useState<string>('')
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const lastTouchRef = useRef<Map<number, TouchPoint>>(new Map())
  const gestureTimeoutRef = useRef<number>()

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      const newTouches = new Map(touches)
      
      Array.from(e.touches).forEach(touch => {
        const point: TouchPoint = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          force: touch.force || 0,
          timestamp: Date.now(),
          type: 'start'
        }
        
        newTouches.set(touch.identifier, point)
        lastTouchRef.current.set(touch.identifier, point)
        
        setTouchHistory(prev => [...prev, point].slice(-50))
      })
      
      setTouches(newTouches)
      detectGesture(e.touches.length, 'start')
    }

    const handleTouchMove = (e: TouchEvent) => {
      const newTouches = new Map(touches)
      
      Array.from(e.touches).forEach(touch => {
        const lastTouch = lastTouchRef.current.get(touch.identifier)
        const currentTime = Date.now()
        
        if (lastTouch) {
          const deltaTime = currentTime - lastTouch.timestamp
          const deltaX = touch.clientX - lastTouch.x
          const deltaY = touch.clientY - lastTouch.y
          
          if (deltaTime > 0) {
            setVelocity({
              x: (deltaX / deltaTime) * 1000,
              y: (deltaY / deltaTime) * 1000
            })
          }
        }
        
        const point: TouchPoint = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          force: touch.force || 0,
          timestamp: currentTime,
          type: 'move'
        }
        
        newTouches.set(touch.identifier, point)
        lastTouchRef.current.set(touch.identifier, point)
        
        setTouchHistory(prev => [...prev, point].slice(-50))
      })
      
      setTouches(newTouches)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const newTouches = new Map(touches)
      
      Array.from(e.changedTouches).forEach(touch => {
        const point: TouchPoint = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          force: 0,
          timestamp: Date.now(),
          type: 'end'
        }
        
        setTouchHistory(prev => [...prev, point].slice(-50))
        
        // Keep the end point visible for a bit
        setTimeout(() => {
          setTouches(prev => {
            const updated = new Map(prev)
            updated.delete(touch.identifier)
            return updated
          })
          lastTouchRef.current.delete(touch.identifier)
        }, persistTime)
      })
      
      detectGesture(e.touches.length, 'end')
    }

    const detectGesture = (touchCount: number, phase: 'start' | 'end') => {
      if (!showGestures) return
      
      let gestureText = ''
      
      if (touchCount === 1) {
        gestureText = phase === 'start' ? 'Single Touch' : 'Touch End'
      } else if (touchCount === 2) {
        gestureText = 'Two Finger Touch (Pinch/Zoom)'
      } else if (touchCount === 3) {
        gestureText = 'Three Finger Touch'
      } else if (touchCount > 3) {
        gestureText = `${touchCount} Finger Touch`
      }
      
      setGesture(gestureText)
      
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current)
      }
      
      gestureTimeoutRef.current = window.setTimeout(() => {
        setGesture('')
      }, 2000)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current)
      }
    }
  }, [enabled, touches, showGestures, persistTime])

  if (!enabled) return null

  return (
    <div className="touch-debug-overlay fixed inset-0 pointer-events-none z-[9999]">
      {/* Touch points */}
      {Array.from(touches.values()).map(touch => (
        <div
          key={touch.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: touch.x, top: touch.y }}
        >
          {/* Touch circle */}
          <div
            className={`
              w-16 h-16 rounded-full border-4 
              ${touch.type === 'start' ? 'border-green-500 bg-green-500' : 
                touch.type === 'move' ? 'border-blue-500 bg-blue-500' : 
                'border-red-500 bg-red-500'}
              bg-opacity-20
            `}
            style={{
              transform: `scale(${1 + touch.force * 0.5})`
            }}
          >
            <div className="text-white text-xs font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {touch.id}
            </div>
          </div>
          
          {/* Coordinates */}
          {showCoordinates && (
            <div className="absolute top-full mt-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded whitespace-nowrap">
              {Math.round(touch.x)}, {Math.round(touch.y)}
              {touch.force > 0 && ` (${touch.force.toFixed(2)})`}
            </div>
          )}
        </div>
      ))}

      {/* Touch trail */}
      <svg className="absolute inset-0 w-full h-full">
        {touchHistory.length > 1 && touchHistory.map((point, index) => {
          if (index === 0) return null
          const prevPoint = touchHistory[index - 1]
          if (prevPoint.id !== point.id) return null
          
          const opacity = (index / touchHistory.length) * 0.5
          
          return (
            <line
              key={`${point.id}-${index}`}
              x1={prevPoint.x}
              y1={prevPoint.y}
              x2={point.x}
              y2={point.y}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeOpacity={opacity}
            />
          )
        })}
      </svg>

      {/* Debug info panel */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm font-mono">
        <div className="mb-2 font-bold text-green-400">Touch Debug</div>
        <div>Active Touches: {touches.size}</div>
        
        {showGestures && gesture && (
          <div className="mt-2 text-yellow-400">{gesture}</div>
        )}
        
        {showVelocity && (velocity.x !== 0 || velocity.y !== 0) && (
          <div className="mt-2">
            <div>Velocity X: {velocity.x.toFixed(0)} px/s</div>
            <div>Velocity Y: {velocity.y.toFixed(0)} px/s</div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-400">
          Press and drag to see touch events
        </div>
      </div>
    </div>
  )
}

// Development-only wrapper
export function DevTouchDebugger() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Enable with keyboard shortcut (Ctrl+Shift+T)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setEnabled(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      <TouchDebugOverlay enabled={enabled} />
      
      {/* Toggle button for mobile */}
      <button
        onClick={() => setEnabled(prev => !prev)}
        className={`
          fixed bottom-20 right-4 z-[9998] p-3 rounded-full shadow-lg
          ${enabled ? 'bg-green-500' : 'bg-gray-700'}
          text-white transition-colors
        `}
        aria-label="Toggle touch debug"
      >
        {enabled ? '🐛' : '👆'}
      </button>
    </>
  )
}