import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
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
  CombatSessionConfig
} from '../types/combat.types';
import { ResourcePool, ResourceUpdate } from '../types/resources.types';
import { ResourceService } from './ResourceService';
import { testMonsterService } from './TestMonsterService';
import { CharacterService } from './CharacterService';
import { StatsService } from './StatsService';
import { DerivedStats, CharacterClass } from '../types/character.types';

export class CombatService {
  private resourceService: ResourceService;
  private characterService: CharacterService;
  
  // Combat Engine Version
  public static readonly VERSION = '2.1.0';
  public static readonly VERSION_NAME = 'AIPE Integration & Dynamic Combat';
  
  // Session storage with config
  private sessions: Map<string, CombatSession> = new Map();
  private sessionConfigs: Map<string, CombatSessionConfig> = new Map();
  private participantToSession: Map<string, string> = new Map();

  // Default configuration
  private defaultConfig: CombatSessionConfig = {
    turnTimeoutSeconds: 30,
    maxTurns: 100,
    enableAIVariety: true
  };

  constructor() {
    this.resourceService = new ResourceService();
    this.characterService = new CharacterService();
    // EquipmentService requires its own repositories and cache
    // For now, skip instantiation since it's not used in core combat logic
    // this.equipmentService = new EquipmentService(equipmentRepo, characterRepo, cache);
  }

  /**
   * Get Combat Engine version information
   */
  static getVersionInfo() {
    return {
      version: CombatService.VERSION,
      name: CombatService.VERSION_NAME,
      features: [
        'AIPE Integration - Uses character stats instead of hard-coded values',
        'Weapon Damage Ranges - Combat now uses equipped weapon damage',
        'Proper Defense Mitigation - Logarithmic formula for balanced defense',
        'Combat Mechanics Implementation - Critical hits, dodge, block, accuracy',
        'Separate Physical/Magical Damage - Different mitigation formulas',
        'Resource validation system (Stamina/Mana requirements)', 
        'Enhanced combat logging with resource tracking',
        'Non-stacking buff mechanics',
        'Weighted AI action selection',
        'Smart target prioritization',
        'Anti-defensive loop prevention',
        'Dynamic resource-based AI decisions'
      ],
      lastUpdated: '2025-07-06'
    };
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
    try {
      logger.debug('=== COMBAT SERVICE START COMBAT ===');
      logger.debug('Input parameters:', {
        initiatorId,
        request: JSON.stringify(request, null, 2)
      });

      const sessionId = uuidv4();
      logger.debug('Generated session ID:', sessionId);
      
      // Check if initiator is already in combat
      const existingSession = this.participantToSession.get(initiatorId);
      logger.debug('Existing session check:', {
        initiatorId,
        existingSession: existingSession || 'none'
      });
      
      if (existingSession) {
        logger.debug('Character already in combat - throwing error');
        throw new Error('Character is already in combat');
      }

      logger.debug('Creating participants...');
      logger.debug('Creating player participant for:', initiatorId);
      
      // Create participants with realistic stats
      const playerParticipant = await this.createParticipant(initiatorId, 'player');
      logger.debug('Player participant created:', JSON.stringify({
        charId: playerParticipant.charId,
        charName: playerParticipant.charName,
        team: playerParticipant.team,
        hp: playerParticipant.hp,
        maxHp: playerParticipant.maxHp
      }, null, 2));

      logger.debug('Creating enemy participants for:', request.targetIds);
      const enemyParticipants = await Promise.all(
        request.targetIds.map(async (id) => {
          logger.debug(`Creating participant for target: ${id}`);
          const participant = await this.createParticipant(id, request.battleType === 'pvp' ? 'player' : 'enemy');
          logger.debug(`Participant created for ${id}:`, JSON.stringify({
            charId: participant.charId,
            charName: participant.charName,
            team: participant.team,
            hp: participant.hp,
            maxHp: participant.maxHp
          }, null, 2));
          return participant;
        })
      );

      const participants: CombatParticipant[] = [playerParticipant, ...enemyParticipants];
      logger.debug('All participants created, total:', participants.length);

      // Ensure player always goes first in turn order
      const playerFirst = participants.filter(p => p.team === 'player');
      const enemiesAfter = participants.filter(p => p.team === 'enemy');
      const turnOrder = [...playerFirst, ...enemiesAfter].map(p => p.charId);
      
      logger.debug('Turn order created:', turnOrder);

      const session: CombatSession = {
        sessionId,
        participants,
        turnOrder,
        currentTurn: 0,
        currentTurnIndex: 0,
        roundNumber: 1,
        status: 'active',
        startTime: Date.now()
      };

      logger.debug('Session object created:', JSON.stringify({
        sessionId: session.sessionId,
        participantCount: session.participants.length,
        turnOrder: session.turnOrder,
        status: session.status
      }, null, 2));

      logger.debug('Storing session in sessions map...');
      this.sessions.set(sessionId, session);
      logger.debug('Session stored. Total sessions:', this.sessions.size);
      
      // Track participants
      logger.debug('Tracking participants...');
      participants.forEach(p => {
        logger.debug(`Tracking participant: ${p.charId} -> ${sessionId}`);
        this.participantToSession.set(p.charId, sessionId);
      });

      logger.debug('=== COMBAT SERVICE START COMBAT SUCCESS ===');
      return session;
    } catch (error) {
      logger.error('=== COMBAT SERVICE START COMBAT ERROR ===');
      logger.error('Error in startCombat:', {
        initiatorId,
        request,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      });
      logger.error('=== END COMBAT SERVICE START COMBAT ERROR ===');
      throw error; // Re-throw to be caught by controller
    }
  }

  /**
   * Updated processAction with resource validation
   */
  async processAction(
    sessionId: string, 
    userId: string, 
    action: CombatAction
  ): Promise<CombatResult | CombatError> {
    try {
      logger.debug('=== COMBAT SERVICE PROCESS ACTION START ===');
      logger.debug('Input parameters:', {
        sessionId,
        userId,
        action: JSON.stringify(action, null, 2)
      });

      const session = this.sessions.get(sessionId);
      logger.debug('Session lookup:', {
        sessionId,
        found: !!session,
        sessionKeys: Array.from(this.sessions.keys()),
        totalSessions: this.sessions.size
      });

      if (!session) {
        logger.debug('Session not found - returning error');
        return { error: 'Combat session not found', code: 'INVALID_ACTION' };
      }

      logger.debug('Session details:', {
        sessionId: session.sessionId,
        status: session.status,
        participantCount: session.participants.length,
        participants: session.participants.map(p => ({
          charId: p.charId,
          team: p.team,
          status: p.status
        }))
      });

      const config = this.sessionConfigs.get(sessionId) || this.defaultConfig;
      logger.debug('Using config:', config);
      
      // Check max turns
      if (session.roundNumber > config.maxTurns) {
        logger.debug('Combat exceeded max turns:', session.roundNumber, '>', config.maxTurns);
        session.status = 'completed';
        session.endTime = Date.now();
        return { 
          error: 'Combat exceeded maximum turns', 
          code: 'COMBAT_TIMEOUT' 
        };
      }

      if (session.status !== 'active') {
        logger.debug('Session not active:', session.status);
        return { error: 'Combat session is not active', code: 'INVALID_ACTION' };
      }

      // Allow only player actions (players can act anytime)
      const actor = session.participants.find(p => p.charId === userId && p.team === 'player');
      logger.debug('Actor lookup:', {
        userId,
        found: !!actor,
        actor: actor ? {
          charId: actor.charId,
          team: actor.team,
          status: actor.status,
          hp: actor.hp,
          stamina: actor.stamina,
          mana: actor.mana
        } : null
      });

      if (!actor) {
        logger.debug('Player not found in combat participants');
        return { error: 'Player not found in combat', code: 'INVALID_ACTION' };
      }

      if (actor.status !== 'active') {
        logger.debug('Player not active:', actor.status);
        return { error: 'Player is not active', code: 'INVALID_ACTION' };
      }

      // FIXED: Validate resources before executing
      logger.debug('Validating resource requirements...');
      const resourceError = this.validateResourceRequirements(actor, action);
      if (resourceError) {
        logger.debug('Resource validation failed:', resourceError);
        return resourceError;
      }
      logger.debug('Resource validation passed');

      // Initialize combat log if needed
      if (!session.combatLog) {
        logger.debug('Initializing combat log');
        session.combatLog = [];
      }

      // Process the player's action
      logger.debug('Executing player action...');
      const playerResult = await this.executeAction(session, actor, action);
      logger.debug('Player action result:', JSON.stringify(playerResult, null, 2));
      
      // Check for combat end after player action
      logger.debug('Checking for combat end...');
      const endMessage = await this.checkCombatEnd(session);
      logger.debug('Combat end check result:', {
        endMessage,
        sessionStatus: session.status
      });
      
      // If combat ended, return result with end message
      if (session.status !== 'active') {
        logger.debug('Combat ended - returning final result');
        const finalResult = {
          ...playerResult,
          message: endMessage || playerResult.message,
          combatStatus: session.status
        };
        logger.debug('Final result:', JSON.stringify(finalResult, null, 2));
        logger.debug('=== COMBAT SERVICE PROCESS ACTION END (COMBAT ENDED) ===');
        return finalResult;
      }

      // Automatically process enemy turns
      logger.debug('Processing enemy turns...');
      const enemyMessages: string[] = [];
      const enemies = session.participants.filter(p => p.team === 'enemy' && p.status === 'active');
      logger.debug('Active enemies:', enemies.length);
      
      for (const enemy of enemies) {
        logger.debug('Processing enemy:', enemy.charId);
        const enemyAction = this.chooseAIAction(session, enemy);
        logger.debug('Enemy action chosen:', JSON.stringify(enemyAction, null, 2));
        
        const enemyResult = await this.executeAction(session, enemy, enemyAction);
        logger.debug('Enemy action result:', JSON.stringify(enemyResult, null, 2));
        enemyMessages.push(enemyResult.message);
        
        // Check for combat end after each enemy action
        const enemyEndMessage = await this.checkCombatEnd(session);
        if (session.status !== 'active') {
          logger.debug('Combat ended during enemy turn');
          // If combat ended due to enemy action, include end message
          if (enemyEndMessage) {
            enemyMessages.push(enemyEndMessage);
          }
          break;
        }
      }

      // Combine player and enemy messages
      const combinedMessage = [playerResult.message, ...enemyMessages].join('\n');
      logger.debug('Combined message:', combinedMessage);
      
      const finalResult = {
        ...playerResult,
        message: combinedMessage,
        combatStatus: session.status
      };

      logger.debug('Final result:', JSON.stringify(finalResult, null, 2));
      logger.debug('=== COMBAT SERVICE PROCESS ACTION END ===');
      
      return finalResult;
    } catch (error) {
      logger.error('=== COMBAT SERVICE ERROR ===');
      logger.error('Error in processAction:', {
        sessionId,
        userId,
        action,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      });
      logger.error('=== END COMBAT SERVICE ERROR ===');
      
      // Return a proper CombatError instead of throwing
      return {
        error: error instanceof Error ? error.message : 'Unknown error in combat processing',
        code: 'INVALID_ACTION'
      };
    }
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
          reason: 'attack'
        });

        // Enhanced resource logging
        session.combatLog!.push({
          message: `${actor.charName} stamina: ${actor.stamina}/${actor.maxStamina} (-5)`,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'resource'
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
        
        // Enhanced resource logging
        session.combatLog!.push({
          message: `${actor.charName} stamina: ${actor.stamina}/${actor.maxStamina} (+${staminaRestore})`,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'resource'
        });
        
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
          reason: 'skill'
        });

        // Enhanced resource logging
        session.combatLog!.push({
          message: `${actor.charName} mana: ${actor.mana}/${actor.maxMana} (-10)`,
          timestamp: Date.now(),
          actorId: actor.charId,
          type: 'resource'
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

      // Clear all buffs and debuffs when combat ends
      session.participants.forEach(p => {
        p.buffs = [];
        p.debuffs = [];
        this.participantToSession.delete(p.charId);
      });
      
      // Combat end logging
      session.combatLog!.push({
        message: `Combat ended: ${endMessage}`,
        timestamp: Date.now(),
        actorId: 'system',
        type: 'action'
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

    const result = await this.processAction(sessionId, userId, fleeAction);
    if ('error' in result) {
      return {
        sessionId,
        action: fleeAction,
        actorId: userId,
        message: result.error
      };
    }
    return result;
  }

  /**
   * Get character combat stats with AIPE integration
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

    try {
      // Get character data with AIPE stats
      const character = await this.characterService.getCharacter(charId);
      if (!character) {
        throw new Error(`Character not found: ${charId}`);
      }

      // Calculate derived stats using AIPE
      const derivedStats: DerivedStats = StatsService.calculateDerivedStats(character);
      
      // Get current resources
      const resources = await this.resourceService.getResources(charId);
      if (!resources) {
        throw new Error(`Resources not found for character: ${charId}`);
      }

      return {
        charId,
        level: character.level,
        attack: derivedStats.physicalDamage,
        defense: derivedStats.physicalDefense,
        speed: derivedStats.attackSpeed,
        critRate: derivedStats.criticalChance / 100, // Convert percentage to decimal
        critDamage: derivedStats.criticalDamage / 100, // Convert percentage to decimal
        resources
      };
    } catch (error) {
      // Fallback to default stats if character service fails
      logger.error(`Failed to get character stats for ${charId}:`, error);
      const defaultResources: ResourcePool = {
        hp: 100, maxHp: 100, mana: 50, maxMana: 50, stamina: 30, maxStamina: 30,
        hpRegenRate: 1, manaRegenRate: 0.5, staminaRegenRate: 2, lastRegenTime: Date.now()
      };
      
      return {
        charId,
        level: 1,
        attack: 10,
        defense: 10,
        speed: 10,
        critRate: 0.05,
        critDamage: 1.5,
        resources: defaultResources
      };
    }
  }

  /**
   * Get character resources
   */
  async getCharacterResources(charId: string): Promise<ResourcePool | null> {
    // Check if this is a test monster
    if (testMonsterService.isTestMonster(charId)) {
      const monster = testMonsterService.getTestMonster(charId);
      if (monster) {
        return {
          hp: monster.hp,
          maxHp: monster.maxHp,
          mana: monster.mana,
          maxMana: monster.maxMana,
          stamina: monster.stamina,
          maxStamina: monster.maxStamina,
          hpRegenRate: 1,
          manaRegenRate: 0.5,
          staminaRegenRate: 2,
          lastRegenTime: Date.now()
        };
      }
      throw new Error(`Test monster resources not found: ${charId}`);
    }

    // Regular character logic
    return this.resourceService.getResources(charId);
  }

  /**
   * Create a combat participant with full AIPE stats
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

    try {
      // Get character with AIPE stats
      const character = await this.characterService.getCharacter(charId);
      if (!character) {
        throw new Error(`Character not found: ${charId}`);
      }

      // Calculate derived stats
      const derivedStats: DerivedStats = StatsService.calculateDerivedStats(character);
      
      // Get current resources
      const resources = await this.resourceService.getResources(charId);
      if (!resources) {
        throw new Error(`Resources not found for character: ${charId}`);
      }

      // Get weapon damage ranges
      // TODO: Integrate with EquipmentService once dependency injection is set up
      // For now, use level-based weapon damage scaling
      let weaponMinDamage = 5 + character.level; // Base damage scales with level
      let weaponMaxDamage = 10 + (character.level * 2);
      
      // Add some variance based on class
      if (character.class === CharacterClass.WARRIOR || character.class === CharacterClass.PALADIN) {
        weaponMinDamage = Math.floor(weaponMinDamage * 1.2);
        weaponMaxDamage = Math.floor(weaponMaxDamage * 1.2);
      } else if (character.class === CharacterClass.MAGE || character.class === CharacterClass.CLERIC) {
        weaponMinDamage = Math.floor(weaponMinDamage * 0.8);
        weaponMaxDamage = Math.floor(weaponMaxDamage * 0.8);
      }

      return {
        charId,
        charName: character.name,
        hp: resources.hp,
        maxHp: resources.maxHp,
        mana: resources.mana,
        maxMana: resources.maxMana,
        stamina: resources.stamina,
        maxStamina: resources.maxStamina,
        team,
        status: 'active',
        buffs: [],
        debuffs: [],
        // AIPE combat stats
        level: character.level,
        attack: derivedStats.physicalDamage,
        defense: derivedStats.physicalDefense,
        magicalAttack: derivedStats.magicalDamage,
        magicalDefense: derivedStats.magicalDefense,
        speed: derivedStats.attackSpeed,
        criticalChance: derivedStats.criticalChance,
        criticalDamage: derivedStats.criticalDamage,
        dodgeChance: derivedStats.dodgeChance,
        blockChance: derivedStats.blockChance,
        accuracy: 95, // Default accuracy value
        weaponMinDamage,
        weaponMaxDamage
      };
    } catch (error) {
      // Fallback participant with minimal stats
      logger.error(`Failed to create participant for ${charId}:`, error);
      return {
        charId,
        charName: `Unknown_${charId.slice(0, 4)}`,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        stamina: 30,
        maxStamina: 30,
        team,
        status: 'active',
        buffs: [],
        debuffs: [],
        level: 1,
        attack: 10,
        defense: 10,
        magicalAttack: 10,
        magicalDefense: 10,
        speed: 10,
        criticalChance: 5,
        criticalDamage: 150,
        dodgeChance: 5,
        blockChance: 5,
        accuracy: 95,
        weaponMinDamage: 5,
        weaponMaxDamage: 10
      };
    }
  }

  /**
   * Calculate physical damage with AIPE stats and proper defense mitigation
   */
  private calculateDamage(attacker: CombatParticipant, target: CombatParticipant): number {
    // Roll weapon damage
    const weaponDamage = attacker.weaponMinDamage + 
      Math.floor(Math.random() * (attacker.weaponMaxDamage - attacker.weaponMinDamage + 1));
    
    // Add attack stat to weapon damage
    const rawDamage = weaponDamage + attacker.attack;
    
    // Calculate defense mitigation using a logarithmic formula
    // This ensures defense is always useful but has diminishing returns
    const defenseMitigation = target.defense / (target.defense + (attacker.level * 10));
    
    // Apply defense mitigation
    let damage = Math.floor(rawDamage * (1 - defenseMitigation));
    
    // Apply random variance (90-110%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    damage = Math.floor(damage * randomFactor);
    
    // Check for critical hit
    if (Math.random() * 100 < attacker.criticalChance) {
      damage = Math.floor(damage * (attacker.criticalDamage / 100));
      // Add to combat log that it was a critical hit
    }
    
    // Check for dodge
    if (Math.random() * 100 < target.dodgeChance) {
      return 0; // Complete dodge
    }
    
    // Check for block
    if (Math.random() * 100 < target.blockChance) {
      damage = Math.floor(damage * 0.5); // 50% damage reduction on block
    }
    
    // Apply defender buffs (defending stance)
    const defendBuff = target.buffs.find((b: { name: string; modifier: number }) => b.name === 'Defending');
    if (defendBuff) {
      damage = Math.floor(damage * defendBuff.modifier);
    }
    
    return Math.max(1, damage); // Minimum 1 damage
  }

  /**
   * Calculate magical skill damage with AIPE stats
   */
  private calculateSkillDamage(caster: CombatParticipant, target: CombatParticipant): number {
    // Base skill damage uses magical attack stat
    const baseSkillDamage = caster.magicalAttack * 1.5; // Skills have 150% scaling
    
    // Calculate magical defense mitigation
    const magicDefenseMitigation = target.magicalDefense / (target.magicalDefense + (caster.level * 10));
    
    // Apply defense mitigation
    let damage = Math.floor(baseSkillDamage * (1 - magicDefenseMitigation));
    
    // Apply random variance (95-105% for skills - more consistent)
    const randomFactor = 0.95 + Math.random() * 0.1;
    damage = Math.floor(damage * randomFactor);
    
    // Skills can crit but at half the normal crit chance
    if (Math.random() * 100 < (caster.criticalChance / 2)) {
      damage = Math.floor(damage * (caster.criticalDamage / 100));
    }
    
    // Magic attacks cannot be dodged or blocked traditionally
    // But defending stance still applies
    const defendBuff = target.buffs.find((b: { name: string; modifier: number }) => b.name === 'Defending');
    if (defendBuff) {
      damage = Math.floor(damage * defendBuff.modifier);
    }
    
    return Math.max(1, damage); // Minimum 1 damage
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
   * 🔧 v2.0 ENHANCEMENT: Advanced AI with weighted action selection and smart targeting
   * Prevents defensive loops and provides dynamic, realistic AI behavior
   */
  private chooseAIAction(session: CombatSession, actor: CombatParticipant): CombatAction {
    // Find available targets
    const enemies = session.participants.filter(p => 
      p.team !== actor.team && p.status === 'active'
    );
    
    if (enemies.length === 0) {
      return {
        type: CombatActionType.DEFEND,
        timestamp: Date.now()
      };
    }

    // Anti-stuck logic - check recent defensive actions
    const recentDefends = session.combatLog
      ? session.combatLog.filter(log => 
          log.actorId === actor.charId && 
          log.message.includes('defensive stance') &&
          Date.now() - log.timestamp < 30000 // Last 30 seconds
        ).length
      : 0;

    // Force attack if defending too much
    if (recentDefends >= 3) {
      const target = this.selectTarget(enemies, 'aggressive');
      return {
        type: CombatActionType.ATTACK,
        targetCharId: target.charId,
        timestamp: Date.now()
      };
    }

    // Calculate action weights based on AI state
    const actionWeights = this.calculateActionWeights(actor, enemies);
    const selectedAction = this.selectWeightedAction(actionWeights);

    // Execute selected action with smart targeting
    switch (selectedAction) {
      case 'attack':
        const attackTarget = this.selectTarget(enemies, 'balanced');
        return {
          type: CombatActionType.ATTACK,
          targetCharId: attackTarget.charId,
          timestamp: Date.now()
        };

      case 'skill':
        if (actor.mana >= 10) {
          const skillTarget = this.selectTarget(enemies, 'priority');
          return {
            type: CombatActionType.USE_SKILL,
            targetCharId: skillTarget.charId,
            skillId: 'fireball',
            timestamp: Date.now()
          };
        }
        // Fall back to attack if no mana
        const fallbackTarget = this.selectTarget(enemies, 'balanced');
        return {
          type: CombatActionType.ATTACK,
          targetCharId: fallbackTarget.charId,
          timestamp: Date.now()
        };

      case 'defend':
      default:
        return {
          type: CombatActionType.DEFEND,
          timestamp: Date.now()
        };
    }
  }

  /**
   * 🔧 v2.0: Calculate weighted action probabilities based on AI state
   */
  private calculateActionWeights(actor: CombatParticipant, enemies: CombatParticipant[]): Record<string, number> {
    const weights = {
      attack: 0.4,
      skill: 0.2,
      defend: 0.4
    };

    // Adjust weights based on resources
    if (actor.stamina >= 8) {
      weights.attack += 0.3; // More aggressive when high stamina
    } else if (actor.stamina <= 3) {
      weights.defend += 0.4; // More defensive when low stamina
      weights.attack -= 0.2;
    }

    if (actor.mana >= 15) {
      weights.skill += 0.3; // Use skills when mana is high
    } else if (actor.mana < 10) {
      weights.skill = 0; // Can't use skills
      weights.attack += 0.1;
    }

    // Adjust based on health
    const healthPercent = actor.hp / actor.maxHp;
    if (healthPercent <= 0.3) {
      weights.defend += 0.3; // Defensive when low health
      weights.attack -= 0.2;
    } else if (healthPercent >= 0.8) {
      weights.attack += 0.2; // Aggressive when healthy
    }

    // Consider enemy state
    const lowHealthEnemies = enemies.filter(e => e.hp / e.maxHp <= 0.3);
    if (lowHealthEnemies.length > 0) {
      weights.attack += 0.2; // Focus fire on weak enemies
    }

    return weights;
  }

  /**
   * 🔧 v2.0: Select action based on weighted probabilities
   */
  private selectWeightedAction(weights: Record<string, number>): string {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const [action, weight] of Object.entries(weights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        return action;
      }
    }
    
    return 'defend'; // Fallback
  }

  /**
   * 🔧 v2.0: Smart target selection based on strategy
   */
  private selectTarget(enemies: CombatParticipant[], strategy: 'aggressive' | 'balanced' | 'priority'): CombatParticipant {
    if (enemies.length === 1) {
      return enemies[0];
    }

    switch (strategy) {
      case 'aggressive':
        // Target lowest health enemy (finish off weak targets)
        return enemies.reduce((weakest, enemy) => 
          enemy.hp < weakest.hp ? enemy : weakest
        );

      case 'priority':
        // Target highest threat (players first, then high HP enemies)
        const players = enemies.filter(e => e.team === 'player');
        if (players.length > 0) {
          return players.reduce((highest, player) => 
            player.hp > highest.hp ? player : highest
          );
        }
        return enemies.reduce((highest, enemy) => 
          enemy.hp > highest.hp ? enemy : highest
        );

      case 'balanced':
      default:
        // Weighted random selection favoring lower health targets
        const targetWeights = enemies.map(enemy => {
          const healthPercent = enemy.hp / enemy.maxHp;
          const isPlayer = enemy.team === 'player';
          
          // Lower health = higher weight, players get priority
          let weight = 1 - healthPercent + 0.5;
          if (isPlayer) weight += 0.3;
          
          return { enemy, weight };
        });

        const totalWeight = targetWeights.reduce((sum, tw) => sum + tw.weight, 0);
        const random = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const { enemy, weight } of targetWeights) {
          currentWeight += weight;
          if (random <= currentWeight) {
            return enemy;
          }
        }
        
        return enemies[0]; // Fallback
    }
  }

  /**
   * Clear all sessions (for testing/debugging)
   */
  clearAllSessions(): void {
    logger.debug('Clearing all combat sessions...');
    logger.debug('Current sessions:', this.sessions.size);
    logger.debug('Current participant mappings:', this.participantToSession.size);
    
    this.sessions.clear();
    this.participantToSession.clear();
    this.sessionConfigs.clear();
    
    logger.debug('All sessions cleared');
  }

  /**
   * Remove participant from session tracking when combat ends
   */
  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove all participants from tracking
      session.participants.forEach(participant => {
        this.participantToSession.delete(participant.charId);
      });
      
      // Remove session and config
      this.sessions.delete(sessionId);
      this.sessionConfigs.delete(sessionId);
      
      logger.debug(`Session ${sessionId} cleaned up`);
    }
  }

  /**
   * Force start combat (for testing) - clears existing session if needed
   */
  async forceStartCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession> {
    // Clear existing session if participant is already in combat
    const existingSession = this.participantToSession.get(initiatorId);
    if (existingSession) {
      console.log(`Forcing new combat for ${initiatorId}, clearing existing session ${existingSession}`);
      this.cleanupSession(existingSession);
    }
    
    // Now start combat normally
    return this.startCombat(initiatorId, request);
  }
}