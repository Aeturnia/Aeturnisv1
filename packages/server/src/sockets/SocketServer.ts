import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { Express } from 'express';
import { logger } from '../utils/logger';
import { AuthService } from '../services/AuthService';
import { RealtimeService } from '../services/RealtimeService';
import { 
  SocketWithAuth, 
  ServerToClientEvents, 
  ClientToServerEvents 
} from '../types/socket.types';

// Import services and handlers
import { RoomService } from './services/RoomService';
import { createSocketAuthMiddleware } from './middleware/authMiddleware';
import { ConnectionHandlers } from './handlers/connectionHandlers';
import { ChatHandler } from './handlers/chatHandler';
import { CharacterHandler } from './handlers/characterHandler';
import { CombatHandler } from './handlers/combatHandler';
import { SocketRedisAdapter, createRedisAdapter } from './adapters/redisAdapter';

export interface SocketServerConfig {
  port?: number;
  corsOrigins?: string[];
  pingInterval?: number;
  pingTimeout?: number;
  maxHttpBufferSize?: number;
  transports?: string[];
  useRedisAdapter?: boolean;
  redisUrl?: string;
}

export class SocketServer {
  private httpServer: HttpServer;
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private authService: AuthService;
  private realtimeService!: RealtimeService;
  private roomService!: RoomService;
  private connectionHandlers!: ConnectionHandlers;
  private chatHandler!: ChatHandler;
  private characterHandler!: CharacterHandler;
  private combatHandler!: CombatHandler;
  private redisAdapter?: SocketRedisAdapter;
  private config: Required<SocketServerConfig>;

  constructor(app: Express, authService: AuthService, config: SocketServerConfig = {}) {
    this.config = {
      port: config.port || 3001,
      corsOrigins: config.corsOrigins || ['http://localhost:3000', 'http://localhost:3001'],
      pingInterval: config.pingInterval || 25000,
      pingTimeout: config.pingTimeout || 60000,
      maxHttpBufferSize: config.maxHttpBufferSize || 1e8, // 100MB
      transports: config.transports || ['websocket', 'polling'],
      useRedisAdapter: config.useRedisAdapter ?? true,
      redisUrl: config.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
    };

    this.authService = authService;
    this.httpServer = createServer(app);
    
    // Initialize Socket.IO server
    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(this.httpServer, {
      cors: {
        origin: this.config.corsOrigins,
        credentials: true,
      },
      pingInterval: this.config.pingInterval,
      pingTimeout: this.config.pingTimeout,
      maxHttpBufferSize: this.config.maxHttpBufferSize,
      transports: this.config.transports as Array<'websocket' | 'polling'>,
    });

    this.initializeServices();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Initialize all services
  private initializeServices(): void {
    this.roomService = new RoomService(this.io);
    this.realtimeService = new RealtimeService(this.io, this.roomService);
    this.connectionHandlers = new ConnectionHandlers(this.io, this.roomService);
    this.chatHandler = new ChatHandler(this.io, this.roomService);
    this.characterHandler = new CharacterHandler(this.io, this.roomService);
    this.combatHandler = new CombatHandler(this.io, this.roomService);

    logger.info('Socket services initialized', {
      service: 'socket-server',
    });
  }

  // Setup Redis adapter if enabled
  private async setupRedisAdapter(): Promise<void> {
    if (!this.config.useRedisAdapter) {
      logger.info('Redis adapter disabled', {
        service: 'socket-server',
      });
      return;
    }

    try {
      this.redisAdapter = createRedisAdapter({ url: this.config.redisUrl });
      await this.redisAdapter.initialize();
      this.redisAdapter.attachToServer(this.io);
      this.redisAdapter.startHealthMonitor();

      logger.info('Redis adapter configured successfully', {
        redisUrl: this.config.redisUrl,
        service: 'socket-server',
      });
    } catch (error) {
      logger.error('Failed to setup Redis adapter', {
        error: error instanceof Error ? error.message : 'Unknown error',
        redisUrl: this.config.redisUrl,
        service: 'socket-server',
      });
      
      // Continue without Redis adapter
      logger.warn('Continuing without Redis adapter - clustering not available', {
        service: 'socket-server',
      });
    }
  }

  // Setup middleware
  private setupMiddleware(): void {
    // Authentication middleware
    const authMiddleware = createSocketAuthMiddleware(this.authService);
    this.io.use(authMiddleware);

    // Connection throttling middleware
    this.io.use((socket, next) => {
      const clientIp = socket.handshake.address;
      
      // Basic rate limiting by IP (can be enhanced)
      // TODO: Implement more sophisticated rate limiting
      
      logger.debug('Socket connection attempt', {
        socketId: socket.id,
        ip: clientIp,
        userAgent: socket.handshake.headers['user-agent'],
        service: 'socket-server',
      });
      
      next();
    });

    logger.info('Socket middleware configured', {
      service: 'socket-server',
    });
  }

  // Setup main event handlers
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: SocketWithAuth) => {
      // Handle new connection
      this.connectionHandlers.handleConnection(socket);

      // Setup chat event handlers
      socket.on('chat:message', (payload) => {
        this.chatHandler.handleChatMessage(socket, payload);
      });

      socket.on('chat:typing', (payload) => {
        this.chatHandler.handleTypingIndicator(socket, payload);
      });

      socket.on('chat:emoji', (payload) => {
        this.chatHandler.handleEmojiReaction(socket, payload);
      });

      // Setup character event handlers
      socket.on('character:move', (payload) => {
        this.characterHandler.handleCharacterMove(socket, payload);
      });

      socket.on('character:action', (payload) => {
        this.characterHandler.handleCharacterAction(socket, payload);
      });

      // Setup combat event handlers
      socket.on('combat:action', (payload) => {
        this.combatHandler.handleCombatAction(socket, payload);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // Handle errors
      socket.on('error', (error) => {
        this.connectionHandlers.handleError(socket, error);
      });

      // Handle reconnection
      socket.on('reconnect', () => {
        this.connectionHandlers.handleReconnection(socket);
      });
    });

    logger.info('Socket event handlers configured', {
      service: 'socket-server',
    });
  }

  // Handle user disconnection and cleanup
  private async handleDisconnection(socket: SocketWithAuth, reason: string): Promise<void> {
    if (socket.user) {
      const { userId } = socket.user;

      // Clean up user from all handlers
      await this.roomService.cleanupUserRooms(userId);
      this.chatHandler.cleanupTypingIndicators(userId);
      this.characterHandler.cleanupCooldowns(userId);
      await this.combatHandler.cleanupUserCombat(userId);

      logger.info('User cleanup completed', {
        userId,
        socketId: socket.id,
        reason,
        service: 'socket-server',
      });
    }

    // Handle general disconnection
    this.connectionHandlers.handleDisconnection(socket, reason);
  }

  // Start the Socket.IO server
  public async start(): Promise<void> {
    try {
      // Setup Redis adapter first
      await this.setupRedisAdapter();

      // Start HTTP server
      await new Promise<void>((resolve, reject) => {
        this.httpServer.listen(this.config.port, '0.0.0.0', (error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      logger.info('Socket.IO server started successfully', {
        port: this.config.port,
        corsOrigins: this.config.corsOrigins,
        redisEnabled: this.config.useRedisAdapter,
        service: 'socket-server',
      });

      // eslint-disable-next-line no-console
      console.log(`🔌 Socket.IO server running on port ${this.config.port}`);
      // eslint-disable-next-line no-console
      console.log(`🌐 CORS origins: ${this.config.corsOrigins.join(', ')}`);
      // eslint-disable-next-line no-console
      console.log(`🔄 Redis adapter: ${this.config.useRedisAdapter ? 'enabled' : 'disabled'}`);

    } catch (error) {
      logger.error('Failed to start Socket.IO server', {
        error: error instanceof Error ? error.message : 'Unknown error',
        port: this.config.port,
        service: 'socket-server',
      });
      throw error;
    }
  }

  // Stop the Socket.IO server
  public async stop(): Promise<void> {
    try {
      // Close all socket connections
      this.io.close();

      // Close HTTP server
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => {
          resolve();
        });
      });

      // Disconnect Redis adapter
      if (this.redisAdapter) {
        await this.redisAdapter.disconnect();
      }

      logger.info('Socket.IO server stopped', {
        service: 'socket-server',
      });
    } catch (error) {
      logger.error('Error stopping Socket.IO server', {
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-server',
      });
    }
  }

  // Get server statistics
  public getStats(): {
    connectedClients: number;
    roomStats: ReturnType<RoomService['getRoomStats']>;
    chatStats: ReturnType<ChatHandler['getChatStats']>;
    characterStats: ReturnType<CharacterHandler['getCharacterStats']>;
    combatStats: ReturnType<CombatHandler['getCombatStats']>;
    serverStats: ReturnType<RealtimeService['getServerStats']>;
  } {
    return {
      connectedClients: this.io.sockets.sockets.size,
      roomStats: this.roomService.getRoomStats(),
      chatStats: this.chatHandler.getChatStats(),
      characterStats: this.characterHandler.getCharacterStats(),
      combatStats: this.combatHandler.getCombatStats(),
      serverStats: this.realtimeService.getServerStats(),
    };
  }

  // Health check
  public async isHealthy(): Promise<boolean> {
    return (
      this.httpServer.listening &&
      this.roomService.isHealthy() &&
      this.realtimeService.isHealthy() &&
      (!this.redisAdapter || await this.redisAdapter.ping())
    );
  }

  // Get realtime service for external use
  public getRealtimeService(): RealtimeService {
    return this.realtimeService;
  }

  // Get room service for external use
  public getRoomService(): RoomService {
    return this.roomService;
  }

  // Get combat handler for external use
  public getCombatHandler(): CombatHandler {
    return this.combatHandler;
  }

  // Get Socket.IO instance for external use
  public getIO(): Server<ClientToServerEvents, ServerToClientEvents> {
    return this.io;
  }
}

// Factory function to create Socket server
export function createSocketServer(
  app: Express, 
  authService: AuthService, 
  config?: SocketServerConfig
): SocketServer {
  return new SocketServer(app, authService, config);
}