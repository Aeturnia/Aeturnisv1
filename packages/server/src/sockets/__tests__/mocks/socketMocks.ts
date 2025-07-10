import { EventEmitter } from 'events';
import { vi, MockedFunction } from 'vitest';
import { SocketUser } from '../../../types/socket.types';

export class MockSocket extends EventEmitter {
  public id: string = 'mock-socket-id';
  public rooms: Set<string> = new Set([this.id]);
  public handshake: any;
  public user?: SocketUser;
  public joinedRooms: Set<string> = new Set();
  public eventHandlers = new Map<string, ((...args: any[]) => void | Promise<void>)[]>();

  // Vitest spy functions
  public join: MockedFunction<(room: string) => void>;
  public leave: MockedFunction<(room: string) => void>;
  public emit: MockedFunction<(event: string, ...args: any[]) => boolean>;
  public to: MockedFunction<(room: string) => any>;
  public broadcast: any;
  public disconnect: MockedFunction<() => void>;

  constructor(user?: SocketUser) {
    super();
    
    // Initialize user - don't default to authenticated unless explicitly provided
    this.user = user;

    // Initialize handshake
    this.handshake = {
      auth: { token: user ? 'test-token' : undefined },
      address: '127.0.0.1',
      time: '2025-07-04T19:00:00.000Z',
      headers: {},
      query: {},
      url: '/',
      xdomain: false,
      secure: false,
      issued: Date.now()
    };

    // Create spy functions
    this.join = vi.fn((room: string) => {
      this.rooms.add(room);
      this.joinedRooms.add(room);
    });

    this.leave = vi.fn((room: string) => {
      this.rooms.delete(room);
      this.joinedRooms.delete(room);
    });

    this.emit = vi.fn((event: string, ...args: any[]) => {
      // Also emit locally for testing
      super.emit(event, ...args);
      return true;
    });

    const broadcastEmit = vi.fn();
    this.to = vi.fn((_room: string) => ({
      emit: broadcastEmit
    }));

    this.broadcast = {
      emit: broadcastEmit
    };

    this.disconnect = vi.fn();

    // Create spy for the on method
    this.on = vi.fn((event: string, handler: (...args: any[]) => void | Promise<void>) => {
      if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, []);
      }
      this.eventHandlers.get(event)!.push(handler);
      super.on(event, handler as any);
      return this;
    });
  }



  // Helper to simulate receiving events
  public simulateEvent(event: string, ...args: any[]) {
    const listeners = this.listeners(event);
    listeners.forEach(listener => {
      listener(...args);
    });
  }

  // Helper to authenticate the socket
  public authenticate(user: SocketUser) {
    this.user = user;
  }

  // Helper to get registered handlers
  public getHandlers(event: string): ((...args: any[]) => void | Promise<void>)[] {
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