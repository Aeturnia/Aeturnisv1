import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  CacheService, 
  MemoryCacheService, 
  LocalStorageCacheService,
  CacheEntry 
} from '../../cache/CacheService';

describe('MemoryCacheService', () => {
  let cache: MemoryCacheService;

  beforeEach(() => {
    cache = new MemoryCacheService({ storage: 'memory' });
  });

  describe('basic operations', () => {
    it('should initialize without errors', async () => {
      await expect(cache.initialize()).resolves.not.toThrow();
    });

    it('should set and get cache entries', async () => {
      const data = { id: 1, name: 'Test' };
      await cache.set('test-key', data);

      const entry = await cache.get('test-key');
      expect(entry).toBeDefined();
      expect(entry?.data).toEqual(data);
      expect(entry?.metadata.timestamp).toBeDefined();
    });

    it('should return null for non-existent keys', async () => {
      const entry = await cache.get('non-existent');
      expect(entry).toBeNull();
    });

    it('should delete entries', async () => {
      await cache.set('test-key', { data: 'test' });
      await cache.delete('test-key');

      const entry = await cache.get('test-key');
      expect(entry).toBeNull();
    });

    it('should clear all entries', async () => {
      await cache.set('key1', { data: 1 });
      await cache.set('key2', { data: 2 });
      await cache.set('key3', { data: 3 });

      await cache.clear();

      expect(await cache.size()).toBe(0);
      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
      expect(await cache.get('key3')).toBeNull();
    });
  });

  describe('TTL and expiration', () => {
    it('should respect TTL when set', async () => {
      vi.useFakeTimers();
      
      await cache.set('expiring', { data: 'test' }, { ttl: 1000 });
      
      // Should exist before TTL
      expect(await cache.get('expiring')).toBeDefined();
      
      // Should expire after TTL
      vi.advanceTimersByTime(1001);
      expect(await cache.get('expiring')).toBeNull();
      
      vi.useRealTimers();
    });

    it('should use default TTL from config', async () => {
      const cacheWithDefaultTTL = new MemoryCacheService({
        storage: 'memory',
        defaultTTL: 2000,
      });

      vi.useFakeTimers();
      
      await cacheWithDefaultTTL.set('test', { data: 'value' });
      
      vi.advanceTimersByTime(1999);
      expect(await cacheWithDefaultTTL.get('test')).toBeDefined();
      
      vi.advanceTimersByTime(2);
      expect(await cacheWithDefaultTTL.get('test')).toBeNull();
      
      vi.useRealTimers();
    });
  });

  describe('size limits', () => {
    it('should evict oldest entries when size limit exceeded', async () => {
      const limitedCache = new MemoryCacheService({
        storage: 'memory',
        maxSize: 3,
      });

      // Add entries up to limit
      await limitedCache.set('key1', { data: 1 });
      await limitedCache.set('key2', { data: 2 });
      await limitedCache.set('key3', { data: 3 });
      
      expect(await limitedCache.size()).toBe(3);

      // Adding one more should trigger eviction
      await limitedCache.set('key4', { data: 4 });

      // Should have evicted the oldest (10% of maxSize = 1 entry)
      expect(await limitedCache.size()).toBe(3);
      expect(await limitedCache.get('key1')).toBeNull();
      expect(await limitedCache.get('key4')).toBeDefined();
    });
  });

  describe('utility methods', () => {
    it('should check if key exists', async () => {
      await cache.set('exists', { data: 'yes' });

      expect(await cache.has('exists')).toBe(true);
      expect(await cache.has('not-exists')).toBe(false);
    });

    it('should return all keys', async () => {
      await cache.set('key1', { data: 1 });
      await cache.set('key2', { data: 2 });
      await cache.set('key3', { data: 3 });

      const keys = await cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys).toHaveLength(3);
    });

    it('should return correct size', async () => {
      expect(await cache.size()).toBe(0);

      await cache.set('key1', { data: 1 });
      expect(await cache.size()).toBe(1);

      await cache.set('key2', { data: 2 });
      expect(await cache.size()).toBe(2);

      await cache.delete('key1');
      expect(await cache.size()).toBe(1);
    });

    it('should handle version in metadata', async () => {
      await cache.set('versioned', { data: 'test' }, { version: '1.0.0' });

      const entry = await cache.get('versioned');
      expect(entry?.metadata.version).toBe('1.0.0');
    });
  });

  describe('close', () => {
    it('should clear cache on close', async () => {
      await cache.set('key1', { data: 1 });
      await cache.set('key2', { data: 2 });

      await cache.close();

      expect(await cache.size()).toBe(0);
    });
  });
});

describe('LocalStorageCacheService', () => {
  let cache: LocalStorageCacheService;

  beforeEach(() => {
    localStorage.clear();
    cache = new LocalStorageCacheService({ 
      storage: 'localStorage',
      name: 'test-cache',
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('basic operations', () => {
    it('should set and get cache entries', async () => {
      const data = { id: 1, name: 'Test' };
      await cache.set('test-key', data);

      const entry = await cache.get('test-key');
      expect(entry).toBeDefined();
      expect(entry?.data).toEqual(data);
    });

    it('should use prefix for keys', async () => {
      await cache.set('test', { data: 'value' });

      const storedKey = Object.keys(localStorage).find(key => 
        key.includes('test')
      );
      expect(storedKey).toBe('cache:test-cache:test');
    });

    it('should handle JSON parse errors gracefully', async () => {
      localStorage.setItem('cache:test-cache:invalid', 'not-json');

      const entry = await cache.get('invalid');
      expect(entry).toBeNull();
    });

    it('should delete entries', async () => {
      await cache.set('test-key', { data: 'test' });
      await cache.delete('test-key');

      expect(localStorage.getItem('cache:test-cache:test-key')).toBeNull();
    });

    it('should clear only cache entries', async () => {
      // Set cache entries
      await cache.set('cache1', { data: 1 });
      await cache.set('cache2', { data: 2 });
      
      // Set non-cache entry
      localStorage.setItem('other-key', 'other-value');

      await cache.clear();

      expect(await cache.size()).toBe(0);
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });
  });

  describe('error handling', () => {
    it('should handle quota exceeded errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementationOnce(() => {
          const error = new DOMException('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        })
        .mockImplementationOnce(() => {
          // Second call succeeds after eviction
        });

      await cache.set('test', { data: 'large' });

      expect(consoleSpy).not.toHaveBeenCalledWith(
        'Failed to set cache entry after eviction:',
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle general storage errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      await cache.set('test', { data: 'value' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to set cache entry:',
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('eviction', () => {
    it('should evict oldest entries when quota exceeded', async () => {
      // Set up some existing entries
      const now = Date.now();
      localStorage.setItem('cache:test-cache:old1', JSON.stringify({
        data: 'old1',
        metadata: { timestamp: now - 10000 },
      }));
      localStorage.setItem('cache:test-cache:old2', JSON.stringify({
        data: 'old2',
        metadata: { timestamp: now - 5000 },
      }));
      localStorage.setItem('cache:test-cache:recent', JSON.stringify({
        data: 'recent',
        metadata: { timestamp: now - 1000 },
      }));

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementationOnce(() => {
          const error = new DOMException('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        })
        .mockImplementation((key, value) => {
          localStorage.setItem(key, value);
        });

      await cache.set('new', { data: 'new' });

      // Should have evicted the oldest entry
      expect(localStorage.getItem('cache:test-cache:old1')).toBeNull();
      expect(localStorage.getItem('cache:test-cache:recent')).toBeDefined();

      setItemSpy.mockRestore();
    });
  });
});

describe('CacheService wrapper', () => {
  it('should create memory cache by default', async () => {
    const cache = new CacheService({ storage: 'memory' });
    
    await cache.set('test', { data: 'value' });
    const entry = await cache.get('test');
    
    expect(entry?.data).toEqual({ data: 'value' });
  });

  it('should create localStorage cache', async () => {
    localStorage.clear();
    const cache = new CacheService({ storage: 'localStorage' });
    
    await cache.set('test', { data: 'value' });
    
    expect(localStorage.length).toBeGreaterThan(0);
    localStorage.clear();
  });

  it('should fallback to localStorage for indexeddb', async () => {
    localStorage.clear();
    const cache = new CacheService({ storage: 'indexeddb' });
    
    await cache.set('test', { data: 'value' });
    
    // Should use localStorage as fallback
    expect(localStorage.length).toBeGreaterThan(0);
    localStorage.clear();
  });

  it('should delegate all methods correctly', async () => {
    const cache = new CacheService({ storage: 'memory' });
    
    // Test all methods
    await cache.initialize();
    await cache.set('key', { data: 'test' });
    const entry = await cache.get('key');
    expect(entry?.data).toEqual({ data: 'test' });
    
    expect(await cache.has('key')).toBe(true);
    expect(await cache.keys()).toContain('key');
    expect(await cache.size()).toBe(1);
    
    await cache.delete('key');
    expect(await cache.has('key')).toBe(false);
    
    await cache.clear();
    expect(await cache.size()).toBe(0);
    
    await cache.close();
  });
});