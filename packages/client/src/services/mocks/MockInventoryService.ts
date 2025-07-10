import { MockService } from './base/MockService';
import { IInventoryService } from '../provider/interfaces/IInventoryService';
import { StateManager } from '../state/StateManager';
import { ServiceLayerConfig } from '../index';

const mockInventory = [
  {
    id: '1',
    name: 'Healing Potion',
    icon: '🧪',
    quantity: 5,
    slot: 0,
    rarity: 'common',
    type: 'consumable',
    description: 'Restores 100 HP when consumed',
    value: 50
  },
  {
    id: '2',
    name: 'Mana Crystal',
    icon: '💎',
    quantity: 3,
    slot: 1,
    rarity: 'uncommon',
    type: 'consumable',
    description: 'Restores 50 MP when consumed',
    value: 75
  },
  {
    id: '3',
    name: 'Ancient Tome',
    icon: '📜',
    quantity: 1,
    slot: 2,
    rarity: 'epic',
    type: 'quest',
    description: 'A mysterious tome with arcane knowledge',
    value: 500
  },
  {
    id: '4',
    name: 'Dragon Scale',
    icon: '🐉',
    quantity: 2,
    slot: 3,
    rarity: 'legendary',
    type: 'material',
    description: 'A scale from an ancient dragon',
    value: 1000
  },
  {
    id: '5',
    name: 'Mystic Herb',
    icon: '🌿',
    quantity: 10,
    slot: 4,
    rarity: 'common',
    type: 'material',
    description: 'Used in various alchemical recipes',
    value: 25
  }
];

export class MockInventoryService extends MockService implements IInventoryService {
  private stateManager: StateManager;
  private inventory: any[];
  private maxSlots: number = 50;

  constructor(
    dependencies: {
      stateManager: StateManager;
    },
    config?: ServiceLayerConfig['mockConfig']
  ) {
    super(config);
    this.stateManager = dependencies.stateManager;
    this.inventory = [...mockInventory];
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize inventory state slice
    this.stateManager.createSlice('inventory', {
      items: this.inventory,
      maxSlots: this.maxSlots,
      usedSlots: this.inventory.length,
      isLoading: false,
      error: null
    });
  }

  async getInventory(): Promise<any[]> {
    this.stateManager.updateSlice('inventory', { isLoading: true });

    try {
      const items = await this.getMockData(this.inventory);
      
      this.stateManager.updateSlice('inventory', { 
        items,
        usedSlots: items.length,
        isLoading: false,
        error: null 
      });

      return items;
    } catch (error) {
      this.stateManager.updateSlice('inventory', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getItem(itemId: string): Promise<any> {
    const item = this.inventory.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    return this.getMockData(item);
  }

  async useItem(itemId: string): Promise<any> {
    this.stateManager.updateSlice('inventory', { isLoading: true });

    try {
      const itemIndex = this.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      const item = this.inventory[itemIndex];
      
      // Check if item is consumable
      if (item.type !== 'consumable') {
        throw new Error('Item cannot be used');
      }

      // Reduce quantity or remove item
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        this.inventory.splice(itemIndex, 1);
      }

      const result = await this.getMockData({
        success: true,
        itemUsed: item.name,
        effect: item.description,
        remainingQuantity: item.quantity > 1 ? item.quantity - 1 : 0
      });

      this.stateManager.updateSlice('inventory', { 
        items: this.inventory,
        usedSlots: this.inventory.length,
        isLoading: false 
      });

      this.emit('inventory:updated', this.inventory);
      this.emit('item:used', result);
      
      return result;
    } catch (error) {
      this.stateManager.updateSlice('inventory', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async dropItem(itemId: string, quantity: number = 1): Promise<any> {
    this.stateManager.updateSlice('inventory', { isLoading: true });

    try {
      const itemIndex = this.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      const item = this.inventory[itemIndex];
      
      if (item.quantity > quantity) {
        item.quantity -= quantity;
      } else {
        this.inventory.splice(itemIndex, 1);
      }

      const result = await this.getMockData({
        success: true,
        itemDropped: item.name,
        quantityDropped: Math.min(quantity, item.quantity)
      });

      this.stateManager.updateSlice('inventory', { 
        items: this.inventory,
        usedSlots: this.inventory.length,
        isLoading: false 
      });

      this.emit('inventory:updated', this.inventory);
      return result;
    } catch (error) {
      this.stateManager.updateSlice('inventory', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async moveItem(itemId: string, toSlot: number): Promise<any> {
    this.stateManager.updateSlice('inventory', { isLoading: true });

    try {
      if (toSlot < 0 || toSlot >= this.maxSlots) {
        throw new Error('Invalid slot number');
      }

      const itemIndex = this.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      const item = this.inventory[itemIndex];
      const targetItem = this.inventory.find(i => i.slot === toSlot);

      // Swap slots if target slot is occupied
      if (targetItem) {
        targetItem.slot = item.slot;
      }

      item.slot = toSlot;

      const result = await this.getMockData({
        success: true,
        itemMoved: item.name,
        fromSlot: itemIndex,
        toSlot
      });

      this.stateManager.updateSlice('inventory', { 
        items: this.inventory,
        isLoading: false 
      });

      this.emit('inventory:updated', this.inventory);
      return result;
    } catch (error) {
      this.stateManager.updateSlice('inventory', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  onInventoryUpdate(callback: (inventory: any[]) => void): () => void {
    const handleUpdate = (data: any) => callback(data);
    this.on('inventory:updated', handleUpdate);
    return () => this.off('inventory:updated', handleUpdate);
  }

  destroy(): void {
    super.destroy();
  }
}