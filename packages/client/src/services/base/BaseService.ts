import { EventEmitter } from 'events';
import { ServiceError, NetworkError } from './ServiceError';

export interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cacheEnabled?: boolean;
  offlineEnabled?: boolean;
}

export interface ServiceResponse<T> {
  data: T;
  metadata?: {
    timestamp: number;
    cached: boolean;
    version?: string;
  };
}

export interface RetryableOperation {
  id: string;
  execute: () => Promise<any>;
  timestamp: number;
}

export interface RetryOptions {
  attempts?: number;
  delay?: number;
}

export abstract class BaseService extends EventEmitter {
  protected config: ServiceConfig;
  protected isOnline: boolean = navigator.onLine;
  protected retryQueue: Map<string, RetryableOperation> = new Map();

  constructor(config: ServiceConfig = {}) {
    super();
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      cacheEnabled: true,
      offlineEnabled: true,
      ...config
    };

    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('network:online');
      this.processRetryQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('network:offline');
    });
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const { attempts = this.config.retryAttempts!, delay = this.config.retryDelay! } = options;
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        if (this.shouldRetry(error)) {
          await this.delay(delay * Math.pow(2, i)); // Exponential backoff
        } else {
          throw error;
        }
      }
    }
    
    throw new ServiceError('Max retry attempts reached');
  }

  protected shouldRetry(error: any): boolean {
    if (!this.isOnline) return false;
    
    // Retry on network errors or 5xx status codes
    return error instanceof NetworkError || 
           (error.response && error.response.status >= 500);
  }

  protected async processRetryQueue(): Promise<void> {
    for (const [id, operation] of this.retryQueue) {
      try {
        await operation.execute();
        this.retryQueue.delete(id);
      } catch (error) {
        console.error(`Failed to retry operation ${id}:`, error);
      }
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public abstract destroy(): void;
}