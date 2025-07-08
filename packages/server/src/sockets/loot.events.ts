import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { ILootDrop } from '../types/loot';

export const LOOT_EVENTS = {
  ASSIGNED: 'loot:assigned',
  ROLL: 'loot:roll',
  CLAIMED: 'loot:claimed',
  HISTORY_UPDATE: 'loot:history_update'
} as const;

export class LootEventHandler {
  constructor(private io: Server) {}

  /**
   * Emit loot assigned event to character
   */
  emitLootAssigned(
    characterId: string, 
    lootDrops: ILootDrop[], 
    source: string,
    combatSessionId?: string
  ): void {
    const eventData = {
      characterId,
      loot: lootDrops,
      source,
      combatSessionId,
      timestamp: new Date().toISOString(),
    };

    // Emit to character's personal room
    this.io.to(`character:${characterId}`).emit(LOOT_EVENTS.ASSIGNED, eventData);

    logger.info('Loot assigned event emitted', { 
      characterId, 
      itemCount: lootDrops.length,
      source 
    });
  }

  /**
   * Emit loot roll event to party/combat participants
   */
  emitLootRoll(
    combatSessionId: string, 
    participantIds: string[], 
    lootDrop: ILootDrop
  ): void {
    const eventData = {
      combatSessionId,
      loot: lootDrop,
      timestamp: new Date().toISOString(),
    };

    // Emit to all participants
    participantIds.forEach(participantId => {
      this.io.to(`character:${participantId}`).emit(LOOT_EVENTS.ROLL, eventData);
    });

    // Emit to combat session room
    this.io.to(`combat:${combatSessionId}`).emit(LOOT_EVENTS.ROLL, eventData);

    logger.info('Loot roll event emitted', { 
      combatSessionId, 
      participantCount: participantIds.length,
      item: lootDrop.itemId
    });
  }

  /**
   * Emit loot claimed event
   */
  emitLootClaimed(
    characterId: string, 
    characterName: string,
    lootDrops: ILootDrop[], 
    combatSessionId?: string
  ): void {
    const eventData = {
      characterId,
      characterName,
      loot: lootDrops,
      combatSessionId,
      timestamp: new Date().toISOString(),
    };

    // Emit to character's personal room
    this.io.to(`character:${characterId}`).emit(LOOT_EVENTS.CLAIMED, eventData);

    // If from combat, emit to combat session participants
    if (combatSessionId) {
      this.io.to(`combat:${combatSessionId}`).emit(LOOT_EVENTS.CLAIMED, eventData);
    }

    logger.info('Loot claimed event emitted', { 
      characterId, 
      itemCount: lootDrops.length,
      combatSessionId 
    });
  }

  /**
   * Emit loot history update
   */
  emitLootHistoryUpdate(characterId: string, newLootEntry: Record<string, unknown>): void {
    const eventData = {
      characterId,
      newEntry: newLootEntry,
      timestamp: new Date().toISOString(),
    };

    // Emit to character's personal room
    this.io.to(`character:${characterId}`).emit(LOOT_EVENTS.HISTORY_UPDATE, eventData);

    logger.info('Loot history update event emitted', { characterId });
  }

  /**
   * Setup loot-related socket event listeners
   */
  setupLootEventListeners(socket: Socket): void {
    // Listen for loot claim requests from client
    socket.on('loot:claim_request', (data) => {
      logger.info('Loot claim request received from client', { 
        socketId: socket.id, 
        data 
      });
      // Handle client loot claim requests if needed
    });

    // Listen for loot roll requests from client
    socket.on('loot:roll_request', (data) => {
      logger.info('Loot roll request received from client', { 
        socketId: socket.id, 
        data 
      });
      // Handle client loot roll requests if needed
    });

    // Listen for loot history requests from client
    socket.on('loot:history_request', (data) => {
      logger.info('Loot history request received from client', { 
        socketId: socket.id, 
        data 
      });
      // Handle client loot history requests if needed
    });
  }
}