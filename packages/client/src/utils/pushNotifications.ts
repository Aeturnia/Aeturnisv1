interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private permission: NotificationPermission = 'default'

  // Initialize push notifications
  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready
      this.permission = Notification.permission

      // Set up message listener for notification clicks
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage)

      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (this.permission === 'granted') return 'granted'

    try {
      this.permission = await Notification.requestPermission()
      return this.permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  // Subscribe to push notifications
  async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init()
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission()
      if (permission !== 'granted') return null
    }

    try {
      const subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  // Get current subscription
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init()
    }

    try {
      return await this.registration!.pushManager.getSubscription()
    } catch (error) {
      console.error('Failed to get push subscription:', error)
      return null
    }
  }

  // Show local notification
  async showNotification(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    if (!this.registration) {
      await this.init()
    }

    try {
      await this.registration!.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-72x72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
        actions: options.actions,
        timestamp: Date.now(),
        vibrate: [200, 100, 200]
      })
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  // Handle service worker messages (for notification clicks)
  private handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data.type === 'notification-click') {
      const { action, data } = event.data

      // Emit custom event for the app to handle
      window.dispatchEvent(new CustomEvent('pushnotificationclick', {
        detail: { action, data }
      }))
    }
  }

  // Helper to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // Check if push notifications are supported
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission
  }
}

// Create singleton instance
export const pushNotifications = new PushNotificationManager()

// React hook for push notifications
import { useState, useEffect, useCallback } from 'react'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supported = PushNotificationManager.isSupported()
      setIsSupported(supported)

      if (supported) {
        await pushNotifications.init()
        setPermission(pushNotifications.getPermissionStatus())
        
        const sub = await pushNotifications.getSubscription()
        setSubscription(sub)
      }

      setIsLoading(false)
    }

    init()
  }, [])

  const requestPermission = useCallback(async () => {
    const perm = await pushNotifications.requestPermission()
    setPermission(perm)
    return perm
  }, [])

  const subscribe = useCallback(async (vapidPublicKey: string) => {
    setIsLoading(true)
    
    const sub = await pushNotifications.subscribe(vapidPublicKey)
    setSubscription(sub)
    setIsLoading(false)
    
    return sub
  }, [])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    
    const success = await pushNotifications.unsubscribe()
    if (success) {
      setSubscription(null)
    }
    
    setIsLoading(false)
    return success
  }, [])

  const sendTestNotification = useCallback(async () => {
    await pushNotifications.showNotification({
      title: 'Aeturnis Online',
      body: 'Test notification from the game!',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: 'test',
      data: { test: true },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }, [])

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}

// Game-specific notification types
export const gameNotifications = {
  // Send notification for new message
  async newMessage(from: string, message: string) {
    await pushNotifications.showNotification({
      title: `Message from ${from}`,
      body: message,
      tag: 'message',
      data: { type: 'message', from },
      requireInteraction: true,
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'view', title: 'View' }
      ]
    })
  },

  // Send notification for combat alert
  async combatAlert(enemyName: string) {
    await pushNotifications.showNotification({
      title: 'Combat Alert!',
      body: `You are being attacked by ${enemyName}!`,
      tag: 'combat',
      data: { type: 'combat', enemy: enemyName },
      requireInteraction: true,
      vibrate: [500, 100, 500]
    })
  },

  // Send notification for trade request
  async tradeRequest(playerName: string) {
    await pushNotifications.showNotification({
      title: 'Trade Request',
      body: `${playerName} wants to trade with you`,
      tag: 'trade',
      data: { type: 'trade', player: playerName },
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' }
      ]
    })
  },

  // Send notification for quest completion
  async questComplete(questName: string, reward: string) {
    await pushNotifications.showNotification({
      title: 'Quest Complete!',
      body: `${questName} completed! Reward: ${reward}`,
      tag: 'quest',
      data: { type: 'quest', questName, reward }
    })
  }
}