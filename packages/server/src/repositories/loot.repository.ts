import { db } from '../database/config';
import { lootTables, lootEntries, lootHistory } from '../database/schema';
import { eq } from 'drizzle-orm';
import { 
  ILootTableRecord, 
  ILootEntryRecord, 
  ILootHistoryRecord,
  ILootDrop
} from '../types/loot';
import { NotFoundError } from '../utils/errors';

export class LootRepository {
  /**
   * Get loot table by ID
   */
  async getLootTableById(lootTableId: string): Promise<ILootTableRecord | null> {
    const result = await db
      .select()
      .from(lootTables)
      .where(eq(lootTables.id, lootTableId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0] as ILootTableRecord;
  }

  /**
   * Get loot table by name
   */
  async getLootTableByName(name: string): Promise<ILootTableRecord | null> {
    const result = await db
      .select()
      .from(lootTables)
      .where(eq(lootTables.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0] as ILootTableRecord;
  }

  /**
   * Get all loot entries for a loot table
   */
  async getLootEntriesByTableId(lootTableId: string): Promise<ILootEntryRecord[]> {
    const results = await db
      .select()
      .from(lootEntries)
      .where(eq(lootEntries.lootTableId, lootTableId));

    return results as ILootEntryRecord[];
  }

  /**
   * Create loot history record
   */
  async createLootHistoryRecord(
    characterId: string,
    combatSessionId: string | undefined,
    itemId: string,
    quantity: number,
    source: string
  ): Promise<void> {
    await db.insert(lootHistory).values({
      characterId,
      combatSessionId,
      itemId,
      qty: quantity,
      source,
      timestamp: new Date(),
    });
  }

  /**
   * Get loot history for character
   */
  async getLootHistoryForCharacter(
    characterId: string,
    limit: number = 50
  ): Promise<ILootHistoryRecord[]> {
    const results = await db
      .select()
      .from(lootHistory)
      .where(eq(lootHistory.characterId, characterId))
      .orderBy(lootHistory.timestamp)
      .limit(limit);

    return results as ILootHistoryRecord[];
  }

  /**
   * Check if character has already claimed loot from a combat session
   */
  async hasCharacterClaimedLoot(
    characterId: string, 
    combatSessionId: string
  ): Promise<boolean> {
    const result = await db
      .select({ id: lootHistory.id })
      .from(lootHistory)
      .where(
        eq(lootHistory.characterId, characterId) &&
        eq(lootHistory.combatSessionId, combatSessionId)
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Create a new loot table
   */
  async createLootTable(
    name: string,
    dropRules: Record<string, unknown>
  ): Promise<string> {
    const result = await db
      .insert(lootTables)
      .values({
        name,
        dropRules,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: lootTables.id });

    return result[0].id;
  }

  /**
   * Create a new loot entry
   */
  async createLootEntry(
    lootTableId: string,
    itemId: string,
    minQty: number,
    maxQty: number,
    dropRate: number,
    rarity: string,
    conditions: Record<string, unknown>
  ): Promise<string> {
    const result = await db
      .insert(lootEntries)
      .values({
        lootTableId,
        itemId,
        minQty,
        maxQty,
        dropRate: dropRate.toString(),
        rarity,
        conditions,
        createdAt: new Date(),
      })
      .returning({ id: lootEntries.id });

    return result[0].id;
  }

  /**
   * Get all loot tables
   */
  async getAllLootTables(): Promise<ILootTableRecord[]> {
    const results = await db
      .select()
      .from(lootTables)
      .orderBy(lootTables.name);

    return results as ILootTableRecord[];
  }

  /**
   * Delete loot table and all associated entries
   */
  async deleteLootTable(lootTableId: string): Promise<void> {
    await db
      .delete(lootTables)
      .where(eq(lootTables.id, lootTableId));
  }

  /**
   * Update loot table drop rules
   */
  async updateLootTableDropRules(
    lootTableId: string,
    dropRules: Record<string, unknown>
  ): Promise<void> {
    await db
      .update(lootTables)
      .set({
        dropRules,
        updatedAt: new Date(),
      })
      .where(eq(lootTables.id, lootTableId));
  }
}