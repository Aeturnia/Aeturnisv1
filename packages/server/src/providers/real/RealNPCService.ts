import { INPCService } from '../interfaces/INPCService';
import { NPC, NPCInteraction } from '@aeturnis/shared';
import { NPCService } from '../../services/NPCService';
import { CacheService } from '../../services/CacheService';

/**
 * Real implementation wrapper for NPCService
 * Implements INPCService interface and delegates to actual NPCService
 */
export class RealNPCService implements INPCService {
  private npcService: NPCService;

  constructor(cacheService?: CacheService) {
    this.npcService = new NPCService();
  }

  async getNPCsInZone(zoneIdOrName: string): Promise<NPC[]> {
    return await this.npcService.getNPCsInZone(zoneIdOrName);
  }

  async startInteraction(npcId: string, characterId: string): Promise<NPCInteraction> {
    return await this.npcService.startInteraction(npcId, characterId);
  }

  async advanceDialogue(npcId: string, characterId: string, choiceId: string): Promise<any> {
    return await this.npcService.advanceDialogue(npcId, characterId, choiceId);
  }

  async endInteraction(npcId: string, characterId: string): Promise<void> {
    return await this.npcService.endInteraction(npcId, characterId);
  }

  async getQuestGivers(): Promise<NPC[]> {
    return await this.npcService.getQuestGivers();
  }

  async getInteractionHistory(characterId: string): Promise<NPCInteraction[]> {
    return await this.npcService.getInteractionHistory(characterId);
  }

  async canInteract(npcId: string, characterId: string): Promise<boolean> {
    return await this.npcService.canInteract(npcId, characterId);
  }

  async processTrade(npcId: string, characterId: string, tradeData: any): Promise<void> {
    return await this.npcService.processTrade(npcId, characterId, tradeData);
  }

  async getNPCById(npcId: string): Promise<NPC | null> {
    return await this.npcService.getNPCById(npcId);
  }

  async getMerchants(): Promise<NPC[]> {
    return await this.npcService.getMerchants();
  }
}