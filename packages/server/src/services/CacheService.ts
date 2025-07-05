import { Redis } from 'ioredis';
import { CacheConfig } from '../types/cache.types';

export class CacheService {
  private redis: Redis;
  private namespace: string = 'aeturnis';
  
  constructor(config: CacheConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      connectTimeout: 10000,
      enableOfflineQueue: true
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      const value = await this.redis.get(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(fullKey, ttlSeconds, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      throw new Error('Cache write failed');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      await this.redis.del(fullKey);
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = `${this.namespace}:${key}`;
      return (await this.redis.exists(fullKey)) === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}