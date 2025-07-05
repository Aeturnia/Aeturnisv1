export enum CombatActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  FLEE = 'flee',
  USE_ITEM = 'useItem',
  USE_SKILL = 'useSkill',
  PASS = 'pass'
}

export interface CombatAction {
  type: CombatActionType;
  targetCharId?: string;
  itemId?: string;
  skillId?: string;
  timestamp: number;
}

export interface CombatSession {
  sessionId: string;
  participants: CombatParticipant[];
  turnOrder: string[]; // Array of charIds
  currentTurnIndex: number;
  roundNumber: number;
  status: 'active' | 'completed' | 'abandoned' | 'ended';
  startTime: number;
  endTime?: number;
  winner?: string; // charId or 'draw'
}

export interface CombatParticipant {
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
}

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

// Import ResourcePool and ResourceUpdate from resources.types.ts
import { ResourcePool, ResourceUpdate } from './resources.types';