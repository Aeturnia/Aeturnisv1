import { NPC, NPCInteraction } from '@aeturnis/shared';

/**
 * Interface for NPC-related operations
 * This interface defines the contract that both mock and real implementations must follow
 */
export interface INPCService {
  /**
   * Get all NPCs in a specific zone
   * @param zoneIdOrName - Zone UUID or zone name
   * @returns Array of NPCs in the zone
   */
  getNPCsInZone(zoneIdOrName: string): Promise<NPC[]>;

  /**
   * Start an interaction with an NPC
   * @param npcId - The NPC UUID
   * @param characterId - The character UUID
   * @returns The interaction details
   */
  startInteraction(npcId: string, characterId: string): Promise<NPCInteraction>;

  /**
   * Advance dialogue with an NPC
   * @param npcId - The NPC UUID
   * @param characterId - The character UUID
   * @param choiceId - The dialogue choice ID
   * @returns The dialogue response
   */
  advanceDialogue(npcId: string, characterId: string, choiceId: string): Promise<any>;

  /**
   * End an interaction with an NPC
   * @param npcId - The NPC UUID
   * @param characterId - The character UUID
   */
  endInteraction(npcId: string, characterId: string): Promise<void>;

  /**
   * Get all quest-giving NPCs
   * @returns Array of NPCs that can give quests
   */
  getQuestGivers(): Promise<NPC[]>;

  /**
   * Get interaction history for a character
   * @param characterId - The character UUID
   * @returns Array of past interactions
   */
  getInteractionHistory(characterId: string): Promise<NPCInteraction[]>;

  /**
   * Check if a character can interact with an NPC
   * @param npcId - The NPC UUID
   * @param characterId - The character UUID
   * @returns Whether interaction is allowed
   */
  canInteract(npcId: string, characterId: string): Promise<boolean>;

  /**
   * Process a trade with an NPC
   * @param npcId - The NPC UUID
   * @param characterId - The character UUID
   * @param tradeData - Trade details
   */
  processTrade(npcId: string, characterId: string, tradeData: any): Promise<void>;

  /**
   * Get an NPC by ID
   * @param npcId - The NPC UUID
   * @returns The NPC or null if not found
   */
  getNPCById(npcId: string): Promise<NPC | null>;

  /**
   * Get all merchant NPCs
   * @returns Array of NPCs that are merchants
   */
  getMerchants(): Promise<NPC[]>;
}