export interface DevicePreset {
  name: string
  category: 'phone' | 'tablet' | 'desktop'
  width: number
  height: number
  deviceScaleFactor: number
  userAgent: string
  hasTouch: boolean
  isLandscape?: boolean
}

export const devicePresets: DevicePreset[] = [
  // iPhones
  {
    name: 'iPhone 14 Pro',
    category: 'phone',
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },
  {
    name: 'iPhone 14 Pro Max',
    category: 'phone',
    width: 430,
    height: 932,
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },
  {
    name: 'iPhone 13 mini',
    category: 'phone',
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },
  {
    name: 'iPhone SE',
    category: 'phone',
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },

  // Android Phones
  {
    name: 'Samsung Galaxy S23',
    category: 'phone',
    width: 360,
    height: 780,
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    hasTouch: true
  },
  {
    name: 'Google Pixel 7',
    category: 'phone',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    hasTouch: true
  },
  {
    name: 'OnePlus 11',
    category: 'phone',
    width: 412,
    height: 919,
    deviceScaleFactor: 3.5,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    hasTouch: true
  },

  // Tablets
  {
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    width: 1024,
    height: 1366,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },
  {
    name: 'iPad Air',
    category: 'tablet',
    width: 820,
    height: 1180,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },
  {
    name: 'iPad mini',
    category: 'tablet',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true
  },
  {
    name: 'Samsung Galaxy Tab S8',
    category: 'tablet',
    width: 800,
    height: 1280,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    hasTouch: true
  },

  // Desktop
  {
    name: 'Desktop HD',
    category: 'desktop',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    hasTouch: false
  },
  {
    name: 'Desktop 4K',
    category: 'desktop',
    width: 3840,
    height: 2160,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    hasTouch: false
  }
]

// Helper functions for device emulation
export function getDevicePreset(name: string): DevicePreset | undefined {
  return devicePresets.find(device => device.name === name)
}

export function getDevicesByCategory(category: 'phone' | 'tablet' | 'desktop'): DevicePreset[] {
  return devicePresets.filter(device => device.category === category)
}

export function applyDevicePreset(preset: DevicePreset) {
  // This would be used in development to emulate device
  if (typeof window !== 'undefined') {
    // Set viewport size (for development tools)
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 
        `width=${preset.width}, initial-scale=1, maximum-scale=1, user-scalable=no`
      )
    }

    // Override user agent (note: this doesn't actually change the user agent)
    Object.defineProperty(navigator, 'userAgent', {
      get: () => preset.userAgent,
      configurable: true
    })

    // Set touch capability
    Object.defineProperty(navigator, 'maxTouchPoints', {
      get: () => preset.hasTouch ? 5 : 0,
      configurable: true
    })

    // Emit custom event for device change
    window.dispatchEvent(new CustomEvent('devicepresetchange', { 
      detail: preset 
    }))
  }
}

// React hook for device emulation
import { useState, useEffect } from 'react'

export function useDeviceEmulation() {
  const [currentDevice, setCurrentDevice] = useState<DevicePreset | null>(null)
  const [isEmulating, setIsEmulating] = useState(false)

  useEffect(() => {
    // Only enable in development
    if (process.env.NODE_ENV !== 'development') return

    const handleDeviceChange = (e: CustomEvent) => {
      setCurrentDevice(e.detail)
      setIsEmulating(true)
    }

    window.addEventListener('devicepresetchange', handleDeviceChange as EventListener)
    return () => {
      window.removeEventListener('devicepresetchange', handleDeviceChange as EventListener)
    }
  }, [])

  const emulateDevice = (deviceName: string) => {
    const preset = getDevicePreset(deviceName)
    if (preset) {
      applyDevicePreset(preset)
      setCurrentDevice(preset)
      setIsEmulating(true)
    }
  }

  const stopEmulation = () => {
    // Reset to actual device
    if (typeof window !== 'undefined') {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        )
      }
    }
    setCurrentDevice(null)
    setIsEmulating(false)
  }

  return {
    currentDevice,
    isEmulating,
    emulateDevice,
    stopEmulation,
    devicePresets
  }
}