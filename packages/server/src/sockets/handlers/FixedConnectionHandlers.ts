import { Server } from 'socket.io';
import { SocketWithAuth, RoomType, requireAuth } from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { RoomService } from '../services/RoomService';
import { isAuthenticated } from '../middleware/authMiddleware';

export class ConnectionHandlers {
  private roomService: RoomService;

  constructor(_io: Server, roomService: RoomService) {
    this.roomService = roomService;
  }

  // Handle new connections
  public handleConnection(socket: SocketWithAuth): void {
    if (!isAuthenticated(socket)) {
      logger.warn('Unauthenticated socket connected', {
        socketId: socket.id,
        ip: socket.handshake.address,
        service: 'connection-handler',
      });
      socket.disconnect(true);
      return;
    }

    const { userId, email, characterId } = socket.user;

    logger.info('User connected via socket', {
      userId,
      email,
      socketId: socket.id,
      ip: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'],
      service: 'connection-handler',
    });

    // Set up connection-specific event handlers
    this.setupSocketEventHandlers(socket);
    
    // Initialize user state
    this.initializeUserConnection(socket);
  }

  // Set up socket event handlers
  private setupSocketEventHandlers(socket: SocketWithAuth): void {
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    socket.on('error', (error) => {
      this.handleSocketError(socket, error);
    });

    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  // Initialize user connection state
  private async initializeUserConnection(socket: SocketWithAuth): Promise<void> {
    try {
      const user = requireAuth(socket);
      
      // Join user to their personal room
      await this.roomService.joinRoom(socket, RoomType.USER, user.userId);
      
      // Restore user state if reconnecting
      await this.restoreUserState(socket);
      
      // Sync user data with client
      await this.syncUserData(socket);
      
      // Broadcast user online status
      this.broadcastUserOnlineStatus(socket);
      
      logger.info('User connection initialized successfully', {
        userId: user.userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to initialize user connection', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Handle user disconnection
  public handleDisconnection(socket: SocketWithAuth, reason: string): void {
    if (!socket.user) {
      logger.debug('Unauthenticated socket disconnected', {
        socketId: socket.id,
        reason,
        service: 'connection-handler',
      });
      return;
    }

    const { userId, email } = socket.user;

    logger.info('User disconnected from socket', {
      userId,
      email,
      socketId: socket.id,
      reason,
      service: 'connection-handler',
    });

    // Clean up user state (fire and forget)
    this.cleanupUserConnection(socket).catch(error => {
      logger.error('Error during user connection cleanup', {
        userId,
        error: error.message,
        service: 'connection-handler'
      });
    });
    
    // Broadcast user offline status
    this.broadcastUserOfflineStatus(socket);
  }

  // Handle socket errors
  private handleSocketError(socket: SocketWithAuth, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown socket error';
    
    logger.error('Socket error occurred', {
      socketId: socket.id,
      userId: socket.user?.userId,
      error: errorMessage,
      service: 'connection-handler',
    });

    // Attempt to recover from recoverable errors
    if (errorMessage.includes('transport')) {
      // Transport errors might be recoverable
      logger.info('Attempting socket recovery', {
        socketId: socket.id,
        service: 'connection-handler',
      });
    }
  }

  // Clean up user connection state
  private async cleanupUserConnection(socket: SocketWithAuth): Promise<void> {
    if (!socket.user) {
      return;
    }

    try {
      const user = requireAuth(socket);
      
      // Leave all rooms
      await this.roomService.cleanupUserRooms(user.userId);
      
      // Clear any user-specific timers or intervals
      // TODO: Implement cleanup for user-specific resources
      
      logger.debug('User connection cleaned up', {
        userId: user.userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to cleanup user connection', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Restore user's previous rooms
  private async restoreUserRooms(socket: SocketWithAuth): Promise<void> {
    if (!socket.user) {
      return;
    }
    const { userId } = socket.user;
    
    try {
      // Get user's previous rooms from database or cache
      // For now, we'll just restore the default zone room
      await this.roomService.joinRoom(socket, RoomType.ZONE, 'tavern-district');
      
      logger.debug('User rooms restored', {
        userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to restore user rooms', {
        userId,
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Restore user state after reconnection
  private async restoreUserState(socket: SocketWithAuth): Promise<void> {
    try {
      const user = requireAuth(socket);
      const { userId } = user;
      
      // Restore user's rooms
      await this.restoreUserRooms(socket);
      
      // Restore user's character context if available
      if (user.characterId) {
        // TODO: Restore character-specific state
        logger.debug('Character context restored', {
          userId,
          characterId: user.characterId,
          service: 'connection-handler',
        });
      }
      
      logger.info('User state restored successfully', {
        userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to restore user state', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Sync user data with client
  private async syncUserData(socket: SocketWithAuth): Promise<void> {
    try {
      const user = requireAuth(socket);
      const { userId } = user;
      
      // Send user's current state
      socket.emit('system:notification', {
        type: 'info',
        message: 'Syncing user data...',
      });
      
      // TODO: Implement actual user data sync
      // This would include character status, inventory, etc.
      
      logger.debug('User data synced', {
        userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to sync user data', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Broadcast user offline status
  private broadcastUserOfflineStatus(socket: SocketWithAuth): void {
    try {
      const user = requireAuth(socket);
      const { userId, email } = user;
      
      // Get user's rooms and broadcast offline status
      const userRooms = this.roomService.getUserRooms(userId);
      
      userRooms.forEach(roomId => {
        socket.to(roomId).emit('system:notification', {
          type: 'info',
          message: `${email.split('@')[0]} went offline`,
        });
      });
      
      logger.debug('User offline status broadcasted', {
        userId,
        roomCount: userRooms.length,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to broadcast offline status', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Broadcast user online status
  private broadcastUserOnlineStatus(socket: SocketWithAuth): void {
    try {
      const user = requireAuth(socket);
      const { userId, email } = user;
      
      // Get user's rooms and broadcast online status
      const userRooms = this.roomService.getUserRooms(userId);
      
      userRooms.forEach(roomId => {
        socket.to(roomId).emit('system:notification', {
          type: 'info',
          message: `${email.split('@')[0]} came online`,
        });
      });
      
      logger.debug('User online status broadcasted', {
        userId,
        roomCount: userRooms.length,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to broadcast online status', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Get connection statistics
  public getConnectionStats(): {
    totalConnections: number;
    authenticatedConnections: number;
    roomDistribution: Record<string, number>;
  } {
    // TODO: Implement connection statistics
    return {
      totalConnections: 0,
      authenticatedConnections: 0,
      roomDistribution: {},
    };
  }
}