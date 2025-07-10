/**
 * Inventory service interface for managing character inventory and equipment
 */

import { IService } from './IService';
import { 
  InventoryItem, 
  EquippedItem, 
  Equipment, 
  EquipmentStats,
  InventoryResponse,
  EquipmentResponse,
  EquipmentSlot
} from '../../../types/inventory.types';

export interface IInventoryService extends IService {
  // Inventory management
  getInventory(characterId: string): Promise<InventoryResponse>;
  getInventoryItem(characterId: string, itemId: string): Promise<InventoryItem | null>;
  
  // Equipment management
  getEquipment(characterId: string): Promise<EquipmentResponse>;
  equipItem(characterId: string, inventorySlot: number, equipmentSlot: EquipmentSlot): Promise<EquipmentResponse>;
  unequipItem(characterId: string, equipmentSlot: EquipmentSlot): Promise<InventoryItem>;
  
  // Item operations
  dropItem(characterId: string, itemId: string, quantity?: number): Promise<void>;
  moveItem(characterId: string, itemId: string, toSlot: number): Promise<InventoryItem>;
  splitStack(characterId: string, itemId: string, quantity: number): Promise<InventoryItem>;
  
  // Equipment stats
  getEquipmentStats(characterId: string): Promise<EquipmentStats>;
  
  // Real-time subscriptions
  subscribeToInventoryUpdates(characterId: string, handler: (inventory: InventoryResponse) => void): () => void;
  subscribeToEquipmentUpdates(characterId: string, handler: (equipment: EquipmentResponse) => void): () => void;
}