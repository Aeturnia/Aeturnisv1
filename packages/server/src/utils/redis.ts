import Redis from 'ioredis';
import { logger } from './logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  logger.info('Redis connected', { service: 'redis' });
});

redis.on('ready', () => {
  logger.info('Redis ready', { service: 'redis' });
});

redis.on('error', (error) => {
  logger.error('Redis error', { 
    error: error.message,
    service: 'redis' 
  });
});

redis.on('close', () => {
  logger.warn('Redis connection closed', { service: 'redis' });
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting', { service: 'redis' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Closing Redis connection...', { service: 'redis' });
  await redis.quit();
});

process.on('SIGINT', async () => {
  logger.info('Closing Redis connection...', { service: 'redis' });
  await redis.quit();
});

export default redis;