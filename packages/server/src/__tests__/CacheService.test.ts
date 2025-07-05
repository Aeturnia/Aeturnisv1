import { CacheService } from '../services/CacheService';
import { CacheConfig } from '../types/cache.types';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock ioredis
vi.mock('ioredis', () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    ttl: vi.fn(),
    exists: vi.fn(),
    quit: vi.fn()
  };
  
  return {
    Redis: vi.fn(() => mockRedis)
  };
});

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    ttl: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    quit: ReturnType<typeof vi.fn>;
  };
  
  const config: CacheConfig = {
    host: 'localhost',
    port: 6379,
    namespace: 'test'
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    cacheService = new CacheService(config);
    // Get the mock Redis instance
    mockRedis = (cacheService as any).redis; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  afterEach(async () => {
    await cacheService.disconnect();
  });

  describe('get', () => {
    test('should return parsed value for existing key', async () => {
      const testData = { name: 'TestPlayer', level: 10 };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));
      
      const result = await cacheService.get('player:123');
      
      expect(mockRedis.get).toHaveBeenCalledWith('aeturnis:player:123');
      expect(result).toEqual(testData);
    });

    test('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const result = await cacheService.get('non:existent');
      
      expect(result).toBeNull();
    });

    test('should return null and log error on Redis failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));
      
      const result = await cacheService.get('any:key');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Cache GET error for key any:key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('set', () => {
    test('should set value without TTL', async () => {
      const testData = { name: 'TestPlayer', level: 10 };
      mockRedis.set.mockResolvedValue('OK');
      
      await cacheService.set('player:456', testData);
      
      expect(mockRedis.set).toHaveBeenCalledWith('aeturnis:player:456', JSON.stringify(testData));
    });

    test('should set value with TTL', async () => {
      const testData = { name: 'TestPlayer', level: 10 };
      mockRedis.setex.mockResolvedValue('OK');
      
      await cacheService.set('player:789', testData, 60);
      
      expect(mockRedis.setex).toHaveBeenCalledWith('aeturnis:player:789', 60, JSON.stringify(testData));
    });

    test('should throw error on Redis failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRedis.set.mockRejectedValue(new Error('Redis write failed'));
      
      await expect(cacheService.set('any:key', 'value')).rejects.toThrow('Cache write failed');
      
      consoleSpy.mockRestore();
    });
  });

  describe('delete', () => {
    test('should delete key', async () => {
      mockRedis.del.mockResolvedValue(1);
      
      await cacheService.delete('player:123');
      
      expect(mockRedis.del).toHaveBeenCalledWith('aeturnis:player:123');
    });

    test('should handle deletion errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRedis.del.mockRejectedValue(new Error('Redis delete failed'));
      
      await expect(cacheService.delete('any:key')).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Cache DELETE error for key any:key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('ttl', () => {
    test('should return TTL for existing key', async () => {
      mockRedis.ttl.mockResolvedValue(60);
      
      const result = await cacheService.ttl('player:123');
      
      expect(mockRedis.ttl).toHaveBeenCalledWith('aeturnis:player:123');
      expect(result).toBe(60);
    });

    test('should return -1 on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRedis.ttl.mockRejectedValue(new Error('Redis TTL failed'));
      
      const result = await cacheService.ttl('any:key');
      
      expect(result).toBe(-1);
      expect(consoleSpy).toHaveBeenCalledWith('Cache TTL error for key any:key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('exists', () => {
    test('should return true for existing key', async () => {
      mockRedis.exists.mockResolvedValue(1);
      
      const result = await cacheService.exists('player:123');
      
      expect(mockRedis.exists).toHaveBeenCalledWith('aeturnis:player:123');
      expect(result).toBe(true);
    });

    test('should return false for non-existing key', async () => {
      mockRedis.exists.mockResolvedValue(0);
      
      const result = await cacheService.exists('player:nonexistent');
      
      expect(result).toBe(false);
    });

    test('should return false on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRedis.exists.mockRejectedValue(new Error('Redis exists failed'));
      
      const result = await cacheService.exists('any:key');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Cache EXISTS error for key any:key:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    test('should disconnect from Redis', async () => {
      mockRedis.quit.mockResolvedValue('OK');
      
      await cacheService.disconnect();
      
      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});