import { Redis } from 'ioredis';
import { CacheConfig } from '../types/cache.types';
import { logger } from '../utils/logger';

export class CacheService {
  private redis: Redis | null = null;
  private namespace: string = 'aeturnis';
  private useRedis: boolean;
  private memoryCache: Map<string, { value: string; expiry?: number }> = new Map();
  
  constructor(config: CacheConfig) {
    // Only connect to Redis if explicitly enabled via environment variable
    this.useRedis = process.env.ENABLE_REDIS === 'true';
    
    if (this.useRedis) {
      this.redis = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        connectTimeout: 10000,
        enableOfflineQueue: true,
        lazyConnect: true // Don't connect immediately
      });
    } else {
      logger.info('CacheService: Using in-memory cache (Redis disabled)');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      
      if (this.useRedis && this.redis) {
        const value = await this.redis.get(fullKey);
        return value ? JSON.parse(value) : null;
      } else {
        // Use in-memory cache
        const cached = this.memoryCache.get(fullKey);
        if (cached) {
          if (!cached.expiry || cached.expiry > Date.now()) {
            return JSON.parse(cached.value);
          } else {
            this.memoryCache.delete(fullKey);
          }
        }
        return null;
      }
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      const serialized = JSON.stringify(value);
      
      if (this.useRedis && this.redis) {
        if (ttlSeconds) {
          await this.redis.setex(fullKey, ttlSeconds, serialized);
        } else {
          await this.redis.set(fullKey, serialized);
        }
      } else {
        // Use in-memory cache
        const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined;
        this.memoryCache.set(fullKey, { value: serialized, expiry });
      }
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      // Don't throw error for cache failures in development
      if (this.useRedis) {
        throw new Error('Cache write failed');
      }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      
      if (this.useRedis && this.redis) {
        await this.redis.del(fullKey);
      } else {
        // Use in-memory cache
        this.memoryCache.delete(fullKey);
      }
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      if (this.useRedis && this.redis) {
        return await this.redis.ttl(fullKey);
      } else {
        // For in-memory cache, check if key exists and return TTL
        const cached = this.memoryCache.get(fullKey);
        if (cached && cached.expiry) {
          const remaining = Math.max(0, cached.expiry - Date.now());
          return Math.floor(remaining / 1000);
        }
        return cached ? -1 : -2; // -1 for no expiry, -2 for not found
      }
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      if (this.useRedis && this.redis) {
        return (await this.redis.exists(fullKey)) === 1;
      } else {
        // For in-memory cache, check if key exists and not expired
        const cached = this.memoryCache.get(fullKey);
        if (cached) {
          if (!cached.expiry || cached.expiry > Date.now()) {
            return true;
          } else {
            this.memoryCache.delete(fullKey);
          }
        }
        return false;
      }
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.useRedis && this.redis) {
      await this.redis.quit();
    }
    // Clear in-memory cache
    this.memoryCache.clear();
  }

  // Add alias method for backward compatibility
  async getTTL(key: string): Promise<number> {
    return this.ttl(key);
  }
}