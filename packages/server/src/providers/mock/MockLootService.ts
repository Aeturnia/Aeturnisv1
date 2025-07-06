import { ILootService, LootSource, LootTable, LootItem, DropRates, ClaimResult, Distribution } from '../interfaces/ILootService';
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

  constructor() {
    logger.info('MockLootService initialized');
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
          rarity: rarity as ItemRarity,
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

  async claimLoot(characterId: string, lootId: string): Promise<ClaimResult> {
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
}