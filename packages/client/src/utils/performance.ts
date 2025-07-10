/**
 * Performance monitoring and optimization utilities for mobile
 */

// Performance metrics tracking
interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkSpeed: 'slow' | 'fast' | 'offline'
  batteryLevel?: number
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkSpeed: 'fast',
    deviceType: 'mobile'
  }

  constructor() {
    this.detectDeviceType()
    this.monitorNetworkSpeed()
    this.trackBatteryLevel()
  }

  // Track page load performance
  trackLoadTime(): void {
    if ('performance' in window) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      this.metrics.loadTime = loadTime
      console.log(`Page load time: ${loadTime}ms`)
    }
  }

  // Monitor render performance
  trackRenderTime(componentName: string, startTime: number): void {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    this.metrics.renderTime = renderTime
    
    // Log slow renders (>16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }
  }

  // Monitor memory usage
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1048576 // Convert to MB
      
      // Warn if memory usage is high
      if (this.metrics.memoryUsage > 50) {
        console.warn(`High memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB`)
      }
    }
  }

  // Detect device type
  private detectDeviceType(): void {
    const width = window.innerWidth
    if (width < 768) {
      this.metrics.deviceType = 'mobile'
    } else if (width < 1024) {
      this.metrics.deviceType = 'tablet'
    } else {
      this.metrics.deviceType = 'desktop'
    }
  }

  // Monitor network speed
  private monitorNetworkSpeed(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection.effectiveType
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        this.metrics.networkSpeed = 'slow'
      } else {
        this.metrics.networkSpeed = 'fast'
      }
      
      // Listen for network changes
      connection.addEventListener('change', () => {
        this.monitorNetworkSpeed()
      })
    }
  }

  // Track battery level
  private trackBatteryLevel(): void {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.metrics.batteryLevel = battery.level * 100
        
        battery.addEventListener('levelchange', () => {
          this.metrics.batteryLevel = battery.level * 100
        })
      })
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    this.trackMemoryUsage()
    return { ...this.metrics }
  }

  // Performance optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.metrics.networkSpeed === 'slow') {
      recommendations.push('Enable low bandwidth mode')
      recommendations.push('Reduce image quality')
      recommendations.push('Cache critical resources')
    }
    
    if (this.metrics.memoryUsage > 50) {
      recommendations.push('Clear cache')
      recommendations.push('Reduce concurrent animations')
    }
    
    if (this.metrics.batteryLevel && this.metrics.batteryLevel < 20) {
      recommendations.push('Enable power saving mode')
      recommendations.push('Reduce animation frequency')
    }
    
    if (this.metrics.deviceType === 'mobile') {
      recommendations.push('Use touch-optimized UI')
      recommendations.push('Enable haptic feedback')
    }
    
    return recommendations
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
    }
    
    updateMetrics()
    const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    metrics,
    recommendations: metrics ? performanceMonitor.getOptimizationRecommendations() : []
  }
}

// Performance-aware component wrapper
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const startTime = performance.now()
    
    useEffect(() => {
      performanceMonitor.trackRenderTime(componentName, startTime)
    })
    
    return <Component {...props} />
  }
}

import { useState, useEffect } from 'react'