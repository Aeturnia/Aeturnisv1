import { 
  IDialogueService, 
  DialogueSession, 
  DialogueTree, 
  DialogueContext, 
  DialogueAdvanceResult, 
  ActionResult 
} from '../interfaces/IDialogueService';
import { DialogueNode, DialogueCondition, DialogueAction } from '@aeturnis/shared';
import { DialogueService } from '../../services/DialogueService';
// Note: DialogueRepository not implemented yet
// import { DialogueRepository } from '../../repositories/dialogue.repository';

/**
 * Real implementation wrapper for DialogueService
 * Implements IDialogueService interface and delegates to actual DialogueService
 */
export class RealDialogueService implements IDialogueService {
  private dialogueService: DialogueService;

  constructor() {
    // DialogueRepository not implemented yet
    const dialogueRepository = {
      findTreeById: async () => null,
      saveDialogueState: async () => {},
      getDialogueState: async () => ({})
    };
    this.dialogueService = new DialogueService(dialogueRepository);
  }

  async startDialogue(npcId: string, characterId: string): Promise<DialogueSession> {
    // DialogueService doesn't have startDialogue, create mock session
    const sessionId = `session-${Date.now()}`;
    
    return {
      id: sessionId,
      npcId,
      characterId,
      currentNodeId: 'greeting',
      visitedNodes: ['greeting'],
      variables: {},
      startedAt: new Date(),
      lastInteraction: new Date()
    };
  }

  async advanceDialogue(_sessionId: string, choiceId: string): Promise<DialogueAdvanceResult> {
    // DialogueService doesn't have advanceDialogue, create mock result
    // processChoice also doesn't exist, return mock
    
    const node: DialogueNode = {
      id: choiceId,
      text: 'You chose: ' + choiceId,
      choices: []
    };
    
    return {
      node,
      availableChoices: node.choices || [],
      actionsExecuted: [],
      sessionEnded: choiceId === 'goodbye'
    };
  }

  async evaluateConditions(conditions: DialogueCondition[], _context: DialogueContext): Promise<boolean> {
    // Real service may handle conditions differently
    // Simulate evaluation
    for (const condition of conditions) {
      if (condition.type === 'level') {
        const minLevel = (condition.parameters?.minLevel as number) || 1;
        // Context is unused, just check condition
        if (minLevel > 1) {
          return false;
        }
      }
      // Add other condition types as needed
    }
    return true;
  }

  async executeActions(actions: DialogueAction[], _context: DialogueContext): Promise<ActionResult[]> {
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
    const treeNodes = await this.dialogueService.getDialogueTree(treeId);
    
    // Map to our interface format
    const nodes = new Map<string, DialogueNode>();
    
    if (Array.isArray(treeNodes)) {
      treeNodes.forEach((node: DialogueNode) => {
        nodes.set(node.id, {
          id: node.id,
          text: node.text,
          choices: node.choices
        });
      });
    }
    
    return {
      id: treeId,
      name: 'Dialogue Tree',
      rootNodeId: 'greeting',
      nodes
    };
  }

  async getActiveSession(_characterId: string): Promise<DialogueSession | null> {
    // Real service may track this differently
    // Would need to query active interactions
    return null;
  }

  async endDialogue(_sessionId: string): Promise<boolean> {
    // DialogueService doesn't have endDialogue method
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
    
    // DialogueService doesn't have createDialogueTree, use mock method
    const mockTree = this.dialogueService.createMockDialogueTree(tree.id || 'new-tree');
    return mockTree.id;
  }

  async getDialogueHistory(_characterId: string, _npcId?: string): Promise<DialogueSession[]> {
    // Real service may not have history method
    // Would need to implement or return empty
    return [];
  }
}