import { IService } from './IService';
import { LootDrop, LootModifiers, ClaimLootRequest, LootHistory } from '@aeturnis/shared';

export interface ILootService extends IService {
  calculateLootDrops(lootTableName: string, modifiers: LootModifiers): Promise<LootDrop[]>;
  claimLoot(sessionId: string, claimRequest: ClaimLootRequest): Promise<boolean>;
  getLootSession(sessionId: string): Promise<any>;
  getLootHistory(characterId: string, limit?: number): Promise<LootHistory[]>;
  subscribeToLootDrops(characterId: string, handler: (loot: LootDrop[]) => void): () => void;
  subscribeToLootSession(sessionId: string, handler: (update: any) => void): () => void;
}