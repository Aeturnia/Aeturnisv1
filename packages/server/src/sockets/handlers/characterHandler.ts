import { Server } from 'socket.io';
import { SocketWithAuth, CharacterMovePayload, CharacterActionPayload, CharacterStatusPayload, RoomType } from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { RoomService } from '../services/RoomService';
import { isAuthenticated } from '../middleware/authMiddleware';

export class CharacterHandler {
  private roomService: RoomService;
  private movementCooldowns: Map<string, number>;
  private actionCooldowns: Map<string, number>;
  private readonly MOVEMENT_COOLDOWN = 500; // 500ms between movements
  private readonly ACTION_COOLDOWN = 1000; // 1 second between actions
  private readonly MAX_MOVEMENT_SPEED = 10; // Maximum movement units per update

  constructor(_io: Server, roomService: RoomService) {
    this.roomService = roomService;
    this.movementCooldowns = new Map();
    this.actionCooldowns = new Map();
  }

  // Handle character movement
  public handleCharacterMove(socket: SocketWithAuth, payload: CharacterMovePayload): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, characterId } = socket.user;

    // Check movement cooldown
    if (this.isOnMovementCooldown(userId)) {
      socket.emit('system:notification', {
        type: 'warning',
        message: 'Movement too fast, please slow down',
      });
      return;
    }

    // Validate movement payload
    if (!this.validateMovement(payload)) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Invalid movement data',
      });
      return;
    }

    // Anti-cheat: Validate movement distance/speed
    if (!this.validateMovementSpeed(payload)) {
      logger.warn('Suspicious movement detected', {
        userId,
        characterId,
        payload,
        service: 'character-handler',
      });
      socket.emit('system:notification', {
        type: 'error',
        message: 'Movement speed validation failed',
      });
      return;
    }

    // Apply movement cooldown
    this.applyMovementCooldown(userId);

    // Create movement update with user context
    const movementUpdate: CharacterMovePayload & { userId: string } = {
      ...payload,
      userId,
    };

    // Broadcast movement to zone
    this.roomService.broadcastToRoom(
      RoomType.ZONE,
      payload.zoneId,
      'character:move',
      movementUpdate,
      userId // Exclude sender
    );

    // Handle zone changes if necessary
    this.handleZoneChange(socket, payload);

    logger.debug('Character movement processed', {
      userId,
      characterId,
      x: payload.x,
      y: payload.y,
      zoneId: payload.zoneId,
      service: 'character-handler',
    });
  }

  // Handle character actions
  public handleCharacterAction(socket: SocketWithAuth, payload: CharacterActionPayload): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, characterId } = socket.user;

    // Check action cooldown
    if (this.isOnActionCooldown(userId)) {
      socket.emit('system:notification', {
        type: 'warning',
        message: 'Action on cooldown',
      });
      return;
    }

    // Validate action payload
    if (!this.validateAction(payload)) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Invalid action data',
      });
      return;
    }

    // Apply action cooldown
    this.applyActionCooldown(userId);

    // Process action based on type
    switch (payload.actionType) {
      case 'emote':
        this.handleEmoteAction(socket, payload);
        break;
      case 'interact':
        this.handleInteractAction(socket, payload);
        break;
      case 'cast':
        this.handleCastAction(socket, payload);
        break;
      case 'use_item':
        this.handleUseItemAction(socket, payload);
        break;
      default:
        socket.emit('system:notification', {
          type: 'error',
          message: 'Unknown action type',
        });
    }

    logger.info('Character action processed', {
      userId,
      characterId,
      actionType: payload.actionType,
      targetId: payload.targetId,
      service: 'character-handler',
    });
  }

  // Handle character status updates
  public handleCharacterStatus(socket: SocketWithAuth, payload: CharacterStatusPayload): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, characterId } = socket.user;

    // Validate status payload
    if (!this.validateStatus(payload)) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Invalid status data',
      });
      return;
    }

    // Server-side validation of status changes
    if (!this.validateStatusChanges(socket, payload)) {
      logger.warn('Suspicious status change detected', {
        userId,
        characterId,
        payload,
        service: 'character-handler',
      });
      return;
    }

    // Create status update with user context
    const statusUpdate: CharacterStatusPayload & { userId: string } = {
      ...payload,
      userId,
    };

    // Broadcast status to relevant users (party members, nearby players)
    this.broadcastStatusUpdate(socket, statusUpdate);

    logger.debug('Character status updated', {
      userId,
      characterId,
      health: payload.health,
      mana: payload.mana,
      level: payload.level,
      service: 'character-handler',
    });
  }

  // Handle emote action
  private handleEmoteAction(socket: SocketWithAuth, payload: CharacterActionPayload): void {
    if (!socket.user) {
      socket.emit('error', { code: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }
    
    const { userId } = socket.user;
    
    // Get current zone (placeholder implementation)
    const currentZone = 'tavern-district'; // TODO: Get from user's actual location
    
    const actionUpdate: CharacterActionPayload & { userId: string } = {
      ...payload,
      userId,
    };

    // Broadcast emote to zone
    this.roomService.broadcastToRoom(
      RoomType.ZONE,
      currentZone,
      'character:action',
      actionUpdate
    );
  }

  // Handle interact action
  private handleInteractAction(socket: SocketWithAuth, payload: CharacterActionPayload): void {
    if (!socket.user) {
      socket.emit('error', { code: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }
    
    const { userId } = socket.user;
    
    // Validate interaction target
    if (!payload.targetId) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'No interaction target specified',
      });
      return;
    }

    // TODO: Implement interaction logic (NPCs, objects, etc.)
    
    const actionUpdate: CharacterActionPayload & { userId: string } = {
      ...payload,
      userId,
    };

    // Broadcast interaction to relevant users
    const currentZone = 'tavern-district';
    this.roomService.broadcastToRoom(
      RoomType.ZONE,
      currentZone,
      'character:action',
      actionUpdate
    );
  }

  // Handle cast action
  private handleCastAction(socket: SocketWithAuth, payload: CharacterActionPayload): void {
    if (!socket.user) {
      socket.emit('error', { code: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }
    
    const { userId } = socket.user;
    
    // Validate skill casting
    if (!payload.skillId) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'No skill specified',
      });
      return;
    }

    // TODO: Implement skill validation and mana cost checking
    
    const actionUpdate: CharacterActionPayload & { userId: string } = {
      ...payload,
      userId,
    };

    // Broadcast cast to zone
    const currentZone = 'tavern-district';
    this.roomService.broadcastToRoom(
      RoomType.ZONE,
      currentZone,
      'character:action',
      actionUpdate
    );
  }

  // Handle use item action
  private handleUseItemAction(socket: SocketWithAuth, payload: CharacterActionPayload): void {
    if (!socket.user) {
      socket.emit('error', { code: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }
    
    const { userId } = socket.user;
    
    // Validate item usage
    if (!payload.itemId) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'No item specified',
      });
      return;
    }

    // TODO: Implement item validation and inventory checking
    
    const actionUpdate: CharacterActionPayload & { userId: string } = {
      ...payload,
      userId,
    };

    // Some items might be visible to others, some might not
    const currentZone = 'tavern-district';
    this.roomService.broadcastToRoom(
      RoomType.ZONE,
      currentZone,
      'character:action',
      actionUpdate
    );
  }

  // Handle zone changes
  private async handleZoneChange(socket: SocketWithAuth, payload: CharacterMovePayload): Promise<void> {
    if (!socket.user) {
      socket.emit('error', { code: 'AUTH_REQUIRED', message: 'Authentication required' });
      return;
    }
    
    // TODO: Implement actual zone change logic
    // For now, just ensure user is in the correct zone room
    
    const members = this.roomService.getRoomMembers(RoomType.ZONE, payload.zoneId);
    const isInZone = members.some(member => member.userId === socket.user!.userId);
    
    if (!isInZone) {
      await this.roomService.joinRoom(socket, RoomType.ZONE, payload.zoneId);
    }
  }

  // Broadcast status update to relevant users
  private broadcastStatusUpdate(_socket: SocketWithAuth, statusUpdate: CharacterStatusPayload & { userId: string }): void {
    // Broadcast to party members
    const partyId = 'default-party'; // TODO: Get user's actual party
    this.roomService.broadcastToRoom(RoomType.PARTY, partyId, 'character:status', statusUpdate);
    
    // Broadcast to nearby players in zone (optional, depending on game design)
    const currentZone = 'tavern-district';
    this.roomService.broadcastToRoom(RoomType.ZONE, currentZone, 'character:status', statusUpdate);
  }

  // Validate movement payload
  private validateMovement(payload: CharacterMovePayload): boolean {
    if (typeof payload.x !== 'number' || typeof payload.y !== 'number') {
      return false;
    }

    if (!payload.zoneId || typeof payload.zoneId !== 'string') {
      return false;
    }

    // Check for reasonable coordinate ranges
    if (payload.x < -10000 || payload.x > 10000 || payload.y < -10000 || payload.y > 10000) {
      return false;
    }

    return true;
  }

  // Validate movement speed (anti-cheat)
  private validateMovementSpeed(payload: CharacterMovePayload): boolean {
    // TODO: Implement actual movement speed validation
    // This would involve checking the distance from the previous position
    // and ensuring it's within reasonable limits
    
    if (payload.speed && payload.speed > this.MAX_MOVEMENT_SPEED) {
      return false;
    }

    return true;
  }

  // Validate action payload
  private validateAction(payload: CharacterActionPayload): boolean {
    const validActionTypes = ['emote', 'interact', 'cast', 'use_item'];
    
    if (!validActionTypes.includes(payload.actionType)) {
      return false;
    }

    // Validate required fields based on action type
    switch (payload.actionType) {
      case 'cast':
        return !!payload.skillId;
      case 'use_item':
        return !!payload.itemId;
      case 'interact':
        return !!payload.targetId;
      default:
        return true;
    }
  }

  // Validate status payload
  private validateStatus(payload: CharacterStatusPayload): boolean {
    // Check for valid numeric values
    if (typeof payload.health !== 'number' || typeof payload.mana !== 'number' ||
        typeof payload.maxHealth !== 'number' || typeof payload.maxMana !== 'number' ||
        typeof payload.level !== 'number') {
      return false;
    }

    // Check for reasonable ranges
    if (payload.health < 0 || payload.mana < 0 || payload.level < 1 || payload.level > 100) {
      return false;
    }

    if (payload.health > payload.maxHealth || payload.mana > payload.maxMana) {
      return false;
    }

    return true;
  }

  // Validate status changes against server state
  private validateStatusChanges(_socket: SocketWithAuth, _payload: CharacterStatusPayload): boolean {
    // TODO: Implement server-side validation against stored character state
    // This would prevent clients from sending arbitrary status updates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return true;
  }

  // Movement cooldown management
  private isOnMovementCooldown(userId: string): boolean {
    const lastMovement = this.movementCooldowns.get(userId);
    if (!lastMovement) {
      return false;
    }
    return Date.now() - lastMovement < this.MOVEMENT_COOLDOWN;
  }

  private applyMovementCooldown(userId: string): void {
    this.movementCooldowns.set(userId, Date.now());
  }

  // Action cooldown management
  private isOnActionCooldown(userId: string): boolean {
    const lastAction = this.actionCooldowns.get(userId);
    if (!lastAction) {
      return false;
    }
    return Date.now() - lastAction < this.ACTION_COOLDOWN;
  }

  private applyActionCooldown(userId: string): void {
    this.actionCooldowns.set(userId, Date.now());
  }

  // Clean up cooldowns on disconnect
  public cleanupCooldowns(userId: string): void {
    this.movementCooldowns.delete(userId);
    this.actionCooldowns.delete(userId);
  }

  // Get character handler statistics
  public getCharacterStats(): {
    activeMovementCooldowns: number;
    activeActionCooldowns: number;
  } {
    return {
      activeMovementCooldowns: this.movementCooldowns.size,
      activeActionCooldowns: this.actionCooldowns.size,
    };
  }
}

// Factory function to create character handler
export function createCharacterHandler(io: Server, roomService: RoomService): CharacterHandler {
  return new CharacterHandler(io, roomService);
}