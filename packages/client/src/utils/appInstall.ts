interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

class AppInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private isInstalled = false
  private installPromptShown = false

  constructor() {
    this.init()
  }

  private init() {
    // Check if app is already installed
    this.checkIfInstalled()

    // Listen for install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('appinstallpromptready'))
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.deferredPrompt = null
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('appinstalled'))
    })

    // Check if launched from home screen
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true
    }
  }

  // Check if app is installed
  private checkIfInstalled() {
    // Check various conditions
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = 'standalone' in (navigator as any) && (navigator as any).standalone
    
    this.isInstalled = isStandalone || isIosStandalone
  }

  // Show install prompt
  async showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'not-available'> {
    if (!this.deferredPrompt) {
      return 'not-available'
    }

    // Show the prompt
    this.deferredPrompt.prompt()
    this.installPromptShown = true

    // Wait for user choice
    const { outcome } = await this.deferredPrompt.userChoice
    
    // Clear the deferred prompt
    this.deferredPrompt = null

    return outcome
  }

  // Check if install prompt is available
  isPromptAvailable(): boolean {
    return this.deferredPrompt !== null
  }

  // Check if app is installable
  isInstallable(): boolean {
    return !this.isInstalled && this.isPromptAvailable()
  }

  // Get install state
  getInstallState(): 'installed' | 'installable' | 'not-installable' {
    if (this.isInstalled) return 'installed'
    if (this.isPromptAvailable()) return 'installable'
    return 'not-installable'
  }

  // Get platform-specific install instructions
  getInstallInstructions(): string {
    const ua = navigator.userAgent.toLowerCase()
    
    if (/iphone|ipad|ipod/.test(ua)) {
      return 'Tap the share button and select "Add to Home Screen"'
    } else if (/android/.test(ua)) {
      if (/chrome/.test(ua)) {
        return 'Tap the menu button and select "Add to Home screen"'
      } else if (/firefox/.test(ua)) {
        return 'Tap the menu button and select "Add to Home Screen"'
      }
    }
    
    return 'Look for the "Install" option in your browser menu'
  }
}

// Create singleton instance
export const appInstall = new AppInstallManager()

// React hook for app installation
import { useState, useEffect, useCallback } from 'react'

export function useAppInstall() {
  const [installState, setInstallState] = useState<'installed' | 'installable' | 'not-installable'>('not-installable')
  const [isPromptReady, setIsPromptReady] = useState(false)

  useEffect(() => {
    // Set initial state
    setInstallState(appInstall.getInstallState())
    setIsPromptReady(appInstall.isPromptAvailable())

    // Listen for events
    const handlePromptReady = () => {
      setIsPromptReady(true)
      setInstallState('installable')
    }

    const handleAppInstalled = () => {
      setInstallState('installed')
      setIsPromptReady(false)
    }

    window.addEventListener('appinstallpromptready', handlePromptReady)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstallpromptready', handlePromptReady)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    const result = await appInstall.showInstallPrompt()
    
    if (result === 'accepted') {
      setInstallState('installed')
    }
    
    return result
  }, [])

  const getInstructions = useCallback(() => {
    return appInstall.getInstallInstructions()
  }, [])

  return {
    installState,
    isPromptReady,
    promptInstall,
    getInstructions
  }
}