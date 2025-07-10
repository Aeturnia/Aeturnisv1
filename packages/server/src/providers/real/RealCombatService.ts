import { 
  ICombatService, 
  CombatSession, 
  CombatAction, 
  CombatResult, 
  CombatStartRequest,
  CombatEndResult,
  CharacterCombatStats,
  ResourcePool
} from '../interfaces/ICombatService';
import { CombatError } from '../../types/combat.types';
import { CombatService } from '../../services/CombatService';
import { logger } from '../../utils/logger';

/**
 * Real implementation wrapper for CombatService
 * Implements ICombatService interface and delegates to actual CombatService
 */
export class RealCombatService implements ICombatService {
  private combatService: CombatService;

  constructor() {
    // CombatService initializes its own dependencies
    this.combatService = new CombatService();
  }

  // New interface methods - delegate directly to CombatService

  async startCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession> {
    logger.info(`RealCombatService: Starting combat for ${initiatorId}`);
    return this.combatService.startCombat(initiatorId, request);
  }

  async processAction(sessionId: string, actorId: string, action: CombatAction): Promise<CombatResult | CombatError> {
    logger.info(`RealCombatService: Processing action ${action.type} for session ${sessionId}`);
    return this.combatService.processAction(sessionId, actorId, action);
  }

  async getSession(sessionId: string): Promise<CombatSession | null> {
    logger.info(`RealCombatService: Getting session ${sessionId}`);
    return this.combatService.getSession(sessionId);
  }

  async validateParticipant(sessionId: string, userId: string): Promise<boolean> {
    logger.info(`RealCombatService: Validating participant ${userId} in session ${sessionId}`);
    const session = await this.getSession(sessionId);
    if (!session) return false;
    
    return session.participants.some(p => p.charId === userId);
  }

  async fleeCombat(sessionId: string, userId: string): Promise<CombatResult> {
    logger.info(`RealCombatService: ${userId} attempting to flee from ${sessionId}`);
    
    const session = await this.getSession(sessionId);
    if (!session) {
      return {
        sessionId,
        action: { type: 'flee', timestamp: Date.now() },
        actorId: userId,
        message: 'Combat session not found',
        combatStatus: 'ended'
      };
    }
    
    // Create a flee action and process it
    const fleeAction: CombatAction = {
      type: 'flee',
      timestamp: Date.now()
    };
    
    const result = await this.processAction(sessionId, userId, fleeAction);
    
    // If it's a CombatError, convert it to a CombatResult
    if ('error' in result) {
      return {
        sessionId,
        action: fleeAction,
        actorId: userId,
        message: result.error,
        combatStatus: 'active'
      };
    }
    
    return result;
  }

  async getCharacterStats(charId: string): Promise<CharacterCombatStats> {
    logger.info(`RealCombatService: Getting character stats for ${charId}`);
    
    // In real implementation, this would query the database
    // For now, return mock data
    return {
      charId,
      level: 1,
      attack: 10,
      defense: 10,
      speed: 10,
      critRate: 0.1,
      critDamage: 1.5,
      resources: {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        stamina: 100,
        maxStamina: 100,
        hpRegenRate: 1,
        manaRegenRate: 1,
        staminaRegenRate: 2,
        lastRegenTime: Date.now()
      }
    };
  }

  async getCharacterResources(charId: string): Promise<ResourcePool | null> {
    logger.info(`RealCombatService: Getting character resources for ${charId}`);
    
    // In real implementation, this would query the database
    // For now, return mock data
    return {
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      stamina: 100,
      maxStamina: 100,
      hpRegenRate: 1,
      manaRegenRate: 1,
      staminaRegenRate: 2,
      lastRegenTime: Date.now()
    };
  }

  async simulateCombat(initiatorId: string, targetIds: string[]): Promise<CombatEndResult> {
    logger.info(`RealCombatService: Simulating combat between ${initiatorId} and ${targetIds}`);
    
    // Simple simulation
    const initiatorWins = Math.random() < 0.6;
    const duration = Math.floor(Math.random() * 30 + 10);
    
    return {
      sessionId: `sim_${Date.now()}`,
      winner: initiatorWins ? initiatorId : targetIds[0],
      loser: initiatorWins ? targetIds[0] : initiatorId,
      rewards: initiatorWins ? [
        { type: 'gold', amount: 100 },
        { type: 'experience', amount: 500 }
      ] : [],
      experience: initiatorWins ? 500 : 100,
      duration
    };
  }

  async forceStartCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession> {
    logger.info(`RealCombatService: Force starting combat for ${initiatorId}`);
    // Same as startCombat but might bypass some checks in future
    return this.startCombat(initiatorId, request);
  }

  // Legacy interface methods (optional) - not implemented in real service
  // These would only be implemented if needed for backward compatibility
}