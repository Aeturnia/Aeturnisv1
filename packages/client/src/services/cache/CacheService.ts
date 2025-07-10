export interface CacheConfig {
  storage: 'memory' | 'localStorage' | 'indexeddb';
  name?: string;
  version?: number;
  maxSize?: number;
  defaultTTL?: number;
}

export interface CacheEntry<T> {
  data: T;
  metadata: {
    timestamp: number;
    version?: string;
  };
  ttl?: number;
}

export interface CacheSetOptions {
  ttl?: number;
  version?: string;
}

export abstract class BaseCacheService {
  protected config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract get<T>(key: string): Promise<CacheEntry<T> | null>;
  abstract set<T>(key: string, data: T, options?: CacheSetOptions): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract has(key: string): Promise<boolean>;
  abstract keys(): Promise<string[]>;
  abstract size(): Promise<number>;
  abstract close(): Promise<void>;
}

export class MemoryCacheService extends BaseCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  async initialize(): Promise<void> {
    // Memory cache doesn't need initialization
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.ttl && Date.now() - entry.metadata.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  async set<T>(key: string, data: T, options: CacheSetOptions = {}): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      metadata: {
        timestamp: Date.now(),
        version: options.version
      },
      ttl: options.ttl || this.config.defaultTTL
    };

    this.cache.set(key, entry);

    // Check size limit
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.config.maxSize * 0.1));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async close(): Promise<void> {
    this.cache.clear();
  }
}

export class LocalStorageCacheService extends BaseCacheService {
  private prefix: string;

  constructor(config: CacheConfig) {
    super(config);
    this.prefix = `cache:${config.name || 'default'}:`;
  }

  async initialize(): Promise<void> {
    // LocalStorage doesn't need initialization
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (entry.ttl && Date.now() - entry.metadata.timestamp > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return entry;
    } catch (error) {
      console.error('Failed to get cache entry:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheSetOptions = {}): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        metadata: {
          timestamp: Date.now(),
          version: options.version
        },
        ttl: options.ttl || this.config.defaultTTL
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to set cache entry:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        await this.evictOldest();
        // Retry once
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch (retryError) {
          console.error('Failed to set cache entry after eviction:', retryError);
        }
      }
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = await this.keys();
    keys.forEach(key => localStorage.removeItem(this.prefix + key));
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  async close(): Promise<void> {
    // LocalStorage doesn't need to be closed
  }

  private async evictOldest(): Promise<void> {
    const entries: Array<[string, CacheEntry<any>]> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key)!);
          entries.push([key, entry]);
        } catch (error) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp and remove oldest 10%
    entries.sort((a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp);
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.1));
    toRemove.forEach(([key]) => localStorage.removeItem(key));
  }
}

export class CacheService extends BaseCacheService {
  private implementation: BaseCacheService;

  constructor(config: CacheConfig) {
    super(config);
    
    switch (config.storage) {
      case 'memory':
        this.implementation = new MemoryCacheService(config);
        break;
      case 'localStorage':
        this.implementation = new LocalStorageCacheService(config);
        break;
      case 'indexeddb':
        // For now, fallback to localStorage
        // TODO: Implement IndexedDB cache service
        this.implementation = new LocalStorageCacheService(config);
        break;
      default:
        this.implementation = new MemoryCacheService(config);
    }
  }

  async initialize(): Promise<void> {
    return this.implementation.initialize();
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    return this.implementation.get<T>(key);
  }

  async set<T>(key: string, data: T, options?: CacheSetOptions): Promise<void> {
    return this.implementation.set(key, data, options);
  }

  async delete(key: string): Promise<void> {
    return this.implementation.delete(key);
  }

  async clear(): Promise<void> {
    return this.implementation.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.implementation.has(key);
  }

  async keys(): Promise<string[]> {
    return this.implementation.keys();
  }

  async size(): Promise<number> {
    return this.implementation.size();
  }

  async close(): Promise<void> {
    return this.implementation.close();
  }
}