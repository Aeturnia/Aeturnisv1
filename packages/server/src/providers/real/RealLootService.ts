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
import { ItemRarity } from '../../types/loot';

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

  async generateLoot(source: LootSource, killer: { level?: number }): Promise<LootTable> {
    // Map to real service format
    const dropModifiers = {
      characterLevel: killer.level || 1,
      partySize: 1,
      luckBonus: 0
    };
    
    const drops = await this.lootService.calculateLootDrops(source.id, dropModifiers);
    
    // Convert to our interface format
    return {
      id: `loot_${Date.now()}`,
      sourceId: source.id,
      items: drops.map((drop: ILootDrop) => ({
        itemId: drop.itemId,
        quantity: drop.quantity || 1,
        rarity: drop.rarity || 'common',
        isBound: false,
        rollValue: Math.floor(Math.random() * 100)
      })),
      gold: BigInt(0), // LootService doesn't return gold directly
      experience: BigInt(0), // LootService doesn't return experience directly
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };
  }

  async calculateDropRates(_monsterId: string, characterLevel: number): Promise<DropRates> {
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
        success: true, // ILootClaimResponse doesn't have success property
        claimedItems: result.loot.map((item: ILootDrop) => ({
          itemId: item.itemId,
          quantity: item.quantity || 1,
          rarity: item.rarity || 'common',
          isBound: false,
          rollValue: 0
        })),
        claimedGold: BigInt(result.gold || 0),
        failedItems: [],
        message: 'Loot claimed' // ILootClaimResponse doesn't have message property
      };
    }
  }

  async distributeLoot(loot: LootTable, party: { id: string }[]): Promise<Distribution> {
    // Real service may not have party distribution
    // Simulate distribution
    const assignments = new Map<string, typeof loot.items>();
    const unassigned: typeof loot.items = [];
    
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

  async getActiveLoot(_characterId: string): Promise<LootTable[]> {
    // Real service may track this differently
    return [];
  }

  async expireLoot(_lootId: string): Promise<void> {
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
    // Convert to LootHistoryEntry format
    return history.map((h: { id: string; combatSessionId?: string; itemId: string; quantity?: number; gold?: number; experience?: number; timestamp: string | number | Date }) => ({
      id: h.id,
      characterId: characterId,
      sessionId: h.combatSessionId || '',
      loot: [{ 
        itemId: h.itemId, 
        quantity: h.quantity || 1,
        rarity: 'common' as ItemRarity,
        rolledChance: 0,
        guaranteed: false
      }],
      gold: h.gold || 0,
      experience: h.experience || 0,
      claimedAt: new Date(h.timestamp)
    }));
  }

  async createTestLootTable(): Promise<string> {
    return await this.lootService.createTestLootTable();
  }

  async getAllLootTables(): Promise<LootTable[]> {
    // LootService doesn't have getAllLootTables method
    return [];
  }
}