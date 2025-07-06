import { INPCService } from '../interfaces/INPCService';
import { NPC, NPCInteraction, NPCType } from '@aeturnis/shared';
import { logger } from '../../utils/logger';

/**
 * Mock implementation of NPCService for testing
 * Uses in-memory data storage
 */
export class MockNPCService implements INPCService {
  // Mock NPCs data - copied from routes
  private mockNPCs: any[] = [
    {
      id: 'npc-001',
      name: 'tutorial_guide',
      displayName: 'Tutorial Guide',
      type: NPCType.QUEST_GIVER,
      zoneId: 'test-zone',
      position: { x: 95, y: 0, z: 105 },
      dialogueTreeId: 'tutorial-dialogue',
      isQuestGiver: true,
      metadata: {
        level: 1,
        dialogue: 'Welcome to Aeturnis Online! I can help you get started.',
        isInteractable: true,
        shopkeeper: false
      }
    },
    {
      id: 'npc-002', 
      name: 'village_merchant',
      displayName: 'Village Merchant',
      type: NPCType.MERCHANT,
      zoneId: 'test-zone',
      position: { x: 120, y: 0, z: 85 },
      dialogueTreeId: 'merchant-dialogue',
      isQuestGiver: false,
      metadata: {
        level: 5,
        dialogue: 'Looking to buy some gear? I have the finest equipment!',
        isInteractable: true,
        shopkeeper: true
      }
    },
    {
      id: 'npc-003',
      name: 'guard_captain',
      displayName: 'Guard Captain',
      type: NPCType.GUARD,
      zoneId: 'test-zone',
      position: { x: 100, y: 0, z: 50 },
      dialogueTreeId: 'guard-dialogue',
      isQuestGiver: true,
      metadata: {
        level: 10,
        dialogue: 'Halt! State your business in this town.',
        isInteractable: true,
        shopkeeper: false
      }
    }
  ];

  // Mock interactions storage
  private mockInteractions: NPCInteraction[] = [];

  constructor() {
    logger.info('MockNPCService initialized');
  }

  async getNPCsInZone(zoneIdOrName: string): Promise<NPC[]> {
    logger.info(`MockNPCService: Getting NPCs for zone ${zoneIdOrName}`);
    
    // Filter NPCs by zone - handle common zone name mappings
    const npcs = this.mockNPCs.filter(npc => 
      npc.zoneId === zoneIdOrName || 
      zoneIdOrName === 'test-zone' ||
      (zoneIdOrName === 'tutorial_area' && npc.zoneId === 'test-zone')
    );
    
    logger.info(`MockNPCService: Found ${npcs.length} NPCs after filtering`);
    
    // Convert to proper NPC format
    return npcs.map(npc => ({
      id: npc.id,
      name: npc.name,
      displayName: npc.displayName,
      type: npc.type,
      zoneId: npc.zoneId,
      position: npc.position,
      dialogueTreeId: npc.dialogueTreeId,
      isQuestGiver: npc.isQuestGiver,
      metadata: npc.metadata
    }));
  }

  async startInteraction(npcId: string, characterId: string): Promise<NPCInteraction> {
    logger.info(`MockNPCService: Starting interaction between ${characterId} and ${npcId}`);
    
    const npc = this.mockNPCs.find(n => n.id === npcId);
    if (!npc) {
      throw new Error(`NPC ${npcId} not found`);
    }

    const interaction: NPCInteraction = {
      id: `interaction-${Date.now()}`,
      npcId: npcId,
      characterId: characterId,
      interactionType: 'dialogue',
      dialogueState: {
        currentNodeId: 'greeting',
        completedNodes: [],
        choices: []
      },
      createdAt: new Date()
    };

    // Store interaction
    this.mockInteractions.push(interaction);

    return interaction;
  }

  async advanceDialogue(npcId: string, characterId: string, choiceId: string): Promise<any> {
    logger.info(`MockNPCService: Advancing dialogue for ${characterId} with ${npcId}, choice: ${choiceId}`);
    
    const npc = this.mockNPCs.find(n => n.id === npcId);
    if (!npc) {
      throw new Error(`NPC ${npcId} not found`);
    }

    // Find existing interaction
    const interaction = this.mockInteractions.find(i => 
      i.npcId === npcId && i.characterId === characterId
    );

    if (!interaction) {
      throw new Error('No active interaction found');
    }

    // Mock dialogue response
    const dialogueResponses: { [key: string]: any } = {
      quest: {
        text: 'Quests are tasks you can complete for rewards. Check your quest log!',
        choices: [
          { id: 'more', text: 'Tell me more' },
          { id: 'thanks', text: 'Thanks!' }
        ]
      },
      shop: {
        text: 'Here are my wares. Everything is 20% off today!',
        choices: [
          { id: 'buy', text: 'Buy something' },
          { id: 'leave', text: 'Maybe later' }
        ]
      },
      goodbye: {
        text: 'Farewell, adventurer! Come back anytime.',
        choices: [],
        isComplete: true
      }
    };

    const response = dialogueResponses[choiceId] || {
      text: 'I see. Is there anything else?',
      choices: [{ id: 'goodbye', text: 'Goodbye' }]
    };

    return {
      id: interaction.id,
      npcId: npcId,
      characterId: characterId,
      node: choiceId,
      ...response
    };
  }

  async endInteraction(npcId: string, characterId: string): Promise<void> {
    logger.info(`MockNPCService: Ending interaction between ${characterId} and ${npcId}`);
    
    const index = this.mockInteractions.findIndex(i => 
      i.npcId === npcId && i.characterId === characterId
    );

    if (index !== -1) {
      this.mockInteractions.splice(index, 1);
    }
  }

  async getQuestGivers(): Promise<NPC[]> {
    logger.info('MockNPCService: Getting quest givers');
    
    const questGivers = this.mockNPCs.filter(npc => npc.isQuestGiver);
    
    return questGivers.map(npc => ({
      id: npc.id,
      name: npc.name,
      displayName: npc.displayName,
      type: npc.type,
      zoneId: npc.zoneId,
      position: npc.position,
      dialogueTreeId: npc.dialogueTreeId,
      isQuestGiver: npc.isQuestGiver,
      metadata: npc.metadata
    }));
  }

  async getInteractionHistory(characterId: string): Promise<NPCInteraction[]> {
    logger.info(`MockNPCService: Getting interaction history for ${characterId}`);
    
    return this.mockInteractions.filter(i => i.characterId === characterId);
  }

  async canInteract(npcId: string, characterId: string): Promise<boolean> {
    logger.info(`MockNPCService: Checking if ${characterId} can interact with ${npcId}`);
    
    const npc = this.mockNPCs.find(n => n.id === npcId);
    if (!npc) {
      return false;
    }

    // Check if already interacting
    const existingInteraction = this.mockInteractions.find(i => 
      i.npcId === npcId && i.characterId === characterId
    );

    // Can interact if NPC is interactable and no existing interaction
    return npc.metadata.isInteractable && !existingInteraction;
  }

  async processTrade(npcId: string, characterId: string, tradeData: any): Promise<void> {
    logger.info(`MockNPCService: Processing trade between ${characterId} and ${npcId}`);
    
    const npc = this.mockNPCs.find(n => n.id === npcId);
    if (!npc) {
      throw new Error(`NPC ${npcId} not found`);
    }

    if (!npc.metadata.shopkeeper) {
      throw new Error(`NPC ${npcId} is not a merchant`);
    }

    // Mock trade processing
    logger.info(`Trade data: ${JSON.stringify(tradeData)}`);
    // In a real implementation, this would handle inventory, currency, etc.
  }

  async getNPCById(npcId: string): Promise<NPC | null> {
    logger.info(`MockNPCService: Getting NPC by ID ${npcId}`);
    
    const npc = this.mockNPCs.find(n => n.id === npcId);
    if (!npc) {
      return null;
    }

    return {
      id: npc.id,
      name: npc.name,
      displayName: npc.displayName,
      type: npc.type,
      zoneId: npc.zoneId,
      position: npc.position,
      dialogueTreeId: npc.dialogueTreeId,
      isQuestGiver: npc.isQuestGiver,
      metadata: npc.metadata
    };
  }

  async getMerchants(): Promise<NPC[]> {
    logger.info('MockNPCService: Getting merchants');
    
    const merchants = this.mockNPCs.filter(npc => 
      npc.type === NPCType.MERCHANT || npc.metadata.shopkeeper
    );
    
    return merchants.map(npc => ({
      id: npc.id,
      name: npc.name,
      displayName: npc.displayName,
      type: npc.type,
      zoneId: npc.zoneId,
      position: npc.position,
      dialogueTreeId: npc.dialogueTreeId,
      isQuestGiver: npc.isQuestGiver,
      metadata: npc.metadata
    }));
  }
}