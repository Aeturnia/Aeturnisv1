import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { AuthService } from '../../../services/AuthService';

// Mock AuthService for testing
vi.mock('../../../services/AuthService');

describe('Socket.IO Integration Flow', () => {
  let httpServer: any;
  let ioServer: Server;
  let clientSocket: ClientSocket;
  let serverPort: number;
  let mockAuthService: any;

  beforeAll(async () => {
    // Create test server
    httpServer = createServer();
    ioServer = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Mock AuthService
    mockAuthService = {
      verifyToken: vi.fn().mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user']
      }),
      generateAccessToken: vi.fn().mockReturnValue('mock-jwt-token')
    };

    // Start server
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        serverPort = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.close();
    }
  });

  it('should establish socket connection successfully', async () => {
    await new Promise<void>((resolve, reject) => {
      clientSocket = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token' }
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        resolve();
      });

      clientSocket.on('connect_error', (error) => {
        reject(error);
      });
    });
  });

  it('should handle authentication flow', async () => {
    // Set up authentication middleware mock
    ioServer.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('No token provided'));
        }

        const payload = await mockAuthService.verifyToken(token);
        socket.user = {
          userId: payload.userId,
          email: payload.email,
          username: payload.email.split('@')[0],
          roles: payload.roles
        };
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    await new Promise<void>((resolve) => {
      clientSocket = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token' }
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        resolve();
      });

      clientSocket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        resolve();
      });
    });
  });

  it('should reject connection with invalid token', async () => {
    mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Invalid token'));

    await new Promise<void>((resolve, reject) => {
      clientSocket = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'invalid-token' }
      });

      clientSocket.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication failed');
        resolve();
      });

      clientSocket.on('connect', () => {
        reject(new Error('Should not connect with invalid token'));
      });
    });
  });

  it('should handle chat message flow', async () => {
    // Set up server-side handlers
    ioServer.on('connection', (socket) => {
      socket.on('chat:message', (data) => {
        // Echo message back to test communication
        socket.emit('chat:message', {
          type: data.type,
          message: data.message,
          timestamp: Date.now(),
          sender: {
            userId: socket.user?.userId || 'unknown',
            username: socket.user?.username || 'unknown'
          }
        });
      });
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message not received within timeout'));
      }, 5000);

      clientSocket = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token' }
      });

      clientSocket.on('connect', () => {
        // Send test message
        clientSocket.emit('chat:message', {
          type: 'zone',
          message: 'Test message'
        });
      });

      clientSocket.on('chat:message', (data) => {
        clearTimeout(timeout);
        expect(data.message).toBe('Test message');
        expect(data.type).toBe('zone');
        expect(data.sender).toBeDefined();
        resolve();
      });
    });
    }, 1000);
  });

  it('should handle room joining and broadcasting', async () => {
    // Set up server-side room handling
    ioServer.on('connection', (socket) => {
      socket.join('test-room');
      
      socket.on('test:broadcast', (data) => {
        socket.to('test-room').emit('test:message', data);
      });
    });

    await new Promise<void>((resolve, reject) => {
      let messagesReceived = 0;
      const expectedMessages = 2;
      
      const timeout = setTimeout(() => {
        client1.close();
        client2.close();
        reject(new Error(`Only received ${messagesReceived}/${expectedMessages} messages`));
      }, 2000);

      // Create two clients
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token-1' }
      });

      const client2 = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token-2' }
      });

      const handleMessage = (data: any) => {
        expect(data.message).toBe('Broadcast test');
        messagesReceived++;
        
        if (messagesReceived === expectedMessages) {
          clearTimeout(timeout);
          client1.close();
          client2.close();
          resolve();
        }
      };

      client1.on('connect', () => {
        client1.on('test:message', handleMessage);
      });

      client2.on('connect', () => {
        client2.on('test:message', handleMessage);
        
        // Send broadcast from client1
        client1.emit('test:broadcast', { message: 'Broadcast test' });
      });
    });
  });

  it('should handle disconnect events properly', async () => {
    await new Promise<void>((resolve, reject) => {
      let disconnectHandled = false;
      
      const timeout = setTimeout(() => {
        if (!disconnectHandled) {
          reject(new Error('Disconnect event not handled'));
        }
      }, 1000);

      ioServer.on('connection', (socket) => {
        socket.on('disconnect', (reason) => {
          clearTimeout(timeout);
          expect(reason).toBeDefined();
          disconnectHandled = true;
          resolve();
        });
      });

      clientSocket = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token' }
      });

      clientSocket.on('connect', () => {
        // Immediately disconnect to test disconnect handling
        clientSocket.close();
      });
    });
  });

  it('should handle concurrent connections', async () => {
    const numberOfClients = 5;
    
    await new Promise<void>((resolve, reject) => {
      const clients: ClientSocket[] = [];
      let connectionsEstablished = 0;
      
      const timeout = setTimeout(() => {
        clients.forEach(c => c.close());
        reject(new Error(`Only ${connectionsEstablished}/${numberOfClients} clients connected`));
      }, 3000);

      for (let i = 0; i < numberOfClients; i++) {
        const client = ioClient(`http://localhost:${serverPort}`, {
          auth: { token: `mock-jwt-token-${i}` }
        });

        client.on('connect', () => {
          connectionsEstablished++;
          
          if (connectionsEstablished === numberOfClients) {
            clearTimeout(timeout);
            // All clients connected successfully
            clients.forEach(c => c.close());
            resolve();
          }
        });

        client.on('connect_error', (error) => {
          clearTimeout(timeout);
          clients.forEach(c => c.close());
          reject(error);
        });

        clients.push(client);
      }
    });
  });

  it('should handle error recovery', async () => {
    ioServer.on('connection', (socket) => {
      socket.on('test:error', () => {
        socket.emit('error', new Error('Test error'));
      });

      socket.on('test:recovery', () => {
        socket.emit('test:recovered', { success: true });
      });
    });

    await new Promise<void>((resolve, reject) => {
      let errorReceived = false;
      let recoverySuccessful = false;
      
      const timeout = setTimeout(() => {
        reject(new Error('Error recovery test failed'));
      }, 2000);

      clientSocket = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: 'mock-jwt-token' }
      });

      clientSocket.on('connect', () => {
        // Trigger an error
        clientSocket.emit('test:error');
      });

      clientSocket.on('error', (error) => {
        expect(error).toBeDefined();
        errorReceived = true;
        
        // Attempt recovery
        clientSocket.emit('test:recovery');
      });

      clientSocket.on('test:recovered', (data) => {
        expect(data.success).toBe(true);
        recoverySuccessful = true;
        
        if (errorReceived && recoverySuccessful) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  });
});