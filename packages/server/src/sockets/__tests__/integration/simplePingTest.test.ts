import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';

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
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should handle basic ping-pong', async () => {
    clientSocket = ClientIO(`http://localhost:${serverPort}`);
    
    await new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        console.log('Client: Connected');
        resolve();
      });
    });

    const pongPromise = new Promise((resolve) => {
      clientSocket.on('test-pong', (data) => {
        console.log('Client: Received test-pong', data);
        resolve(data);
      });
    });

    console.log('Client: Sending test-ping');
    clientSocket.emit('test-ping');

    const result = await pongPromise;
    expect(result).toBeDefined();
    
    clientSocket.close();
  });
});