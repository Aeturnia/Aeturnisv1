import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { testUtils } from '../../../test-utils/setup';

describe('Simple Ping Test', () => {
  let server: HTTPServer;
  let io: SocketIOServer;
  let serverPort: number;
  let clientSocket: Socket;

  beforeAll(async () => {
    server = createServer();
    io = new SocketIOServer(server);
    
    // Simple ping-pong handler
    io.on('connection', (socket) => {
      console.log('Server: Client connected');
      socket.on('test-ping', () => {
        console.log('Server: Received test-ping');
        socket.emit('test-pong', { timestamp: Date.now() });
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        serverPort = (server.address() as any).port;
        resolve();
      });
    });
    
    // Wait for server to be fully ready
    await testUtils.delay(100);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should handle basic ping-pong', async () => {
    clientSocket = ClientIO(`http://localhost:${serverPort}`, {
      timeout: 5000,
      forceNew: true,
    });
    
    // Enhanced connection handling with timeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 3000);
      
      clientSocket.on('connect', () => {
        clearTimeout(timeout);
        console.log('Client: Connected');
        resolve();
      });
      
      clientSocket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Enhanced pong handling with timeout
    const pongPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Pong timeout'));
      }, 2000);
      
      clientSocket.on('test-pong', (data) => {
        clearTimeout(timeout);
        console.log('Client: Received test-pong', data);
        resolve(data);
      });
    });

    // Add small delay before sending
    await testUtils.delay(100);
    console.log('Client: Sending test-ping');
    clientSocket.emit('test-ping');

    const result = await pongPromise;
    expect(result).toBeDefined();
    
    clientSocket.close();
  });
});