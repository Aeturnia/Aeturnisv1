import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseService } from '../../base/BaseService';
import { NetworkError, ServiceError } from '../../base/ServiceError';

// Create a concrete implementation for testing
class TestService extends BaseService {
  public testExecuteWithRetry<T>(operation: () => Promise<T>, options?: any) {
    return this.executeWithRetry(operation, options);
  }

  public testShouldRetry(error: any) {
    return this.shouldRetry(error);
  }

  public testProcessRetryQueue() {
    return this.processRetryQueue();
  }

  public addToRetryQueue(id: string, operation: () => Promise<any>) {
    this.retryQueue.set(id, {
      id,
      execute: operation,
      timestamp: Date.now(),
    });
  }

  public destroy() {
    this.removeAllListeners();
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    service.destroy();
  });

  describe('network listeners', () => {
    it('should set up network event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      new TestService();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should update isOnline when network status changes', () => {
      expect(service['isOnline']).toBe(true);
      
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
      
      expect(service['isOnline']).toBe(false);
      
      // Simulate going online
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
      
      expect(service['isOnline']).toBe(true);
    });

    it('should emit events when network status changes', () => {
      const onlineSpy = vi.fn();
      const offlineSpy = vi.fn();
      
      service.on('network:online', onlineSpy);
      service.on('network:offline', offlineSpy);
      
      window.dispatchEvent(new Event('offline'));
      expect(offlineSpy).toHaveBeenCalled();
      
      window.dispatchEvent(new Event('online'));
      expect(onlineSpy).toHaveBeenCalled();
    });

    it('should process retry queue when coming back online', async () => {
      const processQueueSpy = vi.spyOn(service as any, 'processRetryQueue');
      
      window.dispatchEvent(new Event('online'));
      
      expect(processQueueSpy).toHaveBeenCalled();
    });
  });

  describe('executeWithRetry', () => {
    it('should execute operation successfully on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await service.testExecuteWithRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry failed operations', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValue('success');
      
      const result = await service.testExecuteWithRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should respect retry attempts limit', async () => {
      const operation = vi.fn().mockRejectedValue(new NetworkError('Network error'));
      
      await expect(service.testExecuteWithRetry(operation)).rejects.toThrow(NetworkError);
      expect(operation).toHaveBeenCalledTimes(3); // Default retry attempts
    });

    it('should use exponential backoff between retries', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValue('success');
      
      const delaySpy = vi.spyOn(service as any, 'delay');
      
      await service.testExecuteWithRetry(operation);
      
      expect(delaySpy).toHaveBeenCalledWith(1000); // First retry: 1000ms
      expect(delaySpy).toHaveBeenCalledWith(2000); // Second retry: 2000ms (exponential)
    });

    it('should not retry non-retryable errors', async () => {
      const error = new ServiceError('Validation error', 'VALIDATION_ERROR', { retryable: false });
      const operation = vi.fn().mockRejectedValue(error);
      
      await expect(service.testExecuteWithRetry(operation)).rejects.toThrow(error);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use custom retry options', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValue('success');
      
      const delaySpy = vi.spyOn(service as any, 'delay').mockResolvedValue(undefined);
      
      const result = await service.testExecuteWithRetry(operation, {
        attempts: 2,
        delay: 500,
      });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
      expect(delaySpy).toHaveBeenCalledTimes(1);
      expect(delaySpy).toHaveBeenCalledWith(500); // delay * Math.pow(2, 0) = 500 * 1 = 500
    });

    it('should fail immediately with attempts set to 1', async () => {
      const operation = vi.fn().mockRejectedValue(new NetworkError('Network error'));
      const delaySpy = vi.spyOn(service as any, 'delay').mockResolvedValue(undefined);
      
      await expect(service.testExecuteWithRetry(operation, {
        attempts: 1,
        delay: 500,
      })).rejects.toThrow(NetworkError);
      
      expect(operation).toHaveBeenCalledTimes(1); // Only one attempt total
      expect(delaySpy).not.toHaveBeenCalled(); // No retry, so no delay
    });
  });

  describe('shouldRetry', () => {
    it('should not retry when offline', () => {
      service['isOnline'] = false;
      
      expect(service.testShouldRetry(new NetworkError('Network error'))).toBe(false);
    });

    it('should retry network errors when online', () => {
      service['isOnline'] = true;
      
      expect(service.testShouldRetry(new NetworkError('Network error'))).toBe(true);
    });

    it('should retry 5xx errors', () => {
      const error = { response: { status: 500 } };
      
      expect(service.testShouldRetry(error)).toBe(true);
      expect(service.testShouldRetry({ response: { status: 503 } })).toBe(true);
    });

    it('should not retry 4xx errors', () => {
      const error = { response: { status: 400 } };
      
      expect(service.testShouldRetry(error)).toBe(false);
      expect(service.testShouldRetry({ response: { status: 404 } })).toBe(false);
    });
  });

  describe('retry queue', () => {
    it('should process retry queue successfully', async () => {
      const operation1 = vi.fn().mockResolvedValue('success1');
      const operation2 = vi.fn().mockResolvedValue('success2');
      
      service.addToRetryQueue('op1', operation1);
      service.addToRetryQueue('op2', operation2);
      
      await service.testProcessRetryQueue();
      
      expect(operation1).toHaveBeenCalled();
      expect(operation2).toHaveBeenCalled();
      expect(service['retryQueue'].size).toBe(0);
    });

    it('should handle errors in retry queue gracefully', async () => {
      const operation1 = vi.fn().mockRejectedValue(new Error('Failed'));
      const operation2 = vi.fn().mockResolvedValue('success');
      
      service.addToRetryQueue('op1', operation1);
      service.addToRetryQueue('op2', operation2);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await service.testProcessRetryQueue();
      
      expect(operation1).toHaveBeenCalled();
      expect(operation2).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to retry operation op1:',
        expect.any(Error)
      );
      
      // Failed operation should still be in queue
      expect(service['retryQueue'].has('op1')).toBe(true);
      expect(service['retryQueue'].has('op2')).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const defaultService = new TestService();
      
      expect(defaultService['config']).toEqual({
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        cacheEnabled: true,
        offlineEnabled: true,
      });
    });

    it('should merge custom configuration', () => {
      const customService = new TestService({
        timeout: 5000,
        retryAttempts: 5,
        cacheEnabled: false,
      });
      
      expect(customService['config']).toEqual({
        timeout: 5000,
        retryAttempts: 5,
        retryDelay: 1000,
        cacheEnabled: false,
        offlineEnabled: true,
      });
    });
  });
});