interface PerformanceMark {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

class PerformanceProfiler {
  private marks: Map<string, PerformanceMark> = new Map()
  private memorySnapshots: MemorySnapshot[] = []
  private rafCallbacks: Map<string, number> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  // Start a performance mark
  start(name: string, metadata?: Record<string, any>) {
    const mark: PerformanceMark = {
      name,
      startTime: performance.now(),
      metadata
    }
    
    this.marks.set(name, mark)
    performance.mark(`${name}-start`)
  }

  // End a performance mark and calculate duration
  end(name: string): number | null {
    const mark = this.marks.get(name)
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`)
      return null
    }

    mark.endTime = performance.now()
    mark.duration = mark.endTime - mark.startTime
    
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    return mark.duration
  }

  // Measure component render time
  measureRender(componentName: string, callback: () => void) {
    this.start(`render-${componentName}`)
    
    requestAnimationFrame(() => {
      callback()
      requestAnimationFrame(() => {
        const duration = this.end(`render-${componentName}`)
        if (duration && duration > 16.67) { // More than one frame
          console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
        }
      })
    })
  }

  // Monitor frame rate
  startFPSMonitor(callback: (fps: number) => void) {
    let lastTime = performance.now()
    let frames = 0
    let fps = 0

    const measureFPS = () => {
      frames++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime))
        frames = 0
        lastTime = currentTime
        callback(fps)
      }
      
      this.rafCallbacks.set('fps', requestAnimationFrame(measureFPS))
    }

    measureFPS()
  }

  stopFPSMonitor() {
    const rafId = this.rafCallbacks.get('fps')
    if (rafId) {
      cancelAnimationFrame(rafId)
      this.rafCallbacks.delete('fps')
    }
  }

  // Memory monitoring
  captureMemorySnapshot(): MemorySnapshot | null {
    if (!performance.memory) {
      console.warn('Performance.memory API not available')
      return null
    }

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
    }

    this.memorySnapshots.push(snapshot)
    
    // Keep only last 100 snapshots
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots.shift()
    }

    return snapshot
  }

  // Monitor memory usage over time
  startMemoryMonitor(intervalMs: number = 1000, callback?: (snapshot: MemorySnapshot) => void) {
    const monitorId = setInterval(() => {
      const snapshot = this.captureMemorySnapshot()
      if (snapshot && callback) {
        callback(snapshot)
      }
    }, intervalMs)

    return () => clearInterval(monitorId)
  }

  // Long task detection
  startLongTaskDetection(threshold: number = 50) {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported')
      return
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > threshold) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, {
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration
            })
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
      this.observers.set('longtask', observer)
    } catch (e) {
      console.warn('Long task observation not supported')
    }
  }

  // Layout shift detection
  startLayoutShiftDetection() {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            console.warn(`Layout shift detected: ${(entry as any).value.toFixed(4)}`, {
              sources: (entry as any).sources,
              value: (entry as any).value,
              cumulativeValue: clsValue
            })
          }
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('layout-shift', observer)
    } catch (e) {
      console.warn('Layout shift observation not supported')
    }
  }

  // Generate performance report
  generateReport(): string {
    const report: string[] = [
      '=== Performance Report ===',
      '',
      '📊 Performance Marks:',
    ]

    // Sort marks by duration
    const sortedMarks = Array.from(this.marks.values())
      .filter(mark => mark.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))

    sortedMarks.forEach(mark => {
      report.push(`  ${mark.name}: ${mark.duration?.toFixed(2)}ms`)
    })

    // Memory stats
    if (this.memorySnapshots.length > 0) {
      const latest = this.memorySnapshots[this.memorySnapshots.length - 1]
      const heapUsage = (latest.usedJSHeapSize / 1024 / 1024).toFixed(2)
      const heapTotal = (latest.totalJSHeapSize / 1024 / 1024).toFixed(2)
      
      report.push('')
      report.push('💾 Memory Usage:')
      report.push(`  Heap: ${heapUsage}MB / ${heapTotal}MB`)
    }

    // Navigation timing
    if (performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navEntries.length > 0) {
        const nav = navEntries[0]
        report.push('')
        report.push('🚀 Page Load Metrics:')
        report.push(`  DOM Content Loaded: ${(nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart).toFixed(2)}ms`)
        report.push(`  Load Complete: ${(nav.loadEventEnd - nav.loadEventStart).toFixed(2)}ms`)
        report.push(`  Time to Interactive: ${(nav.domInteractive - nav.fetchStart).toFixed(2)}ms`)
      }
    }

    report.push('')
    report.push('=========================')

    return report.join('\n')
  }

  // Clean up
  cleanup() {
    this.marks.clear()
    this.memorySnapshots = []
    
    // Cancel RAF callbacks
    this.rafCallbacks.forEach(id => cancelAnimationFrame(id))
    this.rafCallbacks.clear()
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Create singleton instance
export const profiler = new PerformanceProfiler()

// React hook for performance profiling
import { useEffect, useRef } from 'react'

export function usePerformanceProfiler(componentName: string) {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current++
    
    // Profile initial mount
    if (renderCount.current === 1) {
      profiler.start(`mount-${componentName}`)
      
      return () => {
        const duration = profiler.end(`mount-${componentName}`)
        if (duration && duration > 100) {
          console.warn(`Slow mount: ${componentName} took ${duration.toFixed(2)}ms`)
        }
      }
    }
    
    // Profile re-renders
    profiler.start(`render-${componentName}-${renderCount.current}`)
    
    requestAnimationFrame(() => {
      const duration = profiler.end(`render-${componentName}-${renderCount.current}`)
      if (duration && duration > 16.67) {
        console.warn(`Slow re-render #${renderCount.current}: ${componentName} took ${duration?.toFixed(2)}ms`)
      }
    })
  })

  return {
    renderCount: renderCount.current,
    measureAction: (actionName: string, action: () => void | Promise<void>) => {
      profiler.start(`${componentName}-${actionName}`)
      
      const result = action()
      
      if (result instanceof Promise) {
        result.finally(() => {
          profiler.end(`${componentName}-${actionName}`)
        })
      } else {
        profiler.end(`${componentName}-${actionName}`)
      }
      
      return result
    }
  }
}

// Development-only auto profiler
if (process.env.NODE_ENV === 'development') {
  // Auto-start monitoring
  profiler.startLongTaskDetection()
  profiler.startLayoutShiftDetection()
  
  // Expose to window for debugging
  (window as any).__profiler = profiler
  
  // Log report on page unload
  window.addEventListener('beforeunload', () => {
    console.log(profiler.generateReport())
  })
}