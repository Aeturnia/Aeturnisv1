import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseHttpService } from '../../base/BaseHttpService';
import { NetworkError } from '../../base/ServiceError';
import { createMockApiClient, createMockCacheService, createMockOfflineQueue } from '../utils/testHelpers';

class TestHttpService extends BaseHttpService {
  public testGet<T>(endpoint: string, options?: any) {
    return this.get<T>(endpoint, options);
  }

  public testPost<T>(endpoint: string, data: any, options?: any) {
    return this.post<T>(endpoint, data, options);
  }

  public testPut<T>(endpoint: string, data: any, options?: any) {
    return this.put<T>(endpoint, data, options);
  }

  public testDelete<T>(endpoint: string, options?: any) {
    return this.delete<T>(endpoint, options);
  }

  public testGetCacheKey(method: string, endpoint: string, params?: any) {
    return this.getCacheKey(method, endpoint, params);
  }

  public testIsCacheExpired(cached: any) {
    return this.isCacheExpired(cached);
  }
}

describe('BaseHttpService', () => {
  let service: TestHttpService;
  let mockApiClient: ReturnType<typeof createMockApiClient>;
  let mockCacheService: ReturnType<typeof createMockCacheService>;
  let mockOfflineQueue: ReturnType<typeof createMockOfflineQueue>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    mockCacheService = createMockCacheService();
    mockOfflineQueue = createMockOfflineQueue();

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });

    service = new TestHttpService({
      apiClient: mockApiClient,
      cacheService: mockCacheService,
      offlineQueue: mockOfflineQueue,
    });

    // Ensure service isOnline is reset
    service['isOnline'] = true;
  });

  afterEach(() => {
    service.destroy();
    // Reset navigator.onLine to default
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockApiClient.get.mockResolvedValue({ data: mockData });

      const result = await service.testGet('/api/v1/test');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/test', {});
      expect(result).toEqual({
        data: mockData,
        metadata: { timestamp: expect.any(Number), cached: false },
      });
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        data: { id: 1, name: 'Cached' },
        metadata: { timestamp: Date.now() - 1000 },
        ttl: 300000,
      };
      mockCacheService.get.mockResolvedValue(cachedData);

      const result = await service.testGet('/api/v1/test');

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: cachedData.data,
        metadata: { ...cachedData.metadata, cached: true },
      });
    });

    it('should not use expired cache', async () => {
      const expiredCache = {
        data: { id: 1, name: 'Expired' },
        metadata: { timestamp: Date.now() - 400000 }, // Older than default TTL
        ttl: 300000,
      };
      mockCacheService.get.mockResolvedValue(expiredCache);
      mockApiClient.get.mockResolvedValue({ data: { id: 1, name: 'Fresh' } });

      const result = await service.testGet('/api/v1/test');

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data).toEqual({ id: 1, name: 'Fresh' });
      expect(result.metadata?.cached).toBe(false);
    });

    it('should cache successful responses', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockApiClient.get.mockResolvedValue({ data: mockData });
      mockCacheService.get.mockResolvedValue(null);

      await service.testGet('/api/v1/test');

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'GET:/api/v1/test:',
        mockData,
        { ttl: 300000 }
      );
    });

    it('should respect cache options', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockApiClient.get.mockResolvedValue({ data: mockData });

      await service.testGet('/api/v1/test', { useCache: false });

      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockApiClient.get).toHaveBeenCalled();
    });

    it('should return cached data when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      const cachedData = {
        data: { id: 1, name: 'Offline cached' },
        metadata: { timestamp: Date.now() - 1000 },
      };
      mockCacheService.get.mockResolvedValue(cachedData);
      mockApiClient.get.mockRejectedValue(new NetworkError('Offline'));

      const result = await service.testGet('/api/v1/test');

      expect(result).toEqual({
        data: cachedData.data,
        metadata: { ...cachedData.metadata, cached: true, offline: true },
      });
    });

    it('should throw error when offline with no cache', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      mockCacheService.get.mockResolvedValue(null);
      mockApiClient.get.mockRejectedValue(new NetworkError('Offline'));

      await expect(service.testGet('/api/v1/test')).rejects.toThrow(NetworkError);
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const postData = { name: 'New Item' };
      const responseData = { id: 1, ...postData };
      mockApiClient.post.mockResolvedValue({ data: responseData });

      const result = await service.testPost('/api/v1/items', postData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/items', postData, {});
      expect(result).toEqual({
        data: responseData,
        metadata: { timestamp: expect.any(Number), cached: false },
      });
    });

    it('should queue POST request when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      const postData = { name: 'Offline Item' };
      mockOfflineQueue.add.mockResolvedValue('queue-id-123');

      await expect(service.testPost('/api/v1/items', postData))
        .rejects.toThrow('Operation queued for offline sync');

      expect(mockOfflineQueue.add).toHaveBeenCalledWith({
        method: 'POST',
        endpoint: '/api/v1/items',
        data: postData,
        options: {},
        timestamp: expect.any(Number),
      });
    });

    it('should return optimistic response when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      const postData = { name: 'Optimistic Item' };
      const optimisticResponse = { id: 'temp-123', ...postData };

      const result = await service.testPost('/api/v1/items', postData, {
        optimisticResponse,
      });

      expect(result).toEqual({
        data: optimisticResponse,
        metadata: {
          timestamp: expect.any(Number),
          cached: false,
          queued: true,
        },
      });
    });

    it('should not queue when offline is disabled', async () => {
      service = new TestHttpService({
        apiClient: mockApiClient,
        offlineEnabled: false,
      });

      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      const postData = { name: 'No Queue Item' };
      mockApiClient.post.mockRejectedValue(new NetworkError('Offline'));

      await expect(service.testPost('/api/v1/items', postData))
        .rejects.toThrow(NetworkError);

      expect(mockOfflineQueue?.add).not.toHaveBeenCalled();
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const putData = { name: 'Updated Item' };
      const responseData = { id: 1, ...putData };
      mockApiClient.put.mockResolvedValue({ data: responseData });

      const result = await service.testPut('/api/v1/items/1', putData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/items/1', putData, {});
      expect(result).toEqual({
        data: responseData,
        metadata: { timestamp: expect.any(Number), cached: false },
      });
    });

    it('should queue PUT request when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      const putData = { name: 'Offline Update' };

      await expect(service.testPut('/api/v1/items/1', putData))
        .rejects.toThrow('Operation queued for offline sync');

      expect(mockOfflineQueue.add).toHaveBeenCalledWith({
        method: 'PUT',
        endpoint: '/api/v1/items/1',
        data: putData,
        options: {},
        timestamp: expect.any(Number),
      });
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      mockApiClient.delete.mockResolvedValue({ data: undefined });

      const result = await service.testDelete('/api/v1/items/1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/items/1', {});
      expect(result).toEqual({
        data: undefined,
        metadata: { timestamp: expect.any(Number), cached: false },
      });
    });

    it('should queue DELETE request when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      service['isOnline'] = false;

      await expect(service.testDelete('/api/v1/items/1'))
        .rejects.toThrow('Operation queued for offline sync');

      expect(mockOfflineQueue.add).toHaveBeenCalledWith({
        method: 'DELETE',
        endpoint: '/api/v1/items/1',
        options: {},
        timestamp: expect.any(Number),
      });
    });
  });

  describe('cache key generation', () => {
    it('should generate consistent cache keys', () => {
      expect(service.testGetCacheKey('GET', '/api/v1/test')).toBe('GET:/api/v1/test:');
      expect(service.testGetCacheKey('GET', '/api/v1/test', { id: 1 }))
        .toBe('GET:/api/v1/test:{"id":1}');
      expect(service.testGetCacheKey('POST', '/api/v1/items', { name: 'Test' }))
        .toBe('POST:/api/v1/items:{"name":"Test"}');
    });
  });

  describe('cache expiration', () => {
    it('should correctly identify expired cache', () => {
      const now = Date.now();
      
      // Not expired
      expect(service.testIsCacheExpired({
        metadata: { timestamp: now - 100000 },
        ttl: 300000,
      })).toBe(false);

      // Expired
      expect(service.testIsCacheExpired({
        metadata: { timestamp: now - 400000 },
        ttl: 300000,
      })).toBe(true);

      // Default TTL (5 minutes)
      expect(service.testIsCacheExpired({
        metadata: { timestamp: now - 400000 },
      })).toBe(true);
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests', async () => {
      mockApiClient.get
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValue({ data: { success: true } });

      const result = await service.testGet('/api/v1/test');

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    });
  });
});