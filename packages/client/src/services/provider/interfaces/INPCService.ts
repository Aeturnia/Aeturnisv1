import { IService } from './IService';
import { NPC, NPCInteraction, DialogueAdvanceRequest, TradeData, ZoneId } from '@aeturnis/shared';

export interface INPCService extends IService {
  getNPCsInZone(zoneIdOrName: ZoneId | string): Promise<NPC[]>;
  getNPC(npcId: string): Promise<NPC | null>;
  startInteraction(npcId: string, characterId: string): Promise<NPCInteraction>;
  advanceDialogue(npcId: string, characterId: string, choiceId?: string): Promise<DialogueAdvanceRequest>;
  endInteraction(npcId: string, characterId: string): Promise<void>;
  processTrade(npcId: string, characterId: string, tradeData: TradeData): Promise<boolean>;
  subscribeToNPCUpdates(npcId: string, handler: (update: any) => void): () => void;
  subscribeToInteraction(characterId: string, handler: (update: any) => void): () => void;
}