/**
 * Offline functionality and data synchronization utilities
 */

// Offline storage interface
interface OfflineData {
  id: string
  type: string
  data: any
  timestamp: number
  synced: boolean
}

class OfflineManager {
  private dbName = 'aeturnis-offline'
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private isOnline = navigator.onLine
  private syncQueue: OfflineData[] = []

  constructor() {
    this.initDatabase()
    this.setupNetworkListeners()
  }

  // Initialize IndexedDB
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create stores for different data types
        if (!db.objectStoreNames.contains('gameData')) {
          const gameStore = db.createObjectStore('gameData', { keyPath: 'id' })
          gameStore.createIndex('type', 'type', { unique: false })
          gameStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('userActions')) {
          const actionStore = db.createObjectStore('userActions', { keyPath: 'id' })
          actionStore.createIndex('synced', 'synced', { unique: false })
        }
      }
    })
  }

  // Setup network event listeners
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncWhenOnline()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Store data offline
  async storeOffline(type: string, data: any): Promise<string> {
    if (!this.db) await this.initDatabase()
    
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameData'], 'readwrite')
      const store = transaction.objectStore('gameData')
      const request = store.add(offlineData)
      
      request.onsuccess = () => {
        this.syncQueue.push(offlineData)
        resolve(id)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Retrieve offline data
  async getOfflineData(type?: string): Promise<OfflineData[]> {
    if (!this.db) await this.initDatabase()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameData'], 'readonly')
      const store = transaction.objectStore('gameData')
      const request = type 
        ? store.index('type').getAll(type)
        : store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Store user action for later sync
  async storeUserAction(action: string, payload: any): Promise<void> {
    if (this.isOnline) {
      // If online, send immediately
      await this.sendToServer(action, payload)
    } else {
      // If offline, store for later sync
      await this.storeOffline('userAction', { action, payload })
    }
  }

  // Sync data when back online
  private async syncWhenOnline(): Promise<void> {
    if (!this.isOnline) return
    
    console.log('Back online, syncing data...')
    
    // Get all unsynced data
    const unsyncedData = await this.getUnsyncedData()
    
    for (const item of unsyncedData) {
      try {
        if (item.type === 'userAction') {
          await this.sendToServer(item.data.action, item.data.payload)
        }
        
        // Mark as synced
        await this.markAsSynced(item.id)
      } catch (error) {
        console.error('Failed to sync item:', item.id, error)
      }
    }
  }

  // Get unsynced data
  private async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) await this.initDatabase()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameData'], 'readonly')
      const store = transaction.objectStore('gameData')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const unsyncedItems = request.result.filter(item => !item.synced)
        resolve(unsyncedItems)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Mark item as synced
  private async markAsSynced(id: string): Promise<void> {
    if (!this.db) return
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameData'], 'readwrite')
      const store = transaction.objectStore('gameData')
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const data = getRequest.result
        if (data) {
          data.synced = true
          const putRequest = store.put(data)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Send data to server
  private async sendToServer(action: string, payload: any): Promise<void> {
    try {
      const response = await fetch('/api/v1/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload })
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send to server:', error)
      throw error
    }
  }

  // Clear old offline data
  async clearOldData(olderThanDays: number = 7): Promise<void> {
    if (!this.db) await this.initDatabase()
    
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000)
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameData'], 'readwrite')
      const store = transaction.objectStore('gameData')
      const index = store.index('timestamp')
      const range = IDBKeyRange.upperBound(cutoffTime)
      const request = index.openCursor(range)
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Get storage info
  async getStorageInfo(): Promise<{ used: number, quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      }
    }
    return { used: 0, quota: 0 }
  }

  // Check if offline
  isOffline(): boolean {
    return !this.isOnline
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager()

// React hook for offline functionality
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [syncQueue, setSyncQueue] = useState<number>(0)
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Update sync queue size periodically
    const updateSyncQueue = async () => {
      const unsyncedData = await offlineManager.getOfflineData()
      setSyncQueue(unsyncedData.filter(item => !item.synced).length)
    }
    
    updateSyncQueue()
    const interval = setInterval(updateSyncQueue, 10000) // Check every 10 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])
  
  return {
    isOffline,
    syncQueue,
    storeOffline: offlineManager.storeOffline.bind(offlineManager),
    storeUserAction: offlineManager.storeUserAction.bind(offlineManager)
  }
}