import { 
  ILootService, 
  LootSource, 
  LootTable, 
  LootItem, 
  DropRates, 
  ClaimResult, 
  Distribution,
  ILootDrop,
  IDropModifierInput,
  ILootClaimRequest,
  ILootClaimResponse,
  LootHistoryEntry
} from '../interfaces/ILootService';
import { ItemRarity } from '@aeturnis/shared';
import { logger } from '../../utils/logger';

/**
 * Mock implementation of LootService for testing
 * Uses in-memory data storage with predictable RNG
 */
export class MockLootService implements ILootService {
  // Mock loot tables storage
  private lootTables: Map<string, LootTable> = new Map();
  
  // Mock item database
  private mockItems = {
    common: [
      { id: 'item_001', name: 'Iron Sword', value: 50 },
      { id: 'item_002', name: 'Health Potion', value: 10 },
      { id: 'item_003', name: 'Leather Armor', value: 40 },
      { id: 'item_004', name: 'Bread', value: 5 }
    ],
    uncommon: [
      { id: 'item_101', name: 'Steel Sword', value: 150 },
      { id: 'item_102', name: 'Mana Potion', value: 30 },
      { id: 'item_103', name: 'Chain Mail', value: 120 }
    ],
    rare: [
      { id: 'item_201', name: 'Silver Ring', value: 500 },
      { id: 'item_202', name: 'Enchanted Dagger', value: 400 },
      { id: 'item_203', name: 'Mystic Orb', value: 600 }
    ],
    epic: [
      { id: 'item_301', name: 'Dragon Scale Armor', value: 2000 },
      { id: 'item_302', name: 'Flaming Sword', value: 1500 }
    ],
    legendary: [
      { id: 'item_401', name: 'Excalibur', value: 10000 },
      { id: 'item_402', name: 'Crown of Kings', value: 15000 }
    ]
  };
  
  // Mock loot claim history
  private claimHistory: Map<string, LootTable[]> = new Map();
  
  // Mock loot history
  private lootHistory: Map<string, LootHistoryEntry[]> = new Map();
  
  // Mock loot tables for testing
  private mockLootTables: Map<string, any> = new Map([
    ['test_monster_loot', {
      id: 'test_monster_loot',
      name: 'Test Monster Loot Table',
      items: [
        { itemId: 'item_001', dropRate: 0.5, minQty: 1, maxQty: 1, rarity: 'common' },
        { itemId: 'item_101', dropRate: 0.2, minQty: 1, maxQty: 1, rarity: 'uncommon' },
        { itemId: 'item_201', dropRate: 0.05, minQty: 1, maxQty: 1, rarity: 'rare' }
      ]
    }]
  ]);

  constructor() {
    try {
      logger.info('MockLootService initialized');
    } catch (error) {
      logger.error('MockLootService initialization failed:', error);
      throw error;
    }
  }

  async generateLoot(source: LootSource, killer: any): Promise<LootTable> {
    logger.info(`MockLootService: Generating loot from ${source.type} ${source.id}`);
    
    const lootId = `loot_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const items: LootItem[] = [];
    
    // Generate items based on source type and level
    const itemCount = this.getItemCount(source);
    
    for (let i = 0; i < itemCount; i++) {
      const rarity = this.getRarity(source.level, killer.level || 1);
      const item = this.getRandomItem(rarity);
      
      if (item) {
        items.push({
          itemId: item.id,
          quantity: rarity === 'common' ? Math.floor(Math.random() * 3) + 1 : 1,
          rarity: rarity as any,
          isBound: rarity === 'legendary' || rarity === 'epic',
          rollValue: Math.floor(Math.random() * 100)
        });
      }
    }
    
    // Calculate gold and experience
    const baseGold = source.level * 10;
    const baseXP = source.level * 50;
    
    const lootTable: LootTable = {
      id: lootId,
      sourceId: source.id,
      items,
      gold: BigInt(baseGold + Math.floor(Math.random() * baseGold)),
      experience: BigInt(baseXP + Math.floor(Math.random() * baseXP)),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };
    
    // Store loot table
    this.lootTables.set(lootId, lootTable);
    
    // Add to killer's active loot
    const killerLoot = this.claimHistory.get(killer.id) || [];
    killerLoot.push(lootTable);
    this.claimHistory.set(killer.id, killerLoot);
    
    return lootTable;
  }

  async calculateDropRates(monsterId: string, characterLevel: number): Promise<DropRates> {
    logger.info(`MockLootService: Calculating drop rates for monster ${monsterId}`);
    
    // Mock drop rate calculation
    const baseDropRate = 0.3; // 30% base chance
    const magicFindBonus = 0.1; // 10% magic find
    const levelDiff = Math.abs(10 - characterLevel); // Assume monster level 10
    const levelPenalty = levelDiff > 5 ? 0.1 : 0;
    
    return {
      baseDropRate,
      magicFindBonus,
      levelPenalty,
      finalDropRate: Math.max(0.1, baseDropRate + magicFindBonus - levelPenalty),
      guaranteedDrops: characterLevel === 1 ? ['item_002'] : [] // Guaranteed health potion for level 1
    };
  }

  // Legacy claimLoot method (for backward compatibility)
  async claimLootLegacy(characterId: string, lootId: string): Promise<ClaimResult> {
    logger.info(`MockLootService: Character ${characterId} claiming loot ${lootId}`);
    
    const lootTable = this.lootTables.get(lootId);
    if (!lootTable) {
      return {
        success: false,
        claimedItems: [],
        claimedGold: BigInt(0),
        failedItems: [],
        message: 'Loot table not found or expired'
      };
    }
    
    // Check if expired
    if (new Date() > lootTable.expiresAt) {
      this.lootTables.delete(lootId);
      return {
        success: false,
        claimedItems: [],
        claimedGold: BigInt(0),
        failedItems: [],
        message: 'Loot has expired'
      };
    }
    
    // Mock claim - assume inventory has space
    const claimedItems = [...lootTable.items];
    const failedItems: string[] = [];
    
    // Simulate some items failing (inventory full)
    if (claimedItems.length > 5) {
      const failed = claimedItems.splice(5);
      failedItems.push(...failed.map(item => item.itemId));
    }
    
    // Remove loot table after claim
    this.lootTables.delete(lootId);
    
    return {
      success: true,
      claimedItems,
      claimedGold: lootTable.gold,
      failedItems,
      message: failedItems.length > 0 ? 'Some items could not be claimed (inventory full)' : 'All loot claimed successfully'
    };
  }

  async distributeLoot(loot: LootTable, party: any[]): Promise<Distribution> {
    logger.info(`MockLootService: Distributing loot ${loot.id} to party of ${party.length}`);
    
    const assignments = new Map<string, LootItem[]>();
    const unassigned: LootItem[] = [];
    
    // Mock round-robin distribution
    let playerIndex = 0;
    for (const item of loot.items) {
      if (item.rarity === 'legendary' || item.rarity === 'epic') {
        // High value items go to unassigned for manual distribution
        unassigned.push(item);
      } else {
        // Distribute to party members in order
        const playerId = party[playerIndex].id;
        const playerItems = assignments.get(playerId) || [];
        playerItems.push(item);
        assignments.set(playerId, playerItems);
        
        playerIndex = (playerIndex + 1) % party.length;
      }
    }
    
    return {
      method: 'roundrobin',
      assignments,
      unassigned
    };
  }

  async getActiveLoot(characterId: string): Promise<LootTable[]> {
    logger.info(`MockLootService: Getting active loot for character ${characterId}`);
    
    const activeLoot: LootTable[] = [];
    const now = new Date();
    
    // Filter loot tables that haven't expired
    for (const [id, lootTable] of this.lootTables) {
      if (lootTable.expiresAt > now) {
        // Check if this loot is available to this character
        const history = this.claimHistory.get(characterId) || [];
        if (history.some(h => h.id === id)) {
          activeLoot.push(lootTable);
        }
      }
    }
    
    return activeLoot;
  }

  async expireLoot(lootId: string): Promise<void> {
    logger.info(`MockLootService: Expiring loot ${lootId}`);
    
    this.lootTables.delete(lootId);
  }

  // Helper methods
  private getItemCount(source: LootSource): number {
    switch (source.type) {
      case 'boss':
        return 3 + Math.floor(Math.random() * 3); // 3-5 items
      case 'chest':
        return 2 + Math.floor(Math.random() * 2); // 2-3 items
      case 'monster':
        return source.rarity === 'elite' ? 2 : Math.random() > 0.5 ? 1 : 0; // 0-2 items
      default:
        return 1;
    }
  }

  private getRarity(sourceLevel: number, characterLevel: number): ItemRarity {
    const roll = Math.random();
    const levelBonus = sourceLevel / 100;
    
    if (roll < 0.01 + levelBonus / 10) return 'legendary';
    if (roll < 0.05 + levelBonus / 5) return 'epic';
    if (roll < 0.15 + levelBonus / 3) return 'rare';
    if (roll < 0.35 + levelBonus / 2) return 'uncommon';
    return 'common';
  }

  private getRandomItem(rarity: ItemRarity): any {
    const items = this.mockItems[rarity];
    if (!items || items.length === 0) return null;
    
    return items[Math.floor(Math.random() * items.length)];
  }

  // New interface methods implementation

  async calculateLootDrops(
    lootTableName: string,
    modifiers: IDropModifierInput
  ): Promise<ILootDrop[]> {
    logger.info(`MockLootService: Calculating loot drops for ${lootTableName}`);
    
    const lootTable = this.mockLootTables.get(lootTableName);
    if (!lootTable) {
      logger.warn(`Loot table ${lootTableName} not found`);
      return [];
    }
    
    const drops: ILootDrop[] = [];
    
    // Apply modifiers to drop rates
    const partyBonus = modifiers.partySize ? 1 + (modifiers.partySize - 1) * 0.1 : 1;
    const luckBonus = 1 + (modifiers.luckBonus || 0);
    
    for (const item of lootTable.items) {
      const modifiedDropRate = item.dropRate * partyBonus * luckBonus;
      const roll = this.seededRandom(modifiers.seed || Math.random().toString());
      
      if (roll <= modifiedDropRate) {
        const quantity = item.minQty + Math.floor(Math.random() * (item.maxQty - item.minQty + 1));
        drops.push({
          itemId: item.itemId,
          quantity,
          rarity: item.rarity,
          rolledChance: roll,
          guaranteed: false
        });
      }
    }
    
    return drops;
  }

  async claimLoot(
    sessionId: string,
    claimRequest: ILootClaimRequest
  ): Promise<ILootClaimResponse> {
    logger.info(`MockLootService: Claiming loot for session ${sessionId}`);
    
    // Generate mock loot for the session
    const drops = await this.calculateLootDrops('test_monster_loot', {
      characterLevel: 10,
      partySize: 1,
      seed: sessionId
    });
    
    // Calculate gold and experience
    const gold = 100 + Math.floor(Math.random() * 200);
    const experience = 500 + Math.floor(Math.random() * 500);
    
    // Store in history
    const historyEntry: LootHistoryEntry = {
      id: `history_${Date.now()}`,
      characterId: claimRequest.characterId,
      sessionId,
      loot: drops,
      gold,
      experience,
      claimedAt: new Date()
    };
    
    const characterHistory = this.lootHistory.get(claimRequest.characterId) || [];
    characterHistory.unshift(historyEntry);
    this.lootHistory.set(claimRequest.characterId, characterHistory);
    
    return {
      loot: drops,
      gold,
      experience
    };
  }

  async getLootHistory(characterId: string, limit: number = 50): Promise<LootHistoryEntry[]> {
    logger.info(`MockLootService: Getting loot history for ${characterId}`);
    
    const history = this.lootHistory.get(characterId) || [];
    return history.slice(0, limit);
  }

  async createTestLootTable(): Promise<string> {
    logger.info('MockLootService: Creating test loot table');
    
    const tableId = `test_table_${Date.now()}`;
    this.mockLootTables.set(tableId, {
      id: tableId,
      name: 'Test Loot Table',
      items: [
        { itemId: 'item_001', dropRate: 0.8, minQty: 1, maxQty: 3, rarity: ItemRarity.COMMON },
        { itemId: 'item_101', dropRate: 0.3, minQty: 1, maxQty: 1, rarity: ItemRarity.UNCOMMON },
        { itemId: 'item_201', dropRate: 0.1, minQty: 1, maxQty: 1, rarity: ItemRarity.RARE },
        { itemId: 'item_301', dropRate: 0.01, minQty: 1, maxQty: 1, rarity: ItemRarity.EPIC }
      ]
    });
    
    return tableId;
  }

  async getAllLootTables(): Promise<LootTable[]> {
    logger.info('MockLootService: Getting all loot tables');
    
    return Array.from(this.lootTables.values());
  }

  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
  }
}