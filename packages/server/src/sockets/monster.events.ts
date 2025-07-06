import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

/**
 * Register monster-related socket events
 * @param io The Socket.IO server instance
 * @param socket The client socket
 */
export const registerMonsterEvents = (io: Server, socket: Socket) => {
  // Subscribe to zone updates for monster spawns/deaths
  socket.on('zone:subscribe', (zoneId: string) => {
    try {
      socket.join(`zone:${zoneId}`);
      logger.info(`Socket ${socket.id} subscribed to zone: ${zoneId}`);
      
      socket.emit('zone:subscribed', {
        zoneId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error subscribing to zone:', error);
      socket.emit('error', {
        message: 'Failed to subscribe to zone updates'
      });
    }
  });

  // Unsubscribe from zone updates
  socket.on('zone:unsubscribe', (zoneId: string) => {
    try {
      socket.leave(`zone:${zoneId}`);
      logger.info(`Socket ${socket.id} unsubscribed from zone: ${zoneId}`);
      
      socket.emit('zone:unsubscribed', {
        zoneId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error unsubscribing from zone:', error);
    }
  });

  // Watch a specific monster for updates
  socket.on('monster:watch', (monsterId: string) => {
    try {
      socket.join(`monster:${monsterId}`);
      logger.info(`Socket ${socket.id} watching monster: ${monsterId}`);
      
      socket.emit('monster:watching', {
        monsterId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error watching monster:', error);
      socket.emit('error', {
        message: 'Failed to watch monster updates'
      });
    }
  });

  // Stop watching a specific monster
  socket.on('monster:unwatch', (monsterId: string) => {
    try {
      socket.leave(`monster:${monsterId}`);
      logger.info(`Socket ${socket.id} stopped watching monster: ${monsterId}`);
      
      socket.emit('monster:unwatching', {
        monsterId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error unwatching monster:', error);
    }
  });
};

/**
 * Emit monster spawned event to zone subscribers
 * @param io The Socket.IO server instance
 * @param zoneId The zone where the monster spawned
 * @param monsterData The spawned monster data
 */
export const emitMonsterSpawned = (io: Server, zoneId: string, monsterData: any) => {
  io.to(`zone:${zoneId}`).emit('monster:spawned', {
    monster: monsterData,
    timestamp: new Date().toISOString()
  });
  
  logger.info(`Monster spawned in zone ${zoneId}: ${monsterData.id}`);
};

/**
 * Emit monster killed event to zone subscribers
 * @param io The Socket.IO server instance
 * @param zoneId The zone where the monster was killed
 * @param monsterId The killed monster ID
 * @param killedBy Optional character ID who killed the monster
 */
export const emitMonsterKilled = (io: Server, zoneId: string, monsterId: string, killedBy?: string) => {
  const eventData = {
    monsterId,
    killedBy,
    timestamp: new Date().toISOString()
  };

  io.to(`zone:${zoneId}`).emit('monster:killed', eventData);
  io.to(`monster:${monsterId}`).emit('monster:killed', eventData);
  
  logger.info(`Monster killed in zone ${zoneId}: ${monsterId}${killedBy ? ` by ${killedBy}` : ''}`);
};

/**
 * Emit monster state changed event
 * @param io The Socket.IO server instance
 * @param zoneId The zone where the monster is located
 * @param monsterId The monster ID
 * @param oldState The previous state
 * @param newState The new state
 * @param targetId Optional target character ID
 */
export const emitMonsterStateChanged = (
  io: Server, 
  zoneId: string, 
  monsterId: string, 
  oldState: string, 
  newState: string, 
  targetId?: string
) => {
  const eventData = {
    monsterId,
    oldState,
    newState,
    targetId,
    timestamp: new Date().toISOString()
  };

  io.to(`zone:${zoneId}`).emit('monster:state-changed', eventData);
  io.to(`monster:${monsterId}`).emit('monster:state-changed', eventData);
  
  logger.info(`Monster ${monsterId} state changed from ${oldState} to ${newState}`);
};

/**
 * Emit monster position updated event
 * @param io The Socket.IO server instance
 * @param zoneId The zone where the monster is located
 * @param monsterId The monster ID
 * @param position The new position
 */
export const emitMonsterPositionUpdated = (
  io: Server, 
  zoneId: string, 
  monsterId: string, 
  position: { x: number; y: number; z: number }
) => {
  const eventData = {
    monsterId,
    position,
    timestamp: new Date().toISOString()
  };

  io.to(`zone:${zoneId}`).emit('monster:position-updated', eventData);
  io.to(`monster:${monsterId}`).emit('monster:position-updated', eventData);
  
  logger.debug(`Monster ${monsterId} position updated: ${JSON.stringify(position)}`);
};

/**
 * Emit monster health changed event
 * @param io The Socket.IO server instance
 * @param zoneId The zone where the monster is located
 * @param monsterId The monster ID
 * @param currentHp Current health points
 * @param maxHp Maximum health points
 */
export const emitMonsterHealthChanged = (
  io: Server, 
  zoneId: string, 
  monsterId: string, 
  currentHp: number, 
  maxHp: number
) => {
  const eventData = {
    monsterId,
    currentHp,
    maxHp,
    healthPercentage: Math.round((currentHp / maxHp) * 100),
    timestamp: new Date().toISOString()
  };

  io.to(`zone:${zoneId}`).emit('monster:health-changed', eventData);
  io.to(`monster:${monsterId}`).emit('monster:health-changed', eventData);
  
  logger.debug(`Monster ${monsterId} health: ${currentHp}/${maxHp}`);
};