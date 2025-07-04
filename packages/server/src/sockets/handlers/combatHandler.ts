import { Server } from 'socket.io';
import { SocketWithAuth, CombatActionPayload, CombatResultPayload, RoomType } from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { RoomService } from '../services/RoomService';
import { isAuthenticated } from '../middleware/authMiddleware';

interface CombatSession {
  sessionId: string;
  participants: string[];
  currentTurn: string;
  turnStartTime: number;
  turnDuration: number;
  sessionType: 'player-vs-player' | 'player-vs-monster' | 'monster-vs-monster';
  status: 'active' | 'paused' | 'ended';
  metadata?: Record<string, unknown>;
}

export class CombatHandler {
  private io: Server;
  private roomService: RoomService;
  private combatSessions: Map<string, CombatSession>;
  private userCombatSessions: Map<string, string>; // userId -> sessionId
  private actionCooldowns: Map<string, number>;
  private readonly ACTION_COOLDOWN = 1000; // 1 second between combat actions
  private readonly TURN_DURATION = 30000; // 30 seconds per turn
  private readonly MAX_PARTICIPANTS = 8; // Maximum players in a combat session

  constructor(io: Server, roomService: RoomService) {
    this.io = io;
    this.roomService = roomService;
    this.combatSessions = new Map();
    this.userCombatSessions = new Map();
    this.actionCooldowns = new Map();
  }

  // Handle combat action
  public handleCombatAction(socket: SocketWithAuth, payload: CombatActionPayload): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, characterId } = socket.user;

    // Check if user is in combat
    const sessionId = this.userCombatSessions.get(userId);
    if (!sessionId) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'You are not in combat',
      });
      return;
    }

    const session = this.combatSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Combat session is not active',
      });
      return;
    }

    // Check if it's the user's turn
    if (session.currentTurn !== userId) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'It is not your turn',
      });
      return;
    }

    // Check action cooldown
    if (this.isOnActionCooldown(userId)) {
      socket.emit('system:notification', {
        type: 'warning',
        message: 'Action on cooldown',
      });
      return;
    }

    // Validate combat action
    if (!this.validateCombatAction(payload, session)) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Invalid combat action',
      });
      return;
    }

    // Apply action cooldown
    this.applyActionCooldown(userId);

    // Process combat action
    const result = this.processCombatAction(userId, payload, session);

    // Broadcast action to combat participants
    const actionUpdate: CombatActionPayload & { userId: string } = {
      ...payload,
      userId,
    };

    this.roomService.broadcastToRoom(
      RoomType.COMBAT,
      sessionId,
      'combat:action',
      actionUpdate
    );

    // Broadcast combat result
    this.roomService.broadcastToRoom(
      RoomType.COMBAT,
      sessionId,
      'combat:result',
      result
    );

    // Update turn if action ends turn
    if (this.actionEndsTurn(payload)) {
      this.nextTurn(session);
    }

    logger.info('Combat action processed', {
      userId,
      characterId,
      sessionId,
      actionType: payload.actionType,
      targetId: payload.targetId,
      service: 'combat-handler',
    });
  }

  // Start a new combat session
  public async startCombatSession(
    initiatorId: string,
    participants: string[],
    sessionType: CombatSession['sessionType'],
    metadata?: Record<string, unknown>
  ): Promise<string | null> {
    if (participants.length > this.MAX_PARTICIPANTS) {
      logger.warn('Too many participants for combat session', {
        participantCount: participants.length,
        maxParticipants: this.MAX_PARTICIPANTS,
        service: 'combat-handler',
      });
      return null;
    }

    // Check if any participants are already in combat
    const conflictingUsers = participants.filter(userId => this.userCombatSessions.has(userId));
    if (conflictingUsers.length > 0) {
      logger.warn('Some participants already in combat', {
        conflictingUsers,
        service: 'combat-handler',
      });
      return null;
    }

    const sessionId = `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CombatSession = {
      sessionId,
      participants,
      currentTurn: participants[0], // First participant starts
      turnStartTime: Date.now(),
      turnDuration: this.TURN_DURATION,
      sessionType,
      status: 'active',
      metadata,
    };

    this.combatSessions.set(sessionId, session);

    // Map users to session
    participants.forEach(userId => {
      this.userCombatSessions.set(userId, sessionId);
    });

    // Create combat room and add participants
    for (const userId of participants) {
      // Find user's socket and join combat room
      const userSockets = this.getUserSockets(userId);
      for (const userSocket of userSockets) {
        await this.roomService.joinRoom(userSocket, RoomType.COMBAT, sessionId);
      }
    }

    // Start turn timer
    this.startTurnTimer(session);

    // Broadcast combat start
    this.roomService.broadcastToRoom(
      RoomType.COMBAT,
      sessionId,
      'combat:turn',
      {
        sessionId,
        currentTurn: session.currentTurn,
        timeRemaining: this.TURN_DURATION,
      }
    );

    logger.info('Combat session started', {
      sessionId,
      initiatorId,
      participants,
      sessionType,
      service: 'combat-handler',
    });

    return sessionId;
  }

  // End a combat session
  public async endCombatSession(sessionId: string, reason: string): Promise<void> {
    const session = this.combatSessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'ended';

    // Remove users from session mapping
    session.participants.forEach(userId => {
      this.userCombatSessions.delete(userId);
    });

    // Remove participants from combat room
    for (const userId of session.participants) {
      const userSockets = this.getUserSockets(userId);
      for (const userSocket of userSockets) {
        await this.roomService.leaveRoom(userSocket, RoomType.COMBAT, sessionId);
      }
    }

    // Clean up session
    this.combatSessions.delete(sessionId);

    logger.info('Combat session ended', {
      sessionId,
      reason,
      participants: session.participants,
      service: 'combat-handler',
    });
  }

  // Process combat action and calculate results
  private processCombatAction(userId: string, action: CombatActionPayload, session: CombatSession): CombatResultPayload {
    // Basic combat result calculation (placeholder implementation)
    const results: CombatResultPayload['results'] = [];

    switch (action.actionType) {
      case 'attack':
        if (action.targetId) {
          const damage = Math.floor(Math.random() * 20) + 5; // Random damage 5-25
          results.push({
            targetId: action.targetId,
            damage,
          });
        }
        break;

      case 'skill':
        if (action.skillId && action.targetId) {
          // Skill-based actions (placeholder)
          const damage = Math.floor(Math.random() * 30) + 10; // Random damage 10-40
          results.push({
            targetId: action.targetId,
            damage,
            statusEffects: [{
              id: 'burn',
              name: 'Burning',
              duration: 3000, // 3 seconds
            }],
          });
        }
        break;

      case 'item':
        if (action.itemId) {
          // Item usage (placeholder)
          if (action.targetId) {
            const healing = Math.floor(Math.random() * 25) + 15; // Random healing 15-40
            results.push({
              targetId: action.targetId,
              healing,
            });
          }
        }
        break;

      case 'defend':
        // Defensive action (no immediate results)
        break;

      case 'flee':
        // Attempt to flee combat
        const fleeSuccess = Math.random() > 0.5; // 50% chance
        if (fleeSuccess) {
          // Remove user from combat
          this.removeUserFromCombat(userId);
        }
        break;
    }

    return {
      sessionId: session.sessionId,
      action,
      results,
    };
  }

  // Remove user from combat session
  private async removeUserFromCombat(userId: string): Promise<void> {
    const sessionId = this.userCombatSessions.get(userId);
    if (!sessionId) {
      return;
    }

    const session = this.combatSessions.get(sessionId);
    if (!session) {
      return;
    }

    // Remove user from participants
    const participantIndex = session.participants.indexOf(userId);
    if (participantIndex !== -1) {
      session.participants.splice(participantIndex, 1);
    }

    // Remove user from session mapping
    this.userCombatSessions.delete(userId);

    // Remove user from combat room
    const userSockets = this.getUserSockets(userId);
    for (const userSocket of userSockets) {
      await this.roomService.leaveRoom(userSocket, RoomType.COMBAT, sessionId);
    }

    // Check if combat should end
    if (session.participants.length <= 1) {
      await this.endCombatSession(sessionId, 'insufficient_participants');
    } else if (session.currentTurn === userId) {
      // If it was the leaving user's turn, advance to next turn
      this.nextTurn(session);
    }

    logger.info('User removed from combat', {
      userId,
      sessionId,
      remainingParticipants: session.participants.length,
      service: 'combat-handler',
    });
  }

  // Advance to next turn
  private nextTurn(session: CombatSession): void {
    const currentIndex = session.participants.indexOf(session.currentTurn);
    const nextIndex = (currentIndex + 1) % session.participants.length;
    
    session.currentTurn = session.participants[nextIndex];
    session.turnStartTime = Date.now();

    // Start new turn timer
    this.startTurnTimer(session);

    // Broadcast turn change
    this.roomService.broadcastToRoom(
      RoomType.COMBAT,
      session.sessionId,
      'combat:turn',
      {
        sessionId: session.sessionId,
        currentTurn: session.currentTurn,
        timeRemaining: this.TURN_DURATION,
      }
    );

    logger.debug('Combat turn advanced', {
      sessionId: session.sessionId,
      newTurn: session.currentTurn,
      service: 'combat-handler',
    });
  }

  // Start turn timer
  private startTurnTimer(session: CombatSession): void {
    setTimeout(() => {
      const currentSession = this.combatSessions.get(session.sessionId);
      if (currentSession && currentSession.status === 'active' && 
          currentSession.currentTurn === session.currentTurn &&
          currentSession.turnStartTime === session.turnStartTime) {
        // Turn timeout - advance to next turn
        this.nextTurn(currentSession);
      }
    }, this.TURN_DURATION);
  }

  // Validate combat action
  private validateCombatAction(action: CombatActionPayload, session: CombatSession): boolean {
    const validActionTypes = ['attack', 'skill', 'item', 'defend', 'flee'];
    
    if (!validActionTypes.includes(action.actionType)) {
      return false;
    }

    // Validate required fields based on action type
    switch (action.actionType) {
      case 'attack':
        return !!action.targetId && session.participants.includes(action.targetId);
      case 'skill':
        return !!action.skillId && (!action.targetId || session.participants.includes(action.targetId));
      case 'item':
        return !!action.itemId;
      default:
        return true;
    }
  }

  // Check if action ends the current turn
  private actionEndsTurn(action: CombatActionPayload): boolean {
    // Most actions end the turn, except for certain instant actions
    const instantActions = ['defend']; // Actions that don't end turn
    return !instantActions.includes(action.actionType);
  }

  // Get user sockets (helper method)
  private getUserSockets(userId: string): SocketWithAuth[] {
    const sockets: SocketWithAuth[] = [];
    this.io.sockets.sockets.forEach((socket: SocketWithAuth) => {
      if (socket.user?.userId === userId) {
        sockets.push(socket);
      }
    });
    return sockets;
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

  // Clean up user combat state on disconnect
  public async cleanupUserCombat(userId: string): Promise<void> {
    const sessionId = this.userCombatSessions.get(userId);
    if (sessionId) {
      await this.removeUserFromCombat(userId);
    }
    this.actionCooldowns.delete(userId);
  }

  // Get combat statistics
  public getCombatStats(): {
    activeSessions: number;
    totalParticipants: number;
    activeCooldowns: number;
  } {
    let totalParticipants = 0;
    this.combatSessions.forEach(session => {
      totalParticipants += session.participants.length;
    });

    return {
      activeSessions: this.combatSessions.size,
      totalParticipants,
      activeCooldowns: this.actionCooldowns.size,
    };
  }

  // Get session info
  public getSessionInfo(sessionId: string): CombatSession | null {
    return this.combatSessions.get(sessionId) || null;
  }

  // Check if user is in combat
  public isUserInCombat(userId: string): boolean {
    return this.userCombatSessions.has(userId);
  }
}

// Factory function to create combat handler
export function createCombatHandler(io: Server, roomService: RoomService): CombatHandler {
  return new CombatHandler(io, roomService);
}