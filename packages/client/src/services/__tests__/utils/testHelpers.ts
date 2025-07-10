import { vi } from 'vitest';
import { EventEmitter } from 'events';
import { ServiceLayerConfig } from '../../index';
import { ApiClient } from '../../core/ApiClient';
import { WebSocketManager } from '../../core/WebSocketManager';
import { StateManager } from '../../state/StateManager';
import { CacheService } from '../../cache/CacheService';
import { OfflineQueue } from '../../cache/OfflineQueue';

export const defaultTestConfig: ServiceLayerConfig = {
  apiBaseUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  timeout: 5000,
  cacheConfig: {
    storage: 'memory',
    maxSize: 100,
    defaultTTL: 60000,
  },
  offlineConfig: {
    storage: 'memory',
    maxSize: 50,
    maxRetries: 3,
  },
};

export function createMockApiClient(): ApiClient {
  const mockApiClient = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    addRequestInterceptor: vi.fn(),
    addResponseInterceptor: vi.fn(),
    retry: vi.fn().mockResolvedValue({ data: {} }),
    getAxiosInstance: vi.fn(),
  };
  return mockApiClient as any;
}

export function createMockWebSocketManager(): WebSocketManager {
  const emitter = new EventEmitter();
  const mockWsManager = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    isConnected: vi.fn().mockReturnValue(false),
    getState: vi.fn().mockReturnValue({
      connected: false,
      connecting: false,
      error: null,
      lastConnectedAt: null,
      reconnectAttempts: 0,
    }),
    updateAuth: vi.fn(),
    // EventEmitter methods
    on: vi.fn((event: string, handler: Function) => {
      emitter.on(event, handler as (...args: any[]) => void);
    }),
    off: vi.fn((event: string, handler: Function) => {
      emitter.off(event, handler as (...args: any[]) => void);
    }),
    emit: vi.fn((event: string, ...args: any[]) => {
      emitter.emit(event, ...args);
    }),
    removeAllListeners: vi.fn(() => {
      emitter.removeAllListeners();
    }),
    // Simulate connection
    simulateConnect: () => {
      (mockWsManager.isConnected as any).mockReturnValue(true);
      (mockWsManager.getState as any).mockReturnValue({
        connected: true,
        connecting: false,
        error: null,
        lastConnectedAt: Date.now(),
        reconnectAttempts: 0,
      });
      emitter.emit('connected');
    },
    simulateDisconnect: () => {
      (mockWsManager.isConnected as any).mockReturnValue(false);
      (mockWsManager.getState as any).mockReturnValue({
        connected: false,
        connecting: false,
        error: null,
        lastConnectedAt: null,
        reconnectAttempts: 0,
      });
      emitter.emit('disconnected');
    },
    simulateMessage: (event: string, data: any) => {
      emitter.emit('message', { event, data });
    },
  };
  return mockWsManager as any;
}

export function createMockStateManager(): StateManager {
  const stateManager = new StateManager();
  vi.spyOn(stateManager, 'register');
  vi.spyOn(stateManager, 'update');
  vi.spyOn(stateManager, 'select');
  vi.spyOn(stateManager, 'subscribe');
  return stateManager;
}

export function createMockCacheService(): CacheService {
  const mockCache = {
    initialize: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    has: vi.fn().mockResolvedValue(false),
    keys: vi.fn().mockResolvedValue([]),
    size: vi.fn().mockResolvedValue(0),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return mockCache as any;
}

export function createMockOfflineQueue(): OfflineQueue {
  const mockQueue = {
    add: vi.fn().mockResolvedValue('mock-id'),
    remove: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    process: vi.fn().mockResolvedValue({
      successful: [],
      failed: [],
      retrying: [],
    }),
    clear: vi.fn().mockResolvedValue(undefined),
    size: vi.fn().mockReturnValue(0),
  };
  return mockQueue as any;
}

export interface MockServiceDependencies {
  apiClient: ApiClient;
  wsManager: WebSocketManager;
  stateManager: StateManager;
  cacheService: CacheService;
  offlineQueue: OfflineQueue;
}

export function createMockServiceDependencies(): MockServiceDependencies {
  return {
    apiClient: createMockApiClient(),
    wsManager: createMockWebSocketManager(),
    stateManager: createMockStateManager(),
    cacheService: createMockCacheService(),
    offlineQueue: createMockOfflineQueue(),
  };
}

export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitForCondition(
  condition: () => boolean,
  timeout = 1000,
  interval = 10
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await waitFor(interval);
  }
}

export function mockNetworkError() {
  return new Error('Network error');
}

export function mockTimeoutError() {
  const error = new Error('Request timeout');
  (error as any).code = 'ECONNABORTED';
  return error;
}

export function mockApiError(status: number, message: string, data?: any) {
  const error: any = new Error(message);
  error.response = { status, data: { message, ...data } };
  return error;
}