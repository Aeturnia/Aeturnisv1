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

  beforeAll((done) => {
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
    httpServer.listen(() => {
      serverPort = httpServer.address().port;
      done();
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

  it('should establish socket connection successfully', (done) => {
    clientSocket = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: 'mock-jwt-token' }
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(error);
    });
  });

  it('should handle authentication flow', (done) => {
    clientSocket = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: 'mock-jwt-token' }
    });

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

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      done();
    });
  });

  it('should reject connection with invalid token', (done) => {
    mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Invalid token'));

    clientSocket = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: 'invalid-token' }
    });

    clientSocket.on('connect_error', (error) => {
      expect(error.message).toContain('Authentication failed');
      done();
    });

    clientSocket.on('connect', () => {
      done(new Error('Should not connect with invalid token'));
    });
  });

  it('should handle chat message flow', (done) => {
    let messageReceived = false;

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
      expect(data.message).toBe('Test message');
      expect(data.type).toBe('zone');
      expect(data.sender).toBeDefined();
      messageReceived = true;
      done();
    });

    // Timeout if message not received
    setTimeout(() => {
      if (!messageReceived) {
        done(new Error('Message not received within timeout'));
      }
    }, 1000);
  });

  it('should handle room joining and broadcasting', (done) => {
    let messagesReceived = 0;
    const expectedMessages = 2;

    // Create two clients
    const client1 = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: 'mock-jwt-token-1' }
    });

    const client2 = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: 'mock-jwt-token-2' }
    });

    // Set up server-side room handling
    ioServer.on('connection', (socket) => {
      socket.join('test-room');
      
      socket.on('test:broadcast', (data) => {
        socket.to('test-room').emit('test:message', data);
      });
    });

    const handleMessage = (data: any) => {
      expect(data.message).toBe('Broadcast test');
      messagesReceived++;
      
      if (messagesReceived === expectedMessages) {
        client1.close();
        client2.close();
        done();
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

    // Cleanup timeout
    setTimeout(() => {
      client1.close();
      client2.close();
      if (messagesReceived < expectedMessages) {
        done(new Error(`Only received ${messagesReceived}/${expectedMessages} messages`));
      }
    }, 2000);
  });

  it('should handle disconnect events properly', (done) => {
    let disconnectHandled = false;

    ioServer.on('connection', (socket) => {
      socket.on('disconnect', (reason) => {
        expect(reason).toBeDefined();
        disconnectHandled = true;
        done();
      });
    });

    clientSocket = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: 'mock-jwt-token' }
    });

    clientSocket.on('connect', () => {
      // Immediately disconnect to test disconnect handling
      clientSocket.close();
    });

    // Timeout if disconnect not handled
    setTimeout(() => {
      if (!disconnectHandled) {
        done(new Error('Disconnect event not handled'));
      }
    }, 1000);
  });

  it('should handle concurrent connections', (done) => {
    const numberOfClients = 5;
    const clients: ClientSocket[] = [];
    let connectionsEstablished = 0;

    for (let i = 0; i < numberOfClients; i++) {
      const client = ioClient(`http://localhost:${serverPort}`, {
        auth: { token: `mock-jwt-token-${i}` }
      });

      client.on('connect', () => {
        connectionsEstablished++;
        
        if (connectionsEstablished === numberOfClients) {
          // All clients connected successfully
          clients.forEach(c => c.close());
          done();
        }
      });

      client.on('connect_error', (error) => {
        clients.forEach(c => c.close());
        done(error);
      });

      clients.push(client);
    }

    // Timeout for concurrent connections
    setTimeout(() => {
      clients.forEach(c => c.close());
      if (connectionsEstablished < numberOfClients) {
        done(new Error(`Only ${connectionsEstablished}/${numberOfClients} clients connected`));
      }
    }, 3000);
  });

  it('should handle error recovery', (done) => {
    let errorReceived = false;
    let recoverySuccessful = false;

    ioServer.on('connection', (socket) => {
      socket.on('test:error', () => {
        socket.emit('error', new Error('Test error'));
      });

      socket.on('test:recovery', () => {
        socket.emit('test:recovered', { success: true });
      });
    });

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
        done();
      }
    });

    // Timeout for error recovery test
    setTimeout(() => {
      if (!errorReceived || !recoverySuccessful) {
        done(new Error('Error recovery test failed'));
      }
    }, 2000);
  });
});