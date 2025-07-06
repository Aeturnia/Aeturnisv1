export interface ILootTable {
  id: string;
  name: string;
  dropRules: IDropRules;
}

export interface IDropRules {
  guaranteedDrops?: string[];
  partyBonusMultiplier?: number;
  levelScaling?: boolean;
  eventMultipliers?: Record<string, number>;
}

export interface ILootEntry {
  id: string;
  lootTableId: string;
  itemId: string;
  minQty: number;
  maxQty: number;
  dropRate: number;
  rarity: ItemRarity;
  conditions: IDropConditions;
}

export interface IDropConditions {
  minLevel?: number;
  maxLevel?: number;
  requiredQuests?: string[];
  timeGated?: ITimeGate;
}

export interface ITimeGate {
  startHour: number;
  endHour: number;
  daysOfWeek?: number[];
}

export interface ILootDrop {
  itemId: string;
  quantity: number;
  rarity: ItemRarity;
  rolledChance: number;
  guaranteed: boolean;
}

export interface IDropModifierInput {
  characterLevel: number;
  partySize?: number;
  luckBonus?: number;
  eventModifiers?: Record<string, number>;
  seed?: string;
}

export interface ILootClaimRequest {
  characterId: string;
}

export interface ILootClaimResponse {
  loot: ILootDrop[];
  experience: number;
  gold: number;
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Database record types
export interface IRespawnPointRecord {
  id: string;
  zoneId: string;
  x: number;
  y: number;
  isGraveyard: boolean;
  name: string;
  restrictions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILootTableRecord {
  id: string;
  name: string;
  dropRules: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILootEntryRecord {
  id: string;
  lootTableId: string;
  itemId: string;
  minQty: number;
  maxQty: number;
  dropRate: number;
  rarity: ItemRarity;
  conditions: Record<string, unknown>;
  createdAt: Date;
}

export interface ILootHistoryRecord {
  id: string;
  characterId: string;
  combatSessionId?: string;
  itemId: string;
  qty: number;
  source: string;
  timestamp: Date;
}