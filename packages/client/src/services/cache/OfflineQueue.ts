export interface OfflineOperation {
  id: string;
  method: string;
  endpoint: string;
  data?: any;
  options?: any;
  timestamp: number;
  retryCount?: number;
  maxRetries?: number;
}

export interface OfflineQueueConfig {
  storage: 'memory' | 'localStorage' | 'indexeddb';
  maxSize?: number;
  maxRetries?: number;
  ttl?: number; // Time to live in milliseconds
}

export class OfflineQueue {
  private config: OfflineQueueConfig;
  private queue: Map<string, OfflineOperation> = new Map();
  private storageKey = 'offline-queue';

  constructor(config: OfflineQueueConfig) {
    this.config = {
      maxSize: 1000,
      maxRetries: 3,
      ttl: 24 * 60 * 60 * 1000, // 24 hours default
      ...config
    };
    
    this.loadFromStorage();
  }

  public async add(operation: Omit<OfflineOperation, 'id'>): Promise<string> {
    const id = this.generateId();
    const fullOperation: OfflineOperation = {
      ...operation,
      id,
      retryCount: 0,
      maxRetries: this.config.maxRetries
    };

    // Check size limit
    if (this.queue.size >= this.config.maxSize!) {
      // Remove oldest operations
      const oldest = Array.from(this.queue.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, Math.floor(this.config.maxSize! * 0.1));
      
      oldest.forEach(op => this.queue.delete(op.id));
    }

    this.queue.set(id, fullOperation);
    await this.saveToStorage();
    
    return id;
  }

  public async remove(id: string): Promise<void> {
    this.queue.delete(id);
    await this.saveToStorage();
  }

  public async get(id: string): Promise<OfflineOperation | undefined> {
    return this.queue.get(id);
  }

  public async getAll(): Promise<OfflineOperation[]> {
    // Remove expired operations
    const now = Date.now();
    const expired: string[] = [];
    
    for (const [id, operation] of this.queue) {
      if (now - operation.timestamp > this.config.ttl!) {
        expired.push(id);
      }
    }
    
    expired.forEach(id => this.queue.delete(id));
    
    if (expired.length > 0) {
      await this.saveToStorage();
    }
    
    return Array.from(this.queue.values());
  }

  public async process(): Promise<ProcessResult> {
    const operations = await this.getAll();
    const results: ProcessResult = {
      successful: [],
      failed: [],
      retrying: []
    };

    for (const operation of operations) {
      try {
        // This would be processed by the actual API client
        // For now, we just mark it as needing processing
        operation.retryCount = (operation.retryCount || 0) + 1;
        
        if (operation.retryCount >= operation.maxRetries!) {
          results.failed.push(operation);
          await this.remove(operation.id);
        } else {
          results.retrying.push(operation);
        }
      } catch (error) {
        console.error('Failed to process offline operation:', error);
        results.failed.push(operation);
      }
    }

    return results;
  }

  public async clear(): Promise<void> {
    this.queue.clear();
    await this.saveToStorage();
  }

  public size(): number {
    return this.queue.size;
  }

  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadFromStorage(): Promise<void> {
    if (this.config.storage === 'memory') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const operations: OfflineOperation[] = JSON.parse(stored);
        operations.forEach(op => this.queue.set(op.id, op));
      }
    } catch (error) {
      console.error('Failed to load offline queue from storage:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (this.config.storage === 'memory') return;

    try {
      const operations = Array.from(this.queue.values());
      localStorage.setItem(this.storageKey, JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to save offline queue to storage:', error);
    }
  }
}

export interface ProcessResult {
  successful: OfflineOperation[];
  failed: OfflineOperation[];
  retrying: OfflineOperation[];
}