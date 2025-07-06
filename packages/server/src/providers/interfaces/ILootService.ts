import { ItemRarity } from '@aeturnis/shared';

/**
 * Source of loot generation
 */
export interface LootSource {
  type: 'monster' | 'chest' | 'quest' | 'boss';
  id: string;
  level: number;
  rarity?: 'normal' | 'elite' | 'boss';
}

/**
 * Generated loot table
 */
export interface LootTable {
  id: string;
  sourceId: string;
  items: LootItem[];
  gold: bigint;
  experience: bigint;
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * Individual loot item
 */
export interface LootItem {
  itemId: string;
  quantity: number;
  rarity: ItemRarity;
  isBound: boolean;
  rollValue: number; // For group loot distribution
}

/**
 * Drop rate calculations
 */
export interface DropRates {
  baseDropRate: number;
  magicFindBonus: number;
  levelPenalty: number;
  finalDropRate: number;
  guaranteedDrops: string[];
}

/**
 * Result of claiming loot
 */
export interface ClaimResult {
  success: boolean;
  claimedItems: LootItem[];
  claimedGold: bigint;
  failedItems: string[]; // Items that couldn't be claimed (inventory full, etc.)
  message: string;
}

/**
 * Loot distribution for party/raid
 */
export interface Distribution {
  method: 'freeforall' | 'roundrobin' | 'masterloot' | 'needgreed';
  assignments: Map<string, LootItem[]>; // characterId -> items
  unassigned: LootItem[];
}

/**
 * Interface for Loot-related operations
 * Handles loot generation, distribution, and claiming
 */
export interface ILootService {
  /**
   * Generate loot from a source
   * @param source - The loot source (monster, chest, etc.)
   * @param killer - The character who killed/opened the source
   * @returns Generated loot table
   */
  generateLoot(source: LootSource, killer: any): Promise<LootTable>;

  /**
   * Calculate drop rates based on various factors
   * @param monsterId - The monster being killed
   * @param characterLevel - The character's level
   * @returns Calculated drop rates
   */
  calculateDropRates(monsterId: string, characterLevel: number): Promise<DropRates>;

  /**
   * Claim loot from a loot table
   * @param characterId - The character claiming the loot
   * @param lootId - The loot table ID
   * @returns Result of the claim attempt
   */
  claimLoot(characterId: string, lootId: string): Promise<ClaimResult>;

  /**
   * Distribute loot among party members
   * @param loot - The loot table to distribute
   * @param party - Array of party members
   * @returns Distribution assignments
   */
  distributeLoot(loot: LootTable, party: any[]): Promise<Distribution>;

  /**
   * Get active loot tables for a character
   * @param characterId - The character to check
   * @returns Array of available loot tables
   */
  getActiveLoot(characterId: string): Promise<LootTable[]>;

  /**
   * Force expire a loot table
   * @param lootId - The loot table to expire
   */
  expireLoot(lootId: string): Promise<void>;
}