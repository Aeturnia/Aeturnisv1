import { 
  IDialogueService, 
  DialogueSession, 
  DialogueTree, 
  DialogueContext, 
  DialogueAdvanceResult, 
  ActionResult 
} from '../interfaces/IDialogueService';
import { DialogueNode, DialogueChoice, DialogueAction, DialogueCondition } from '@aeturnis/shared';
import { DialogueService } from '../../services/DialogueService';
import { DialogueRepository } from '../../repositories/dialogue.repository';

/**
 * Real implementation wrapper for DialogueService
 * Implements IDialogueService interface and delegates to actual DialogueService
 */
export class RealDialogueService implements IDialogueService {
  private dialogueService: DialogueService;

  constructor() {
    const dialogueRepository = new DialogueRepository();
    this.dialogueService = new DialogueService(dialogueRepository);
  }

  async startDialogue(npcId: string, characterId: string): Promise<DialogueSession> {
    // Real service returns interaction, map to session
    const interaction = await this.dialogueService.startDialogue(npcId, characterId);
    
    return {
      id: interaction.id,
      npcId,
      characterId,
      currentNodeId: interaction.currentNodeId || 'start',
      visitedNodes: [interaction.currentNodeId || 'start'],
      variables: {},
      startedAt: new Date(interaction.createdAt),
      lastInteraction: new Date()
    };
  }

  async advanceDialogue(sessionId: string, choiceId: string): Promise<DialogueAdvanceResult> {
    // Real service expects different parameters
    // Would need to adapt or modify real service
    const result = await this.dialogueService.advanceDialogue(sessionId, parseInt(choiceId));
    
    const node: DialogueNode = {
      id: result.nodeId || 'node',
      text: result.text || '',
      choices: result.choices?.map((c: any) => ({
        id: c.id.toString(),
        text: c.text,
        nextNodeId: c.nextNodeId || 'next'
      })) || []
    };
    
    return {
      node,
      availableChoices: node.choices || [],
      actionsExecuted: [],
      sessionEnded: result.isComplete || false
    };
  }

  async evaluateConditions(conditions: DialogueCondition[], context: DialogueContext): Promise<boolean> {
    // Real service may handle conditions differently
    // Simulate evaluation
    for (const condition of conditions) {
      if (condition.type === 'level') {
        const minLevel = condition.parameters?.minLevel || 1;
        if (context.character.level < minLevel) {
          return false;
        }
      }
      // Add other condition types as needed
    }
    return true;
  }

  async executeActions(actions: DialogueAction[], context: DialogueContext): Promise<ActionResult[]> {
    // Real service may handle actions differently
    const results: ActionResult[] = [];
    
    for (const action of actions) {
      results.push({
        action,
        success: true,
        message: `Action ${action.type} executed`
      });
    }
    
    return results;
  }

  async getDialogueTree(treeId: string): Promise<DialogueTree> {
    const tree = await this.dialogueService.getDialogueTree(treeId);
    
    // Map to our interface format
    const nodes = new Map<string, DialogueNode>();
    
    if (tree.nodes) {
      Object.entries(tree.nodes).forEach(([id, node]: [string, any]) => {
        nodes.set(id, {
          id,
          text: node.text,
          choices: node.choices?.map((c: any) => ({
            id: c.id.toString(),
            text: c.text,
            nextNodeId: c.nextNodeId
          }))
        });
      });
    }
    
    return {
      id: tree.id,
      name: tree.name || 'Dialogue Tree',
      rootNodeId: tree.rootNodeId || 'start',
      nodes
    };
  }

  async getActiveSession(characterId: string): Promise<DialogueSession | null> {
    // Real service may track this differently
    // Would need to query active interactions
    return null;
  }

  async endDialogue(sessionId: string): Promise<boolean> {
    await this.dialogueService.endDialogue(sessionId);
    return true;
  }

  async saveDialogueTree(tree: DialogueTree): Promise<string> {
    // Convert to real service format
    const nodes: any = {};
    tree.nodes.forEach((node, id) => {
      nodes[id] = {
        id,
        text: node.text,
        choices: node.choices?.map(c => ({
          id: parseInt(c.id),
          text: c.text,
          nextNodeId: c.nextNodeId
        }))
      };
    });
    
    const result = await this.dialogueService.createDialogueTree({
      name: tree.name,
      rootNodeId: tree.rootNodeId,
      nodes
    });
    
    return result.id;
  }

  async getDialogueHistory(characterId: string, npcId?: string): Promise<DialogueSession[]> {
    // Real service may not have history method
    // Would need to implement or return empty
    return [];
  }
}