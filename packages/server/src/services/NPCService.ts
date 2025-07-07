import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { npcs, npcInteractions, zones } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export class NPCService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  /**
   * Get all NPCs in a specific zone
   */
  async getNPCsInZone(zoneIdOrName: string): Promise<Array<{ id: string; name: string; type: string; position: { x: number; y: number } }>> {
    try {
      logger.info(`Fetching NPCs for zone: ${zoneIdOrName}`);
      
      const cacheKey = `npcs:zone:${zoneIdOrName}`;
      const cached = await this.cache.get<Array<{ id: string; name: string; type: string; position: { x: number; y: number } }>>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for NPCs in zone: ${zoneIdOrName}`);
        return cached;
      }

      // First, resolve zone name to UUID if needed
      let zoneId = zoneIdOrName;
      if (!zoneIdOrName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's a zone name, look up the UUID
        const zoneResult = await db
          .select({ id: zones.id })
          .from(zones)
          .where(eq(zones.name, zoneIdOrName))
          .limit(1);
        
        if (!zoneResult.length) {
          logger.error(`Zone not found: ${zoneIdOrName}`);
          return [];
        }
        zoneId = zoneResult[0].id;
      }

      const result = await db
        .select()
        .from(npcs)
        .where(eq(npcs.zoneId, zoneId));

      await this.cache.set(cacheKey, result, 60); // Cache for 1 minute
      logger.info(`Found ${result.length} NPCs in zone: ${zoneId}`);
      return result;
    } catch (error) {
      logger.error(`Error fetching NPCs for zone ${zoneIdOrName}:`, error);
      throw error;
    }
  }

  /**
   * Start interaction with an NPC
   */
  async startInteraction(npcId: string, characterId: string): Promise<any> {
    try {
      logger.info(`Starting interaction between character ${characterId} and NPC ${npcId}`);
      
      // Get NPC details
      const npc = await db
        .select()
        .from(npcs)
        .where(eq(npcs.id, npcId))
        .limit(1);

      if (!npc.length) {
        throw new Error(`NPC not found: ${npcId}`);
      }

      // Create interaction record
      const interaction = {
        npcId,
        characterId,
        interactionType: 'talk',
        dialogueState: {
          startTime: new Date().toISOString(),
          currentNode: 'greeting'
        }
      };

      const result = await db
        .insert(npcInteractions)
        .values(interaction)
        .returning();

      // Get initial dialogue from NPC's metadata
      const metadata = npc[0].metadata as any;
      const dialogueTree = metadata?.dialogueTree;
      const initialDialogue = dialogueTree?.root || {
        nodeId: 'greeting',
        text: `Hello! I'm ${npc[0].displayName}. How can I help you?`,
        choices: [
          {
            id: 'services',
            text: 'What services do you offer?',
            nextNodeId: 'services'
          },
          {
            id: 'goodbye',
            text: 'Farewell',
            nextNodeId: 'end'
          }
        ]
      };

      logger.info(`Interaction started successfully: ${result[0].id}`);
      return {
        interaction: result[0],
        dialogue: initialDialogue
      };
    } catch (error) {
      logger.error(`Error starting interaction between character ${characterId} and NPC ${npcId}:`, error);
      throw error;
    }
  }

  /**
   * Advance dialogue with an NPC
   */
  async advanceDialogue(npcId: string, characterId: string, choiceId: string): Promise<any> {
    try {
      logger.info(`Advancing dialogue for character ${characterId} and NPC ${npcId} with choice: ${choiceId}`);
      
      // Get NPC details
      const npc = await db
        .select()
        .from(npcs)
        .where(eq(npcs.id, npcId))
        .limit(1);

      if (!npc.length) {
        throw new Error(`NPC not found: ${npcId}`);
      }

      // Get dialogue tree and find next node
      const metadata = npc[0].metadata as any;
      const dialogueTree = metadata?.dialogueTree;
      let nextDialogue;

      // Simple dialogue logic based on choice
      switch (choiceId) {
        case 'services':
          const services = (npc[0].metadata as any)?.services || ['general'];
          nextDialogue = {
            nodeId: 'services',
            text: `I offer the following services: ${services.join(', ')}. What interests you?`,
            choices: [
              {
                id: 'trade',
                text: 'I would like to trade',
                nextNodeId: 'trade'
              },
              {
                id: 'back',
                text: 'Go back',
                nextNodeId: 'greeting'
              }
            ]
          };
          break;
        case 'trade':
          nextDialogue = {
            nodeId: 'trade',
            text: 'Welcome to my shop! Browse my wares.',
            choices: [],
            actions: [
              {
                type: 'open_trade',
                parameters: { npcId }
              }
            ]
          };
          break;
        case 'goodbye':
          nextDialogue = {
            nodeId: 'end',
            text: 'Safe travels, adventurer!',
            choices: [],
            actions: [
              {
                type: 'end_interaction',
                parameters: {}
              }
            ]
          };
          break;
        default:
          // Try to find in dialogue tree
          nextDialogue = dialogueTree?.[choiceId] || {
            nodeId: 'default',
            text: 'I\'m not sure what you mean.',
            choices: [
              {
                id: 'goodbye',
                text: 'Farewell',
                nextNodeId: 'end'
              }
            ]
          };
      }

      // Update dialogue state
      const updateData = {
        dialogueState: {
          lastChoice: choiceId,
          currentNode: nextDialogue.nodeId,
          timestamp: new Date().toISOString()
        }
      };

      await db
        .update(npcInteractions)
        .set(updateData)
        .where(and(
          eq(npcInteractions.npcId, npcId),
          eq(npcInteractions.characterId, characterId)
        ));

      logger.info(`Dialogue advanced successfully for character ${characterId} and NPC ${npcId}`);
      return {
        dialogue: nextDialogue
      };
    } catch (error) {
      logger.error(`Error advancing dialogue for character ${characterId} and NPC ${npcId}:`, error);
      throw error;
    }
  }

  /**
   * End interaction with an NPC
   */
  async endInteraction(npcId: string, characterId: string): Promise<void> {
    try {
      logger.info(`Ending interaction between character ${characterId} and NPC ${npcId}`);
      
      const updateData = {
        dialogueState: {
          endTime: new Date().toISOString(),
          status: 'completed'
        }
      };

      await db
        .update(npcInteractions)
        .set(updateData)
        .where(and(
          eq(npcInteractions.npcId, npcId),
          eq(npcInteractions.characterId, characterId)
        ));

      logger.info(`Interaction ended successfully between character ${characterId} and NPC ${npcId}`);
    } catch (error) {
      logger.error(`Error ending interaction between character ${characterId} and NPC ${npcId}:`, error);
      throw error;
    }
  }

  /**
   * Get all quest-giving NPCs
   */
  async getQuestGivers(): Promise<Array<{ id: string; name: string; questIds: string[]; location: { zone: string; position: { x: number; y: number } } }>> {
    try {
      logger.info('Fetching quest-giving NPCs');
      
      const cacheKey = 'npcs:quest-givers';
      const cached = await this.cache.get<Array<{ id: string; name: string; questIds: string[]; location: { zone: string; position: { x: number; y: number } } }>>(cacheKey);
      if (cached) {
        logger.info('Cache hit for quest-giving NPCs');
        return cached;
      }

      const result = await db
        .select()
        .from(npcs)
        .where(eq(npcs.type, 'quest_giver'));

      await this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
      logger.info(`Found ${result.length} quest-giving NPCs`);
      return result;
    } catch (error) {
      logger.error('Error fetching quest-giving NPCs:', error);
      throw error;
    }
  }

  /**
   * Get interaction history for a character
   */
  async getInteractionHistory(characterId: string): Promise<Array<{ id: string; npcId: string; timestamp: Date; interactionType: string; data: Record<string, unknown> }>> {
    try {
      logger.info(`Fetching interaction history for character: ${characterId}`);
      
      const result = await db
        .select()
        .from(npcInteractions)
        .where(eq(npcInteractions.characterId, characterId));

      logger.info(`Found ${result.length} interactions for character: ${characterId}`);
      return result;
    } catch (error) {
      logger.error(`Error fetching interaction history for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Check if character can interact with NPC
   */
  async canInteract(npcId: string, characterId: string): Promise<boolean> {
    try {
      // Get NPC details
      const npc = await db
        .select()
        .from(npcs)
        .where(eq(npcs.id, npcId))
        .limit(1);

      if (!npc.length) {
        return false;
      }

      // Check for any blocking conditions in metadata
      const metadata = npc[0].metadata as any;
      if (metadata?.disabled || metadata?.maintenance) {
        return false;
      }

      // Additional validation could be added here
      // - Check character level requirements
      // - Check quest prerequisites
      // - Check faction standings

      return true;
    } catch (error) {
      logger.error(`Error checking interaction eligibility for character ${characterId} and NPC ${npcId}:`, error);
      return false;
    }
  }

  /**
   * Process trade interaction with merchant NPC
   */
  async processTrade(npcId: string, characterId: string, tradeData: { itemId: string; quantity: number; type: 'buy' | 'sell' }): Promise<void> {
    try {
      logger.info(`Processing trade between character ${characterId} and NPC ${npcId}`);
      
      // Get NPC details
      const npc = await db
        .select()
        .from(npcs)
        .where(eq(npcs.id, npcId))
        .limit(1);

      if (!npc.length) {
        throw new Error(`NPC not found: ${npcId}`);
      }

      // Verify NPC is a merchant
      const metadata = npc[0].metadata as any;
      const services = metadata?.services || [];
      if (!services.includes('shop') && !services.includes('trade')) {
        throw new Error(`NPC ${npcId} is not a merchant`);
      }

      // Create trade interaction record
      const interaction = {
        npcId,
        characterId,
        interactionType: 'trade',
        dialogueState: {
          tradeData,
          timestamp: new Date().toISOString()
        }
      };

      await db
        .insert(npcInteractions)
        .values(interaction);

      // TODO: Implement actual trade processing
      // - Validate character has required currency/items
      // - Update character inventory
      // - Record transaction

      logger.info(`Trade processed successfully between character ${characterId} and NPC ${npcId}`);
    } catch (error) {
      logger.error(`Error processing trade between character ${characterId} and NPC ${npcId}:`, error);
      throw error;
    }
  }

  /**
   * Get NPC by ID
   */
  async getNPCById(npcId: string): Promise<any> {
    try {
      const result = await db
        .select()
        .from(npcs)
        .where(eq(npcs.id, npcId))
        .limit(1);

      return result.length ? result[0] : null;
    } catch (error) {
      logger.error(`Error fetching NPC ${npcId}:`, error);
      throw error;
    }
  }

  /**
   * Get all merchant NPCs
   */
  async getMerchants(): Promise<Array<{ id: string; name: string; shopType: string; inventory: unknown[]; location: { zone: string; position: { x: number; y: number } } }>> {
    try {
      logger.info('Fetching merchant NPCs');
      
      const cacheKey = 'npcs:merchants';
      const cached = await this.cache.get<Array<{ id: string; name: string; shopType: string; inventory: unknown[]; location: { zone: string; position: { x: number; y: number } } }>>(cacheKey);
      if (cached) {
        logger.info('Cache hit for merchant NPCs');
        return cached;
      }

      const result = await db
        .select()
        .from(npcs)
        .where(eq(npcs.type, 'merchant'));

      await this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
      logger.info(`Found ${result.length} merchant NPCs`);
      return result;
    } catch (error) {
      logger.error('Error fetching merchant NPCs:', error);
      throw error;
    }
  }
}