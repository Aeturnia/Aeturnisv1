import { 
  CombatSession as ActualCombatSession,
  CombatAction as ActualCombatAction,
  CombatResult as ActualCombatResult,
  CombatStartRequest,
  CombatEndResult,
  CharacterCombatStats,
  Combatant as ActualCombatant,
  CombatOutcome as ActualCombatOutcome,
  DamageType,
  CombatError
} from '../../types/combat.types';
import { ResourcePool } from '../../types/resources.types';
import { IService } from './IService';

// Re-export the actual types for consistency
export { 
  ActualCombatSession as CombatSessionNew,
  ActualCombatAction as CombatActionNew,
  ActualCombatResult as CombatResultNew,
  ActualCombatant as CombatantNew,
  ActualCombatOutcome as CombatOutcomeNew,
  CombatStartRequest,
  CombatEndResult,
  CharacterCombatStats,
  ResourcePool,
  DamageType
};

// Type aliases for backward compatibility
export type CombatSession = ActualCombatSession;
export type CombatAction = ActualCombatAction;
export type CombatResult = ActualCombatResult;
export type Combatant = ActualCombatant;
export type CombatOutcome = ActualCombatOutcome;

/**
 * Legacy combat participant (player or monster)
 * @deprecated Use Combatant from combat.types.ts instead
 */
export interface LegacyCombatant {
  id: string;
  name: string;
  type: 'player' | 'monster' | 'npc';
  level: number;
  currentHp: number;
  maxHp: number;
  currentMp?: number;
  maxMp?: number;
  stats: CombatStats;
  buffs: Buff[];
  debuffs: Debuff[];
}

/**
 * Combat-relevant stats
 */
export interface CombatStats {
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  accuracy: number;
  evasion: number;
  resistances?: Record<DamageType, number>;
}

/**
 * Active combat session
 */
export interface LegacyCombatSession {
  id: string;
  participants: LegacyCombatant[];
  currentTurn: number;
  turnOrder: string[]; // Array of participant IDs
  rounds: CombatRound[];
  state: 'active' | 'paused' | 'ended';
  startedAt: Date;
  endedAt?: Date;
}

/**
 * Combat action taken by a participant
 */
export interface LegacyCombatAction {
  type: 'attack' | 'defend' | 'skill' | 'item' | 'flee';
  targetId?: string;
  skillId?: string;
  itemId?: string;
}

/**
 * Result of a combat action
 */
export interface LegacyCombatResult {
  success: boolean;
  damage?: DamageResult;
  healing?: number;
  statusEffects?: StatusEffect[];
  message: string;
  combatEnded: boolean;
  winner?: string;
}

/**
 * Damage calculation result
 */
export interface DamageResult {
  baseDamage: number;
  damageType: DamageType;
  actualDamage: number;
  isCritical: boolean;
  isBlocked: boolean;
  isDodged: boolean;
  resistanceModifier: number;
}

/**
 * Combat round information
 */
export interface CombatRound {
  roundNumber: number;
  actions: {
    participantId: string;
    action: LegacyCombatAction;
    result: LegacyCombatResult;
    timestamp: Date;
  }[];
}

/**
 * How combat ended
 */
export interface LegacyCombatOutcome {
  reason: 'victory' | 'defeat' | 'flee' | 'timeout';
  winner?: string;
  survivors: string[];
  casualties: string[];
  rewards?: {
    experience: bigint;
    gold: bigint;
    items: string[];
  };
}

/**
 * Buff/Debuff/Status Effect
 */
export interface Buff {
  id: string;
  name: string;
  duration: number;
  stacks?: number;
  modifier: Record<string, unknown>;
}

export interface Debuff extends Buff {}

export interface StatusEffect {
  type: 'buff' | 'debuff';
  effect: Buff | Debuff;
}

/**
 * Skill definition
 */
export interface Skill {
  id: string;
  name: string;
  damageType?: DamageType;
  mpCost?: number;
  cooldown?: number;
}

/**
 * Interface for Combat-related operations
 * Handles combat initiation, turn processing, and resolution
 */
export interface ICombatService extends IService {
  /**
   * Start a new combat session
   * @param initiatorId - The initiator of combat
   * @param request - Combat start request with targets and type
   * @returns New combat session
   */
  startCombat(initiatorId: string, request: CombatStartRequest): Promise<ActualCombatSession>;

  /**
   * Process a combat action
   * @param sessionId - The session ID
   * @param actorId - The actor ID
   * @param action - The action to process
   * @returns Result of the action
   */
  processAction(sessionId: string, actorId: string, action: ActualCombatAction): Promise<ActualCombatResult | CombatError>;

  /**
   * Get a combat session by ID
   * @param sessionId - The session ID
   * @returns Combat session or null
   */
  getSession(sessionId: string): Promise<ActualCombatSession | null>;

  /**
   * Validate if a user is part of a combat session
   * @param sessionId - The session ID
   * @param userId - The user ID to validate
   * @returns True if valid participant
   */
  validateParticipant(sessionId: string, userId: string): Promise<boolean>;

  /**
   * Allow a participant to flee from combat
   * @param sessionId - The session ID
   * @param userId - The user attempting to flee
   * @returns Combat result of flee attempt
   */
  fleeCombat(sessionId: string, userId: string): Promise<ActualCombatResult>;

  /**
   * Get combat stats for a character
   * @param charId - The character ID
   * @returns Character's combat stats
   */
  getCharacterStats(charId: string): Promise<CharacterCombatStats>;

  /**
   * Get resource pools for a character
   * @param charId - The character ID
   * @returns Character's resource pools or null
   */
  getCharacterResources(charId: string): Promise<ResourcePool | null>;

  /**
   * Simulate a complete combat scenario
   * @param initiatorId - The initiator ID
   * @param targetIds - Array of target IDs
   * @returns Combat end result
   */
  simulateCombat(initiatorId: string, targetIds: string[]): Promise<CombatEndResult>;

  /**
   * Force start a combat (bypassing some checks)
   * @param initiatorId - The initiator ID
   * @param request - Combat start request
   * @returns New combat session
   */
  forceStartCombat(initiatorId: string, request: CombatStartRequest): Promise<ActualCombatSession>;

  // Legacy methods that some implementations might still support
  /**
   * Initiate combat between participants (legacy)
   * @param attackerId - The initiator of combat
   * @param targetId - The target of the attack
   * @returns New combat session
   */
  initiateCombat?(attackerId: string, targetId: string): Promise<LegacyCombatSession>;

  /**
   * Process a combat action (legacy)
   * @param sessionId - The combat session ID
   * @param action - The action to process
   * @returns Result of the action
   */
  processCombatAction?(sessionId: string, action: LegacyCombatAction): Promise<LegacyCombatResult>;

  /**
   * End a combat session (legacy)
   * @param sessionId - The combat session ID
   * @param outcome - How the combat ended
   */
  endCombat?(sessionId: string, outcome: ActualCombatOutcome): Promise<void>;

  /**
   * Calculate damage between combatants (legacy)
   * @param attacker - The attacking combatant
   * @param target - The target combatant
   * @param skill - Optional skill being used
   * @returns Calculated damage
   */
  calculateDamage?(attacker: LegacyCombatant, target: LegacyCombatant, skill?: Skill): Promise<DamageResult>;

  /**
   * Get active combat session for a participant (legacy)
   * @param participantId - The participant to check
   * @returns Active session or null
   */
  getActiveCombat?(participantId: string): Promise<LegacyCombatSession | null>;

  /**
   * Apply status effect to a combatant (legacy)
   * @param combatantId - The combatant to affect
   * @param effect - The effect to apply
   */
  applyStatusEffect?(combatantId: string, effect: StatusEffect): Promise<void>;
}