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
  DamageType,
  CombatStartRequest,
  CombatEndResult,
  CharacterCombatStats,
  ResourcePool,
  LegacyCombatSession,
  LegacyCombatant,
  LegacyCombatAction,
  LegacyCombatResult
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
  
  // Mock combatants database - using new Combatant type
  private mockCombatants: Map<string, Combatant> = new Map([
    ['player-test-001', {
      charId: 'player-test-001',
      charName: 'Test Hero',
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      stamina: 100,
      maxStamina: 100,
      team: 'player',
      status: 'active',
      buffs: [],
      debuffs: [],
      level: 10,
      attack: 25,
      defense: 15,
      magicalAttack: 25,
      magicalDefense: 15,
      speed: 18,
      criticalChance: 0.15,
      criticalDamage: 1.5,
      dodgeChance: 0.1,
      blockChance: 0.1,
      accuracy: 0.95,
      weaponMinDamage: 10,
      weaponMaxDamage: 20
    }],
    ['test_goblin_001', {
      charId: 'test_goblin_001',
      charName: 'Training Goblin',
      hp: 60,
      maxHp: 60,
      mana: 20,
      maxMana: 20,
      stamina: 80,
      maxStamina: 80,
      team: 'enemy',
      status: 'active',
      buffs: [],
      debuffs: [],
      level: 5,
      attack: 15,
      defense: 10,
      magicalAttack: 10,
      magicalDefense: 8,
      speed: 12,
      criticalChance: 0.05,
      criticalDamage: 1.2,
      dodgeChance: 0.05,
      blockChance: 0.05,
      accuracy: 0.85,
      weaponMinDamage: 5,
      weaponMaxDamage: 10
    }],
    ['test_orc_001', {
      charId: 'test_orc_001',
      charName: 'Forest Orc',
      hp: 120,
      maxHp: 120,
      mana: 30,
      maxMana: 30,
      stamina: 120,
      maxStamina: 120,
      team: 'enemy',
      status: 'active',
      buffs: [],
      debuffs: [],
      level: 10,
      attack: 30,
      defense: 20,
      magicalAttack: 20,
      magicalDefense: 15,
      speed: 10,
      criticalChance: 0.1,
      criticalDamage: 1.5,
      dodgeChance: 0.02,
      blockChance: 0.2,
      accuracy: 0.9,
      weaponMinDamage: 15,
      weaponMaxDamage: 25
    }]
  ]);

  // Legacy combatants for legacy methods
  private legacyCombatants: Map<string, LegacyCombatant> = new Map();

  constructor() {
    logger.info('MockCombatService initialized');
    
    // Initialize legacy combatants from new combatants
    this.mockCombatants.forEach((combatant, id) => {
      this.legacyCombatants.set(id, {
        id: combatant.charId,
        name: combatant.charName,
        type: combatant.team === 'player' ? 'player' : 'monster',
        level: combatant.level,
        currentHp: combatant.hp,
        maxHp: combatant.maxHp,
        currentMp: combatant.mana,
        maxMp: combatant.maxMana,
        stats: {
          attack: combatant.attack,
          defense: combatant.defense,
          speed: combatant.speed,
          critChance: combatant.criticalChance,
          critDamage: combatant.criticalDamage,
          accuracy: combatant.accuracy,
          evasion: combatant.dodgeChance,
          resistances: {
            physical: 0.1,
            fire: 0,
            ice: 0,
            lightning: 0,
            holy: 0,
            dark: 0,
            poison: 0,
            psychic: 0
          }
        },
        buffs: [],
        debuffs: []
      });
    });
  }

  // New interface methods

  async startCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession> {
    logger.info(`MockCombatService: Starting combat - initiator: ${initiatorId}`);
    
    const sessionId = `combat_${Date.now()}_${uuidv4()}`;
    const participants: Combatant[] = [];
    
    // Add initiator
    const initiator = this.mockCombatants.get(initiatorId);
    if (initiator) {
      participants.push({ ...initiator });
    } else {
      // Create a default player if not found
      participants.push({
        charId: initiatorId,
        charName: 'Player',
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        stamina: 100,
        maxStamina: 100,
        team: 'player',
        status: 'active',
        buffs: [],
        debuffs: [],
        level: 1,
        attack: 10,
        defense: 10,
        magicalAttack: 10,
        magicalDefense: 10,
        speed: 10,
        criticalChance: 0.1,
        criticalDamage: 1.5,
        dodgeChance: 0.1,
        blockChance: 0.1,
        accuracy: 0.9,
        weaponMinDamage: 5,
        weaponMaxDamage: 10
      });
    }
    
    // Add targets
    for (const targetId of request.targetIds) {
      const target = this.mockCombatants.get(targetId);
      if (target) {
        participants.push({ ...target });
      }
    }
    
    const session: CombatSession = {
      sessionId,
      participants,
      turnOrder: participants.map(p => p.charId),
      currentTurn: 0,
      currentTurnIndex: 0,
      roundNumber: 1,
      status: 'active',
      startTime: Date.now(),
      combatLog: []
    };
    
    // Store session
    this.combatSessions.set(sessionId, session);
    
    // Map participants to session
    for (const participant of participants) {
      this.participantSessions.set(participant.charId, sessionId);
    }
    
    return session;
  }

  async processAction(action: CombatAction): Promise<CombatResult> {
    logger.info(`MockCombatService: Processing action - type: ${action.type}`);
    
    // Find session from participants
    const sessions = Array.from(this.combatSessions.values()).filter(s => s.status === 'active');
    const session = sessions[0]; // Use first active session for mock
    
    if (!session) {
      return {
        sessionId: 'mock',
        action,
        actorId: 'unknown',
        message: 'No active combat session',
        combatStatus: 'ended'
      };
    }
    
    // Get current actor
    const actorId = session.turnOrder[session.currentTurn % session.turnOrder.length];
    const actor = session.participants.find(p => p.charId === actorId);
    
    if (!actor) {
      return {
        sessionId: session.sessionId,
        action,
        actorId: actorId,
        message: 'Actor not found',
        combatStatus: 'active'
      };
    }
    
    let result: CombatResult;
    
    switch (action.type) {
      case 'attack':
      case CombatActionType.ATTACK:
        const targetId = action.targetCharId || action.targetId;
        if (!targetId) {
          result = {
            sessionId: session.sessionId,
            action,
            actorId: actor.charId,
            message: 'No target specified',
            combatStatus: 'active'
          };
        } else {
          const target = session.participants.find(p => p.charId === targetId);
          if (!target) {
            result = {
              sessionId: session.sessionId,
              action,
              actorId: actor.charId,
              message: 'Target not found',
              combatStatus: 'active'
            };
          } else {
            const damage = Math.floor(Math.random() * (actor.weaponMaxDamage - actor.weaponMinDamage) + actor.weaponMinDamage);
            target.hp = Math.max(0, target.hp - damage);
            
            result = {
              sessionId: session.sessionId,
              action,
              actorId: actor.charId,
              targetId: target.charId,
              damage,
              message: `${actor.charName} attacks ${target.charName} for ${damage} damage!`,
              combatStatus: target.hp <= 0 ? 'completed' : 'active'
            };
            
            if (target.hp <= 0) {
              target.status = 'defeated';
              session.status = 'completed';
              session.winner = actor.charId;
              session.endTime = Date.now();
            }
          }
        }
        break;
        
      case 'defend':
      case CombatActionType.DEFEND:
        result = {
          sessionId: session.sessionId,
          action,
          actorId: actor.charId,
          message: `${actor.charName} is defending`,
          combatStatus: 'active'
        };
        break;
        
      case 'flee':
      case CombatActionType.FLEE:
        const fleeSuccess = Math.random() < 0.7;
        if (fleeSuccess) {
          actor.status = 'fled';
          session.status = 'completed';
          session.endTime = Date.now();
          result = {
            sessionId: session.sessionId,
            action,
            actorId: actor.charId,
            message: `${actor.charName} fled from combat!`,
            combatStatus: 'completed'
          };
        } else {
          result = {
            sessionId: session.sessionId,
            action,
            actorId: actor.charId,
            message: `${actor.charName} failed to flee!`,
            combatStatus: 'active'
          };
        }
        break;
        
      default:
        result = {
          sessionId: session.sessionId,
          action,
          actorId: actor.charId,
          message: `${action.type} action processed`,
          combatStatus: 'active'
        };
    }
    
    // Advance turn if combat is still active
    if (session.status === 'active') {
      session.currentTurn++;
      session.currentTurnIndex = session.currentTurn;
      if (session.currentTurn % session.participants.length === 0) {
        session.roundNumber++;
      }
    }
    
    // Add to combat log
    if (session.combatLog) {
      session.combatLog.push({
        message: result.message,
        timestamp: Date.now(),
        actorId: result.actorId,
        type: 'action'
      });
    }
    
    return result;
  }

  async getSession(sessionId: string): Promise<CombatSession | null> {
    return this.combatSessions.get(sessionId) || null;
  }

  async validateParticipant(sessionId: string, userId: string): Promise<boolean> {
    const session = this.combatSessions.get(sessionId);
    if (!session) return false;
    
    return session.participants.some(p => p.charId === userId);
  }

  async fleeCombat(sessionId: string, userId: string): Promise<CombatResult> {
    logger.info(`MockCombatService: ${userId} attempting to flee from ${sessionId}`);
    
    const session = this.combatSessions.get(sessionId);
    if (!session) {
      return {
        sessionId,
        action: { type: CombatActionType.FLEE, timestamp: Date.now() },
        actorId: userId,
        message: 'Combat session not found',
        combatStatus: 'ended'
      };
    }
    
    const participant = session.participants.find(p => p.charId === userId);
    if (!participant) {
      return {
        sessionId,
        action: { type: CombatActionType.FLEE, timestamp: Date.now() },
        actorId: userId,
        message: 'You are not in this combat',
        combatStatus: 'active'
      };
    }
    
    // 70% chance to flee successfully
    const fleeSuccess = Math.random() < 0.7;
    
    if (fleeSuccess) {
      participant.status = 'fled';
      this.participantSessions.delete(userId);
      
      // Check if combat should end
      const activeParticipants = session.participants.filter(p => p.status === 'active');
      if (activeParticipants.length <= 1) {
        session.status = 'completed';
        session.endTime = Date.now();
        if (activeParticipants.length === 1) {
          session.winner = activeParticipants[0].charId;
        }
      }
      
      return {
        sessionId,
        action: { type: CombatActionType.FLEE, timestamp: Date.now() },
        actorId: userId,
        message: 'Successfully fled from combat!',
        combatStatus: session.status === 'completed' ? 'completed' : 'active'
      };
    } else {
      return {
        sessionId,
        action: { type: CombatActionType.FLEE, timestamp: Date.now() },
        actorId: userId,
        message: 'Failed to flee from combat!',
        damage: Math.floor(Math.random() * 10 + 5), // Take some damage for failed flee
        combatStatus: 'active'
      };
    }
  }

  async getCharacterStats(charId: string): Promise<CharacterCombatStats> {
    const combatant = this.mockCombatants.get(charId);
    
    return {
      charId,
      level: combatant?.level || 1,
      attack: combatant?.attack || 10,
      defense: combatant?.defense || 10,
      speed: combatant?.speed || 10,
      critRate: combatant?.criticalChance || 0.1,
      critDamage: combatant?.criticalDamage || 1.5,
      resources: {
        hp: combatant?.hp || 100,
        maxHp: combatant?.maxHp || 100,
        mana: combatant?.mana || 50,
        maxMana: combatant?.maxMana || 50,
        stamina: combatant?.stamina || 100,
        maxStamina: combatant?.maxStamina || 100,
        hpRegenRate: 1,
        manaRegenRate: 1,
        staminaRegenRate: 2,
        lastRegenTime: Date.now()
      }
    };
  }

  async getCharacterResources(charId: string): Promise<ResourcePool | null> {
    const combatant = this.mockCombatants.get(charId);
    if (!combatant) return null;
    
    return {
      hp: combatant.hp,
      maxHp: combatant.maxHp,
      mana: combatant.mana,
      maxMana: combatant.maxMana,
      stamina: combatant.stamina,
      maxStamina: combatant.maxStamina,
      hpRegenRate: 1,
      manaRegenRate: 1,
      staminaRegenRate: 2,
      lastRegenTime: Date.now()
    };
  }

  async simulateCombat(initiatorId: string, targetIds: string[]): Promise<CombatEndResult> {
    logger.info(`MockCombatService: Simulating combat between ${initiatorId} and ${targetIds}`);
    
    // Simple simulation - initiator wins 60% of the time
    const initiatorWins = Math.random() < 0.6;
    const duration = Math.floor(Math.random() * 30 + 10); // 10-40 turns
    
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
    logger.info(`MockCombatService: Force starting combat - initiator: ${initiatorId}`);
    // Same as startCombat but bypasses any checks
    return this.startCombat(initiatorId, request);
  }

  // Legacy interface methods (optional)

  async initiateCombat?(attackerId: string, targetId: string): Promise<LegacyCombatSession> {
    logger.info(`MockCombatService: Initiating legacy combat between ${attackerId} and ${targetId}`);
    
    const attacker = this.legacyCombatants.get(attackerId);
    const target = this.legacyCombatants.get(targetId);
    
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
    
    const session: LegacyCombatSession = {
      id: sessionId,
      participants,
      currentTurn: 0,
      turnOrder,
      rounds: [],
      state: 'active',
      startedAt: new Date()
    };
    
    // Store in new format too for compatibility
    const newSession: CombatSession = {
      sessionId,
      participants: participants.map(p => ({
        charId: p.id,
        charName: p.name,
        hp: p.currentHp,
        maxHp: p.maxHp,
        mana: p.currentMp || 50,
        maxMana: p.maxMp || 50,
        stamina: 100,
        maxStamina: 100,
        team: p.type === 'player' ? 'player' : 'enemy',
        status: 'active',
        buffs: [],
        debuffs: [],
        level: p.level,
        attack: p.stats.attack,
        defense: p.stats.defense,
        magicalAttack: p.stats.attack,
        magicalDefense: p.stats.defense,
        speed: p.stats.speed,
        criticalChance: p.stats.critChance,
        criticalDamage: p.stats.critDamage,
        dodgeChance: p.stats.evasion,
        blockChance: 0.1,
        accuracy: p.stats.accuracy,
        weaponMinDamage: 5,
        weaponMaxDamage: 15
      })),
      turnOrder,
      currentTurn: 0,
      currentTurnIndex: 0,
      roundNumber: 1,
      status: 'active',
      startTime: session.startedAt.getTime()
    };
    
    this.combatSessions.set(sessionId, newSession);
    this.participantSessions.set(attackerId, sessionId);
    this.participantSessions.set(targetId, sessionId);
    
    return session;
  }

  async processCombatAction?(_sessionId: string, action: LegacyCombatAction): Promise<LegacyCombatResult> {
    // Convert to new action format and process
    const newAction: CombatAction = {
      type: action.type as any,
      targetCharId: action.targetId,
      targetId: action.targetId,
      itemId: action.itemId,
      skillId: action.skillId,
      timestamp: Date.now()
    };
    
    const result = await this.processAction(newAction);
    
    // Convert back to legacy format
    return {
      success: !result.message.includes('failed'),
      message: result.message,
      combatEnded: result.combatStatus === 'completed',
      winner: result.combatStatus === 'completed' ? result.actorId : undefined
    };
  }

  async endCombat?(sessionId: string, outcome: CombatOutcome): Promise<void> {
    logger.info(`MockCombatService: Ending combat session ${sessionId}`, outcome);
    
    const session = this.combatSessions.get(sessionId);
    if (!session) {
      throw new Error('Combat session not found');
    }
    
    session.status = 'completed';
    session.endTime = Date.now();
    session.winner = outcome.winner;
    
    // Clear participant mappings
    session.participants.forEach(p => {
      this.participantSessions.delete(p.charId);
    });
    
    // Keep session for history
    setTimeout(() => {
      this.combatSessions.delete(sessionId);
    }, 60000); // Keep for 1 minute
  }

  async calculateDamage?(attacker: LegacyCombatant, target: LegacyCombatant, skill?: Skill): Promise<DamageResult> {
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
    
    // Block check
    const blockChance = Math.min(0.3, target.stats.defense / 100);
    const isBlocked = Math.random() < blockChance;
    
    // Damage type and resistance
    const damageType: DamageType = skill?.damageType || DamageType.PHYSICAL;
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

  async getActiveCombat?(participantId: string): Promise<LegacyCombatSession | null> {
    logger.info(`MockCombatService: Getting active combat for ${participantId}`);
    
    const sessionId = this.participantSessions.get(participantId);
    if (!sessionId) {
      return null;
    }
    
    const session = this.combatSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return null;
    }
    
    // Convert to legacy format
    return {
      id: session.sessionId,
      participants: session.participants.map(p => {
        const legacy = this.legacyCombatants.get(p.charId);
        return legacy || {
          id: p.charId,
          name: p.charName,
          type: p.team === 'player' ? 'player' : 'monster',
          level: p.level,
          currentHp: p.hp,
          maxHp: p.maxHp,
          currentMp: p.mana,
          maxMp: p.maxMana,
          stats: {
            attack: p.attack,
            defense: p.defense,
            speed: p.speed,
            critChance: p.criticalChance,
            critDamage: p.criticalDamage,
            accuracy: p.accuracy,
            evasion: p.dodgeChance
          },
          buffs: [],
          debuffs: []
        } as LegacyCombatant;
      }),
      currentTurn: session.currentTurn,
      turnOrder: session.turnOrder,
      rounds: [],
      state: session.status === 'active' ? 'active' : 'ended',
      startedAt: new Date(session.startTime)
    };
  }

  async applyStatusEffect?(combatantId: string, effect: StatusEffect): Promise<void> {
    logger.info(`MockCombatService: Applying ${effect.type} to ${combatantId}`);
    
    const combatant = this.mockCombatants.get(combatantId);
    if (!combatant) {
      throw new Error(`Combatant ${combatantId} not found`);
    }
    
    // Convert legacy effect to new format
    const newEffect: CombatBuff = {
      id: effect.effect.id,
      name: effect.effect.name,
      duration: effect.effect.duration,
      modifier: typeof effect.effect.modifier === 'number' ? effect.effect.modifier : 1
    };
    
    if (effect.type === 'buff') {
      combatant.buffs.push(newEffect);
    } else {
      combatant.debuffs.push(newEffect);
    }
    
    // Also apply to legacy combatant
    const legacyCombatant = this.legacyCombatants.get(combatantId);
    if (legacyCombatant) {
      if (effect.type === 'buff') {
        legacyCombatant.buffs.push(effect.effect);
      } else {
        legacyCombatant.debuffs.push(effect.effect);
      }
    }
  }
}

// Add missing import for CombatActionType and CombatBuff enums/types
import { CombatActionType, CombatBuff } from '../../types/combat.types';