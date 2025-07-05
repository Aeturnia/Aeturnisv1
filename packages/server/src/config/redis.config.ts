import { CacheConfig } from '../types/cache.types';

export const redisConfig: CacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  namespace: process.env.REDIS_NAMESPACE || 'aeturnis'
};

export const getRedisUrl = (): string => {
  const { host, port, password } = redisConfig;
  
  if (password) {
    return `redis://:${password}@${host}:${port}`;
  }
  
  return `redis://${host}:${port}`;
};