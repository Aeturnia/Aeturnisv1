import { EventEmitter } from 'events';
import { vi } from 'vitest';
import { SocketUser } from '../../../types/socket.types';

export class MockSocket extends EventEmitter {
  id = 'mock-socket-id';
  user?: SocketUser;
  joinedRooms = new Set<string>();
  rooms = new Set<string>();
  eventHandlers = new Map<string, Function[]>();
  
  // Mock handshake for auth testing
  handshake = {
    auth: {} as any,
    address: '127.0.0.1',
    time: '2025-07-04T19:00:00.000Z',
    headers: {},
    query: {},
    url: '/',
    xdomain: false,
    secure: false,
    issued: Date.now()
  };
  
  join = vi.fn((room: string) => {
    this.rooms.add(room);
    return Promise.resolve();
  });
  
  leave = vi.fn((room: string) => {
    this.rooms.delete(room);
    return Promise.resolve();
  });
  
  emit = vi.fn();
  to = vi.fn((_room: string | string[]) => ({ emit: vi.fn() }));
  disconnect = vi.fn();
  
  // Override on to track event handlers
  on(event: string, handler: Function): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
    return super.on(event, handler as any);
  }
  
  constructor(user?: SocketUser) {
    super();
    this.user = user;
  }
  
  // Helper to authenticate the socket
  authenticate(user: SocketUser) {
    this.user = user;
  }
  
  // Helper to get registered handlers for testing
  getHandlers(event: string): Function[] {
    return this.eventHandlers.get(event) || [];
  }
}

export const createMockUser = (overrides?: Partial<SocketUser>): SocketUser => ({
  userId: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  roles: ['user'],
  ...overrides
});

export const createMockAdmin = (): SocketUser => ({
  userId: 'admin-user-id',
  email: 'admin@example.com',
  username: 'admin',
  roles: ['admin', 'user']
});

// Vitest-compatible mock factory
export const createMockIO = () => ({
  to: vi.fn(() => ({ emit: vi.fn() })),
  emit: vi.fn(),
  sockets: {
    sockets: new Map()
  }
});

// Enhanced mock broadcast functionality
export const createMockBroadcast = () => ({
  emit: vi.fn(),
  to: vi.fn(() => ({ emit: vi.fn() }))
});