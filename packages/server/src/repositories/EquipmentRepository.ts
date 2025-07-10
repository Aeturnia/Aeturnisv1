import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../database/config';
import { 
  items,
  characterEquipment, 
  characterInventory, 
  equipmentSlots,
  itemStats,
  itemSets,
  itemSetPieces,
  itemSetBonuses
} from '../database/schema';
import type { 
  Item,
  EquipmentItem, 
  InventoryItem, 
  ItemStat,
  EquipmentSlotType,
  BindType,
  StatType,
  EquipmentSlot
} from '../types/equipment.types';
import { logger } from '../utils/logger';

// Item Set Info interface
export interface ItemSetInfo {
  setName?: string;
  description?: string | null;
  totalPieces: number;
  equippedPieces: number;
  itemIds: number[];
  equippedItemIds: number[];
  bonuses: Array<{
    requiredPieces: number;
    bonusStats: Record<string, number>;
    active: boolean;
  }>;
}

export class EquipmentRepository {
  // =========================================================================
  // ITEM OPERATIONS
  // =========================================================================

  async getItemById(itemId: number): Promise<Item | null> {
    try {
      const result = await db
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .limit(1);
      
      if (!result[0]) return null;
      
      // Convert null values to undefined for optional fields
      const item = result[0];
      return {
        ...item,
        description: item.description ?? undefined,
        durability: item.durability ?? undefined,
        iconPath: item.iconPath ?? undefined,
        equipmentSlot: item.equipmentSlot as EquipmentSlotType | undefined,
      } as Item;
    } catch (error) {
      logger.error('Error fetching item by ID:', error);
      throw error;
    }
  }

  async getItemsByIds(itemIds: number[]): Promise<Item[]> {
    if (itemIds.length === 0) return [];
    
    try {
      const results = await db
        .select()
        .from(items)
        .where(inArray(items.id, itemIds));
      
      // Convert null values to undefined for optional fields
      return results.map(item => ({
        ...item,
        description: item.description ?? undefined,
        durability: item.durability ?? undefined,
        iconPath: item.iconPath ?? undefined,
        equipmentSlot: item.equipmentSlot as EquipmentSlotType | undefined,
      } as Item));
    } catch (error) {
      logger.error('Error fetching items by IDs:', error);
      throw error;
    }
  }

  async getItemStats(itemIds: number[]): Promise<Record<number, ItemStat[]>> {
    if (itemIds.length === 0) return {};
    
    try {
      const stats = await db
        .select()
        .from(itemStats)
        .where(inArray(itemStats.itemId, itemIds));

      const statsByItem: Record<number, ItemStat[]> = {};
      stats.forEach(stat => {
        if (!statsByItem[stat.itemId]) {
          statsByItem[stat.itemId] = [];
        }
        statsByItem[stat.itemId].push({
          id: stat.id,
          itemId: stat.itemId,
          statType: stat.statType as StatType,
          value: stat.value,
          isPercentage: stat.isPercentage,
        });
      });

      return statsByItem;
    } catch (error) {
      logger.error('Error fetching item stats:', error);
      throw error;
    }
  }

  // =========================================================================
  // EQUIPMENT OPERATIONS
  // =========================================================================

  async getCharacterEquipment(charId: string): Promise<EquipmentItem[]> {
    try {
      const equipment = await db
        .select()
        .from(characterEquipment)
        .where(eq(characterEquipment.charId, charId));

      return equipment.map(item => ({
        id: item.id,
        charId: item.charId,
        slotType: item.slotType as EquipmentSlotType,
        itemId: item.itemId,
        durability: item.durability,
        equippedAt: item.equippedAt,
      }));
    } catch (error) {
      logger.error('Error fetching character equipment:', error);
      throw error;
    }
  }

  async equipItem(charId: string, slotType: EquipmentSlotType, itemId: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Remove any existing item in that slot
        await tx
          .delete(characterEquipment)
          .where(and(
            eq(characterEquipment.charId, charId),
            eq(characterEquipment.slotType, slotType)
          ));

        // Equip new item
        await tx.insert(characterEquipment).values({
          charId,
          slotType,
          itemId,
          durability: 100, // Default to full durability
        });
      });
      
      logger.info(`Item ${itemId} equipped to slot ${slotType} for character ${charId}`);
    } catch (error) {
      logger.error('Error equipping item:', error);
      throw error;
    }
  }

  async unequipItem(charId: string, slotType: EquipmentSlotType): Promise<number | null> {
    try {
      const result = await db
        .delete(characterEquipment)
        .where(and(
          eq(characterEquipment.charId, charId),
          eq(characterEquipment.slotType, slotType)
        ))
        .returning({ itemId: characterEquipment.itemId });
      
      const itemId = result[0]?.itemId || null;
      if (itemId) {
        logger.info(`Item ${itemId} unequipped from slot ${slotType} for character ${charId}`);
      }
      
      return itemId;
    } catch (error) {
      logger.error('Error unequipping item:', error);
      throw error;
    }
  }

  async updateEquipmentDurability(charId: string, slotType: EquipmentSlotType, durability: number): Promise<void> {
    try {
      await db
        .update(characterEquipment)
        .set({ durability })
        .where(and(
          eq(characterEquipment.charId, charId),
          eq(characterEquipment.slotType, slotType)
        ));
      
      logger.debug(`Equipment durability updated for character ${charId}, slot ${slotType}: ${durability}`);
    } catch (error) {
      logger.error('Error updating equipment durability:', error);
      throw error;
    }
  }

  // =========================================================================
  // INVENTORY OPERATIONS
  // =========================================================================

  async getCharacterInventory(charId: string): Promise<InventoryItem[]> {
    try {
      const inventory = await db
        .select()
        .from(characterInventory)
        .where(eq(characterInventory.charId, charId))
        .orderBy(characterInventory.slotPosition);

      return inventory.map(item => ({
        id: item.id,
        charId: item.charId,
        itemId: item.itemId,
        quantity: item.quantity,
        slotPosition: item.slotPosition,
        bindStatus: item.bindStatus as BindType | undefined,
        bindTime: item.bindTime || undefined,
        durability: item.durability || undefined,
        obtainedAt: item.obtainedAt,
      }));
    } catch (error) {
      logger.error('Error fetching character inventory:', error);
      throw error;
    }
  }

  async addToInventory(
    charId: string, 
    itemId: number, 
    quantity: number,
    slotPosition: number,
    bindStatus?: BindType
  ): Promise<void> {
    try {
      await db.insert(characterInventory).values({
        charId,
        itemId,
        quantity,
        slotPosition,
        bindStatus: bindStatus || null,
        bindTime: bindStatus ? new Date() : null,
      });
      
      logger.info(`Added ${quantity}x item ${itemId} to inventory slot ${slotPosition} for character ${charId}`);
    } catch (error) {
      logger.error('Error adding item to inventory:', error);
      throw error;
    }
  }

  async updateInventorySlot(
    charId: string,
    slotPosition: number,
    updates: Partial<{
      itemId: number;
      quantity: number;
      bindStatus: BindType | null;
      durability: number | null;
    }>
  ): Promise<void> {
    try {
      await db
        .update(characterInventory)
        .set(updates)
        .where(and(
          eq(characterInventory.charId, charId),
          eq(characterInventory.slotPosition, slotPosition)
        ));
      
      logger.debug(`Inventory slot ${slotPosition} updated for character ${charId}`);
    } catch (error) {
      logger.error('Error updating inventory slot:', error);
      throw error;
    }
  }

  async removeFromInventory(charId: string, slotPosition: number): Promise<void> {
    try {
      await db
        .delete(characterInventory)
        .where(and(
          eq(characterInventory.charId, charId),
          eq(characterInventory.slotPosition, slotPosition)
        ));
      
      logger.info(`Removed item from inventory slot ${slotPosition} for character ${charId}`);
    } catch (error) {
      logger.error('Error removing item from inventory:', error);
      throw error;
    }
  }

  async moveInventoryItem(
    charId: string,
    fromSlot: number,
    toSlot: number
  ): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Get the item in the from slot
        const fromItem = await tx
          .select()
          .from(characterInventory)
          .where(and(
            eq(characterInventory.charId, charId),
            eq(characterInventory.slotPosition, fromSlot)
          ))
          .limit(1);

        if (fromItem.length === 0) {
          throw new Error('No item found in source slot');
        }

        // Check if destination slot is occupied
        const toItem = await tx
          .select()
          .from(characterInventory)
          .where(and(
            eq(characterInventory.charId, charId),
            eq(characterInventory.slotPosition, toSlot)
          ))
          .limit(1);

        if (toItem.length > 0) {
          // Swap positions
          await tx
            .update(characterInventory)
            .set({ slotPosition: -1 }) // Temporary position
            .where(and(
              eq(characterInventory.charId, charId),
              eq(characterInventory.slotPosition, fromSlot)
            ));

          await tx
            .update(characterInventory)
            .set({ slotPosition: fromSlot })
            .where(and(
              eq(characterInventory.charId, charId),
              eq(characterInventory.slotPosition, toSlot)
            ));

          await tx
            .update(characterInventory)
            .set({ slotPosition: toSlot })
            .where(and(
              eq(characterInventory.charId, charId),
              eq(characterInventory.slotPosition, -1)
            ));
        } else {
          // Simple move
          await tx
            .update(characterInventory)
            .set({ slotPosition: toSlot })
            .where(and(
              eq(characterInventory.charId, charId),
              eq(characterInventory.slotPosition, fromSlot)
            ));
        }
      });
      
      logger.info(`Moved inventory item from slot ${fromSlot} to ${toSlot} for character ${charId}`);
    } catch (error) {
      logger.error('Error moving inventory item:', error);
      throw error;
    }
  }

  async findEmptyInventorySlot(charId: string, maxSlots: number = 100): Promise<number> {
    try {
      const occupiedSlots = await db
        .select({ slotPosition: characterInventory.slotPosition })
        .from(characterInventory)
        .where(eq(characterInventory.charId, charId));

      const occupied = new Set(occupiedSlots.map(s => s.slotPosition));
      
      for (let slot = 0; slot < maxSlots; slot++) {
        if (!occupied.has(slot)) {
          return slot;
        }
      }
      
      return -1; // No empty slot found
    } catch (error) {
      logger.error('Error finding empty inventory slot:', error);
      throw error;
    }
  }

  // =========================================================================
  // SET BONUS OPERATIONS
  // =========================================================================

  async getItemSetInfo(itemIds: number[]): Promise<Record<number, ItemSetInfo>> {
    if (itemIds.length === 0) return {};
    
    try {
      // Get set pieces for these items
      const setPieces = await db
        .select({
          itemId: itemSetPieces.itemId,
          setId: itemSetPieces.setId,
          setName: itemSets.setName,
          setDescription: itemSets.description,
        })
        .from(itemSetPieces)
        .innerJoin(itemSets, eq(itemSetPieces.setId, itemSets.id))
        .where(inArray(itemSetPieces.itemId, itemIds));

      if (setPieces.length === 0) return {};

      const setIds = [...new Set(setPieces.map(p => p.setId))];
      
      // Get all pieces for these sets
      const allSetPieces = await db
        .select()
        .from(itemSetPieces)
        .where(inArray(itemSetPieces.setId, setIds));

      // Get set bonuses
      const setBonuses = await db
        .select()
        .from(itemSetBonuses)
        .where(inArray(itemSetBonuses.setId, setIds));

      // Group by set
      const setInfo: Record<number, ItemSetInfo> = {};
      
      setIds.forEach(setId => {
        const setData = setPieces.find(p => p.setId === setId);
        const setItemIds = allSetPieces.filter(p => p.setId === setId).map(p => p.itemId);
        const equippedItems = setItemIds.filter(id => itemIds.includes(id));
        const bonuses = setBonuses.filter(b => b.setId === setId);

        setInfo[setId] = {
          setName: setData?.setName,
          description: setData?.setDescription,
          totalPieces: setItemIds.length,
          equippedPieces: equippedItems.length,
          itemIds: setItemIds,
          equippedItemIds: equippedItems,
          bonuses: bonuses.map(b => ({
            requiredPieces: b.requiredPieces,
            bonusStats: b.bonusStats,
            active: equippedItems.length >= b.requiredPieces,
          })),
        };
      });

      return setInfo;
    } catch (error) {
      logger.error('Error fetching item set info:', error);
      throw error;
    }
  }

  // =========================================================================
  // EQUIPMENT SLOTS CONFIGURATION
  // =========================================================================

  async getEquipmentSlots(): Promise<EquipmentSlot[]> {
    try {
      const slots = await db
        .select()
        .from(equipmentSlots)
        .orderBy(equipmentSlots.sortOrder);
      
      return slots.map(slot => ({
        id: slot.id,
        slotType: slot.slotType as EquipmentSlotType,
        displayName: slot.displayName,
        sortOrder: slot.sortOrder,
        createdAt: slot.createdAt,
      }));
    } catch (error) {
      logger.error('Error fetching equipment slots:', error);
      throw error;
    }
  }

  async initializeEquipmentSlots(): Promise<void> {
    try {
      const slotsConfig = [
        { slotType: 'head', displayName: 'Head', sortOrder: 1 },
        { slotType: 'neck', displayName: 'Neck', sortOrder: 2 },
        { slotType: 'chest', displayName: 'Chest', sortOrder: 3 },
        { slotType: 'hands', displayName: 'Hands', sortOrder: 4 },
        { slotType: 'legs', displayName: 'Legs', sortOrder: 5 },
        { slotType: 'feet', displayName: 'Feet', sortOrder: 6 },
        { slotType: 'weapon', displayName: 'Main Hand', sortOrder: 7 },
        { slotType: 'offhand', displayName: 'Off Hand', sortOrder: 8 },
        { slotType: 'ring1', displayName: 'Ring 1', sortOrder: 9 },
        { slotType: 'ring2', displayName: 'Ring 2', sortOrder: 10 },
      ];

      for (const slot of slotsConfig) {
        await db
          .insert(equipmentSlots)
          .values(slot)
          .onConflictDoNothing();
      }
      
      logger.info('Equipment slots initialized');
    } catch (error) {
      logger.error('Error initializing equipment slots:', error);
      throw error;
    }
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getInventoryWeight(_charId: string): Promise<number> {
    try {
      // Note: This would require a weight field on items table
      // For now, returning 0 as placeholder
      return 0;
    } catch (error) {
      logger.error('Error calculating inventory weight:', error);
      throw error;
    }
  }

  async getInventoryValue(charId: string): Promise<number> {
    try {
      const inventory = await db
        .select({
          quantity: characterInventory.quantity,
          sellPrice: items.sellPrice,
        })
        .from(characterInventory)
        .innerJoin(items, eq(characterInventory.itemId, items.id))
        .where(eq(characterInventory.charId, charId));

      return inventory.reduce((total, item) => {
        return total + (Number(item.sellPrice) * item.quantity);
      }, 0);
    } catch (error) {
      logger.error('Error calculating inventory value:', error);
      throw error;
    }
  }
}