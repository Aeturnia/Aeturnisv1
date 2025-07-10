import { ItemRarity } from '@aeturnis/shared';
import { 
  ILootDrop, 
  IDropModifierInput, 
  ILootClaimRequest, 
  ILootClaimResponse 
} from '../../types/loot';
import { IService } from './IService';

// Re-export types that are used by the interface
export { ILootDrop, IDropModifierInput, ILootClaimRequest, ILootClaimResponse };

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
 * Loot history entry
 */
export interface LootHistoryEntry {
  id: string;
  characterId: string;
  sessionId: string;
  loot: ILootDrop[];
  gold: number;
  experience: number;
  claimedAt: Date;
}

/**
 * Interface for Loot-related operations
 * Handles loot generation, distribution, and claiming
 */
export interface ILootService extends IService {
  /**
   * Calculate and generate loot drops from a loot table
   * @param lootTableName - Name of the loot table
   * @param modifiers - Drop rate modifiers
   * @returns Array of loot drops
   */
  calculateLootDrops(
    lootTableName: string,
    modifiers: IDropModifierInput
  ): Promise<ILootDrop[]>;

  /**
   * Claim loot from a combat session
   * @param sessionId - The combat session ID
   * @param claimRequest - The claim request containing characterId
   * @returns Loot claim response with items, gold, and experience
   */
  claimLoot(
    sessionId: string,
    claimRequest: ILootClaimRequest
  ): Promise<ILootClaimResponse>;

  /**
   * Get loot history for a character
   * @param characterId - The character ID
   * @param limit - Maximum number of entries to return
   * @returns Array of loot history entries
   */
  getLootHistory(characterId: string, limit?: number): Promise<LootHistoryEntry[]>;

  /**
   * Create a test loot table for development/testing
   * @returns The created loot table ID
   */
  createTestLootTable(): Promise<string>;

  /**
   * Get all available loot tables
   * @returns Array of loot tables
   */
  getAllLootTables?(): Promise<LootTable[]>;

  // Legacy methods that some implementations might still support
  /**
   * Generate loot from a source (legacy)
   * @param source - The loot source (monster, chest, etc.)
   * @param killer - The character who killed/opened the source
   * @returns Generated loot table
   */
  generateLoot?(source: LootSource, killer: any): Promise<LootTable>;

  /**
   * Calculate drop rates based on various factors (legacy)
   * @param monsterId - The monster being killed
   * @param characterLevel - The character's level
   * @returns Calculated drop rates
   */
  calculateDropRates?(monsterId: string, characterLevel: number): Promise<DropRates>;
}