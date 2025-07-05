import { CacheService } from './CacheService';
import { SessionManager } from './SessionManager';
import { redisConfig } from '../config/redis.config';

// Initialize cache service
export const cacheService = new CacheService(redisConfig);

// Initialize session manager
export const sessionManager = new SessionManager(cacheService);

// Export services for use throughout the application
export { CacheService, SessionManager };

// Graceful shutdown handler
export const shutdownServices = async (): Promise<void> => {
  try {
    await cacheService.disconnect();
    console.log('📊 Cache service disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting cache service:', error);
  }
};