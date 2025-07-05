import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { vi } from 'vitest';

export interface TestClient {
  socket: ClientSocket;
  userId: string;
  token: string;
}

export async function createTestClient(
  port: number,
  token: string = 'test-token',
  userId: string = 'test-user-id'
): Promise<TestClient> {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true
    });

    socket.on('connect', () => {
      resolve({ socket, userId, token });
    });

    socket.on('connect_error', reject);

    // Timeout after 5 seconds
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
}

export async function waitForEvent(
  socket: ClientSocket,
  event: string,
  timeout: number = 1000
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${event}`));
    }, timeout);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

export function createSpySocket() {
  const emit = vi.fn();
  const on = vi.fn();
  const once = vi.fn();
  const off = vi.fn();
  const join = vi.fn();
  const leave = vi.fn();
  const to = vi.fn(() => ({ emit }));
  const broadcast = { emit };

  return {
    id: 'test-socket-id',
    emit,
    on,
    once,
    off,
    join,
    leave,
    to,
    broadcast,
    rooms: new Set<string>(),
    handshake: {
      auth: { token: 'test-token' }
    },
    user: {
      userId: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      roles: ['user']
    }
  };
}