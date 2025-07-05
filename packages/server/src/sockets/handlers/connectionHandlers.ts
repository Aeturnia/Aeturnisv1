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
      characterId,
      socketId: socket.id,
      ip: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'],
      service: 'connection-handler',
    });

    // Join user's private room
    this.joinUserPrivateRoom(socket);

    // Restore user's previous rooms if reconnecting
    this.restoreUserRooms(socket);

    // Send welcome message
    socket.emit('system:notification', {
      type: 'info',
      message: 'Connected to Aeturnis Online',
    });

    // Set up connection-specific event handlers
    this.setupSocketEventHandlers(socket);
  }

  // Handle disconnections
  public handleDisconnection(socket: SocketWithAuth, reason: string): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, email } = socket.user;

    logger.info('User disconnected', {
      userId,
      email,
      socketId: socket.id,
      reason,
      service: 'connection-handler',
    });

    // Clean up user from all rooms
    this.roomService.cleanupUserRooms(userId);

    // Broadcast user offline status to relevant rooms
    this.broadcastUserOfflineStatus(socket);

    // Log disconnection metrics
    this.logDisconnectionMetrics(socket, reason);
  }

  // Handle reconnections
  public handleReconnection(socket: SocketWithAuth): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, email } = socket.user;

    logger.info('User reconnected', {
      userId,
      email,
      socketId: socket.id,
      service: 'connection-handler',
    });

    // Restore user state
    this.restoreUserState(socket);

    // Notify user of successful reconnection
    socket.emit('system:notification', {
      type: 'info',
      message: 'Reconnected to Aeturnis Online',
    });

    // Re-sync user data
    this.syncUserData(socket);
  }

  // Handle connection errors
  public handleError(socket: SocketWithAuth, error: Error): void {
    const userId = socket.user?.userId || 'unknown';
    
    logger.error('Socket connection error', {
      userId,
      socketId: socket.id,
      error: error.message,
      stack: error.stack,
      service: 'connection-handler',
    });

    // Send error notification to client
    socket.emit('system:notification', {
      type: 'error',
      message: 'Connection error occurred',
    });

    // Attempt to recover connection
    this.attemptConnectionRecovery(socket, error);
  }

  // Join user's private room
  private async joinUserPrivateRoom(socket: SocketWithAuth): Promise<void> {
    if (!socket.user) {
      return;
    }
    const { userId } = socket.user;
    
    try {
      await this.roomService.joinRoom(socket, RoomType.USER, userId);
      logger.debug('User joined private room', {
        userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    } catch (error) {
      logger.error('Failed to join user private room', {
        userId,
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
      if (!user) {
        return;
      }
      const { userId, email } = user;
    
      // Get user's rooms and broadcast offline status
      const userRooms = this.roomService.getUserRooms(userId);
      
      userRooms.forEach(({ type, identifier }) => {
        if (type !== RoomType.USER) { // Don't broadcast to private room
          this.roomService.broadcastToRoom(
            type,
            identifier,
            'user:offline',
            {
              userId,
              username: email.split('@')[0],
              timestamp: Date.now(),
            },
            userId // Exclude the disconnecting user
          );
        }
      });
    } catch (error) {
      logger.error('Failed to broadcast user offline status', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'connection-handler',
      });
    }
  }

  // Log disconnection metrics
  private logDisconnectionMetrics(socket: SocketWithAuth, reason: string): void {
    if (!socket.user) {
      return;
    }
    
    const { userId } = socket.user;
    
    // Calculate connection duration
    const connectionTime = Date.now() - (Number(socket.handshake.time) || Date.now());
    
    logger.info('Connection metrics', {
      userId,
      socketId: socket.id,
      reason,
      connectionDuration: connectionTime,
      disconnectionTime: Date.now(),
      service: 'connection-handler',
    });
  }

  // Attempt connection recovery
  private attemptConnectionRecovery(socket: SocketWithAuth, error: Error): void {
    if (!socket.user) {
      return;
    }
    const { userId } = socket.user;
    
    // Basic recovery strategy
    if (error.message.includes('timeout')) {
      logger.info('Attempting connection recovery for timeout', {
        userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
      
      // Send ping to test connection
      socket.emit('ping', { timestamp: Date.now() });
    }
  }

  // Set up socket-specific event handlers
  private setupSocketEventHandlers(socket: SocketWithAuth): void {
    // Handle ping/pong for connection health
    socket.on('ping', (data) => {
      socket.emit('pong', { ...data, serverTime: Date.now() });
    });

    // Handle room join/leave requests
    socket.on('room:join', async (data) => {
      try {
        await this.roomService.joinRoom(socket, data.roomType, data.roomId);
      } catch (error) {
        socket.emit('system:notification', {
          type: 'error',
          message: 'Failed to join room',
        });
      }
    });

    socket.on('room:leave', async (data) => {
      try {
        await this.roomService.leaveRoom(socket, data.roomType, data.roomId);
      } catch (error) {
        socket.emit('system:notification', {
          type: 'error',
          message: 'Failed to leave room',
        });
      }
    });

    // Handle character selection
    socket.on('character:select', async (data) => {
      if (socket.user && data.characterId) {
        socket.user.characterId = data.characterId;
        logger.info('Character selected', {
          userId: socket.user.userId,
          characterId: data.characterId,
          socketId: socket.id,
          service: 'connection-handler',
        });
      }
    });

    if (socket.user) {
      logger.debug('Socket event handlers set up', {
        userId: socket.user.userId,
        socketId: socket.id,
        service: 'connection-handler',
      });
    }
  }
}

// Factory function to create connection handlers
export function createConnectionHandlers(io: Server, roomService: RoomService): ConnectionHandlers {
  return new ConnectionHandlers(io, roomService);
}