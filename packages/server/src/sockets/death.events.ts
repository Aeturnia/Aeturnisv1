import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { IDeathEvent } from '../types/death';

export const DEATH_EVENTS = {
  OCCURRED: 'death:occurred',
  RESPAWNED: 'character:respawned',
  PENALTY_APPLIED: 'death:penalty_applied',
  STATUS_UPDATE: 'death:status_update'
} as const;

export class DeathEventHandler {
  constructor(private io: Server) {}

  /**
   * Emit death occurred event to zone
   */
  emitDeathOccurred(deathEvent: IDeathEvent, characterName: string): void {
    const eventData = {
      characterId: deathEvent.characterId,
      characterName,
      reason: deathEvent.reason,
      killerId: deathEvent.killerId,
      zoneId: deathEvent.zoneId,
      position: deathEvent.position,
      timestamp: deathEvent.deathAt.toISOString(),
    };

    // Emit to zone room
    this.io.to(`zone:${deathEvent.zoneId}`).emit(DEATH_EVENTS.OCCURRED, eventData);

    // Emit to character's personal room
    this.io.to(`character:${deathEvent.characterId}`).emit(DEATH_EVENTS.STATUS_UPDATE, {
      isDead: true,
      deathAt: deathEvent.deathAt.toISOString(),
    });

    logger.info('Death event emitted', { 
      characterId: deathEvent.characterId, 
      zoneId: deathEvent.zoneId 
    });
  }

  /**
   * Emit character respawned event
   */
  emitCharacterRespawned(
    characterId: string, 
    characterName: string, 
    zoneId: string, 
    position: { x: number; y: number }
  ): void {
    const eventData = {
      characterId,
      characterName,
      zoneId,
      position,
      timestamp: new Date().toISOString(),
    };

    // Emit to zone room
    this.io.to(`zone:${zoneId}`).emit(DEATH_EVENTS.RESPAWNED, eventData);

    // Emit to character's personal room
    this.io.to(`character:${characterId}`).emit(DEATH_EVENTS.STATUS_UPDATE, {
      isDead: false,
      respawnedAt: new Date().toISOString(),
    });

    logger.info('Respawn event emitted', { characterId, zoneId });
  }

  /**
   * Emit death penalty applied event
   */
  emitPenaltyApplied(
    characterId: string, 
    penalties: any
  ): void {
    const eventData = {
      characterId,
      penalties,
      timestamp: new Date().toISOString(),
    };

    // Emit to character's personal room
    this.io.to(`character:${characterId}`).emit(DEATH_EVENTS.PENALTY_APPLIED, eventData);

    logger.info('Death penalty event emitted', { characterId });
  }

  /**
   * Setup death-related socket event listeners
   */
  setupDeathEventListeners(socket: Socket): void {
    // Listen for death notifications from client
    socket.on('death:notify', (data) => {
      logger.info('Death notification received from client', { 
        socketId: socket.id, 
        data 
      });
      // Handle client death notifications if needed
    });

    // Listen for respawn requests from client
    socket.on('death:respawn_request', (data) => {
      logger.info('Respawn request received from client', { 
        socketId: socket.id, 
        data 
      });
      // Handle client respawn requests if needed
    });
  }
}