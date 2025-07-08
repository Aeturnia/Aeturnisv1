export enum CombatActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  FLEE = 'flee',
  USE_ITEM = 'useItem',
  USE_SKILL = 'useSkill',
  PASS = 'pass'
}

export interface CombatAction {
  type: CombatActionType | 'attack' | 'defend' | 'flee' | 'useItem' | 'useSkill' | 'pass' | 'skill' | 'item';
  targetCharId?: string;
  targetId?: string; // Alternative name for compatibility
  itemId?: string;
  skillId?: string;
  timestamp: number;
}

export interface CombatError {
  error: string;
  code: 'INSUFFICIENT_RESOURCES' | 'INVALID_ACTION' | 'COMBAT_TIMEOUT';
}

export interface CombatSessionConfig {
  turnTimeoutSeconds: number;
  maxTurns: number;
  enableAIVariety: boolean;
}

export interface CombatLog {
  message: string;
  timestamp: number;
  actorId: string;
  type: 'action' | 'damage' | 'buff' | 'system' | 'resource';
}

export interface CombatSession {
  sessionId: string;
  participants: Combatant[];
  turnOrder: string[]; // Array of charIds
  currentTurn: number;
  currentTurnIndex: number; // Alias for currentTurn for compatibility
  roundNumber: number;
  status: 'active' | 'completed' | 'abandoned' | 'ended';
  startTime: number;
  endTime?: number;
  winner?: string; // charId or 'draw'
  endMessage?: string; // Win/loss/flee message
  combatLog?: CombatLog[];
}

export interface Combatant {
  charId: string;
  charName: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  team: 'player' | 'enemy' | 'neutral';
  status: 'active' | 'defeated' | 'fled';
  buffs: CombatBuff[];
  debuffs: CombatDebuff[];
  // Combat stats from AIPE
  level: number;
  attack: number;
  defense: number;
  magicalAttack: number;
  magicalDefense: number;
  speed: number;
  criticalChance: number;
  criticalDamage: number;
  dodgeChance: number;
  blockChance: number;
  accuracy: number;
  // Weapon damage range
  weaponMinDamage: number;
  weaponMaxDamage: number;
}

// Alias for backward compatibility
export type CombatParticipant = Combatant;

export interface CombatBuff {
  id: string;
  name: string;
  duration: number; // turns remaining
  modifier: number; // percentage or flat value
}

export interface CombatDebuff extends CombatBuff {}

export interface CombatResult {
  sessionId: string;
  action: CombatAction;
  actorId: string;
  targetId?: string;
  damage?: number;
  healing?: number;
  resourceCost?: ResourceUpdate[];
  statusEffects?: Array<CombatBuff | CombatDebuff>;
  message: string;
  combatStatus?: string;
}

export interface CharacterCombatStats {
  charId: string;
  level: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  resources: ResourcePool;
}

export interface CombatStartRequest {
  targetIds: string[];
  battleType: 'pve' | 'pvp' | 'training';
}

export interface CombatActionRequest {
  sessionId: string;
  action: CombatAction;
}

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

export interface CombatEndResult {
  sessionId: string;
  winner: string | null;
  loser: string | null;
  rewards: CombatReward[];
  experience: number;
  duration: number;
}

export interface CombatReward {
  type: 'gold' | 'item' | 'experience';
  amount: number;
  itemId?: string;
}

import { ResourcePool, ResourceUpdate } from './resources.types';

// Export DamageType enum
export enum DamageType {
  PHYSICAL = 'physical',
  FIRE = 'fire',
  ICE = 'ice',
  LIGHTNING = 'lightning',
  HOLY = 'holy',
  DARK = 'dark',
  POISON = 'poison',
  PSYCHIC = 'psychic'
}