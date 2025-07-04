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
  console.log('🔗 Connected to Redis');
});

redis.on('error', (err: Error) => {
  console.error('🚨 Redis connection error:', err);
});

redis.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...');
});

// Initialize connection
redis.connect().catch((err) => {
  console.error('🚨 Failed to connect to Redis:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔌 Closing Redis connection...');
  await redis.quit();
});

export default redis;