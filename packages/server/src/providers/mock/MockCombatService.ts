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
  DamageType
} from '../interfaces/ICombatService';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of CombatService for testing
 * Uses predictable combat mechanics for testing
 */
export class MockCombatService implements ICombatService {
  // Active combat sessions
  private combatSessions: Map<string, CombatSession> = new Map();
  
  // Participant to session mapping
  private participantSessions: Map<string, string> = new Map();
  
  // Mock combatants database
  private mockCombatants: Map<string, Combatant> = new Map([
    ['player-test-001', {
      id: 'player-test-001',
      name: 'Test Hero',
      type: 'player',
      level: 10,
      currentHp: 100,
      maxHp: 100,
      currentMp: 50,
      maxMp: 50,
      stats: {
        attack: 25,
        defense: 15,
        speed: 18,
        critChance: 0.15,
        critDamage: 1.5,
        accuracy: 0.95,
        evasion: 0.1,
        resistances: {
          physical: 0.1,
          fire: 0.2,
          ice: 0.1,
          lightning: 0.05,
          holy: 0.3,
          dark: -0.1
        }
      },
      buffs: [],
      debuffs: []
    }],
    ['test_goblin_001', {
      id: 'test_goblin_001',
      name: 'Training Goblin',
      type: 'monster',
      level: 5,
      currentHp: 60,
      maxHp: 60,
      currentMp: 20,
      maxMp: 20,
      stats: {
        attack: 15,
        defense: 10,
        speed: 12,
        critChance: 0.05,
        critDamage: 1.2,
        accuracy: 0.85,
        evasion: 0.05
      },
      buffs: [],
      debuffs: []
    }],
    ['test_orc_001', {
      id: 'test_orc_001',
      name: 'Forest Orc',
      type: 'monster',
      level: 10,
      currentHp: 120,
      maxHp: 120,
      currentMp: 30,
      maxMp: 30,
      stats: {
        attack: 30,
        defense: 20,
        speed: 10,
        critChance: 0.1,
        critDamage: 1.5,
        accuracy: 0.9,
        evasion: 0.02,
        resistances: {
          physical: 0.2,
          fire: -0.1,
          ice: 0,
          lightning: 0,
          holy: -0.2,
          dark: 0.1
        }
      },
      buffs: [],
      debuffs: []
    }]
  ]);

  constructor() {
    logger.info('MockCombatService initialized');
  }

  async initiateCombat(attackerId: string, targetId: string): Promise<CombatSession> {
    logger.info(`MockCombatService: Initiating combat between ${attackerId} and ${targetId}`);
    
    const attacker = this.mockCombatants.get(attackerId);
    const target = this.mockCombatants.get(targetId);
    
    if (!attacker) {
      throw new Error(`Attacker ${attackerId} not found`);
    }
    if (!target) {
      throw new Error(`Target ${targetId} not found`);
    }
    
    // Check if already in combat
    if (this.participantSessions.has(attackerId)) {
      throw new Error(`${attackerId} is already in combat`);
    }
    if (this.participantSessions.has(targetId)) {
      throw new Error(`${targetId} is already in combat`);
    }
    
    const sessionId = `combat_${uuidv4()}`;
    const participants = [
      { ...attacker },
      { ...target }
    ];
    
    // Determine turn order by speed
    const turnOrder = participants
      .sort((a, b) => b.stats.speed - a.stats.speed)
      .map(p => p.id);
    
    const session: CombatSession = {
      id: sessionId,
      participants,
      currentTurn: 0,
      turnOrder,
      rounds: [],
      state: 'active',
      startedAt: new Date()
    };
    
    // Store session
    this.combatSessions.set(sessionId, session);
    this.participantSessions.set(attackerId, sessionId);
    this.participantSessions.set(targetId, sessionId);
    
    return session;
  }

  async processCombatAction(sessionId: string, action: CombatAction): Promise<CombatResult> {
    logger.info(`MockCombatService: Processing action in session ${sessionId}`, action);
    
    const session = this.combatSessions.get(sessionId);
    if (!session || session.state !== 'active') {
      throw new Error('Combat session not found or not active');
    }
    
    const currentParticipantId = session.turnOrder[session.currentTurn % session.turnOrder.length];
    const actor = session.participants.find(p => p.id === currentParticipantId);
    
    if (!actor) {
      throw new Error('Current participant not found');
    }
    
    let result: CombatResult;
    
    switch (action.type) {
      case 'attack':
        result = await this.processAttack(session, actor, action.targetId!);
        break;
      case 'defend':
        result = await this.processDefend(session, actor);
        break;
      case 'flee':
        result = await this.processFlee(session, actor);
        break;
      case 'skill':
        result = await this.processSkill(session, actor, action.targetId!, action.skillId!);
        break;
      default:
        result = {
          success: false,
          message: 'Invalid action type',
          combatEnded: false
        };
    }
    
    // Add action to current round
    const currentRoundIndex = Math.floor(session.currentTurn / session.participants.length);
    if (!session.rounds[currentRoundIndex]) {
      session.rounds[currentRoundIndex] = {
        roundNumber: currentRoundIndex + 1,
        actions: []
      };
    }
    
    session.rounds[currentRoundIndex].actions.push({
      participantId: actor.id,
      action,
      result,
      timestamp: new Date()
    });
    
    // Check for combat end
    if (result.combatEnded) {
      await this.endCombat(sessionId, {
        reason: result.winner === actor.id ? 'victory' : 'defeat',
        winner: result.winner,
        survivors: session.participants.filter(p => p.currentHp > 0).map(p => p.id),
        casualties: session.participants.filter(p => p.currentHp <= 0).map(p => p.id),
        rewards: {
          experience: BigInt(100 * session.participants.filter(p => p.type === 'monster').length),
          gold: BigInt(50 * session.participants.filter(p => p.type === 'monster').length),
          items: []
        }
      });
    } else {
      // Advance turn
      session.currentTurn++;
    }
    
    return result;
  }

  async endCombat(sessionId: string, outcome: CombatOutcome): Promise<void> {
    logger.info(`MockCombatService: Ending combat session ${sessionId}`, outcome);
    
    const session = this.combatSessions.get(sessionId);
    if (!session) {
      throw new Error('Combat session not found');
    }
    
    session.state = 'ended';
    session.endedAt = new Date();
    
    // Clear participant mappings
    session.participants.forEach(p => {
      this.participantSessions.delete(p.id);
    });
    
    // Keep session for history (in real implementation, might move to database)
    // For mock, we'll delete after a delay
    setTimeout(() => {
      this.combatSessions.delete(sessionId);
    }, 60000); // Keep for 1 minute
  }

  async calculateDamage(attacker: Combatant, target: Combatant, skill?: Skill): Promise<DamageResult> {
    logger.info(`MockCombatService: Calculating damage from ${attacker.name} to ${target.name}`);
    
    // Base damage calculation
    const baseDamage = skill ? 
      attacker.stats.attack * 1.5 : // Skills do 50% more damage
      attacker.stats.attack;
    
    // Defense reduction
    const defenseReduction = target.stats.defense * 0.5;
    const damageAfterDefense = Math.max(1, baseDamage - defenseReduction);
    
    // Critical hit check
    const isCritical = Math.random() < attacker.stats.critChance;
    const critMultiplier = isCritical ? attacker.stats.critDamage : 1;
    
    // Evasion check
    const isDodged = Math.random() < target.stats.evasion;
    
    // Block check (simplified - higher defense = higher block chance)
    const blockChance = Math.min(0.3, target.stats.defense / 100);
    const isBlocked = Math.random() < blockChance;
    
    // Damage type and resistance
    const damageType: DamageType = skill?.damageType || 'physical';
    const resistance = target.stats.resistances?.[damageType] || 0;
    const resistanceModifier = 1 - resistance;
    
    // Final damage
    let actualDamage = damageAfterDefense * critMultiplier * resistanceModifier;
    
    if (isDodged) {
      actualDamage = 0;
    } else if (isBlocked) {
      actualDamage *= 0.5; // 50% damage reduction on block
    }
    
    return {
      baseDamage: Math.floor(baseDamage),
      damageType,
      actualDamage: Math.floor(actualDamage),
      isCritical,
      isBlocked,
      isDodged,
      resistanceModifier
    };
  }

  async getActiveCombat(participantId: string): Promise<CombatSession | null> {
    logger.info(`MockCombatService: Getting active combat for ${participantId}`);
    
    const sessionId = this.participantSessions.get(participantId);
    if (!sessionId) {
      return null;
    }
    
    const session = this.combatSessions.get(sessionId);
    return session && session.state === 'active' ? session : null;
  }

  async applyStatusEffect(combatantId: string, effect: StatusEffect): Promise<void> {
    logger.info(`MockCombatService: Applying ${effect.type} to ${combatantId}`);
    
    const combatant = this.mockCombatants.get(combatantId);
    if (!combatant) {
      throw new Error(`Combatant ${combatantId} not found`);
    }
    
    if (effect.type === 'buff') {
      combatant.buffs.push(effect.effect);
    } else {
      combatant.debuffs.push(effect.effect);
    }
  }

  // Private helper methods
  private async processAttack(session: CombatSession, attacker: Combatant, targetId: string): Promise<CombatResult> {
    const target = session.participants.find(p => p.id === targetId);
    if (!target) {
      return {
        success: false,
        message: 'Target not found',
        combatEnded: false
      };
    }
    
    const damage = await this.calculateDamage(attacker, target);
    
    // Apply damage
    target.currentHp = Math.max(0, target.currentHp - damage.actualDamage);
    
    // Check if target is defeated
    const targetDefeated = target.currentHp <= 0;
    const combatEnded = targetDefeated && session.participants.filter(p => p.currentHp > 0).length === 1;
    
    return {
      success: true,
      damage,
      message: damage.isDodged ? `${target.name} dodged the attack!` :
               damage.isBlocked ? `${target.name} blocked the attack!` :
               damage.isCritical ? `Critical hit! ${attacker.name} dealt ${damage.actualDamage} damage!` :
               `${attacker.name} dealt ${damage.actualDamage} damage to ${target.name}`,
      combatEnded,
      winner: combatEnded ? attacker.id : undefined
    };
  }

  private async processDefend(session: CombatSession, actor: Combatant): Promise<CombatResult> {
    // Apply defend buff
    const defendBuff = {
      id: 'defend_' + Date.now(),
      name: 'Defending',
      duration: 1,
      modifier: { defense: actor.stats.defense * 0.5 } // 50% defense boost
    };
    
    actor.buffs.push(defendBuff);
    
    return {
      success: true,
      message: `${actor.name} is defending`,
      combatEnded: false
    };
  }

  private async processFlee(session: CombatSession, actor: Combatant): Promise<CombatResult> {
    // Flee chance based on speed difference
    const avgEnemySpeed = session.participants
      .filter(p => p.id !== actor.id)
      .reduce((sum, p) => sum + p.stats.speed, 0) / (session.participants.length - 1);
    
    const fleeChance = Math.min(0.9, Math.max(0.1, actor.stats.speed / avgEnemySpeed));
    const success = Math.random() < fleeChance;
    
    return {
      success,
      message: success ? `${actor.name} fled from combat!` : `${actor.name} failed to flee!`,
      combatEnded: success,
      winner: success ? undefined : session.participants.find(p => p.id !== actor.id)?.id
    };
  }

  private async processSkill(session: CombatSession, actor: Combatant, targetId: string, skillId: string): Promise<CombatResult> {
    // Mock skill implementation
    const mockSkill: Skill = {
      id: skillId,
      name: 'Fireball',
      damageType: 'fire',
      mpCost: 10,
      cooldown: 3
    };
    
    // Check MP
    if ((actor.currentMp || 0) < mockSkill.mpCost!) {
      return {
        success: false,
        message: 'Not enough MP',
        combatEnded: false
      };
    }
    
    // Deduct MP
    actor.currentMp = (actor.currentMp || 0) - mockSkill.mpCost!;
    
    // Process as attack with skill
    const target = session.participants.find(p => p.id === targetId);
    if (!target) {
      return {
        success: false,
        message: 'Target not found',
        combatEnded: false
      };
    }
    
    const damage = await this.calculateDamage(actor, target, mockSkill);
    target.currentHp = Math.max(0, target.currentHp - damage.actualDamage);
    
    const targetDefeated = target.currentHp <= 0;
    const combatEnded = targetDefeated && session.participants.filter(p => p.currentHp > 0).length === 1;
    
    return {
      success: true,
      damage,
      message: `${actor.name} cast ${mockSkill.name} for ${damage.actualDamage} ${mockSkill.damageType} damage!`,
      combatEnded,
      winner: combatEnded ? actor.id : undefined
    };
  }
}