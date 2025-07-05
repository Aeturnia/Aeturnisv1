import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redis: RedisClientType | null = null;

export const createRedisClient = async (): Promise<RedisClientType> => {
  if (redis) {
    return redis;
  }

  try {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 60000,
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Too many Redis connection attempts');
            return false;
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redis.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis client connected');
    });

    redis.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redis.connect();
    return redis;
  } catch (error) {
    logger.error('Failed to create Redis client:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redis;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    await redis.disconnect();
    redis = null;
    logger.info('Redis client disconnected');
  }
};

// Cache utilities
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available for cache get');
      return null;
    }
    return await client.get(key);
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: string, ttl?: number): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available for cache set');
      return false;
    }
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available for cache delete');
      return false;
    }
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
};

export default {
  createRedisClient,
  getRedisClient,
  disconnectRedis,
  cacheGet,
  cacheSet,
  cacheDel,
};