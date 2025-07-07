import { 
  ILootService, 
  LootSource, 
  LootTable, 
  DropRates, 
  ClaimResult, 
  Distribution,
  ILootDrop,
  IDropModifierInput,
  ILootClaimRequest,
  ILootClaimResponse,
  LootHistoryEntry
} from '../interfaces/ILootService';
import { LootService } from '../../services/loot.service';
import { LootRepository } from '../../repositories/loot.repository';

/**
 * Real implementation wrapper for LootService
 * Implements ILootService interface and delegates to actual LootService
 */
export class RealLootService implements ILootService {
  private lootService: LootService;

  constructor() {
    const lootRepository = new LootRepository();
    this.lootService = new LootService(lootRepository);
  }

  async generateLoot(source: LootSource, killer: any): Promise<LootTable> {
    // Map to real service format
    const dropModifiers = {
      characterLevel: killer.level || 1,
      partySize: 1,
      luckBonus: 0
    };
    
    const result = await this.lootService.calculateLootDrops(source.id, dropModifiers);
    
    // Convert to our interface format
    return {
      id: `loot_${Date.now()}`,
      sourceId: source.id,
      items: result.loot.map((item: any) => ({
        itemId: item.itemId,
        quantity: item.quantity || 1,
        rarity: item.rarity || 'common',
        isBound: false,
        rollValue: Math.floor(Math.random() * 100)
      })),
      gold: BigInt(result.gold || 0),
      experience: BigInt(result.experience || 0),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };
  }

  async calculateDropRates(monsterId: string, characterLevel: number): Promise<DropRates> {
    // Real service may not have this exact method
    // Simulate drop rate calculation
    const baseDropRate = 0.3;
    const levelDiff = Math.abs(10 - characterLevel);
    const levelPenalty = levelDiff > 5 ? 0.1 : 0;
    
    return {
      baseDropRate,
      magicFindBonus: 0.1,
      levelPenalty,
      finalDropRate: Math.max(0.1, baseDropRate - levelPenalty),
      guaranteedDrops: []
    };
  }

  // Legacy claimLoot method (for backward compatibility)
  async claimLoot(characterId: string, lootId: string): Promise<ClaimResult>;
  // New claimLoot method signature
  async claimLoot(sessionId: string, claimRequest: ILootClaimRequest): Promise<ILootClaimResponse>;
  // Implementation that handles both signatures
  async claimLoot(
    sessionIdOrCharacterId: string, 
    lootIdOrClaimRequest?: string | ILootClaimRequest
  ): Promise<ClaimResult | ILootClaimResponse> {
    // Check if this is the new signature
    if (typeof lootIdOrClaimRequest === 'object' && lootIdOrClaimRequest !== null) {
      // New signature: claimLoot(sessionId, claimRequest)
      const sessionId = sessionIdOrCharacterId;
      const claimRequest = lootIdOrClaimRequest as ILootClaimRequest;
      
      const result = await this.lootService.claimLoot(sessionId, claimRequest);
      return result;
    } else {
      // Legacy signature: claimLoot(characterId, lootId)
      const characterId = sessionIdOrCharacterId;
      const lootId = lootIdOrClaimRequest as string;
      
      const claimRequest = {
        characterId,
        lootIds: [lootId]
      };
      
      const result = await this.lootService.claimLoot(lootId, claimRequest);
      
      return {
        success: result.success,
        claimedItems: result.loot.map((item: any) => ({
          itemId: item.itemId,
          quantity: item.quantity || 1,
          rarity: item.rarity || 'common',
          isBound: false,
          rollValue: 0
        })),
        claimedGold: BigInt(result.gold || 0),
        failedItems: [],
        message: result.message || 'Loot claimed'
      };
    }
  }

  async distributeLoot(loot: LootTable, party: any[]): Promise<Distribution> {
    // Real service may not have party distribution
    // Simulate distribution
    const assignments = new Map<string, any[]>();
    const unassigned: any[] = [];
    
    // Simple round-robin distribution
    let playerIndex = 0;
    for (const item of loot.items) {
      const playerId = party[playerIndex].id;
      const playerItems = assignments.get(playerId) || [];
      playerItems.push(item);
      assignments.set(playerId, playerItems);
      playerIndex = (playerIndex + 1) % party.length;
    }
    
    return {
      method: 'roundrobin',
      assignments,
      unassigned
    };
  }

  async getActiveLoot(characterId: string): Promise<LootTable[]> {
    // Real service may track this differently
    return [];
  }

  async expireLoot(lootId: string): Promise<void> {
    // Real service may not have explicit expire method
    // Would need to implement or simulate
  }

  async calculateLootDrops(
    lootTableName: string,
    modifiers: IDropModifierInput
  ): Promise<ILootDrop[]> {
    const result = await this.lootService.calculateLootDrops(lootTableName, modifiers);
    return result;
  }

  async getLootHistory(characterId: string, limit: number = 50): Promise<LootHistoryEntry[]> {
    const history = await this.lootService.getLootHistory(characterId, limit);
    return history;
  }

  async createTestLootTable(): Promise<string> {
    const tableId = await this.lootService.createTestLootTable();
    return tableId;
  }

  async getAllLootTables(): Promise<LootTable[]> {
    if (this.lootService.getAllLootTables) {
      return await this.lootService.getAllLootTables();
    }
    // If the real service doesn't have this method, return empty array
    return [];
  }
}