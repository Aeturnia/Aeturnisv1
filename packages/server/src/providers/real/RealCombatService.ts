import { 
  ICombatService, 
  CombatSession, 
  CombatAction, 
  CombatResult, 
  DamageResult, 
  Combatant, 
  CombatOutcome,
  StatusEffect,
  Skill,
  CombatSessionNew,
  CombatActionNew,
  CombatResultNew,
  CombatStartRequest,
  CombatEndResult,
  CharacterCombatStats,
  ResourcePool
} from '../interfaces/ICombatService';
import { CombatService } from '../../services/CombatService';
import { CharacterService } from '../../services/CharacterService';
import { ResourceService } from '../../services/ResourceService';
import { StatsService } from '../../services/StatsService';
import { TestMonsterService } from '../../services/TestMonsterService';

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

  async initiateCombat(attackerId: string, targetId: string): Promise<CombatSession> {
    // Use the new startCombat method
    const request: CombatStartRequest = {
      targetIds: [targetId],
      battleType: 'pve'
    };
    
    const result = await this.combatService.startCombat(attackerId, request);
    
    // Map to legacy interface format
    const participants: Combatant[] = result.participants.map((p: any) => ({
      id: p.charId,
      name: p.charName,
      type: p.team === 'player' ? 'player' : 'monster',
      level: p.level || 1,
      currentHp: p.hp || 100,
      maxHp: p.maxHp || 100,
      currentMp: p.mana || 50,
      maxMp: p.maxMana || 50,
      stats: {
        attack: p.attack || 10,
        defense: p.defense || 10,
        speed: p.speed || 10,
        critChance: p.criticalChance || 0.1,
        critDamage: p.criticalDamage || 1.5,
        accuracy: p.accuracy || 0.9,
        evasion: p.dodgeChance || 0.1
      },
      buffs: p.buffs || [],
      debuffs: p.debuffs || []
    }));
    
    return {
      id: result.sessionId,
      participants,
      currentTurn: result.currentTurnIndex || 0,
      turnOrder: result.turnOrder || participants.map(p => p.id),
      rounds: [],
      state: result.status === 'active' ? 'active' : 'ended',
      startedAt: new Date(result.startTime)
    };
  }

  async processCombatAction(sessionId: string, action: CombatAction): Promise<CombatResult> {
    // Map action to new service format
    const combatAction: CombatActionNew = {
      type: action.type as any,
      targetCharId: action.targetId,
      itemId: action.itemId,
      skillId: action.skillId,
      timestamp: Date.now()
    };
    
    const result = await this.combatService.processAction(combatAction);
    
    // Map damage if present
    let damage: DamageResult | undefined;
    if (result.damage) {
      damage = {
        baseDamage: result.damage,
        damageType: 'physical' as any,
        actualDamage: result.damage,
        isCritical: false,
        isBlocked: false,
        isDodged: false,
        resistanceModifier: 1
      };
    }
    
    return {
      success: true,
      damage,
      message: result.message || 'Action processed',
      combatEnded: result.combatStatus === 'ended',
      winner: undefined
    };
  }

  async endCombat(sessionId: string, outcome: CombatOutcome): Promise<void> {
    // The real service doesn't have an endCombat method
    // Combat ends automatically when conditions are met
    // This is a no-op for compatibility
  }

  async calculateDamage(attacker: Combatant, target: Combatant, skill?: Skill): Promise<DamageResult> {
    // Use stats service or simulate
    const baseDamage = attacker.stats.attack;
    const defense = target.stats.defense;
    const actualDamage = Math.max(1, baseDamage - defense * 0.5);
    
    return {
      baseDamage: Math.floor(baseDamage),
      damageType: skill?.damageType || 'physical',
      actualDamage: Math.floor(actualDamage),
      isCritical: Math.random() < attacker.stats.critChance,
      isBlocked: false,
      isDodged: Math.random() < target.stats.evasion,
      resistanceModifier: 1
    };
  }

  async getActiveCombat(participantId: string): Promise<CombatSession | null> {
    // The real service doesn't have getCombatSession
    // We need to find the session by checking all sessions
    // For now, return null as we can't efficiently find it
    return null;
  }

  async applyStatusEffect(combatantId: string, effect: StatusEffect): Promise<void> {
    // Real service may handle this differently
    // Would need to implement or adapt
  }

  // New interface methods

  async startCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSessionNew> {
    const session = await this.combatService.startCombat(initiatorId, request);
    return session;
  }

  async processAction(action: CombatActionNew): Promise<CombatResultNew> {
    const result = await this.combatService.processAction(action);
    return result;
  }

  async getSession(sessionId: string): Promise<CombatSessionNew | null> {
    const session = await this.combatService.getSession(sessionId);
    return session;
  }

  async validateParticipant(sessionId: string, userId: string): Promise<boolean> {
    const isValid = await this.combatService.validateParticipant(sessionId, userId);
    return isValid;
  }

  async fleeCombat(sessionId: string, userId: string): Promise<CombatResultNew> {
    const result = await this.combatService.fleeCombat(sessionId, userId);
    return result;
  }

  async getCharacterStats(charId: string): Promise<CharacterCombatStats> {
    const stats = await this.combatService.getCharacterStats(charId);
    return stats;
  }

  async getCharacterResources(charId: string): Promise<ResourcePool | null> {
    const resources = await this.combatService.getCharacterResources(charId);
    return resources;
  }

  async simulateCombat(initiatorId: string, targetIds: string[]): Promise<CombatEndResult> {
    const result = await this.combatService.simulateCombat(initiatorId, targetIds);
    return result;
  }

  async forceStartCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSessionNew> {
    const session = await this.combatService.forceStartCombat(initiatorId, request);
    return session;
  }
}