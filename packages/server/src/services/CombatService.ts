import { v4 as uuidv4 } from 'uuid';
import { 
  CombatSession, 
  CombatAction, 
  CombatResult, 
  CharacterCombatStats,
  CombatParticipant,
  CombatActionType,
  CombatStartRequest,
  CombatEndResult
} from '../types/combat.types';
import { ResourcePool, ResourceUpdate } from '../types/resources.types';
import { ResourceService } from './ResourceService';
import { testMonsterService } from './TestMonsterService';

export class CombatService {
  private resourceService: ResourceService;
  
  // In-memory session storage for mocking
  private sessions: Map<string, CombatSession> = new Map();
  private participantToSession: Map<string, string> = new Map();

  constructor() {
    this.resourceService = new ResourceService();
  }

  /**
   * Start a new combat session
   */
  async startCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession> {
    const sessionId = uuidv4();
    
    // Check if initiator is already in combat
    const existingSession = this.participantToSession.get(initiatorId);
    if (existingSession) {
      throw new Error('Character is already in combat');
    }

    // Create participants with realistic stats
    const participants: CombatParticipant[] = [
      await this.createParticipant(initiatorId, 'player'),
      ...await Promise.all(
        request.targetIds.map((id, index) => 
          this.createParticipant(id, request.battleType === 'pvp' ? 'player' : 'enemy')
        )
      )
    ];

    // Determine turn order based on speed (mock calculation)
    const turnOrder = participants
      .sort((a, b) => this.calculateSpeed(b.charId) - this.calculateSpeed(a.charId))
      .map(p => p.charId);

    const session: CombatSession = {
      sessionId,
      participants,
      turnOrder,
      currentTurnIndex: 0,
      roundNumber: 1,
      status: 'active',
      startTime: Date.now()
    };

    this.sessions.set(sessionId, session);
    
    // Track participants
    participants.forEach(p => {
      this.participantToSession.set(p.charId, sessionId);
    });

    return session;
  }

  /**
   * Process a combat action
   */
  async processAction(
    sessionId: string, 
    userId: string, 
    action: CombatAction
  ): Promise<CombatResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Combat session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Combat session is not active');
    }

    // Validate it's the user's turn
    const currentCharId = session.turnOrder[session.currentTurnIndex];
    if (currentCharId !== userId) {
      throw new Error('Not your turn');
    }

    const actor = session.participants.find(p => p.charId === currentCharId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    // Process the action based on type
    const result = await this.executeAction(session, actor, action);

    // Update session state
    this.updateSessionAfterAction(session, result);

    // Check for combat end conditions
    await this.checkCombatEnd(session);

    return result;
  }

  /**
   * Execute specific combat action
   */
  private async executeAction(
    session: CombatSession, 
    actor: CombatParticipant, 
    action: CombatAction
  ): Promise<CombatResult> {
    const resourceCost: ResourceUpdate[] = [];
    let damage = 0;
    let healing = 0;
    let message = '';
    let targetId = action.targetCharId;

    switch (action.type) {
      case CombatActionType.ATTACK:
        if (!targetId) {
          throw new Error('Attack requires a target');
        }
        
        const target = session.participants.find(p => p.charId === targetId);
        if (!target) {
          throw new Error('Target not found');
        }

        // Calculate damage (mock formula)
        damage = this.calculateDamage(actor, target);
        
        // Apply damage to target
        target.hp = Math.max(0, target.hp - damage);
        if (target.hp === 0) {
          target.status = 'defeated';
        }

        // Stamina cost for attack
        resourceCost.push({
          charId: actor.charId,
          poolType: 'stamina',
          currentValue: actor.stamina - 5,
          maxValue: actor.maxStamina,
          change: -5,
          reason: 'combat'
        });
        actor.stamina = Math.max(0, actor.stamina - 5);

        message = `${actor.charName} attacks ${target.charName} for ${damage} damage!`;
        break;

      case CombatActionType.DEFEND:
        // Defensive stance - reduces incoming damage next turn
        // Add a buff (mock implementation)
        actor.buffs.push({
          id: uuidv4(),
          name: 'Defending',
          duration: 1,
          modifier: 0.5 // 50% damage reduction
        });
        message = `${actor.charName} takes a defensive stance!`;
        break;

      case CombatActionType.FLEE:
        actor.status = 'fled';
        message = `${actor.charName} flees from combat!`;
        break;

      case CombatActionType.USE_ITEM:
        // Mock item usage (healing potion)
        healing = 25;
        actor.hp = Math.min(actor.maxHp, actor.hp + healing);
        message = `${actor.charName} uses an item and heals for ${healing} HP!`;
        break;

      case CombatActionType.USE_SKILL:
        // Mock skill usage (fireball)
        if (!targetId) {
          throw new Error('Skill requires a target');
        }
        
        const skillTarget = session.participants.find(p => p.charId === targetId);
        if (!skillTarget) {
          throw new Error('Skill target not found');
        }

        damage = this.calculateSkillDamage(actor, skillTarget);
        skillTarget.hp = Math.max(0, skillTarget.hp - damage);
        if (skillTarget.hp === 0) {
          skillTarget.status = 'defeated';
        }

        // Mana cost for skill
        resourceCost.push({
          charId: actor.charId,
          poolType: 'mana',
          currentValue: actor.mana - 10,
          maxValue: actor.maxMana,
          change: -10,
          reason: 'combat'
        });
        actor.mana = Math.max(0, actor.mana - 10);

        message = `${actor.charName} casts a skill on ${skillTarget.charName} for ${damage} damage!`;
        break;

      case CombatActionType.PASS:
        message = `${actor.charName} passes their turn.`;
        break;

      default:
        throw new Error('Invalid action type');
    }

    // Determine next turn
    const nextTurnCharId = this.getNextTurnCharId(session);

    return {
      sessionId: session.sessionId,
      action,
      actorId: actor.charId,
      targetId,
      damage,
      healing,
      resourceCost,
      message,
      nextTurnCharId
    };
  }

  /**
   * Get the next character's turn
   */
  private getNextTurnCharId(session: CombatSession): string {
    let nextIndex = (session.currentTurnIndex + 1) % session.turnOrder.length;
    let attempts = 0;
    
    // Skip defeated or fled participants
    while (attempts < session.turnOrder.length) {
      const charId = session.turnOrder[nextIndex];
      const participant = session.participants.find(p => p.charId === charId);
      
      if (participant && participant.status === 'active') {
        return charId;
      }
      
      nextIndex = (nextIndex + 1) % session.turnOrder.length;
      attempts++;
    }
    
    // If no active participants found, return current
    return session.turnOrder[session.currentTurnIndex];
  }

  /**
   * Update session state after action
   */
  private updateSessionAfterAction(session: CombatSession, result: CombatResult): void {
    // Advance turn
    session.currentTurnIndex = session.turnOrder.findIndex(id => id === result.nextTurnCharId);
    
    if (session.currentTurnIndex === 0 || session.currentTurnIndex === -1) {
      session.roundNumber++;
      if (session.currentTurnIndex === -1) {
        session.currentTurnIndex = 0;
      }
    }

    // Update buff/debuff durations
    session.participants.forEach(participant => {
      participant.buffs = participant.buffs.filter(buff => {
        buff.duration--;
        return buff.duration > 0;
      });
      
      participant.debuffs = participant.debuffs.filter(debuff => {
        debuff.duration--;
        return debuff.duration > 0;
      });
    });
  }

  /**
   * Check if combat should end
   */
  private async checkCombatEnd(session: CombatSession): Promise<void> {
    const activeTeams = new Set(
      session.participants
        .filter(p => p.status === 'active')
        .map(p => p.team)
    );

    if (activeTeams.size <= 1) {
      session.status = 'completed';
      session.endTime = Date.now();
      
      // Determine winner
      const activePlayers = session.participants.filter(p => p.status === 'active');
      if (activePlayers.length > 0) {
        session.winner = activePlayers[0].charId;
      }

      // Clean up participant tracking
      session.participants.forEach(p => {
        this.participantToSession.delete(p.charId);
      });
    }
  }

  /**
   * Get combat session
   */
  async getSession(sessionId: string): Promise<CombatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Validate if user is participant in session
   */
  async validateParticipant(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    return session.participants.some(p => p.charId === userId);
  }

  /**
   * Flee from combat
   */
  async fleeCombat(sessionId: string, userId: string): Promise<CombatResult> {
    const fleeAction: CombatAction = {
      type: CombatActionType.FLEE,
      timestamp: Date.now()
    };

    return this.processAction(sessionId, userId, fleeAction);
  }

  /**
   * Get character combat stats
   */
  async getCharacterStats(charId: string): Promise<CharacterCombatStats> {
    // Check if this is a test monster
    if (testMonsterService.isTestMonster(charId)) {
      const stats = testMonsterService.getTestMonsterCombatStats(charId);
      if (stats) {
        return stats;
      }
      throw new Error(`Test monster stats not found: ${charId}`);
    }

    // Regular character logic
    const resources = await this.resourceService.getResources(charId);
    const defaultResources: ResourcePool = {
      hp: 100, maxHp: 100, mana: 50, maxMana: 50, stamina: 30, maxStamina: 30,
      hpRegenRate: 1, manaRegenRate: 0.5, staminaRegenRate: 2, lastRegenTime: Date.now()
    };

    return {
      charId,
      level: 10,
      attack: 25,
      defense: 20,
      speed: 15,
      critRate: 0.1,
      critDamage: 1.5,
      resources: resources || defaultResources
    };
  }

  /**
   * Get character resources
   */
  async getCharacterResources(charId: string): Promise<ResourcePool | null> {
    return this.resourceService.getResources(charId);
  }

  /**
   * Create a combat participant
   */
  private async createParticipant(charId: string, team: 'player' | 'enemy'): Promise<CombatParticipant> {
    // Check if this is a test monster
    if (testMonsterService.isTestMonster(charId)) {
      const testParticipant = testMonsterService.createCombatParticipant(charId);
      if (testParticipant) {
        return testParticipant;
      }
      throw new Error(`Test monster not found: ${charId}`);
    }

    // Regular character logic
    const stats = await this.getCharacterStats(charId);
    
    return {
      charId,
      charName: team === 'player' ? `Player_${charId.slice(0, 4)}` : `Enemy_${charId.slice(0, 4)}`,
      hp: stats.resources.hp,
      maxHp: stats.resources.maxHp,
      mana: stats.resources.mana,
      maxMana: stats.resources.maxMana,
      stamina: stats.resources.stamina,
      maxStamina: stats.resources.maxStamina,
      team,
      status: 'active',
      buffs: [],
      debuffs: []
    };
  }

  /**
   * Calculate attack damage (mock formula)
   */
  private calculateDamage(attacker: CombatParticipant, target: CombatParticipant): number {
    const baseAttack = 25; // Mock attack stat
    const targetDefense = 20; // Mock defense stat
    const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% damage variance
    
    let damage = Math.floor((baseAttack - targetDefense * 0.5) * randomFactor);
    
    // Apply defender buffs (defending stance)
    const defendBuff = target.buffs.find(b => b.name === 'Defending');
    if (defendBuff) {
      damage = Math.floor(damage * defendBuff.modifier);
    }
    
    return Math.max(1, damage); // Minimum 1 damage
  }

  /**
   * Calculate skill damage (mock formula)
   */
  private calculateSkillDamage(caster: CombatParticipant, target: CombatParticipant): number {
    const baseSkillDamage = 35; // Higher than normal attack
    const randomFactor = 0.9 + Math.random() * 0.2; // 90-110% damage variance
    
    return Math.floor(baseSkillDamage * randomFactor);
  }

  /**
   * Calculate character speed (mock formula)
   */
  private calculateSpeed(charId: string): number {
    // Mock speed calculation based on character ID
    const hash = charId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return 10 + (hash % 20); // Speed between 10-30
  }

  /**
   * Simulate combat for testing
   */
  async simulateCombat(initiatorId: string, targetIds: string[]): Promise<CombatEndResult> {
    const session = await this.startCombat(initiatorId, {
      targetIds,
      battleType: 'pve'
    });

    // Run auto-combat until completion
    const maxTurns = 50; // Prevent infinite loops
    let turnCount = 0;

    while (session.status === 'active' && turnCount < maxTurns) {
      const currentCharId = session.turnOrder[session.currentTurnIndex];
      const actor = session.participants.find(p => p.charId === currentCharId);
      
      if (actor && actor.status === 'active') {
        // AI chooses action (simple logic)
        const action = this.chooseAIAction(session, actor);
        await this.processAction(session.sessionId, currentCharId, action);
      }
      
      turnCount++;
    }

    return {
      sessionId: session.sessionId,
      winner: session.winner || null,
      loser: null, // Could be determined from participants
      rewards: [
        { type: 'gold', amount: 100 },
        { type: 'experience', amount: 50 }
      ],
      experience: 50,
      duration: (session.endTime || Date.now()) - session.startTime
    };
  }

  /**
   * Simple AI action selection
   */
  private chooseAIAction(session: CombatSession, actor: CombatParticipant): CombatAction {
    // Simple AI: attack if stamina available, otherwise defend
    if (actor.stamina >= 5) {
      // Find a target from opposing team
      const enemies = session.participants.filter(p => 
        p.team !== actor.team && p.status === 'active'
      );
      
      if (enemies.length > 0) {
        return {
          type: CombatActionType.ATTACK,
          targetCharId: enemies[0].charId,
          timestamp: Date.now()
        };
      }
    }

    return {
      type: CombatActionType.DEFEND,
      timestamp: Date.now()
    };
  }
}