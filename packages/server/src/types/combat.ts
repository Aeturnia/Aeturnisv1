export interface CombatStats {
  baseAttack: number;
  baseDefense: number;
  accuracy: number;
  evasion: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
  blockChance: number;
  resistances: {
    physical: number;
    magical: number;
    fire: number;
    ice: number;
    lightning: number;
    poison: number;
  };
}

export interface CombatAction {
  type: 'attack' | 'defend' | 'skill' | 'flee';
  skillId?: string;
  targetId?: string;
  damage?: number;
  healing?: number;
  effects?: StatusEffect[];
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'dot' | 'hot';
  duration: number;
  tickDamage?: number;
  tickHealing?: number;
  statModifiers?: {
    [key: string]: number;
  };
}

export interface CombatResult {
  success: boolean;
  damage: number;
  healing: number;
  isCritical: boolean;
  isBlocked: boolean;
  isMissed: boolean;
  effects: StatusEffect[];
  message: string;
}

export interface CombatState {
  sessionId: string;
  participants: string[]; // character IDs
  currentTurn: number;
  turnOrder: string[];
  isActive: boolean;
  startTime: Date;
  actions: CombatAction[];
  effects: Map<string, StatusEffect[]>; // characterId -> effects
}

export interface CombatSession {
  id: string;
  type: 'pve' | 'pvp' | 'raid' | 'dungeon';
  participants: {
    characterId: string;
    name: string;
    level: number;
    currentHp: number;
    maxHp: number;
    currentMp: number;
    maxMp: number;
    isAlive: boolean;
    position: number;
  }[];
  enemies?: {
    id: string;
    name: string;
    level: number;
    currentHp: number;
    maxHp: number;
    stats: CombatStats;
    lootTable: string[];
    experienceReward: number;
    goldReward: number;
  }[];
  state: CombatState;
  createdAt: Date;
  lastActionAt: Date;
  timeoutAt: Date;
}

export interface DamageCalculation {
  baseDamage: number;
  statModifier: number;
  weaponDamage: number;
  skillModifier: number;
  criticalMultiplier: number;
  resistanceReduction: number;
  finalDamage: number;
  breakdown: {
    base: number;
    stats: number;
    weapon: number;
    skill: number;
    critical: number;
    resistance: number;
  };
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  targetType: 'self' | 'enemy' | 'ally' | 'all_enemies' | 'all_allies';
  cooldown: number;
  manaCost: number;
  damage: number;
  healing: number;
  effects: StatusEffect[];
  requirements: {
    level: number;
    stats?: { [key: string]: number };
    items?: string[];
  };
}

export interface CombatEvent {
  type: 'combat_start' | 'combat_end' | 'turn_start' | 'action_taken' | 'effect_applied' | 'character_defeated';
  sessionId: string;
  characterId?: string;
  action?: CombatAction;
  result?: CombatResult;
  message: string;
  timestamp: Date;
}