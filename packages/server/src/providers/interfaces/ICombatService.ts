import { DamageType } from '@aeturnis/shared';

/**
 * Combat participant (player or monster)
 */
export interface Combatant {
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
export interface CombatSession {
  id: string;
  participants: Combatant[];
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
export interface CombatAction {
  type: 'attack' | 'defend' | 'skill' | 'item' | 'flee';
  targetId?: string;
  skillId?: string;
  itemId?: string;
}

/**
 * Result of a combat action
 */
export interface CombatResult {
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
    action: CombatAction;
    result: CombatResult;
    timestamp: Date;
  }[];
}

/**
 * How combat ended
 */
export interface CombatOutcome {
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
  modifier: any;
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
export interface ICombatService {
  /**
   * Initiate combat between participants
   * @param attackerId - The initiator of combat
   * @param targetId - The target of the attack
   * @returns New combat session
   */
  initiateCombat(attackerId: string, targetId: string): Promise<CombatSession>;

  /**
   * Process a combat action
   * @param sessionId - The combat session ID
   * @param action - The action to process
   * @returns Result of the action
   */
  processCombatAction(sessionId: string, action: CombatAction): Promise<CombatResult>;

  /**
   * End a combat session
   * @param sessionId - The combat session ID
   * @param outcome - How the combat ended
   */
  endCombat(sessionId: string, outcome: CombatOutcome): Promise<void>;

  /**
   * Calculate damage between combatants
   * @param attacker - The attacking combatant
   * @param target - The target combatant
   * @param skill - Optional skill being used
   * @returns Calculated damage
   */
  calculateDamage(attacker: Combatant, target: Combatant, skill?: Skill): Promise<DamageResult>;

  /**
   * Get active combat session for a participant
   * @param participantId - The participant to check
   * @returns Active session or null
   */
  getActiveCombat(participantId: string): Promise<CombatSession | null>;

  /**
   * Apply status effect to a combatant
   * @param combatantId - The combatant to affect
   * @param effect - The effect to apply
   */
  applyStatusEffect(combatantId: string, effect: StatusEffect): Promise<void>;
}