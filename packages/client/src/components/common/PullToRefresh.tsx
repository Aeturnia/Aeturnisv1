import { useState, useRef, ReactNode, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)

  const { hapticFeedback } = useTouch({
    onPullToRefresh: async () => {
      if (!disabled && !isRefreshing) {
        await handleRefresh()
      }
    }
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    hapticFeedback('medium')
    
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      if (disabled || isRefreshing) return
      
      const scrollTop = container.scrollTop
      if (scrollTop > 0) return // Only allow pull when at top
      
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return
      
      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current
      
      if (diff > 0) {
        e.preventDefault() // Prevent scroll bounce
        const distance = Math.min(diff * 0.5, threshold * 1.5) // Add resistance
        setPullDistance(distance)
        
        // Haptic feedback at threshold
        if (distance >= threshold && pullDistance < threshold) {
          hapticFeedback('light')
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return
      
      setIsPulling(false)
      
      if (pullDistance >= threshold && !isRefreshing && !disabled) {
        await handleRefresh()
      } else {
        setPullDistance(0)
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, threshold, disabled, isRefreshing, hapticFeedback])

  const getIndicatorText = () => {
    if (isRefreshing) return 'Refreshing...'
    if (pullDistance >= threshold) return 'Release to refresh'
    if (pullDistance > 20) return 'Pull to refresh'
    return ''
  }

  const indicatorOpacity = Math.min(pullDistance / threshold, 1)
  const indicatorRotation = pullDistance >= threshold ? 180 : (pullDistance / threshold) * 180

  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh-container relative overflow-auto ${className}`}
      style={{ height: '100%', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-10"
        style={{
          height: `${pullDistance}px`,
          opacity: indicatorOpacity,
          transition: isPulling ? 'none' : 'all 0.3s ease-out'
        }}
      >
        <div className="text-center">
          <div
            className="text-2xl mb-1"
            style={{
              transform: `rotate(${indicatorRotation}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {isRefreshing ? '⚡' : '↓'}
          </div>
          <div className="text-sm text-dark-400">
            {getIndicatorText()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Example usage
export function RefreshableContent() {
  const [data, setData] = useState<string[]>([
    'Item 1',
    'Item 2',
    'Item 3'
  ])

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Add new data
    setData(prev => [
      `New Item ${Date.now()}`,
      ...prev
    ])
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-screen bg-dark-900">
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-4">Pull down to refresh</h2>
        {data.map((item, index) => (
          <div
            key={index}
            className="p-3 mb-2 bg-dark-800 rounded-lg text-white"
          >
            {item}
          </div>
        ))}
      </div>
    </PullToRefresh>
  )
}