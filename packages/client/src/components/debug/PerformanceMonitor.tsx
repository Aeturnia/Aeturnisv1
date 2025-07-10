import { useState, useEffect } from 'react'
import { profiler } from '../../utils/performanceProfiler'

interface PerformanceStats {
  fps: number
  memory: {
    used: number
    total: number
    limit: number
  }
  renderTime: number
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    memory: { used: 0, total: 0, limit: 0 },
    renderTime: 0
  })

  useEffect(() => {
    if (!isVisible) return

    // Start FPS monitoring
    const stopFPS = profiler.startFPSMonitor((fps) => {
      setStats(prev => ({ ...prev, fps }))
    })

    // Start memory monitoring
    const stopMemory = profiler.startMemoryMonitor(1000, (snapshot) => {
      setStats(prev => ({
        ...prev,
        memory: {
          used: snapshot.usedJSHeapSize / 1024 / 1024,
          total: snapshot.totalJSHeapSize / 1024 / 1024,
          limit: snapshot.jsHeapSizeLimit / 1024 / 1024
        }
      }))
    })

    return () => {
      stopFPS()
      stopMemory()
    }
  }, [isVisible])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const fpsColor = stats.fps >= 55 ? 'text-green-400' : 
                   stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
  
  const memoryPercent = (stats.memory.used / stats.memory.total) * 100
  const memoryColor = memoryPercent < 70 ? 'text-green-400' :
                      memoryPercent < 90 ? 'text-yellow-400' : 'text-red-400'

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          fixed top-4 right-4 z-[9998] p-2 rounded shadow-lg
          ${isVisible ? 'bg-green-500' : 'bg-gray-700'}
          text-white text-xs transition-colors
        `}
        aria-label="Toggle performance monitor"
      >
        📊
      </button>

      {/* Performance stats overlay */}
      {isVisible && (
        <div className="fixed top-16 right-4 z-[9997] bg-black bg-opacity-90 text-white p-3 rounded-lg font-mono text-xs min-w-[200px]">
          <div className="mb-2 font-bold text-green-400">Performance Monitor</div>
          
          {/* FPS */}
          <div className="flex justify-between mb-1">
            <span>FPS:</span>
            <span className={fpsColor}>{stats.fps}</span>
          </div>
          
          {/* Memory */}
          <div className="mb-1">
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className={memoryColor}>
                {stats.memory.used.toFixed(1)}MB
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  memoryPercent < 70 ? 'bg-green-500' :
                  memoryPercent < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${memoryPercent}%` }}
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-3 pt-2 border-t border-gray-700">
            <button
              onClick={() => {
                console.log(profiler.generateReport())
              }}
              className="text-blue-400 hover:text-blue-300 mr-3"
            >
              Log Report
            </button>
            <button
              onClick={() => {
                profiler.cleanup()
                profiler.startLongTaskDetection()
                profiler.startLayoutShiftDetection()
              }}
              className="text-yellow-400 hover:text-yellow-300"
            >
              Reset
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Ctrl+Shift+P to toggle
          </div>
        </div>
      )}
    </>
  )
}