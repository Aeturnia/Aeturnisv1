/**
 * Mock generators for testing
 */
import { vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';

/**
 * Create mock Express request
 */
export function createMockRequest(overrides?: Partial<Request>): Request {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    get: vi.fn(),
    header: vi.fn(),
    user: undefined,
    ...overrides
  } as unknown as Request;
}

/**
 * Create mock Express response
 */
export function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    sendStatus: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    locals: {},
    statusCode: 200
  } as unknown as Response;
  
  return res;
}

/**
 * Create mock next function
 */
export function createMockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

/**
 * Create mock Socket.IO socket
 */
export function createMockSocket(overrides?: Partial<Socket>): Socket {
  const socket = {
    id: 'test-socket-id',
    handshake: {
      auth: {},
      headers: {},
      query: {}
    },
    rooms: new Set(['test-socket-id']),
    data: {},
    emit: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
    to: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    broadcast: {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis()
    },
    disconnect: vi.fn(),
    ...overrides
  } as unknown as Socket;
  
  return socket;
}

/**
 * Create mock database transaction
 */
export function createMockTransaction() {
  return {
    commit: vi.fn(),
    rollback: vi.fn(),
    isCompleted: false
  };
}

/**
 * Create mock Redis client
 */
export function createMockRedis() {
  const store = new Map<string, string>();
  
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
      return 'OK';
    }),
    setex: vi.fn(async (key: string, ttl: number, value: string) => {
      store.set(key, value);
      return 'OK';
    }),
    del: vi.fn(async (key: string) => {
      const existed = store.has(key);
      store.delete(key);
      return existed ? 1 : 0;
    }),
    exists: vi.fn(async (key: string) => store.has(key) ? 1 : 0),
    ttl: vi.fn(async (key: string) => store.has(key) ? 3600 : -2),
    quit: vi.fn(),
    _store: store // Expose store for testing
  };
}

/**
 * Create mock logger
 */
export function createMockLogger() {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn()
  };
}

/**
 * Create mock service
 */
export function createMockService<T>(methods: (keyof T)[]): T {
  const service: any = {};
  
  methods.forEach(method => {
    service[method] = vi.fn();
  });
  
  return service as T;
}

/**
 * Mock timer utilities
 */
export const mockTimers = {
  /**
   * Use fake timers
   */
  useFakeTimers: () => {
    vi.useFakeTimers();
    return {
      advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
      runAllTimers: () => vi.runAllTimers(),
      runOnlyPendingTimers: () => vi.runOnlyPendingTimers(),
      clearAllTimers: () => vi.clearAllTimers(),
      restore: () => vi.useRealTimers()
    };
  }
};

/**
 * Create mock event emitter
 */
export function createMockEventEmitter() {
  const listeners = new Map<string, Function[]>();
  
  return {
    on: vi.fn((event: string, listener: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(listener);
    }),
    
    emit: vi.fn((event: string, ...args: any[]) => {
      const eventListeners = listeners.get(event) || [];
      eventListeners.forEach(listener => listener(...args));
    }),
    
    off: vi.fn((event: string, listener: Function) => {
      const eventListeners = listeners.get(event) || [];
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }),
    
    removeAllListeners: vi.fn((event?: string) => {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }),
    
    _listeners: listeners // Expose for testing
  };
}