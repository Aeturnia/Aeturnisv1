import { LootRepository } from '../repositories/loot.repository';
import { 
  ILootClaimRequest,
  ILootClaimResponse,
  ILootDrop,
  IDropModifierInput,
  ItemRarity,
  ILootEntryRecord
} from '../types/loot';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class LootService {
  private static readonly PARTY_BONUS_MULTIPLIER = 1.2;
  private static readonly LUCK_BONUS_MULTIPLIER = 0.1;

  constructor(private lootRepository: LootRepository) {}

  /**
   * Calculate and generate loot drops from a loot table
   */
  async calculateLootDrops(
    lootTableName: string,
    modifiers: IDropModifierInput
  ): Promise<ILootDrop[]> {
    logger.info('Calculating loot drops', { lootTableName, modifiers });

    // Get loot table
    const lootTable = await this.lootRepository.getLootTableByName(lootTableName);
    if (!lootTable) {
      throw new NotFoundError(`Loot table '${lootTableName}' not found`);
    }

    // Get loot entries for the table
    const lootEntries = await this.lootRepository.getLootEntriesByTableId(lootTable.id);
    
    if (lootEntries.length === 0) {
      logger.warn('No loot entries found for table', { lootTableName });
      return [];
    }

    // Calculate drops for each entry
    const drops: ILootDrop[] = [];
    
    for (const entry of lootEntries) {
      const drop = this.rollLootEntry(entry, modifiers);
      if (drop) {
        drops.push(drop);
      }
    }

    logger.info('Loot drops calculated', { 
      lootTableName, 
      totalEntries: lootEntries.length, 
      successfulDrops: drops.length 
    });

    return drops;
  }

  /**
   * Claim loot from a combat session
   */
  async claimLoot(
    combatSessionId: string,
    request: ILootClaimRequest
  ): Promise<ILootClaimResponse> {
    logger.info('Processing loot claim', { combatSessionId, characterId: request.characterId });

    // Validate loot claim
    await this.validateLootClaim(combatSessionId, request.characterId);

    // Check if character has already claimed loot
    const alreadyClaimed = await this.lootRepository.hasCharacterClaimedLoot(
      request.characterId, 
      combatSessionId
    );

    if (alreadyClaimed) {
      throw new ConflictError('Loot already claimed for this combat session');
    }

    // For demo purposes, generate mock loot drops
    const mockLoot = await this.generateMockLoot(request.characterId);

    // Record loot history for each item
    for (const loot of mockLoot.loot) {
      await this.lootRepository.createLootHistoryRecord(
        request.characterId,
        combatSessionId,
        loot.itemId,
        loot.quantity,
        'combat_victory'
      );
    }

    logger.info('Loot claim processed successfully', { 
      combatSessionId, 
      characterId: request.characterId,
      itemCount: mockLoot.loot.length
    });

    return mockLoot;
  }

  /**
   * Get loot history for a character
   */
  async getLootHistory(characterId: string, limit: number = 50): Promise<Array<{ id: string; timestamp: Date; items: unknown[]; source: string }>> {
    const history = await this.lootRepository.getLootHistoryForCharacter(characterId, limit);
    
    return history.map(record => ({
      id: record.id,
      itemId: record.itemId,
      quantity: record.qty,
      source: record.source,
      timestamp: record.timestamp.toISOString(),
      combatSessionId: record.combatSessionId,
    }));
  }

  /**
   * Roll a single loot entry to determine if it drops
   */
  private rollLootEntry(
    entry: ILootEntryRecord, 
    modifiers: IDropModifierInput
  ): ILootDrop | null {
    // Calculate modified drop rate
    let dropRate = parseFloat(entry.dropRate.toString());
    
    // Apply level scaling
    if (modifiers.characterLevel > 1) {
      const levelBonus = Math.min(modifiers.characterLevel * 0.01, 0.1); // Max 10% bonus
      dropRate += levelBonus;
    }

    // Apply party bonus
    if (modifiers.partySize && modifiers.partySize > 1) {
      dropRate *= LootService.PARTY_BONUS_MULTIPLIER;
    }

    // Apply luck bonus
    if (modifiers.luckBonus && modifiers.luckBonus > 0) {
      dropRate += modifiers.luckBonus * LootService.LUCK_BONUS_MULTIPLIER;
    }

    // Apply event modifiers
    if (modifiers.eventModifiers) {
      for (const [event, multiplier] of Object.entries(modifiers.eventModifiers)) {
        dropRate *= multiplier;
      }
    }

    // Cap drop rate at 100%
    dropRate = Math.min(dropRate, 1.0);

    // Roll for drop
    const roll = this.generateSeededRandom(modifiers.seed);
    
    if (roll <= dropRate) {
      // Determine quantity
      const quantity = this.randomInt(entry.minQty, entry.maxQty);
      
      return {
        itemId: entry.itemId,
        quantity,
        rarity: entry.rarity as ItemRarity,
        rolledChance: roll,
        guaranteed: dropRate >= 1.0,
      };
    }

    return null;
  }

  /**
   * Validate loot claim request
   */
  private async validateLootClaim(
    combatSessionId: string, 
    characterId: string
  ): Promise<void> {
    if (!combatSessionId) {
      throw new ValidationError('Combat session ID is required');
    }

    if (!characterId) {
      throw new ValidationError('Character ID is required');
    }

    // TODO: Validate that combat session exists and is completed
    // TODO: Validate that character participated in combat
    // For now, we'll assume validation passes
  }

  /**
   * Generate mock loot for testing purposes
   */
  private async generateMockLoot(characterId: string): Promise<ILootClaimResponse> {
    const mockLoot: ILootDrop[] = [
      {
        itemId: 'health_potion_001',
        quantity: 2,
        rarity: ItemRarity.COMMON,
        rolledChance: 0.85,
        guaranteed: false,
      },
      {
        itemId: 'iron_sword_001',
        quantity: 1,
        rarity: ItemRarity.UNCOMMON,
        rolledChance: 0.15,
        guaranteed: false,
      },
    ];

    // Random chance for rare drop
    if (Math.random() < 0.1) {
      mockLoot.push({
        itemId: 'rare_gem_001',
        quantity: 1,
        rarity: ItemRarity.RARE,
        rolledChance: 0.05,
        guaranteed: false,
      });
    }

    return {
      loot: mockLoot,
      experience: 150,
      gold: 25,
    };
  }

  /**
   * Generate seeded random number for consistent drops
   */
  private generateSeededRandom(seed?: string): number {
    if (!seed) {
      return Math.random();
    }

    // Simple seeded random implementation
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Create a new loot table for testing
   */
  async createTestLootTable(): Promise<string> {
    const tableId = await this.lootRepository.createLootTable(
      'test_monster_loot',
      {
        guaranteedDrops: ['gold'],
        partyBonusMultiplier: 1.2,
        levelScaling: true,
      }
    );

    // Add some test loot entries
    await this.lootRepository.createLootEntry(
      tableId,
      'health_potion_001',
      1,
      3,
      0.75,
      'common',
      {}
    );

    await this.lootRepository.createLootEntry(
      tableId,
      'iron_sword_001',
      1,
      1,
      0.25,
      'uncommon',
      { minLevel: 5 }
    );

    await this.lootRepository.createLootEntry(
      tableId,
      'rare_gem_001',
      1,
      1,
      0.05,
      'rare',
      { minLevel: 10 }
    );

    return tableId;
  }
}