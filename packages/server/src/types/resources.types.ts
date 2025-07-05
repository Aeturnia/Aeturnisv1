export interface ResourcePool {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  hpRegenRate: number;
  manaRegenRate: number;
  staminaRegenRate: number;
  lastRegenTime: number; // Unix timestamp
}

export interface ResourceUpdate {
  charId: string;
  poolType: 'hp' | 'mana' | 'stamina';
  currentValue: number;
  maxValue: number;
  change: number; // positive for gain, negative for loss
  reason: string; // 'combat', 'regen', 'item', 'skill'
}

export interface ResourceModifier {
  type: 'hp' | 'mana' | 'stamina';
  value: number;
  percentage?: boolean; // true for percentage-based, false for flat value
  duration?: number; // in seconds, undefined for instant
}

export interface ResourceEvent {
  charId: string;
  timestamp: number;
  updates: ResourceUpdate[];
  source: 'combat' | 'regen' | 'item' | 'skill' | 'rest';
}