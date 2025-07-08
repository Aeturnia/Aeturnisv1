import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

/**
 * Register NPC-related socket events
 * @param io The Socket.IO server instance
 * @param socket The client socket
 */
export const registerNPCEvents = (_io: Server, socket: Socket) => {
  // Watch an NPC for interaction updates
  socket.on('npc:watch', (npcId: string) => {
    try {
      socket.join(`npc:${npcId}`);
      logger.info(`Socket ${socket.id} watching NPC: ${npcId}`);
      
      socket.emit('npc:watching', {
        npcId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error watching NPC:', error);
      socket.emit('error', {
        message: 'Failed to watch NPC updates'
      });
    }
  });

  // Stop watching an NPC
  socket.on('npc:unwatch', (npcId: string) => {
    try {
      socket.leave(`npc:${npcId}`);
      logger.info(`Socket ${socket.id} stopped watching NPC: ${npcId}`);
      
      socket.emit('npc:unwatching', {
        npcId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error unwatching NPC:', error);
    }
  });

  // Join dialogue session room
  socket.on('dialogue:join', (sessionId: string) => {
    try {
      socket.join(`dialogue:${sessionId}`);
      logger.info(`Socket ${socket.id} joined dialogue session: ${sessionId}`);
      
      socket.emit('dialogue:joined', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error joining dialogue session:', error);
      socket.emit('error', {
        message: 'Failed to join dialogue session'
      });
    }
  });

  // Leave dialogue session room
  socket.on('dialogue:leave', (sessionId: string) => {
    try {
      socket.leave(`dialogue:${sessionId}`);
      logger.info(`Socket ${socket.id} left dialogue session: ${sessionId}`);
      
      socket.emit('dialogue:left', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error leaving dialogue session:', error);
    }
  });

  // Subscribe to trade updates for merchant NPCs
  socket.on('trade:subscribe', (merchantId: string) => {
    try {
      socket.join(`trade:${merchantId}`);
      logger.info(`Socket ${socket.id} subscribed to trade updates for merchant: ${merchantId}`);
      
      socket.emit('trade:subscribed', {
        merchantId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error subscribing to trade updates:', error);
      socket.emit('error', {
        message: 'Failed to subscribe to trade updates'
      });
    }
  });

  // Unsubscribe from trade updates
  socket.on('trade:unsubscribe', (merchantId: string) => {
    try {
      socket.leave(`trade:${merchantId}`);
      logger.info(`Socket ${socket.id} unsubscribed from trade updates for merchant: ${merchantId}`);
      
      socket.emit('trade:unsubscribed', {
        merchantId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error unsubscribing from trade updates:', error);
    }
  });
};

/**
 * Emit NPC dialogue started event
 * @param io The Socket.IO server instance
 * @param npcId The NPC ID
 * @param characterId The character starting dialogue
 * @param sessionId The dialogue session ID
 */
export const emitDialogueStarted = (
  io: Server, 
  npcId: string, 
  characterId: string, 
  sessionId: string
) => {
  const eventData = {
    npcId,
    characterId,
    sessionId,
    timestamp: new Date().toISOString()
  };

  io.to(`npc:${npcId}`).emit('npc:dialogue-started', eventData);
  io.to(`dialogue:${sessionId}`).emit('dialogue:started', eventData);
  
  logger.info(`Dialogue started: NPC ${npcId} with character ${characterId}`);
};

/**
 * Emit NPC dialogue updated event
 * @param io The Socket.IO server instance
 * @param sessionId The dialogue session ID
 * @param npcId The NPC ID
 * @param dialogueNode The current dialogue node
 */
export const emitDialogueUpdated = (
  io: Server, 
  sessionId: string, 
  npcId: string, 
  dialogueNode: Record<string, unknown>
) => {
  const eventData = {
    sessionId,
    npcId,
    dialogueNode,
    timestamp: new Date().toISOString()
  };

  io.to(`dialogue:${sessionId}`).emit('dialogue:updated', eventData);
  io.to(`npc:${npcId}`).emit('npc:dialogue-updated', eventData);
  
  logger.info(`Dialogue updated in session ${sessionId}: ${dialogueNode.id}`);
};

/**
 * Emit NPC dialogue ended event
 * @param io The Socket.IO server instance
 * @param sessionId The dialogue session ID
 * @param npcId The NPC ID
 * @param characterId The character ID
 * @param reason The reason dialogue ended
 */
export const emitDialogueEnded = (
  io: Server, 
  sessionId: string, 
  npcId: string, 
  characterId: string, 
  reason: string = 'completed'
) => {
  const eventData = {
    sessionId,
    npcId,
    characterId,
    reason,
    timestamp: new Date().toISOString()
  };

  io.to(`dialogue:${sessionId}`).emit('dialogue:ended', eventData);
  io.to(`npc:${npcId}`).emit('npc:dialogue-ended', eventData);
  
  logger.info(`Dialogue ended: session ${sessionId}, reason: ${reason}`);
};

/**
 * Emit trade interaction started event
 * @param io The Socket.IO server instance
 * @param merchantId The merchant NPC ID
 * @param characterId The character starting trade
 * @param tradeId The trade session ID
 */
export const emitTradeStarted = (
  io: Server, 
  merchantId: string, 
  characterId: string, 
  tradeId: string
) => {
  const eventData = {
    merchantId,
    characterId,
    tradeId,
    timestamp: new Date().toISOString()
  };

  io.to(`npc:${merchantId}`).emit('npc:trade-started', eventData);
  io.to(`trade:${merchantId}`).emit('trade:started', eventData);
  
  logger.info(`Trade started: merchant ${merchantId} with character ${characterId}`);
};

/**
 * Emit trade completed event
 * @param io The Socket.IO server instance
 * @param merchantId The merchant NPC ID
 * @param characterId The character ID
 * @param tradeId The trade session ID
 * @param tradeData The trade transaction data
 */
export const emitTradeCompleted = (
  io: Server, 
  merchantId: string, 
  characterId: string, 
  tradeId: string, 
  tradeData: Record<string, unknown>
) => {
  const eventData = {
    merchantId,
    characterId,
    tradeId,
    tradeData,
    timestamp: new Date().toISOString()
  };

  io.to(`npc:${merchantId}`).emit('npc:trade-completed', eventData);
  io.to(`trade:${merchantId}`).emit('trade:completed', eventData);
  
  logger.info(`Trade completed: ${tradeId} between merchant ${merchantId} and character ${characterId}`);
};

/**
 * Emit quest given event
 * @param io The Socket.IO server instance
 * @param npcId The quest giver NPC ID
 * @param characterId The character receiving the quest
 * @param questId The quest ID
 */
export const emitQuestGiven = (
  io: Server, 
  npcId: string, 
  characterId: string, 
  questId: string
) => {
  const eventData = {
    npcId,
    characterId,
    questId,
    timestamp: new Date().toISOString()
  };

  io.to(`npc:${npcId}`).emit('npc:quest-given', eventData);
  
  logger.info(`Quest ${questId} given by NPC ${npcId} to character ${characterId}`);
};

/**
 * Emit quest completed event
 * @param io The Socket.IO server instance
 * @param npcId The quest giver NPC ID
 * @param characterId The character completing the quest
 * @param questId The quest ID
 * @param rewards The quest rewards
 */
export const emitQuestCompleted = (
  io: Server, 
  npcId: string, 
  characterId: string, 
  questId: string, 
  rewards: Record<string, unknown>
) => {
  const eventData = {
    npcId,
    characterId,
    questId,
    rewards,
    timestamp: new Date().toISOString()
  };

  io.to(`npc:${npcId}`).emit('npc:quest-completed', eventData);
  
  logger.info(`Quest ${questId} completed by character ${characterId} at NPC ${npcId}`);
};