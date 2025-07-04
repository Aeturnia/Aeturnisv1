import { createClient } from 'redis';
import { config } from 'dotenv';

// Load environment variables
config();

// Create Redis client
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

// Connect to Redis
redis.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('🔗 Connected to Redis');
});

redis.on('error', (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('🚨 Redis connection error:', err);
});

redis.on('reconnecting', () => {
  // eslint-disable-next-line no-console
  console.log('🔄 Reconnecting to Redis...');
});

// Initialize connection
redis.connect().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('🚨 Failed to connect to Redis:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  // eslint-disable-next-line no-console
  console.log('🔌 Closing Redis connection...');
  await redis.quit();
});

export default redis;