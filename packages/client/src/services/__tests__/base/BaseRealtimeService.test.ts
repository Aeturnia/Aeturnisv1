import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseRealtimeService } from '../../base/BaseRealtimeService';
import { createMockWebSocketManager } from '../utils/testHelpers';

class TestRealtimeService extends BaseRealtimeService {
  public testSubscribe(channel: string, handler: (event: string, data: any) => void, options?: any) {
    return this.subscribe(channel, handler, options);
  }

  public testUnsubscribe(subscriptionId: string) {
    return this.unsubscribe(subscriptionId);
  }

  public testSend(event: string, data: any) {
    return this.send(event, data);
  }

  public getSubscriptions() {
    return this.subscriptions;
  }

  public getMessageQueue() {
    return this.messageQueue;
  }
}

describe('BaseRealtimeService', () => {
  let service: TestRealtimeService;
  let mockWsManager: ReturnType<typeof createMockWebSocketManager>;

  beforeEach(() => {
    mockWsManager = createMockWebSocketManager();
    service = new TestRealtimeService({
      wsManager: mockWsManager,
      heartbeatInterval: 30000,
    });
  });

  afterEach(() => {
    service.destroy();
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    it('should set up event handlers on initialization', () => {
      const connectedHandler = vi.fn();
      const disconnectedHandler = vi.fn();
      const errorHandler = vi.fn();
      const messageHandler = vi.fn();

      service.on('realtime:connected', connectedHandler);
      service.on('realtime:disconnected', disconnectedHandler);
      service.on('realtime:error', errorHandler);

      // Simulate events
      mockWsManager.emit('connected');
      mockWsManager.emit('disconnected');
      mockWsManager.emit('error', new Error('Test error'));

      expect(connectedHandler).toHaveBeenCalled();
      expect(disconnectedHandler).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should start heartbeat when configured', () => {
      vi.useFakeTimers();
      
      // Create a new service with heartbeat interval after setting up fake timers
      const mockWs = createMockWebSocketManager();
      mockWs.isConnected.mockReturnValue(true);
      const testService = new TestRealtimeService({
        wsManager: mockWs,
        heartbeatInterval: 30000,
      });

      vi.advanceTimersByTime(30000);

      expect(mockWs.send).toHaveBeenCalledWith('heartbeat', {
        timestamp: expect.any(Number),
      });

      testService.destroy();
      vi.useRealTimers();
    });
  });

  describe('subscriptions', () => {
    it('should create subscription with unique ID', () => {
      const handler = vi.fn();
      const subscriptionId = service.testSubscribe('test-channel', handler);

      expect(subscriptionId).toMatch(/^sub_\d+_[a-z0-9]+$/);
      expect(service.getSubscriptions().has(subscriptionId)).toBe(true);
    });

    it('should activate subscription when connected', () => {
      mockWsManager.isConnected.mockReturnValue(true);
      const handler = vi.fn();

      service.testSubscribe('test-channel', handler, { filter: { type: 'test' } });

      expect(mockWsManager.send).toHaveBeenCalledWith('subscribe', {
        channel: 'test-channel',
        filter: { type: 'test' },
      });
    });

    it('should not activate subscription when disconnected', () => {
      mockWsManager.isConnected.mockReturnValue(false);
      const handler = vi.fn();

      service.testSubscribe('test-channel', handler);

      expect(mockWsManager.send).not.toHaveBeenCalled();
    });

    it('should resubscribe all when reconnected', () => {
      mockWsManager.isConnected.mockReturnValue(false);
      
      // Create subscriptions while disconnected
      service.testSubscribe('channel1', vi.fn());
      service.testSubscribe('channel2', vi.fn());

      expect(mockWsManager.send).not.toHaveBeenCalled();

      // Simulate reconnection
      mockWsManager.isConnected.mockReturnValue(true);
      mockWsManager.emit('connected');

      expect(mockWsManager.send).toHaveBeenCalledWith('subscribe', {
        channel: 'channel1',
      });
      expect(mockWsManager.send).toHaveBeenCalledWith('subscribe', {
        channel: 'channel2',
      });
    });

    it('should unsubscribe and remove subscription', () => {
      mockWsManager.isConnected.mockReturnValue(true);
      const handler = vi.fn();
      const subscriptionId = service.testSubscribe('test-channel', handler);

      service.testUnsubscribe(subscriptionId);

      expect(mockWsManager.send).toHaveBeenCalledWith('unsubscribe', {
        channel: 'test-channel',
      });
      expect(service.getSubscriptions().has(subscriptionId)).toBe(false);
    });

    it('should handle unsubscribe when disconnected', () => {
      const handler = vi.fn();
      const subscriptionId = service.testSubscribe('test-channel', handler);
      
      mockWsManager.isConnected.mockReturnValue(false);
      service.testUnsubscribe(subscriptionId);

      expect(mockWsManager.send).toHaveBeenCalledTimes(0);
      expect(service.getSubscriptions().has(subscriptionId)).toBe(false);
    });
  });

  describe('message handling', () => {
    it('should call subscription handlers on matching messages', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      service.testSubscribe('channel1', handler1);
      service.testSubscribe('channel2', handler2);
      service.testSubscribe('*', handler3); // Wildcard subscription

      // Simulate incoming message
      mockWsManager.emit('message', {
        channel: 'channel1',
        event: 'update',
        data: { id: 1 },
      });

      expect(handler1).toHaveBeenCalledWith('update', { id: 1 });
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith('update', { id: 1 });
    });

    it('should emit channel-specific events', () => {
      const eventHandler = vi.fn();
      service.on('message:channel1:update', eventHandler);

      mockWsManager.emit('message', {
        channel: 'channel1',
        event: 'update',
        data: { id: 1 },
      });

      expect(eventHandler).toHaveBeenCalledWith({ id: 1 });
    });

    it('should handle errors in subscription handlers gracefully', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();

      service.testSubscribe('test-channel', errorHandler);
      service.testSubscribe('test-channel', normalHandler);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockWsManager.emit('message', {
        channel: 'test-channel',
        event: 'update',
        data: { id: 1 },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in subscription handler:',
        expect.any(Error)
      );
      expect(normalHandler).toHaveBeenCalledWith('update', { id: 1 });

      consoleSpy.mockRestore();
    });
  });

  describe('sending messages', () => {
    it('should send messages when connected', () => {
      mockWsManager.isConnected.mockReturnValue(true);

      service.testSend('test-event', { data: 'test' });

      expect(mockWsManager.send).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('should queue messages when disconnected', () => {
      mockWsManager.isConnected.mockReturnValue(false);

      service.testSend('test-event', { data: 'test' });

      expect(mockWsManager.send).not.toHaveBeenCalled();
      expect(service.getMessageQueue()).toHaveLength(1);
      expect(service.getMessageQueue()[0]).toEqual({
        event: 'test-event',
        data: { data: 'test' },
        timestamp: expect.any(Number),
      });
    });

    it('should flush message queue on reconnection', () => {
      mockWsManager.isConnected.mockReturnValue(false);

      // Queue some messages
      service.testSend('event1', { data: 1 });
      service.testSend('event2', { data: 2 });

      expect(service.getMessageQueue()).toHaveLength(2);

      // Simulate reconnection
      mockWsManager.isConnected.mockReturnValue(true);
      mockWsManager.emit('connected');

      expect(mockWsManager.send).toHaveBeenCalledWith('event1', { data: 1 });
      expect(mockWsManager.send).toHaveBeenCalledWith('event2', { data: 2 });
      expect(service.getMessageQueue()).toHaveLength(0);
    });

    it('should skip old messages when flushing queue', () => {
      mockWsManager.isConnected.mockReturnValue(false);

      // Add an old message
      const oldMessage = {
        event: 'old-event',
        data: { old: true },
        timestamp: Date.now() - 40000, // Older than 30 seconds
      };
      service['messageQueue'].push(oldMessage);

      // Add a recent message
      service.testSend('recent-event', { recent: true });

      // Simulate reconnection
      mockWsManager.isConnected.mockReturnValue(true);
      mockWsManager.emit('connected');

      expect(mockWsManager.send).not.toHaveBeenCalledWith('old-event', { old: true });
      expect(mockWsManager.send).toHaveBeenCalledWith('recent-event', { recent: true });
    });
  });

  describe('cleanup', () => {
    it('should clean up on destroy', () => {
      vi.useFakeTimers();
      
      const handler = vi.fn();
      service.testSubscribe('test-channel', handler);
      service.testSend('queued-event', { data: 'test' });

      service.destroy();

      expect(service.getSubscriptions().size).toBe(0);
      expect(service.getMessageQueue()).toHaveLength(0);
      expect(mockWsManager.disconnect).toHaveBeenCalled();

      // Verify heartbeat is cleared
      vi.advanceTimersByTime(30000);
      expect(mockWsManager.send).not.toHaveBeenCalledWith('heartbeat', expect.any(Object));

      vi.useRealTimers();
    });
  });

  describe('subscription options', () => {
    it('should pass subscription options when activating', () => {
      mockWsManager.isConnected.mockReturnValue(true);

      service.testSubscribe('filtered-channel', vi.fn(), {
        filter: { userId: '123' },
        priority: 1,
      });

      expect(mockWsManager.send).toHaveBeenCalledWith('subscribe', {
        channel: 'filtered-channel',
        filter: { userId: '123' },
        priority: 1,
      });
    });
  });
});