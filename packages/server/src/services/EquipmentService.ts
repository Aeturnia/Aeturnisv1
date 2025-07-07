import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { CharacterRepository } from '../repositories/CharacterRepository';
import { CacheService } from './CacheService';
import { 
  EQUIPMENT_SLOTS,
  MAX_INVENTORY_SLOTS,
  STAT_TYPES
} from '../types/equipment.types';
import type { 
  Item,
  EquipmentItem, 
  InventoryItem, 
  EquipmentStats,
  EquipmentSlotType,
  BindType,
  ItemWithStats,
  InventoryItemWithDetails,
  EquipmentItemWithDetails,
  EquipmentSet,
  InventoryData,
  EquipmentOperationResult,
  InventoryOperationResult,
  StatType
} from '../types/equipment.types';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

export class EquipmentService {
  constructor(
    private equipmentRepo: EquipmentRepository,
    private characterRepo: CharacterRepository,
    private cache: CacheService
  ) {}

  // =========================================================================
  // EQUIPMENT OPERATIONS
  // =========================================================================

  async getCharacterEquipment(charId: string): Promise<EquipmentSet> {
    const cacheKey = `equipment:${charId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const equipment = await this.equipmentRepo.getCharacterEquipment(charId);
      const itemIds = equipment.map(eq => eq.itemId);
      
      // Get items with stats
      const itemsWithStats = await this.getItemsWithStats(itemIds);
      
      // Build equipment set
      const equipmentSet: EquipmentSet = {
        equipment: this.buildEquipmentSlots(equipment, itemsWithStats),
        stats: await this.calculateEquipmentStats(equipment, itemsWithStats),
      };

      await this.cache.set(cacheKey, equipmentSet, 300);
      return equipmentSet;
    } catch (error) {
      logger.error('Error fetching character equipment:', error);
      throw error;
    }
  }

  async equipItem(
    charId: string, 
    inventorySlot: number, 
    equipmentSlot: EquipmentSlotType
  ): Promise<EquipmentOperationResult> {
    try {
      // Validate character exists
      const character = await this.characterRepo.findById(charId);
      if (!character) {
        throw new NotFoundError('Character not found');
      }

      // Get inventory item
      const inventory = await this.getCharacterInventory(charId);
      const inventoryItem = inventory.items.find(item => item.slotPosition === inventorySlot);
      if (!inventoryItem) {
        throw new BadRequestError('Item not found in inventory');
      }

      // Validate item can be equipped in this slot
      if (inventoryItem.item.equipmentSlot !== equipmentSlot) {
        throw new BadRequestError(`Item cannot be equipped in ${equipmentSlot} slot`);
      }

      // Check level requirement
      if (character.level < inventoryItem.item.levelRequirement) {
        throw new BadRequestError(`Character level ${character.level} is too low. Required: ${inventoryItem.item.levelRequirement}`);
      }

      // Check binding restrictions
      if (inventoryItem.bindStatus === 'soulbound' && inventoryItem.charId !== charId) {
        throw new BadRequestError('Item is soulbound to another character');
      }

      // Check if slot is occupied and handle unequipping
      const currentEquipment = await this.equipmentRepo.getCharacterEquipment(charId);
      const currentEquipped = currentEquipment.find(eq => eq.slotType === equipmentSlot);
      
      if (currentEquipped) {
        const emptySlot = await this.equipmentRepo.findEmptyInventorySlot(charId, MAX_INVENTORY_SLOTS);
        if (emptySlot === -1) {
          throw new BadRequestError('Inventory is full. Cannot unequip current item.');
        }
        
        // Move current equipment to inventory
        await this.equipmentRepo.addToInventory(charId, currentEquipped.itemId, 1, emptySlot);
        await this.equipmentRepo.unequipItem(charId, equipmentSlot);
      }

      // Equip the new item
      await this.equipmentRepo.equipItem(charId, equipmentSlot, inventoryItem.itemId);
      
      // Remove from inventory
      await this.equipmentRepo.removeFromInventory(charId, inventorySlot);

      // Apply binding if needed
      if (inventoryItem.item.bindOnEquip && !inventoryItem.bindStatus) {
        // Item becomes soulbound when equipped
        // This will be applied when item is moved to inventory again
      }

      // Clear caches
      await this.clearCharacterCaches(charId);

      // Return updated equipment and inventory
      const equipment = await this.getCharacterEquipment(charId);
      const updatedInventory = await this.getCharacterInventory(charId);

      return {
        success: true,
        message: `${inventoryItem.item.name} equipped to ${equipmentSlot}`,
        equipment,
        inventory: updatedInventory,
      };
    } catch (error) {
      logger.error('Error equipping item:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to equip item',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async unequipItem(charId: string, equipmentSlot: EquipmentSlotType): Promise<EquipmentOperationResult> {
    try {
      // Find empty inventory slot
      const emptySlot = await this.equipmentRepo.findEmptyInventorySlot(charId, MAX_INVENTORY_SLOTS);
      if (emptySlot === -1) {
        throw new BadRequestError('Inventory is full');
      }

      const itemId = await this.equipmentRepo.unequipItem(charId, equipmentSlot);
      if (!itemId) {
        throw new BadRequestError('No item equipped in that slot');
      }

      // Get item details
      const item = await this.equipmentRepo.getItemById(itemId);
      if (!item) {
        throw new NotFoundError('Item not found');
      }

      // Add to inventory (with binding if item binds on equip)
      const bindStatus: BindType | undefined = item.bindOnEquip ? 'soulbound' : undefined;
      await this.equipmentRepo.addToInventory(charId, itemId, 1, emptySlot, bindStatus);

      // Clear caches
      await this.clearCharacterCaches(charId);

      // Return updated equipment and inventory
      const equipment = await this.getCharacterEquipment(charId);
      const inventory = await this.getCharacterInventory(charId);

      return {
        success: true,
        message: `${item.name} unequipped from ${equipmentSlot}`,
        equipment,
        inventory,
      };
    } catch (error) {
      logger.error('Error unequipping item:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unequip item',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // =========================================================================
  // INVENTORY OPERATIONS
  // =========================================================================

  async getCharacterInventory(charId: string): Promise<InventoryData> {
    const cacheKey = `inventory:${charId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const inventory = await this.equipmentRepo.getCharacterInventory(charId);
      const itemIds = inventory.map(inv => inv.itemId);
      const itemsWithStats = await this.getItemsWithStats(itemIds);

      const inventoryData: InventoryData = {
        items: inventory.map(inv => ({
          ...inv,
          item: itemsWithStats.find(item => item.id === inv.itemId)!,
        })),
        maxSlots: MAX_INVENTORY_SLOTS,
        usedSlots: inventory.length,
        weight: await this.equipmentRepo.getInventoryWeight(charId),
        maxWeight: 1000, // TODO: Calculate based on character stats
      };

      await this.cache.set(cacheKey, inventoryData, 300);
      return inventoryData;
    } catch (error) {
      logger.error('Error fetching character inventory:', error);
      throw error;
    }
  }

  async moveInventoryItem(
    charId: string,
    fromSlot: number,
    toSlot: number
  ): Promise<InventoryOperationResult> {
    try {
      await this.equipmentRepo.moveInventoryItem(charId, fromSlot, toSlot);
      await this.clearCharacterCaches(charId);

      const inventory = await this.getCharacterInventory(charId);

      return {
        success: true,
        message: `Item moved from slot ${fromSlot} to ${toSlot}`,
        inventory,
      };
    } catch (error) {
      logger.error('Error moving inventory item:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to move item',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async dropItem(
    charId: string,
    slotPosition: number,
    quantity: number = 1
  ): Promise<InventoryOperationResult> {
    try {
      const inventory = await this.getCharacterInventory(charId);
      const item = inventory.items.find(inv => inv.slotPosition === slotPosition);
      
      if (!item) {
        throw new BadRequestError('Item not found in inventory');
      }

      if (item.bindStatus === 'soulbound') {
        throw new BadRequestError('Cannot drop soulbound items');
      }

      if (quantity > item.quantity) {
        throw new BadRequestError('Cannot drop more items than you have');
      }

      if (quantity === item.quantity) {
        // Remove entire stack
        await this.equipmentRepo.removeFromInventory(charId, slotPosition);
      } else {
        // Reduce quantity
        await this.equipmentRepo.updateInventorySlot(charId, slotPosition, {
          quantity: item.quantity - quantity,
        });
      }

      await this.clearCharacterCaches(charId);
      const updatedInventory = await this.getCharacterInventory(charId);

      return {
        success: true,
        message: `Dropped ${quantity}x ${item.item.name}`,
        inventory: updatedInventory,
      };
    } catch (error) {
      logger.error('Error dropping item:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to drop item',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // =========================================================================
  // STAT CALCULATIONS
  // =========================================================================

  private async calculateEquipmentStats(
    equipment: EquipmentItem[],
    itemsWithStats: ItemWithStats[]
  ): Promise<EquipmentStats> {
    const baseStats: Record<StatType, number> = {
      [STAT_TYPES.STRENGTH]: 0,
      [STAT_TYPES.DEXTERITY]: 0,
      [STAT_TYPES.INTELLIGENCE]: 0,
      [STAT_TYPES.WISDOM]: 0,
      [STAT_TYPES.CONSTITUTION]: 0,
      [STAT_TYPES.CHARISMA]: 0,
      [STAT_TYPES.HEALTH]: 0,
      [STAT_TYPES.MANA]: 0,
      [STAT_TYPES.STAMINA]: 0,
      [STAT_TYPES.DAMAGE]: 0,
      [STAT_TYPES.DEFENSE]: 0,
      [STAT_TYPES.CRITICAL_CHANCE]: 0,
      [STAT_TYPES.CRITICAL_DAMAGE]: 0,
      [STAT_TYPES.ATTACK_SPEED]: 0,
      [STAT_TYPES.MOVEMENT_SPEED]: 0,
    };

    // Calculate base stats from equipment
    for (const equipItem of equipment) {
      const item = itemsWithStats.find(i => i.id === equipItem.itemId);
      if (item) {
        for (const stat of item.stats) {
          const statType = stat.statType as StatType;
          if (baseStats.hasOwnProperty(statType)) {
            if (stat.isPercentage) {
              baseStats[statType] += stat.value / 100; // Convert percentage to decimal
            } else {
              baseStats[statType] += stat.value;
            }
          }
        }
      }
    }

    // Calculate set bonuses
    const setBonuses: Record<StatType, number> = { ...baseStats };
    const itemIds = equipment.map(eq => eq.itemId);
    const setInfo = await this.equipmentRepo.getItemSetInfo(itemIds);
    const activeSets = [];

    for (const [setId, info] of Object.entries(setInfo)) {
      if (info.equippedPieces > 0) {
        activeSets.push({
          setId: parseInt(setId),
          setName: info.setName,
          equippedPieces: info.equippedPieces,
          totalPieces: info.totalPieces,
          activeBonuses: info.bonuses.filter((bonus: { active: boolean; bonusStats: Record<string, number> }) => bonus.active),
        });

        // Apply active set bonuses
        for (const bonus of info.bonuses) {
          if (bonus.active) {
            for (const [statType, value] of Object.entries(bonus.bonusStats)) {
              if (setBonuses.hasOwnProperty(statType)) {
                setBonuses[statType as StatType] += value as number;
              }
            }
          }
        }
      }
    }

    // Calculate total stats (base + set bonuses)
    const totalStats: Record<StatType, number> = {};
    for (const statType of Object.keys(baseStats) as StatType[]) {
      totalStats[statType] = baseStats[statType] + (setBonuses[statType] - baseStats[statType]);
    }

    return {
      baseStats,
      setBonuses: this.calculateSetBonusesOnly(setBonuses, baseStats),
      totalStats,
      activeSets,
    };
  }

  private calculateSetBonusesOnly(
    setBonuses: Record<StatType, number>,
    baseStats: Record<StatType, number>
  ): Record<StatType, number> {
    const bonusOnly: Record<StatType, number> = {};
    for (const statType of Object.keys(baseStats) as StatType[]) {
      bonusOnly[statType] = setBonuses[statType] - baseStats[statType];
    }
    return bonusOnly;
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private async getItemsWithStats(itemIds: number[]): Promise<ItemWithStats[]> {
    if (itemIds.length === 0) return [];

    const items = await this.equipmentRepo.getItemsByIds(itemIds);
    const itemStats = await this.equipmentRepo.getItemStats(itemIds);
    const setInfo = await this.equipmentRepo.getItemSetInfo(itemIds);

    return items.map(item => {
      const stats = itemStats[item.id] || [];
      const itemSetData = Object.values(setInfo).find(set => 
        set.itemIds && set.itemIds.includes(item.id)
      );

      return {
        ...item,
        stats,
        setInfo: itemSetData ? {
          setId: itemSetData.setId,
          setName: itemSetData.setName,
          totalPieces: itemSetData.totalPieces,
        } : undefined,
      };
    });
  }

  private buildEquipmentSlots(
    equipment: EquipmentItem[],
    itemsWithStats: ItemWithStats[]
  ): Record<EquipmentSlotType, EquipmentItem | null> {
    const slots: Record<EquipmentSlotType, EquipmentItem | null> = {
      [EQUIPMENT_SLOTS.HEAD]: null,
      [EQUIPMENT_SLOTS.NECK]: null,
      [EQUIPMENT_SLOTS.CHEST]: null,
      [EQUIPMENT_SLOTS.HANDS]: null,
      [EQUIPMENT_SLOTS.LEGS]: null,
      [EQUIPMENT_SLOTS.FEET]: null,
      [EQUIPMENT_SLOTS.WEAPON]: null,
      [EQUIPMENT_SLOTS.OFFHAND]: null,
      [EQUIPMENT_SLOTS.RING1]: null,
      [EQUIPMENT_SLOTS.RING2]: null,
    };

    for (const equipItem of equipment) {
      const item = itemsWithStats.find(i => i.id === equipItem.itemId);
      if (item) {
        slots[equipItem.slotType] = {
          ...equipItem,
          item,
        };
      }
    }

    return slots;
  }

  private async clearCharacterCaches(charId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(`equipment:${charId}`),
      this.cache.delete(`inventory:${charId}`),
      this.cache.delete(`character:${charId}`), // Character stats may have changed
    ]);
  }

  // =========================================================================
  // VALIDATION METHODS
  // =========================================================================

  async canEquipItem(charId: string, itemId: number, slotType: EquipmentSlotType): Promise<{
    canEquip: boolean;
    reason?: string;
  }> {
    try {
      const character = await this.characterRepo.findById(charId);
      const item = await this.equipmentRepo.getItemById(itemId);

      if (!character) {
        return { canEquip: false, reason: 'Character not found' };
      }

      if (!item) {
        return { canEquip: false, reason: 'Item not found' };
      }

      if (item.equipmentSlot !== slotType) {
        return { canEquip: false, reason: `Item cannot be equipped in ${slotType} slot` };
      }

      if (character.level < item.levelRequirement) {
        return { canEquip: false, reason: `Requires level ${item.levelRequirement}` };
      }

      return { canEquip: true };
    } catch (error) {
      logger.error('Error validating item equip:', error);
      return { canEquip: false, reason: 'Validation error' };
    }
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  async getItemDetails(itemId: number): Promise<ItemWithStats | null> {
    try {
      const items = await this.getItemsWithStats([itemId]);
      return items[0] || null;
    } catch (error) {
      logger.error('Error fetching item details:', error);
      return null;
    }
  }

  async getInventoryValue(charId: string): Promise<number> {
    try {
      return await this.equipmentRepo.getInventoryValue(charId);
    } catch (error) {
      logger.error('Error calculating inventory value:', error);
      return 0;
    }
  }

  async getEquipmentValue(charId: string): Promise<number> {
    try {
      const equipment = await this.equipmentRepo.getCharacterEquipment(charId);
      const itemIds = equipment.map(eq => eq.itemId);
      const items = await this.equipmentRepo.getItemsByIds(itemIds);
      
      return items.reduce((total, item) => total + Number(item.sellPrice), 0);
    } catch (error) {
      logger.error('Error calculating equipment value:', error);
      return 0;
    }
  }
}