import { v4 as uuidv4 } from 'uuid';
import { 
  CombatSession, 
  CombatAction, 
  CombatResult, 
  CharacterCombatStats,
  CombatParticipant,
  CombatActionType,
  CombatStartRequest,
  CombatEndResult,
  CombatError,
  CombatLog,
  CombatSessionConfig
} from '../types/combat.types';
import { ResourcePool, ResourceUpdate } from '../types/resources.types';
import { ResourceService } from './ResourceService';
import { testMonsterService } from './TestMonsterService';

export class CombatService {
  private resourceService: ResourceService;
  
  // Session storage with config
  private sessions: Map<string, CombatSession> = new Map();
  private sessionConfigs: Map<string, CombatSessionConfig> = new Map();
  private turnTimers: Map<string, NodeJS.Timeout> = new Map();
  private participantToSession: Map<string, string> = new Map();

  // Default configuration
  private defaultConfig: CombatSessionConfig = {
    turnTimeoutSeconds: 30,
    maxTurns: 100,
    enableAIVariety: true
  };

  constructor() {
    this.resourceService = new ResourceService();
  }

  /**
   * Validate resource requirements before action
   */
  private validateResourceRequirements(
    actor: CombatParticipant, 
    action: CombatAction
  ): CombatError | null {
    switch (action.type) {
      case CombatActionType.ATTACK:
        if (actor.stamina < 5) {
          return { 
            error: 'Not enough stamina to attack (requires 5)', 
            code: 'INSUFFICIENT_RESOURCES' 
          };
        }
        break;
        
      case CombatActionType.USE_SKILL:
        if (actor.mana < 10) {
          return { 
            error: 'Not enough mana to use skill (requires 10)', 
            code: 'INSUFFICIENT_RESOURCES' 
          };
        }
        break;
        
      case CombatActionType.USE_ITEM:
        // TODO: Validate item exists in inventory
        break;
    }
    
    return null;
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

    // Ensure player always goes first in turn order
    const playerFirst = participants.filter(p => p.team === 'player');
    const enemiesAfter = participants.filter(p => p.team === 'enemy');
    const turnOrder = [...playerFirst, ...enemiesAfter].map(p => p.charId);

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
   * Updated processAction with resource validation
   */
  async processAction(
    sessionId: string, 
    userId: string, 
    action: CombatAction
  ): Promise<CombatResult | CombatError> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Combat session not found', code: 'INVALID_ACTION' };
    }

    const config = this.sessionConfigs.get(sessionId) || this.defaultConfig;
    
    // Check max turns
    if (session.roundNumber > config.maxTurns) {
      session.status = 'completed';
      session.endTime = Date.now();
      return { 
        error: 'Combat exceeded maximum turns', 
        code: 'COMBAT_TIMEOUT' 
      };
    }

    if (session.status !== 'active') {
      return { error: 'Combat session is not active', code: 'INVALID_ACTION' };
    }

    // Allow only player actions (players can act anytime)
    const actor = session.participants.find(p => p.charId === userId && p.team === 'player');
    if (!actor) {
      return { error: 'Player not found in combat', code: 'INVALID_ACTION' };
    }

    if (actor.status !== 'active') {
      return { error: 'Player is not active', code: 'INVALID_ACTION' };
    }

    // FIXED: Validate resources before executing
    const resourceError = this.validateResourceRequirements(actor, action);
    if (resourceError) {
      return resourceError;
    }

    // Initialize combat log if needed
    if (!session.combatLog) session.combatLog = [];

    // Process the player's action
    const playerResult = await this.executeAction(session, actor, action);
    
    // Check for combat end after player action
    const endMessage = await this.checkCombatEnd(session);
    
    // If combat ended, return result with end message
    if (session.status === 'ended') {
      return {
        ...playerResult,
        message: endMessage || playerResult.message,
        combatStatus: 'ended'
      };
    }

    // Automatically process enemy turns
    const enemyMessages: string[] = [];
    const enemies = session.participants.filter(p => p.team === 'enemy' && p.status === 'active');
    
    for (const enemy of enemies) {
      const enemyAction = this.chooseAIAction(session, enemy);
      const enemyResult = await this.executeAction(session, enemy, enemyAction);
      enemyMessages.push(enemyResult.message);
      
      // Check for combat end after each enemy action
      const enemyEndMessage = await this.checkCombatEnd(session);
      if (session.status === 'ended') {
        // If combat ended due to enemy action, include end message
        if (enemyEndMessage) {
          enemyMessages.push(enemyEndMessage);
        }
        break;
      }
    }

    // Combine player and enemy messages
    const combinedMessage = [playerResult.message, ...enemyMessages].join('\n');
    
    return {
      ...playerResult,
      message: combinedMessage,
      combatStatus: session.status
    };
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

        // Calculate and apply damage
        damage = this.calculateDamage(actor, target);
        target.hp = Math.max(0, target.hp - damage);
        
        if (target.hp === 0) {
          target.status = 'defeated';
        }

        // Deduct stamina
        actor.stamina = Math.max(0, actor.stamina - 5);
        resourceCost.push({
          charId: actor.charId,
          poolType: 'stamina',
          currentValue: actor.stamina,
          maxValue: actor.maxStamina,
          change: -5,
          reason: 'combat'
        });

        message = `${actor.charName} attacks ${target.charName} for ${damage} damage!`;
        
        // Add to combat log
        session.combatLog!.push({
          message,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'damage'
        });
        break;

      case CombatActionType.DEFEND:
        // FIXED: Check if already defending
        const existingDefendBuff = actor.buffs.find(b => b.name === 'Defending');
        if (!existingDefendBuff) {
          actor.buffs.push({
            id: `defend-${Date.now()}`,
            name: 'Defending',
            duration: 1, // Expires after 1 turn
            modifier: 0.5 // 50% damage reduction
          });
        }

        // Regenerate stamina
        const staminaRestore = Math.min(3, actor.maxStamina - actor.stamina);
        if (staminaRestore > 0) {
          actor.stamina += staminaRestore;
          resourceCost.push({
            charId: actor.charId,
            poolType: 'stamina',
            currentValue: actor.stamina,
            maxValue: actor.maxStamina,
            change: staminaRestore,
            reason: 'defend'
          });
        }

        message = `${actor.charName} takes a defensive stance and recovers ${staminaRestore} stamina`;
        
        session.combatLog!.push({
          message,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'buff'
        });
        break;

      case CombatActionType.FLEE:
        actor.status = 'fled';
        message = `${actor.charName} fled from combat!`;
        
        session.combatLog!.push({
          message,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'action'
        });
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

        // Calculate skill damage
        damage = this.calculateSkillDamage(actor, skillTarget);
        skillTarget.hp = Math.max(0, skillTarget.hp - damage);
        
        if (skillTarget.hp === 0) {
          skillTarget.status = 'defeated';
        }

        // Deduct mana
        actor.mana = Math.max(0, actor.mana - 10);
        resourceCost.push({
          charId: actor.charId,
          poolType: 'mana',
          currentValue: actor.mana,
          maxValue: actor.maxMana,
          change: -10,
          reason: 'combat'
        });

        message = `${actor.charName} casts a skill on ${skillTarget.charName} for ${damage} damage!`;
        
        session.combatLog!.push({
          message,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'damage'
        });
        break;

      case CombatActionType.PASS:
        message = `${actor.charName} passes their turn.`;
        break;

      default:
        throw new Error('Invalid action type');
    }

    return {
      sessionId: session.sessionId,
      action,
      actorId: actor.charId,
      targetId,
      damage,
      healing,
      resourceCost,
      message
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
   * Check if combat should end and generate end message
   */
  private async checkCombatEnd(session: CombatSession): Promise<string | null> {
    const activeTeams = new Set(
      session.participants
        .filter(p => p.status === 'active')
        .map(p => p.team)
    );

    const activePlayers = session.participants.filter(p => p.status === 'active' && p.team === 'player');
    const activeEnemies = session.participants.filter(p => p.status === 'active' && p.team === 'enemy');
    const hasPlayerFled = session.participants.some(p => p.team === 'player' && p.status === 'fled');
    const defeatedEnemies = session.participants.filter(p => p.status === 'defeated' && p.team === 'enemy');
    const defeatedPlayers = session.participants.filter(p => p.status === 'defeated' && p.team === 'player');

    let endMessage: string | null = null;

    // End combat if no active teams, or if all players fled
    if (activeTeams.size <= 1 || activePlayers.length === 0 || hasPlayerFled) {
      session.status = 'ended';
      session.endTime = Date.now();
      
      // Generate appropriate end message
      if (hasPlayerFled) {
        endMessage = "💨 You fled from combat! Better luck next time.";
        session.winner = undefined; // No winner when fleeing
      } else if (activePlayers.length > 0 && activeEnemies.length === 0) {
        // Player wins - all enemies defeated
        const playerName = activePlayers[0].charName;
        const enemyNames = defeatedEnemies.map(e => e.charName).join(', ');
        endMessage = `🏆 VICTORY! ${playerName} has defeated ${enemyNames}!`;
        session.winner = activePlayers[0].charId;
      } else if (activePlayers.length === 0 && activeEnemies.length > 0) {
        // Player loses - all players defeated
        const enemyNames = activeEnemies.map(e => e.charName).join(', ');
        const playerNames = defeatedPlayers.map(p => p.charName).join(', ');
        endMessage = `💀 DEFEAT! ${playerNames} has been defeated by ${enemyNames}!`;
        session.winner = activeEnemies[0].charId;
      } else {
        // Tie or other edge case
        endMessage = "⚔️ Combat has ended in a draw!";
        session.winner = undefined;
      }

      // Store the end message in session for retrieval
      session.endMessage = endMessage;

      // Clean up participant tracking for all participants
      session.participants.forEach(p => {
        this.participantToSession.delete(p.charId);
      });
      
      // Also remove the session itself
      this.sessions.delete(session.sessionId);
    }

    return endMessage;
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

    // Regular character logic - provide default resources for all users
    const defaultResources: ResourcePool = {
      hp: 100, maxHp: 100, mana: 50, maxMana: 50, stamina: 30, maxStamina: 30,
      hpRegenRate: 1, manaRegenRate: 0.5, staminaRegenRate: 2, lastRegenTime: Date.now()
    };

    try {
      const resources = await this.resourceService.getResources(charId);
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
    } catch (error) {
      // If resource service fails, use default resources
      return {
        charId,
        level: 10,
        attack: 25,
        defense: 20,
        speed: 15,
        critRate: 0.1,
        critDamage: 1.5,
        resources: defaultResources
      };
    }
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
   * Fixed damage calculation with proper defense clamping
   */
  private calculateDamage(attacker: CombatParticipant, target: CombatParticipant): number {
    const baseAttack = 25; // Mock attack stat
    const targetDefense = 20; // Mock defense stat
    const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% damage variance
    
    // FIXED: Clamp base damage BEFORE applying random factor
    const baseDamage = Math.max(0, baseAttack - targetDefense * 0.5);
    let damage = Math.floor(baseDamage * randomFactor);
    
    // Apply defender buffs (defending stance)
    const defendBuff = target.buffs.find(b => b.name === 'Defending');
    if (defendBuff) {
      damage = Math.floor(damage * defendBuff.modifier);
    }
    
    return Math.max(1, damage); // Minimum 1 damage
  }

  /**
   * Fixed skill damage to consider defense
   */
  private calculateSkillDamage(caster: CombatParticipant, target: CombatParticipant): number {
    const baseSkillDamage = 35; // Higher than normal attack
    const targetDefense = 20; // Mock defense stat
    const randomFactor = 0.9 + Math.random() * 0.2; // 90-110% damage variance
    
    // FIXED: Skills now consider defense (but less than normal attacks)
    const baseDamage = Math.max(0, baseSkillDamage - targetDefense * 0.25);
    return Math.floor(baseDamage * randomFactor);
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
   * Enhanced AI action selection with anti-stuck logic
   */
  private chooseAIAction(session: CombatSession, actor: CombatParticipant): CombatAction {
    // Find targets
    const enemies = session.participants.filter(p => 
      p.team !== actor.team && p.status === 'active'
    );
    
    if (enemies.length === 0) {
      return {
        type: CombatActionType.DEFEND,
        timestamp: Date.now()
      };
    }

    // Check if actor has been defending too much (anti-stuck logic)
    const recentDefends = session.combatLog
      ? session.combatLog.filter(log => 
          log.actorId === actor.charId && 
          log.message.includes('defensive stance') &&
          Date.now() - log.timestamp < 30000 // Last 30 seconds
        ).length
      : 0;

    // If been defending 3+ times recently, force an attack even with low stamina
    if (recentDefends >= 3) {
      return {
        type: CombatActionType.ATTACK,
        targetCharId: enemies[0].charId,
        timestamp: Date.now()
      };
    }

    // Normal AI logic with lower stamina threshold
    if (actor.stamina >= 3) { // Lowered from 5 to 3
      return {
        type: CombatActionType.ATTACK,
        targetCharId: enemies[0].charId,
        timestamp: Date.now()
      };
    }

    // 30% chance to attack even with very low stamina (risky behavior)
    if (Math.random() < 0.3) {
      return {
        type: CombatActionType.ATTACK,
        targetCharId: enemies[0].charId,
        timestamp: Date.now()
      };
    }

    return {
      type: CombatActionType.DEFEND,
      timestamp: Date.now()
    };
  }
}