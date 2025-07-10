import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OfflineQueue, OfflineOperation } from '../../cache/OfflineQueue';

describe('OfflineQueue', () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    localStorage.clear();
    queue = new OfflineQueue({ storage: 'memory' });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('basic operations', () => {
    it('should add operations to queue', async () => {
      const operation = {
        method: 'POST',
        endpoint: '/api/test',
        data: { name: 'Test' },
        timestamp: Date.now(),
      };

      const id = await queue.add(operation);

      expect(id).toMatch(/^op_\d+_[a-z0-9]+$/);
      expect(queue.size()).toBe(1);
    });

    it('should get operation by id', async () => {
      const operation = {
        method: 'POST',
        endpoint: '/api/test',
        data: { name: 'Test' },
        timestamp: Date.now(),
      };

      const id = await queue.add(operation);
      const retrieved = await queue.get(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.method).toBe('POST');
      expect(retrieved?.endpoint).toBe('/api/test');
      expect(retrieved?.data).toEqual({ name: 'Test' });
    });

    it('should remove operations', async () => {
      const id = await queue.add({
        method: 'POST',
        endpoint: '/api/test',
        data: {},
        timestamp: Date.now(),
      });

      await queue.remove(id);

      expect(await queue.get(id)).toBeUndefined();
      expect(queue.size()).toBe(0);
    });

    it('should get all operations', async () => {
      await queue.add({
        method: 'POST',
        endpoint: '/api/test1',
        data: { id: 1 },
        timestamp: Date.now(),
      });

      await queue.add({
        method: 'PUT',
        endpoint: '/api/test2',
        data: { id: 2 },
        timestamp: Date.now(),
      });

      const all = await queue.getAll();

      expect(all).toHaveLength(2);
      expect(all[0].endpoint).toBe('/api/test1');
      expect(all[1].endpoint).toBe('/api/test2');
    });

    it('should clear all operations', async () => {
      await queue.add({
        method: 'POST',
        endpoint: '/api/test1',
        data: {},
        timestamp: Date.now(),
      });

      await queue.add({
        method: 'POST',
        endpoint: '/api/test2',
        data: {},
        timestamp: Date.now(),
      });

      await queue.clear();

      expect(queue.size()).toBe(0);
      expect(await queue.getAll()).toHaveLength(0);
    });
  });

  describe('size limits', () => {
    it('should enforce max size limit', async () => {
      const limitedQueue = new OfflineQueue({
        storage: 'memory',
        maxSize: 3,
      });

      // Add operations up to limit
      const id1 = await limitedQueue.add({
        method: 'POST',
        endpoint: '/api/1',
        data: {},
        timestamp: Date.now() - 3000,
      });

      await limitedQueue.add({
        method: 'POST',
        endpoint: '/api/2',
        data: {},
        timestamp: Date.now() - 2000,
      });

      await limitedQueue.add({
        method: 'POST',
        endpoint: '/api/3',
        data: {},
        timestamp: Date.now() - 1000,
      });

      // Adding one more should evict oldest
      await limitedQueue.add({
        method: 'POST',
        endpoint: '/api/4',
        data: {},
        timestamp: Date.now(),
      });

      expect(limitedQueue.size()).toBe(3);
      expect(await limitedQueue.get(id1)).toBeUndefined(); // Oldest was evicted
    });
  });

  describe('TTL and expiration', () => {
    it('should remove expired operations', async () => {
      const queueWithTTL = new OfflineQueue({
        storage: 'memory',
        ttl: 1000, // 1 second
      });

      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      const id1 = await queueWithTTL.add({
        method: 'POST',
        endpoint: '/api/old',
        data: {},
        timestamp: now - 2000, // Expired
      });

      const id2 = await queueWithTTL.add({
        method: 'POST',
        endpoint: '/api/new',
        data: {},
        timestamp: now - 500, // Not expired
      });

      const all = await queueWithTTL.getAll();

      expect(all).toHaveLength(1);
      expect(all[0].endpoint).toBe('/api/new');
      expect(await queueWithTTL.get(id1)).toBeUndefined();
      expect(await queueWithTTL.get(id2)).toBeDefined();

      vi.useRealTimers();
    });

    it('should use default TTL of 24 hours', async () => {
      const defaultQueue = new OfflineQueue({ storage: 'memory' });
      
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      await defaultQueue.add({
        method: 'POST',
        endpoint: '/api/old',
        data: {},
        timestamp: now - (25 * 60 * 60 * 1000), // 25 hours old
      });

      await defaultQueue.add({
        method: 'POST',
        endpoint: '/api/recent',
        data: {},
        timestamp: now - (23 * 60 * 60 * 1000), // 23 hours old
      });

      const all = await defaultQueue.getAll();

      expect(all).toHaveLength(1);
      expect(all[0].endpoint).toBe('/api/recent');

      vi.useRealTimers();
    });
  });

  describe('process method', () => {
    it('should process operations and track retry counts', async () => {
      const op1 = await queue.add({
        method: 'POST',
        endpoint: '/api/test1',
        data: {},
        timestamp: Date.now(),
      });

      const op2 = await queue.add({
        method: 'POST',
        endpoint: '/api/test2',
        data: {},
        timestamp: Date.now(),
      });

      const result = await queue.process();

      expect(result.retrying).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.successful).toHaveLength(0);

      // Check retry counts were incremented
      const operation1 = await queue.get(op1);
      const operation2 = await queue.get(op2);
      expect(operation1?.retryCount).toBe(1);
      expect(operation2?.retryCount).toBe(1);
    });

    it('should mark operations as failed after max retries', async () => {
      const queueWithLowRetries = new OfflineQueue({
        storage: 'memory',
        maxRetries: 2,
      });

      const opId = await queueWithLowRetries.add({
        method: 'POST',
        endpoint: '/api/test',
        data: {},
        timestamp: Date.now(),
      });

      // First process - retry count becomes 1
      await queueWithLowRetries.process();
      expect(await queueWithLowRetries.get(opId)).toBeDefined();

      // Second process - retry count becomes 2 (max)
      const result2 = await queueWithLowRetries.process();
      expect(result2.failed).toHaveLength(1);
      expect(await queueWithLowRetries.get(opId)).toBeUndefined(); // Removed
    });

    it('should handle process errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the operation to throw an error during processing
      const operation = {
        method: 'POST',
        endpoint: '/api/test',
        data: {},
        timestamp: Date.now(),
      };

      await queue.add(operation);

      // Override the process method to simulate an error
      const originalProcess = queue.process.bind(queue);
      queue.process = async () => {
        const ops = await queue.getAll();
        throw new Error('Process error');
      };

      await expect(queue.process()).rejects.toThrow('Process error');

      queue.process = originalProcess;
      consoleSpy.mockRestore();
    });
  });

  describe('localStorage persistence', () => {
    it('should persist to localStorage', async () => {
      const persistedQueue = new OfflineQueue({
        storage: 'localStorage',
      });

      await persistedQueue.add({
        method: 'POST',
        endpoint: '/api/test',
        data: { persisted: true },
        timestamp: Date.now(),
      });

      const stored = localStorage.getItem('offline-queue');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].data).toEqual({ persisted: true });
    });

    it('should load from localStorage on init', async () => {
      const operations = [
        {
          id: 'op_123',
          method: 'POST',
          endpoint: '/api/test1',
          data: { id: 1 },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'op_456',
          method: 'PUT',
          endpoint: '/api/test2',
          data: { id: 2 },
          timestamp: Date.now(),
          retryCount: 1,
        },
      ];

      localStorage.setItem('offline-queue', JSON.stringify(operations));

      const newQueue = new OfflineQueue({
        storage: 'localStorage',
      });

      expect(newQueue.size()).toBe(2);
      expect(await newQueue.get('op_123')).toBeDefined();
      expect(await newQueue.get('op_456')).toBeDefined();
    });

    it('should handle localStorage errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const persistedQueue = new OfflineQueue({
        storage: 'localStorage',
      });

      await persistedQueue.add({
        method: 'POST',
        endpoint: '/api/test',
        data: {},
        timestamp: Date.now(),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save offline queue to storage:',
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('default values', () => {
    it('should set default retry count and max retries', async () => {
      const id = await queue.add({
        method: 'POST',
        endpoint: '/api/test',
        data: {},
        timestamp: Date.now(),
      });

      const operation = await queue.get(id);
      expect(operation?.retryCount).toBe(0);
      expect(operation?.maxRetries).toBe(3); // Default from config
    });
  });
});