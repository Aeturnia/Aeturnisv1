import { Server } from 'socket.io';
import { SocketWithAuth, RoomType } from '../types/socket.types';
import { logger } from '../utils/logger';
import { RoomService } from '../sockets/services/RoomService';

export class RealtimeService {
  private io: Server;
  private roomService: RoomService;

  constructor(io: Server, roomService: RoomService) {
    this.io = io;
    this.roomService = roomService;
  }

  // Core emission methods
  public emitToUser(userId: string, event: string, data: unknown): void {
    try {
      this.roomService.broadcastToRoom(RoomType.USER, userId, event, data);
      
      logger.debug('Message emitted to user', {
        userId,
        event,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to emit to user', {
        userId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  public emitToZone(zoneId: string, event: string, data: unknown, excludeUserId?: string): void {
    try {
      this.roomService.broadcastToRoom(RoomType.ZONE, zoneId, event, data, excludeUserId);
      
      logger.debug('Message emitted to zone', {
        zoneId,
        event,
        excludeUserId,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to emit to zone', {
        zoneId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  public emitToCombat(sessionId: string, event: string, data: unknown, excludeUserId?: string): void {
    try {
      this.roomService.broadcastToRoom(RoomType.COMBAT, sessionId, event, data, excludeUserId);
      
      logger.debug('Message emitted to combat session', {
        sessionId,
        event,
        excludeUserId,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to emit to combat session', {
        sessionId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  public emitToGuild(guildId: string, event: string, data: unknown, excludeUserId?: string): void {
    try {
      this.roomService.broadcastToRoom(RoomType.GUILD, guildId, event, data, excludeUserId);
      
      logger.debug('Message emitted to guild', {
        guildId,
        event,
        excludeUserId,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to emit to guild', {
        guildId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  public emitToParty(partyId: string, event: string, data: unknown, excludeUserId?: string): void {
    try {
      this.roomService.broadcastToRoom(RoomType.PARTY, partyId, event, data, excludeUserId);
      
      logger.debug('Message emitted to party', {
        partyId,
        event,
        excludeUserId,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to emit to party', {
        partyId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  public broadcastToAll(event: string, data: unknown): void {
    try {
      this.io.emit(event, data);
      
      logger.info('Message broadcasted to all users', {
        event,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to broadcast to all users', {
        event,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  // Utility methods
  public getUserSockets(userId: string): SocketWithAuth[] {
    const sockets: SocketWithAuth[] = [];
    
    this.io.sockets.sockets.forEach((socket: SocketWithAuth) => {
      if (socket.user?.userId === userId) {
        sockets.push(socket);
      }
    });
    
    return sockets;
  }

  public isUserOnline(userId: string): boolean {
    return this.getUserSockets(userId).length > 0;
  }

  public getZonePopulation(zoneId: string): number {
    return this.roomService.getRoomMemberCount(RoomType.ZONE, zoneId);
  }

  public getGuildPopulation(guildId: string): number {
    return this.roomService.getRoomMemberCount(RoomType.GUILD, guildId);
  }

  public getPartyPopulation(partyId: string): number {
    return this.roomService.getRoomMemberCount(RoomType.PARTY, partyId);
  }

  public getCombatParticipants(sessionId: string): number {
    return this.roomService.getRoomMemberCount(RoomType.COMBAT, sessionId);
  }

  public disconnectUser(userId: string, reason: string): void {
    try {
      const userSockets = this.getUserSockets(userId);
      
      userSockets.forEach(socket => {
        socket.emit('system:disconnect', { reason });
        socket.disconnect(true);
      });
      
      logger.info('User disconnected by server', {
        userId,
        reason,
        socketCount: userSockets.length,
        service: 'realtime-service',
      });
    } catch (error) {
      logger.error('Failed to disconnect user', {
        userId,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
    }
  }

  // Room management utilities
  public async joinUserToZone(userId: string, zoneId: string): Promise<boolean> {
    try {
      const userSockets = this.getUserSockets(userId);
      
      for (const socket of userSockets) {
        await this.roomService.joinRoom(socket, RoomType.ZONE, zoneId);
      }
      
      logger.info('User joined zone', {
        userId,
        zoneId,
        socketCount: userSockets.length,
        service: 'realtime-service',
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to join user to zone', {
        userId,
        zoneId,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
      
      return false;
    }
  }

  public async removeUserFromZone(userId: string, zoneId: string): Promise<boolean> {
    try {
      const userSockets = this.getUserSockets(userId);
      
      for (const socket of userSockets) {
        await this.roomService.leaveRoom(socket, RoomType.ZONE, zoneId);
      }
      
      logger.info('User left zone', {
        userId,
        zoneId,
        socketCount: userSockets.length,
        service: 'realtime-service',
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to remove user from zone', {
        userId,
        zoneId,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
      
      return false;
    }
  }

  public async joinUserToGuild(userId: string, guildId: string): Promise<boolean> {
    try {
      const userSockets = this.getUserSockets(userId);
      
      for (const socket of userSockets) {
        await this.roomService.joinRoom(socket, RoomType.GUILD, guildId);
      }
      
      logger.info('User joined guild', {
        userId,
        guildId,
        socketCount: userSockets.length,
        service: 'realtime-service',
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to join user to guild', {
        userId,
        guildId,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
      
      return false;
    }
  }

  public async joinUserToParty(userId: string, partyId: string): Promise<boolean> {
    try {
      const userSockets = this.getUserSockets(userId);
      
      for (const socket of userSockets) {
        await this.roomService.joinRoom(socket, RoomType.PARTY, partyId);
      }
      
      logger.info('User joined party', {
        userId,
        partyId,
        socketCount: userSockets.length,
        service: 'realtime-service',
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to join user to party', {
        userId,
        partyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'realtime-service',
      });
      
      return false;
    }
  }

  // Server statistics
  public getServerStats(): {
    totalConnections: number;
    authenticatedConnections: number;
    roomStats: ReturnType<RoomService['getRoomStats']>;
  } {
    let totalConnections = 0;
    let authenticatedConnections = 0;
    
    this.io.sockets.sockets.forEach((socket: SocketWithAuth) => {
      totalConnections++;
      if (socket.user) {
        authenticatedConnections++;
      }
    });
    
    return {
      totalConnections,
      authenticatedConnections,
      roomStats: this.roomService.getRoomStats(),
    };
  }

  // Health check
  public isHealthy(): boolean {
    return this.io.sockets.sockets.size >= 0 && this.roomService.isHealthy();
  }

  // Send notification to user
  public sendNotificationToUser(userId: string, type: 'info' | 'warning' | 'error', message: string): void {
    this.emitToUser(userId, 'system:notification', {
      type,
      message,
      timestamp: Date.now(),
    });
  }

  // Send notification to zone
  public sendNotificationToZone(zoneId: string, type: 'info' | 'warning' | 'error', message: string, excludeUserId?: string): void {
    this.emitToZone(zoneId, 'system:notification', {
      type,
      message,
      timestamp: Date.now(),
    }, excludeUserId);
  }

  // Send notification to all users
  public sendGlobalNotification(type: 'info' | 'warning' | 'error', message: string): void {
    this.broadcastToAll('system:notification', {
      type,
      message,
      timestamp: Date.now(),
    });
  }
}