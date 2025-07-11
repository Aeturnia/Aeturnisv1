/**
 * Inventory service implementation for managing character inventory and equipment
 */

import { 
  InventoryItem, 
  EquippedItem, 
  Equipment, 
  EquipmentStats,
  InventoryResponse,
  EquipmentResponse,
  EquipmentSlot
} from '../../types/inventory.types';
import { BaseService } from '../base/BaseService';
import { BaseHttpService } from '../base/BaseHttpService';
import { BaseRealtimeService } from '../base/BaseRealtimeService';
import { IInventoryService } from '../provider/interfaces/IInventoryService';
import { ServiceError } from '../base/ServiceError';
import { ServiceDependencies } from '../../providers/ServiceProvider';

// HTTP service for inventory API calls  
class InventoryHttpService extends BaseHttpService {
  constructor(dependencies: ServiceDependencies) {
    super({
      serviceName: 'InventoryHttpService',
      apiClient: dependencies.apiClient,
      cacheService: dependencies.cacheService,
      offlineQueue: dependencies.offlineQueue
    });
  }
  async getInventory(characterId: string): Promise<InventoryResponse> {
    const response = await this.http.get<{ data: InventoryResponse }>(
      `/api/v1/equipment/${characterId}/inventory`
    );
    return response.data.data;
  }

  async getEquipment(characterId: string): Promise<EquipmentResponse> {
    const response = await this.http.get<{ data: EquipmentResponse }>(
      `/api/v1/equipment/${characterId}`
    );
    return response.data.data;
  }

  async equipItem(characterId: string, inventorySlot: number, equipmentSlot: EquipmentSlot): Promise<EquipmentResponse> {
    const response = await this.http.post<{ data: EquipmentResponse }>(
      `/api/v1/equipment/${characterId}/equip`,
      { inventorySlot, equipmentSlot }
    );
    return response.data.data;
  }

  async unequipItem(characterId: string, equipmentSlot: EquipmentSlot): Promise<InventoryItem> {
    const response = await this.http.post<{ data: InventoryItem }>(
      `/api/v1/equipment/${characterId}/unequip`,
      { equipmentSlot }
    );
    return response.data.data;
  }

  async dropItem(characterId: string, itemId: string, quantity?: number): Promise<void> {
    await this.http.delete(`/api/v1/equipment/${characterId}/items/${itemId}`, {
      params: quantity ? { quantity } : undefined
    });
  }

  async moveItem(characterId: string, itemId: string, toSlot: number): Promise<InventoryItem> {
    const response = await this.http.patch<{ data: InventoryItem }>(
      `/api/v1/equipment/${characterId}/items/${itemId}/move`,
      { toSlot }
    );
    return response.data.data;
  }

  async splitStack(characterId: string, itemId: string, quantity: number): Promise<InventoryItem> {
    const response = await this.http.post<{ data: InventoryItem }>(
      `/api/v1/equipment/${characterId}/items/${itemId}/split`,
      { quantity }
    );
    return response.data.data;
  }
}

// Realtime service for inventory WebSocket events
class InventoryRealtimeService extends BaseRealtimeService {
  constructor(dependencies: ServiceDependencies) {
    super({
      serviceName: 'InventoryRealtimeService',
      wsManager: dependencies.wsManager
    });

    // Listen for inventory events
    this.on('inventory:update', this.handleInventoryUpdate.bind(this));
    this.on('equipment:update', this.handleEquipmentUpdate.bind(this));
    this.on('item:added', this.handleItemAdded.bind(this));
    this.on('item:removed', this.handleItemRemoved.bind(this));
  }

  private handleInventoryUpdate(data: { characterId: string; inventory: InventoryResponse }) {
    this.emit(`character:${data.characterId}:inventory`, data.inventory);
  }

  private handleEquipmentUpdate(data: { characterId: string; equipment: EquipmentResponse }) {
    this.emit(`character:${data.characterId}:equipment`, data.equipment);
  }

  private handleItemAdded(data: { characterId: string; item: InventoryItem }) {
    this.emit(`character:${data.characterId}:item:added`, data.item);
  }

  private handleItemRemoved(data: { characterId: string; itemId: string }) {
    this.emit(`character:${data.characterId}:item:removed`, data.itemId);
  }

  subscribeToCharacterInventory(characterId: string) {
    this.socket.emit('inventory:subscribe', { characterId });
  }

  unsubscribeFromCharacterInventory(characterId: string) {
    this.socket.emit('inventory:unsubscribe', { characterId });
  }
}

// Main inventory service
export class InventoryService extends BaseService implements IInventoryService {
  private http: InventoryHttpService;
  private realtime: InventoryRealtimeService;
  private subscribedCharacters: Set<string> = new Set();

  constructor(dependencies: ServiceDependencies) {
    super(dependencies);
    this.http = new InventoryHttpService(dependencies);
    this.realtime = new InventoryRealtimeService(dependencies);
  }

  async initialize(): Promise<void> {
    await super.initialize();

    // Initialize state keys
    this.stateManager.initialize('inventory:data', new Map());
    this.stateManager.initialize('equipment:data', new Map());
    this.stateManager.initialize('equipment:stats', new Map());
  }

  async getInventory(characterId: string): Promise<InventoryResponse> {
    try {
      const inventory = await this.http.getInventory(characterId);
      
      // Update cache
      const inventoryData = this.stateManager.getState<Map<string, InventoryResponse>>('inventory:data') || new Map();
      inventoryData.set(characterId, inventory);
      await this.stateManager.update('inventory:data', inventoryData);
      
      return inventory;
    } catch (error) {
      throw new ServiceError('Failed to fetch inventory', 'INVENTORY_FETCH_ERROR', error);
    }
  }

  async getInventoryItem(characterId: string, itemId: string): Promise<InventoryItem | null> {
    const inventoryData = this.stateManager.getState<Map<string, InventoryResponse>>('inventory:data');
    const inventory = inventoryData?.get(characterId);
    
    if (!inventory) {
      // Try to fetch from server
      const freshInventory = await this.getInventory(characterId);
      return freshInventory.items.find(item => item.id === itemId) || null;
    }
    
    return inventory.items.find(item => item.id === itemId) || null;
  }

  async getEquipment(characterId: string): Promise<EquipmentResponse> {
    try {
      const equipment = await this.http.getEquipment(characterId);
      
      // Update cache
      const equipmentData = this.stateManager.getState<Map<string, EquipmentResponse>>('equipment:data') || new Map();
      equipmentData.set(characterId, equipment);
      await this.stateManager.update('equipment:data', equipmentData);
      
      // Update stats cache
      const statsData = this.stateManager.getState<Map<string, EquipmentStats>>('equipment:stats') || new Map();
      statsData.set(characterId, equipment.stats);
      await this.stateManager.update('equipment:stats', statsData);
      
      return equipment;
    } catch (error) {
      throw new ServiceError('Failed to fetch equipment', 'EQUIPMENT_FETCH_ERROR', error);
    }
  }

  async equipItem(characterId: string, inventorySlot: number, equipmentSlot: EquipmentSlot): Promise<EquipmentResponse> {
    try {
      const equipment = await this.http.equipItem(characterId, inventorySlot, equipmentSlot);
      
      // Update caches
      const equipmentData = this.stateManager.getState<Map<string, EquipmentResponse>>('equipment:data') || new Map();
      equipmentData.set(characterId, equipment);
      await this.stateManager.update('equipment:data', equipmentData);
      
      // Refresh inventory as item was moved
      await this.getInventory(characterId);
      
      return equipment;
    } catch (error) {
      throw new ServiceError('Failed to equip item', 'EQUIP_ERROR', error);
    }
  }

  async unequipItem(characterId: string, equipmentSlot: EquipmentSlot): Promise<InventoryItem> {
    try {
      const inventoryItem = await this.http.unequipItem(characterId, equipmentSlot);
      
      // Refresh both equipment and inventory
      await Promise.all([
        this.getEquipment(characterId),
        this.getInventory(characterId)
      ]);
      
      return inventoryItem;
    } catch (error) {
      throw new ServiceError('Failed to unequip item', 'UNEQUIP_ERROR', error);
    }
  }

  async dropItem(characterId: string, itemId: string, quantity?: number): Promise<void> {
    try {
      await this.http.dropItem(characterId, itemId, quantity);
      
      // Refresh inventory
      await this.getInventory(characterId);
    } catch (error) {
      throw new ServiceError('Failed to drop item', 'DROP_ERROR', error);
    }
  }

  async moveItem(characterId: string, itemId: string, toSlot: number): Promise<InventoryItem> {
    try {
      const item = await this.http.moveItem(characterId, itemId, toSlot);
      
      // Refresh inventory
      await this.getInventory(characterId);
      
      return item;
    } catch (error) {
      throw new ServiceError('Failed to move item', 'MOVE_ERROR', error);
    }
  }

  async splitStack(characterId: string, itemId: string, quantity: number): Promise<InventoryItem> {
    try {
      const newItem = await this.http.splitStack(characterId, itemId, quantity);
      
      // Refresh inventory
      await this.getInventory(characterId);
      
      return newItem;
    } catch (error) {
      throw new ServiceError('Failed to split stack', 'SPLIT_ERROR', error);
    }
  }

  async getEquipmentStats(characterId: string): Promise<EquipmentStats> {
    const statsData = this.stateManager.getState<Map<string, EquipmentStats>>('equipment:stats');
    if (statsData?.has(characterId)) {
      return statsData.get(characterId)!;
    }
    
    // Fetch equipment to get stats
    const equipment = await this.getEquipment(characterId);
    return equipment.stats;
  }

  subscribeToInventoryUpdates(characterId: string, handler: (inventory: InventoryResponse) => void): () => void {
    const eventName = `character:${characterId}:inventory`;
    
    // Subscribe to realtime updates if not already subscribed
    if (!this.subscribedCharacters.has(characterId)) {
      this.realtime.subscribeToCharacterInventory(characterId);
      this.subscribedCharacters.add(characterId);
    }
    
    this.realtime.on(eventName, handler);
    
    // Also listen for item events
    const addHandler = () => this.getInventory(characterId).then(handler);
    const removeHandler = () => this.getInventory(characterId).then(handler);
    
    this.realtime.on(`character:${characterId}:item:added`, addHandler);
    this.realtime.on(`character:${characterId}:item:removed`, removeHandler);
    
    return () => {
      this.realtime.off(eventName, handler);
      this.realtime.off(`character:${characterId}:item:added`, addHandler);
      this.realtime.off(`character:${characterId}:item:removed`, removeHandler);
      
      // Check if we should unsubscribe from realtime
      if (!this.realtime.listeners(eventName).length) {
        this.realtime.unsubscribeFromCharacterInventory(characterId);
        this.subscribedCharacters.delete(characterId);
      }
    };
  }

  subscribeToEquipmentUpdates(characterId: string, handler: (equipment: EquipmentResponse) => void): () => void {
    const eventName = `character:${characterId}:equipment`;
    
    // Subscribe to realtime updates if not already subscribed
    if (!this.subscribedCharacters.has(characterId)) {
      this.realtime.subscribeToCharacterInventory(characterId);
      this.subscribedCharacters.add(characterId);
    }
    
    this.realtime.on(eventName, handler);
    
    return () => {
      this.realtime.off(eventName, handler);
    };
  }

  async destroy(): Promise<void> {
    // Unsubscribe from all characters
    for (const characterId of this.subscribedCharacters) {
      this.realtime.unsubscribeFromCharacterInventory(characterId);
    }
    
    this.subscribedCharacters.clear();
    
    await super.destroy();
  }
}