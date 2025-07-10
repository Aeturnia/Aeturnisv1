import { IService } from './IService';

export interface IInventoryService extends IService {
  /**
   * Get inventory items
   */
  getInventory(): Promise<any[]>;

  /**
   * Get specific item
   */
  getItem(itemId: string): Promise<any>;

  /**
   * Use an item
   */
  useItem(itemId: string): Promise<any>;

  /**
   * Drop an item
   */
  dropItem(itemId: string, quantity?: number): Promise<any>;

  /**
   * Move item in inventory
   */
  moveItem(itemId: string, toSlot: number): Promise<any>;

  /**
   * Subscribe to inventory updates
   */
  onInventoryUpdate(callback: (inventory: any[]) => void): () => void;
}