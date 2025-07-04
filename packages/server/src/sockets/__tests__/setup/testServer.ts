import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AddressInfo } from 'net';
import { AuthService } from '../../../services/AuthService';

export interface TestServerConfig {
  port?: number;
  mockAuth?: boolean;
}

export class TestSocketServer {
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private port: number = 0;
  private authService: AuthService;

  constructor(config: TestServerConfig = {}) {
    this.httpServer = createServer();
    this.authService = new AuthService();
    
    // Create Socket.IO server with test configuration
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Mock authentication if requested
    if (config.mockAuth) {
      this.setupMockAuth();
    } else {
      this.setupRealAuth();
    }
  }

  private setupMockAuth() {
    // Override auth middleware for testing
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (token === 'test-token') {
        (socket as any).user = {
          userId: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser',
          roles: ['user']
        };
        next();
      } else if (token) {
        // Use real auth for other tokens
        this.authService.verifyToken(token)
          .then(payload => {
            (socket as any).user = {
              userId: payload.userId,
              email: payload.email,
              username: payload.email.split('@')[0],
              roles: payload.roles
            };
            next();
          })
          .catch(() => next(new Error('Authentication failed')));
      } else {
        next(new Error('No token provided'));
      }
    });
  }

  private setupRealAuth() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (token) {
        this.authService.verifyToken(token)
          .then(payload => {
            (socket as any).user = {
              userId: payload.userId,
              email: payload.email,
              username: payload.email.split('@')[0],
              roles: payload.roles
            };
            next();
          })
          .catch(() => next(new Error('Authentication failed')));
      } else {
        next(new Error('No token provided'));
      }
    });
  }

  async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.port, () => {
        const address = this.httpServer.address() as AddressInfo;
        this.port = address.port;
        resolve(this.port);
      });

      this.httpServer.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        this.httpServer.close(() => {
          resolve();
        });
      });
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }

  getPort(): number {
    return this.port;
  }

  // Helper to generate valid JWT token for testing
  generateTestToken(userId: string = 'test-user-id'): string {
    return this.authService.generateAccessToken({
      id: userId,
      email: `${userId}@example.com`,
      username: `user-${userId}`,
      roles: ['user']
    });
  }
}