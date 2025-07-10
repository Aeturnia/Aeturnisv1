interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

interface ShareTargetData {
  title?: string
  text?: string
  url?: string
  files?: FileList
}

class ShareManager {
  private canShare = false
  private canShareFiles = false

  constructor() {
    this.init()
  }

  private init() {
    // Check Web Share API support
    this.canShare = 'share' in navigator
    this.canShareFiles = this.canShare && 'canShare' in navigator

    // Handle incoming shares (when app is share target)
    this.handleIncomingShare()
  }

  // Handle incoming share data when app is opened as share target
  private handleIncomingShare() {
    // Check if page was opened with share target data
    const urlParams = new URLSearchParams(window.location.search)
    
    const title = urlParams.get('title')
    const text = urlParams.get('text')
    const url = urlParams.get('url')

    if (title || text || url) {
      const shareData: ShareTargetData = {
        title: title || undefined,
        text: text || undefined,
        url: url || undefined
      }

      // Dispatch custom event with share data
      window.dispatchEvent(new CustomEvent('sharetarget', {
        detail: shareData
      }))

      // Clear URL params to prevent re-processing
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  // Share content from the app
  async share(data: ShareData): Promise<boolean> {
    if (!this.canShare) {
      console.warn('Web Share API not supported')
      return false
    }

    try {
      // Check if we can share this data
      if (this.canShareFiles && data.files && !navigator.canShare({ files: data.files })) {
        console.warn('Cannot share files')
        return false
      }

      await navigator.share(data)
      return true
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled share
        return false
      }
      console.error('Share failed:', error)
      return false
    }
  }

  // Check if sharing is supported
  isSupported(): boolean {
    return this.canShare
  }

  // Check if file sharing is supported
  isFileSharingSupported(): boolean {
    return this.canShareFiles
  }

  // Generate shareable game content
  generateGameShare(type: 'achievement' | 'character' | 'item' | 'location', data: any): ShareData {
    switch (type) {
      case 'achievement':
        return {
          title: `Achievement Unlocked: ${data.name}`,
          text: `I just unlocked "${data.name}" in Aeturnis Online! ${data.description}`,
          url: `${window.location.origin}/achievements/${data.id}`
        }

      case 'character':
        return {
          title: `Check out my character in Aeturnis Online`,
          text: `${data.name} - Level ${data.level} ${data.class}. Join me in Aeturnis Online!`,
          url: `${window.location.origin}/character/${data.id}`
        }

      case 'item':
        return {
          title: `Rare item found: ${data.name}`,
          text: `I found a ${data.rarity} ${data.name} in Aeturnis Online! ${data.description}`,
          url: `${window.location.origin}/items/${data.id}`
        }

      case 'location':
        return {
          title: `Exploring ${data.name}`,
          text: `Currently exploring ${data.name} in Aeturnis Online. ${data.description}`,
          url: `${window.location.origin}/map/${data.id}`
        }

      default:
        return {
          title: 'Aeturnis Online',
          text: 'Join me in this epic MMORPG adventure!',
          url: window.location.origin
        }
    }
  }
}

// Create singleton instance
export const shareManager = new ShareManager()

// React hook for sharing
import { useState, useCallback, useEffect } from 'react'

export function useShare() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [incomingShare, setIncomingShare] = useState<ShareTargetData | null>(null)

  useEffect(() => {
    setIsSupported(shareManager.isSupported())

    // Listen for incoming shares
    const handleShareTarget = (event: CustomEvent) => {
      setIncomingShare(event.detail)
    }

    window.addEventListener('sharetarget', handleShareTarget as EventListener)
    return () => {
      window.removeEventListener('sharetarget', handleShareTarget as EventListener)
    }
  }, [])

  const share = useCallback(async (data: ShareData) => {
    setIsSharing(true)
    
    try {
      const success = await shareManager.share(data)
      return success
    } finally {
      setIsSharing(false)
    }
  }, [])

  const shareGame = useCallback(async (type: 'achievement' | 'character' | 'item' | 'location', data: any) => {
    const shareData = shareManager.generateGameShare(type, data)
    return share(shareData)
  }, [share])

  const clearIncomingShare = useCallback(() => {
    setIncomingShare(null)
  }, [])

  return {
    isSupported,
    isSharing,
    share,
    shareGame,
    incomingShare,
    clearIncomingShare
  }
}