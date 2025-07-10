import { 
  IDialogueService, 
  DialogueSession, 
  DialogueTree, 
  DialogueContext, 
  DialogueAdvanceResult, 
  ActionResult 
} from '../interfaces/IDialogueService';
import { DialogueNode, DialogueChoice, DialogueAction, DialogueCondition } from '@aeturnis/shared';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of DialogueService for testing
 * Uses in-memory dialogue trees and sessions
 */
export class MockDialogueService implements IDialogueService {
  /**
   * Get the service name (from IService)
   */
  getName(): string {
    return 'MockDialogueService';
  }
  // Active dialogue sessions
  private sessions: Map<string, DialogueSession> = new Map();
  
  // Character to session mapping
  private characterSessions: Map<string, string> = new Map();
  
  // Mock dialogue trees
  private dialogueTrees: Map<string, DialogueTree> = new Map();
  
  // Session history
  private sessionHistory: DialogueSession[] = [];

  constructor() {
    logger.info('MockDialogueService initialized');
    this.initializeMockDialogues();
  }

  private initializeMockDialogues(): void {
    // Tutorial NPC dialogue tree
    const tutorialTree = this.createTutorialDialogue();
    this.dialogueTrees.set('tutorial-dialogue', tutorialTree);
    
    // Merchant dialogue tree
    const merchantTree = this.createMerchantDialogue();
    this.dialogueTrees.set('merchant-dialogue', merchantTree);
    
    // Quest giver dialogue tree
    const questTree = this.createQuestDialogue();
    this.dialogueTrees.set('quest-dialogue', questTree);
  }

  async startDialogue(npcId: string, characterId: string): Promise<DialogueSession> {
    logger.info(`MockDialogueService: Starting dialogue between ${characterId} and ${npcId}`);
    
    // Check if character already in dialogue
    if (this.characterSessions.has(characterId)) {
      throw new Error('Character is already in a dialogue');
    }
    
    // Determine dialogue tree based on NPC
    let treeId = 'tutorial-dialogue'; // Default
    if (npcId === 'npc-002') {
      treeId = 'merchant-dialogue';
    } else if (npcId === 'npc-003') {
      treeId = 'quest-dialogue';
    }
    
    const tree = this.dialogueTrees.get(treeId);
    if (!tree) {
      throw new Error(`Dialogue tree ${treeId} not found`);
    }
    
    const session: DialogueSession = {
      id: `dialogue_${uuidv4()}`,
      npcId,
      characterId,
      currentNodeId: tree.rootNodeId,
      visitedNodes: [tree.rootNodeId],
      variables: { ...tree.variables },
      startedAt: new Date(),
      lastInteraction: new Date()
    };
    
    this.sessions.set(session.id, session);
    this.characterSessions.set(characterId, session.id);
    
    return session;
  }

  async advanceDialogue(sessionId: string, choiceId: string): Promise<DialogueAdvanceResult> {
    logger.info(`MockDialogueService: Advancing dialogue ${sessionId} with choice ${choiceId}`);
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Dialogue session not found');
    }
    
    // Get dialogue tree
    const treeId = session.npcId === 'npc-002' ? 'merchant-dialogue' : 
                   session.npcId === 'npc-003' ? 'quest-dialogue' : 'tutorial-dialogue';
    const tree = this.dialogueTrees.get(treeId);
    if (!tree) {
      throw new Error('Dialogue tree not found');
    }
    
    // Get current node
    const currentNode = tree.nodes.get(session.currentNodeId);
    if (!currentNode) {
      throw new Error('Current dialogue node not found');
    }
    
    // Find selected choice
    const selectedChoice = currentNode.choices?.find(c => c.id === choiceId);
    if (!selectedChoice) {
      throw new Error('Invalid choice selected');
    }
    
    // Create context for condition evaluation
    const context: DialogueContext = {
      character: { id: session.characterId, level: 10 }, // Mock character data
      npc: { id: session.npcId },
      session,
      gameState: { hasCompletedTutorial: true }
    };
    
    // Check choice conditions
    if (selectedChoice.conditions) {
      const canSelect = await this.evaluateConditions(selectedChoice.conditions, context);
      if (!canSelect) {
        throw new Error('Choice conditions not met');
      }
    }
    
    // Move to next node
    const nextNode = tree.nodes.get(selectedChoice.nextNodeId);
    if (!nextNode) {
      throw new Error('Next dialogue node not found');
    }
    
    session.currentNodeId = selectedChoice.nextNodeId;
    session.visitedNodes.push(selectedChoice.nextNodeId);
    session.lastInteraction = new Date();
    
    // Execute node actions
    const actionsExecuted: ActionResult[] = [];
    if (nextNode.actions) {
      actionsExecuted.push(...await this.executeActions(nextNode.actions, context));
    }
    
    // Filter available choices based on conditions
    const availableChoices: DialogueChoice[] = [];
    if (nextNode.choices) {
      for (const choice of nextNode.choices) {
        if (!choice.conditions || await this.evaluateConditions(choice.conditions, context)) {
          availableChoices.push(choice);
        }
      }
    }
    
    // Check if dialogue should end
    const sessionEnded = availableChoices.length === 0 || selectedChoice.nextNodeId === 'end';
    if (sessionEnded) {
      await this.endDialogue(sessionId);
    }
    
    return {
      node: nextNode,
      availableChoices,
      actionsExecuted,
      sessionEnded
    };
  }

  async evaluateConditions(conditions: DialogueCondition[], context: DialogueContext): Promise<boolean> {
    logger.info(`MockDialogueService: Evaluating ${conditions.length} conditions`);
    
    for (const condition of conditions) {
      let result = false;
      
      switch (condition.type) {
        case 'level':
          result = context.character.level >= (condition.parameters?.minLevel || 1);
          break;
        case 'quest':
          result = context.gameState[`quest_${condition.parameters?.questId}_completed`] === true;
          break;
        case 'item':
          result = true; // Mock: assume player has item
          break;
        case 'gold':
          result = true; // Mock: assume player has enough gold
          break;
        default:
          result = true; // Unknown conditions pass in mock
      }
      
      if (!result) {
        return false; // All conditions must be true
      }
    }
    
    return true;
  }

  async executeActions(actions: DialogueAction[], context: DialogueContext): Promise<ActionResult[]> {
    logger.info(`MockDialogueService: Executing ${actions.length} actions`);
    
    const results: ActionResult[] = [];
    
    for (const action of actions) {
      const result: ActionResult = {
        action,
        success: true
      };
      
      switch (action.type) {
        case 'give_item':
          result.message = `Received ${action.parameters?.itemName || 'item'}`;
          result.changes = { inventory: `+${action.parameters?.itemId}` };
          break;
        case 'give_gold':
          result.message = `Received ${action.parameters?.amount || 0} gold`;
          result.changes = { gold: `+${action.parameters?.amount}` };
          break;
        case 'start_quest':
          result.message = `Started quest: ${action.parameters?.questName}`;
          result.changes = { quest: action.parameters?.questId };
          context.gameState[`quest_${action.parameters?.questId}_started`] = true;
          break;
        case 'complete_quest':
          result.message = `Completed quest: ${action.parameters?.questName}`;
          context.gameState[`quest_${action.parameters?.questId}_completed`] = true;
          break;
        case 'set_flag':
          const flagName = String(action.parameters?.flag || 'flag');
          context.session.variables[flagName] = action.parameters?.value || true;
          result.message = `Flag set: ${flagName}`;
          break;
        default:
          result.message = `Unknown action: ${action.type}`;
      }
      
      results.push(result);
    }
    
    return results;
  }

  async getDialogueTree(treeId: string): Promise<DialogueTree> {
    logger.info(`MockDialogueService: Getting dialogue tree ${treeId}`);
    
    const tree = this.dialogueTrees.get(treeId);
    if (!tree) {
      throw new Error(`Dialogue tree ${treeId} not found`);
    }
    
    return tree;
  }

  async getActiveSession(characterId: string): Promise<DialogueSession | null> {
    logger.info(`MockDialogueService: Getting active session for ${characterId}`);
    
    const sessionId = this.characterSessions.get(characterId);
    if (!sessionId) {
      return null;
    }
    
    return this.sessions.get(sessionId) || null;
  }

  async endDialogue(sessionId: string): Promise<boolean> {
    logger.info(`MockDialogueService: Ending dialogue ${sessionId}`);
    
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    
    // Add to history
    this.sessionHistory.push({ ...session });
    
    // Clean up
    this.sessions.delete(sessionId);
    this.characterSessions.delete(session.characterId);
    
    return true;
  }

  async saveDialogueTree(tree: DialogueTree): Promise<string> {
    logger.info(`MockDialogueService: Saving dialogue tree ${tree.name}`);
    
    this.dialogueTrees.set(tree.id, tree);
    return tree.id;
  }

  async getDialogueHistory(characterId: string, npcId?: string): Promise<DialogueSession[]> {
    logger.info(`MockDialogueService: Getting dialogue history for ${characterId}`);
    
    let history = this.sessionHistory.filter(s => s.characterId === characterId);
    
    if (npcId) {
      history = history.filter(s => s.npcId === npcId);
    }
    
    return history.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // Helper methods to create mock dialogue trees
  private createTutorialDialogue(): DialogueTree {
    const nodes = new Map<string, DialogueNode>();
    
    nodes.set('greeting', {
      id: 'greeting',
      text: 'Welcome to Aeturnis Online! I can help you get started on your adventure.',
      choices: [
        { id: 'learn', text: 'I want to learn the basics', nextNodeId: 'basics' },
        { id: 'quest', text: 'Do you have any quests?', nextNodeId: 'quest_offer' },
        { id: 'bye', text: 'Goodbye', nextNodeId: 'farewell' }
      ]
    });
    
    nodes.set('basics', {
      id: 'basics',
      text: 'Great! You can move with WASD, interact with E, and open your inventory with I. Combat is turn-based.',
      choices: [
        { id: 'more', text: 'Tell me more', nextNodeId: 'advanced' },
        { id: 'back', text: 'Back to main menu', nextNodeId: 'greeting' }
      ]
    });
    
    nodes.set('quest_offer', {
      id: 'quest_offer',
      text: 'Yes! I have a simple task for you. Could you deliver this letter to the merchant?',
      choices: [
        { id: 'accept', text: 'I\'ll do it', nextNodeId: 'quest_accepted' },
        { id: 'decline', text: 'Not right now', nextNodeId: 'greeting' }
      ],
      actions: [
        { type: 'start_quest', parameters: { questId: 'tutorial_delivery', questName: 'Letter Delivery' } }
      ]
    });
    
    nodes.set('quest_accepted', {
      id: 'quest_accepted',
      text: 'Wonderful! Here\'s the letter. The merchant is just down the road to the east.',
      actions: [
        { type: 'give_item', parameters: { itemId: 'quest_letter', itemName: 'Sealed Letter' } }
      ],
      choices: [
        { id: 'thanks', text: 'Thank you!', nextNodeId: 'farewell' }
      ]
    });
    
    nodes.set('farewell', {
      id: 'farewell',
      text: 'Good luck on your journey, adventurer!',
      choices: []
    });
    
    nodes.set('advanced', {
      id: 'advanced',
      text: 'You can also trade with merchants, join guilds, and explore dungeons. The world is vast!',
      choices: [
        { id: 'back', text: 'Thanks for the info', nextNodeId: 'greeting' }
      ]
    });
    
    return {
      id: 'tutorial-dialogue',
      name: 'Tutorial NPC Dialogue',
      rootNodeId: 'greeting',
      nodes,
      variables: {}
    };
  }

  private createMerchantDialogue(): DialogueTree {
    const nodes = new Map<string, DialogueNode>();
    
    nodes.set('greeting', {
      id: 'greeting',
      text: 'Welcome to my shop! I have the finest wares in the land. What can I help you with?',
      choices: [
        { id: 'browse', text: 'Show me your wares', nextNodeId: 'shop' },
        { id: 'sell', text: 'I have items to sell', nextNodeId: 'sell' },
        { id: 'bye', text: 'Just looking, thanks', nextNodeId: 'farewell' }
      ]
    });
    
    nodes.set('shop', {
      id: 'shop',
      text: 'I have weapons, armor, and potions. Everything a brave adventurer needs!',
      choices: [
        { id: 'weapons', text: 'Show me weapons', nextNodeId: 'weapons' },
        { id: 'potions', text: 'I need potions', nextNodeId: 'potions' },
        { id: 'back', text: 'Back', nextNodeId: 'greeting' }
      ]
    });
    
    nodes.set('sell', {
      id: 'sell',
      text: 'Let me see what you have... I can offer fair prices for quality items.',
      choices: [
        { id: 'back', text: 'Maybe later', nextNodeId: 'greeting' }
      ]
    });
    
    nodes.set('farewell', {
      id: 'farewell',
      text: 'Come back anytime! May your travels be profitable!',
      choices: []
    });
    
    return {
      id: 'merchant-dialogue',
      name: 'Merchant Dialogue',
      rootNodeId: 'greeting',
      nodes,
      variables: {}
    };
  }

  private createQuestDialogue(): DialogueTree {
    const nodes = new Map<string, DialogueNode>();
    
    nodes.set('greeting', {
      id: 'greeting',
      text: 'Halt, traveler! These are dangerous times. Bandits roam the roads.',
      choices: [
        { id: 'help', text: 'Can I help?', nextNodeId: 'quest_offer' },
        { id: 'info', text: 'Tell me more', nextNodeId: 'info' },
        { id: 'bye', text: 'I\'ll be careful', nextNodeId: 'farewell' }
      ]
    });
    
    nodes.set('quest_offer', {
      id: 'quest_offer',
      text: 'Actually, yes! We\'ve been tracking a bandit camp to the north. Clear it out and I\'ll reward you handsomely.',
      choices: [
        { 
          id: 'accept', 
          text: 'I\'ll take care of it', 
          nextNodeId: 'quest_accepted',
          conditions: [{ type: 'level', parameters: { minLevel: 5 } }]
        },
        { id: 'decline', text: 'Too dangerous for me', nextNodeId: 'greeting' }
      ]
    });
    
    nodes.set('quest_accepted', {
      id: 'quest_accepted',
      text: 'Excellent! The camp is north of here, past the old bridge. Be careful - they have a leader who\'s quite skilled.',
      actions: [
        { type: 'start_quest', parameters: { questId: 'bandit_camp', questName: 'Clear the Bandit Camp' } }
      ],
      choices: [
        { id: 'go', text: 'I\'m on it!', nextNodeId: 'farewell' }
      ]
    });
    
    nodes.set('info', {
      id: 'info',
      text: 'The bandits have been attacking merchant caravans. We\'ve lost three shipments this month alone.',
      choices: [
        { id: 'help', text: 'Let me help', nextNodeId: 'quest_offer' },
        { id: 'back', text: 'I see', nextNodeId: 'greeting' }
      ]
    });
    
    nodes.set('farewell', {
      id: 'farewell',
      text: 'Safe travels, and watch your back out there.',
      choices: []
    });
    
    return {
      id: 'quest-dialogue',
      name: 'Quest Giver Dialogue',
      rootNodeId: 'greeting',
      nodes,
      variables: {}
    };
  }
}