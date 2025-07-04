import { Server } from 'socket.io';
import { SocketWithAuth, RoomType } from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { isAuthenticated } from '../middleware/authMiddleware';

export interface RoomMember {
  userId: string;
  socketId: string;
  joinedAt: number;
  characterId?: string;
  username?: string;
}

export interface RoomInfo {
  id: string;
  type: RoomType;
  members: Map<string, RoomMember>;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export class RoomService {
  private io: Server;
  private rooms: Map<string, RoomInfo>;
  private userRooms: Map<string, Set<string>>; // userId -> Set of room IDs

  constructor(io: Server) {
    this.io = io;
    this.rooms = new Map();
    this.userRooms = new Map();
  }

  // Generate room ID based on type and identifier
  private generateRoomId(type: RoomType, identifier: string): string {
    return `${type}:${identifier}`;
  }

  // Create or get existing room
  private getOrCreateRoom(type: RoomType, identifier: string, metadata?: Record<string, unknown>): RoomInfo {
    const roomId = this.generateRoomId(type, identifier);
    
    if (!this.rooms.has(roomId)) {
      const room: RoomInfo = {
        id: roomId,
        type,
        members: new Map(),
        createdAt: Date.now(),
        metadata,
      };
      this.rooms.set(roomId, room);
      
      logger.info('Room created', {
        roomId,
        type,
        identifier,
        service: 'room-service',
      });
    }
    
    return this.rooms.get(roomId)!;
  }

  // Join a room
  public async joinRoom(
    socket: SocketWithAuth,
    type: RoomType,
    identifier: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    if (!isAuthenticated(socket)) {
      logger.warn('Unauthenticated socket attempted to join room', {
        socketId: socket.id,
        roomType: type,
        identifier,
        service: 'room-service',
      });
      return false;
    }

    const roomId = this.generateRoomId(type, identifier);
    const room = this.getOrCreateRoom(type, identifier, metadata);

    // Check if user is already in the room
    if (room.members.has(socket.user.userId)) {
      logger.info('User already in room', {
        userId: socket.user.userId,
        roomId,
        service: 'room-service',
      });
      return true;
    }

    // Validate room access permissions
    if (!this.validateRoomAccess(socket, type, identifier)) {
      logger.warn('Room access denied', {
        userId: socket.user.userId,
        roomId,
        service: 'room-service',
      });
      return false;
    }

    // Add member to room
    const member: RoomMember = {
      userId: socket.user.userId,
      socketId: socket.id,
      joinedAt: Date.now(),
      characterId: socket.user.characterId,
      username: socket.user.email.split('@')[0], // Use email prefix as username for now
    };

    room.members.set(socket.user.userId, member);

    // Track user's rooms
    if (!this.userRooms.has(socket.user.userId)) {
      this.userRooms.set(socket.user.userId, new Set());
    }
    this.userRooms.get(socket.user.userId)!.add(roomId);

    // Join socket to room
    await socket.join(roomId);

    // Notify room members
    socket.to(roomId).emit('room:joined', {
      roomType: type,
      roomId: identifier,
      member: {
        userId: socket.user.userId,
        username: member.username,
        characterId: member.characterId,
      },
    });

    // Notify the joining user
    socket.emit('room:joined', {
      roomType: type,
      roomId: identifier,
    });

    logger.info('User joined room', {
      userId: socket.user.userId,
      roomId,
      memberCount: room.members.size,
      service: 'room-service',
    });

    return true;
  }

  // Leave a room
  public async leaveRoom(socket: SocketWithAuth, type: RoomType, identifier: string): Promise<boolean> {
    if (!isAuthenticated(socket)) {
      return false;
    }

    const roomId = this.generateRoomId(type, identifier);
    const room = this.rooms.get(roomId);

    if (!room || !room.members.has(socket.user.userId)) {
      return false;
    }

    // Remove member from room
    const member = room.members.get(socket.user.userId)!;
    room.members.delete(socket.user.userId);

    // Update user's rooms
    this.userRooms.get(socket.user.userId)?.delete(roomId);

    // Leave socket room
    await socket.leave(roomId);

    // Notify room members
    socket.to(roomId).emit('room:left', {
      roomType: type,
      roomId: identifier,
      member: {
        userId: socket.user.userId,
        username: member.username,
        characterId: member.characterId,
      },
    });

    // Notify the leaving user
    socket.emit('room:left', {
      roomType: type,
      roomId: identifier,
    });

    logger.info('User left room', {
      userId: socket.user.userId,
      roomId,
      memberCount: room.members.size,
      service: 'room-service',
    });

    // Clean up empty rooms (except persistent ones)
    if (room.members.size === 0 && !this.isPersistentRoom(type)) {
      this.rooms.delete(roomId);
      logger.info('Empty room cleaned up', {
        roomId,
        service: 'room-service',
      });
    }

    return true;
  }

  // Get room members
  public getRoomMembers(type: RoomType, identifier: string): RoomMember[] {
    const roomId = this.generateRoomId(type, identifier);
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return [];
    }

    return Array.from(room.members.values());
  }

  // Get room member count
  public getRoomMemberCount(type: RoomType, identifier: string): number {
    const roomId = this.generateRoomId(type, identifier);
    const room = this.rooms.get(roomId);
    
    return room ? room.members.size : 0;
  }

  // Broadcast to room
  public broadcastToRoom(
    type: RoomType,
    identifier: string,
    event: string,
    data: unknown,
    excludeUserId?: string
  ): void {
    const roomId = this.generateRoomId(type, identifier);
    const room = this.rooms.get(roomId);

    if (!room) {
      logger.warn('Attempted to broadcast to non-existent room', {
        roomId,
        event,
        service: 'room-service',
      });
      return;
    }

    if (excludeUserId) {
      // Broadcast to all except specified user
      Array.from(room.members.values())
        .filter(member => member.userId !== excludeUserId)
        .forEach(member => {
          this.io.to(member.socketId).emit(event, data);
        });
    } else {
      // Broadcast to all room members
      this.io.to(roomId).emit(event, data);
    }

    logger.debug('Broadcast sent to room', {
      roomId,
      event,
      memberCount: room.members.size,
      excludeUserId,
      service: 'room-service',
    });
  }

  // Clean up user from all rooms when they disconnect
  public async cleanupUserRooms(userId: string): Promise<void> {
    const userRoomIds = this.userRooms.get(userId);
    
    if (!userRoomIds) {
      return;
    }

    for (const roomId of userRoomIds) {
      const room = this.rooms.get(roomId);
      
      if (room && room.members.has(userId)) {
        const member = room.members.get(userId)!;
        room.members.delete(userId);

        // Notify room members
        this.io.to(roomId).emit('room:left', {
          roomType: room.type,
          roomId: roomId.split(':')[1],
          member: {
            userId,
            username: member.username,
            characterId: member.characterId,
          },
        });

        // Clean up empty rooms
        if (room.members.size === 0 && !this.isPersistentRoom(room.type)) {
          this.rooms.delete(roomId);
        }
      }
    }

    this.userRooms.delete(userId);

    logger.info('User rooms cleaned up', {
      userId,
      roomCount: userRoomIds.size,
      service: 'room-service',
    });
  }

  // Get all rooms for a user
  public getUserRooms(userId: string): Array<{ type: RoomType; identifier: string }> {
    const userRoomIds = this.userRooms.get(userId);
    
    if (!userRoomIds) {
      return [];
    }

    return Array.from(userRoomIds).map(roomId => {
      const [type, identifier] = roomId.split(':');
      return {
        type: type as RoomType,
        identifier,
      };
    });
  }

  // Validate room access permissions
  private validateRoomAccess(socket: SocketWithAuth, type: RoomType, identifier: string): boolean {
    if (!socket.user) {
      return false;
    }

    // Basic validation - can be extended with more complex permission logic
    switch (type) {
      case RoomType.USER:
        // Only allow users to join their own private room
        return identifier === socket.user.userId;
      
      case RoomType.ZONE:
        // Allow all authenticated users to join zone rooms
        return true;
      
      case RoomType.GUILD:
        // TODO: Implement guild membership validation
        return true;
      
      case RoomType.PARTY:
        // TODO: Implement party membership validation
        return true;
      
      case RoomType.COMBAT:
        // TODO: Implement combat session validation
        return true;
      
      default:
        return false;
    }
  }

  // Check if room should persist when empty
  private isPersistentRoom(type: RoomType): boolean {
    return type === RoomType.ZONE; // Zone rooms persist even when empty
  }

  // Get room statistics
  public getRoomStats(): {
    totalRooms: number;
    roomsByType: Record<RoomType, number>;
    totalMembers: number;
    averageMembersPerRoom: number;
  } {
    const roomsByType = {
      [RoomType.USER]: 0,
      [RoomType.ZONE]: 0,
      [RoomType.GUILD]: 0,
      [RoomType.PARTY]: 0,
      [RoomType.COMBAT]: 0,
    };

    let totalMembers = 0;

    for (const room of this.rooms.values()) {
      roomsByType[room.type]++;
      totalMembers += room.members.size;
    }

    return {
      totalRooms: this.rooms.size,
      roomsByType,
      totalMembers,
      averageMembersPerRoom: this.rooms.size > 0 ? totalMembers / this.rooms.size : 0,
    };
  }

  // Health check
  public isHealthy(): boolean {
    return this.rooms.size >= 0; // Basic health check
  }
}