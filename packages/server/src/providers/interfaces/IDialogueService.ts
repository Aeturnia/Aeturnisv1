import { DialogueNode, DialogueChoice, DialogueAction, DialogueCondition } from '@aeturnis/shared';

/**
 * Active dialogue session
 */
export interface DialogueSession {
  id: string;
  npcId: string;
  characterId: string;
  currentNodeId: string;
  visitedNodes: string[];
  variables: Record<string, any>; // Session-specific variables
  startedAt: Date;
  lastInteraction: Date;
}

/**
 * Dialogue tree structure
 */
export interface DialogueTree {
  id: string;
  name: string;
  description?: string;
  rootNodeId: string;
  nodes: Map<string, DialogueNode>;
  variables?: Record<string, any>; // Default variables
}

/**
 * Context for evaluating conditions and actions
 */
export interface DialogueContext {
  character: any; // Character data
  npc: any; // NPC data
  session: DialogueSession;
  gameState: Record<string, any>; // Quest states, flags, etc.
}

/**
 * Result of advancing dialogue
 */
export interface DialogueAdvanceResult {
  node: DialogueNode;
  availableChoices: DialogueChoice[];
  actionsExecuted: ActionResult[];
  sessionEnded: boolean;
}

/**
 * Result of executing a dialogue action
 */
export interface ActionResult {
  action: DialogueAction;
  success: boolean;
  message?: string;
  changes?: Record<string, any>;
}

/**
 * Interface for Dialogue-related operations
 * Handles NPC conversations and dialogue trees
 */
export interface IDialogueService {
  /**
   * Start a dialogue session with an NPC
   * @param npcId - The NPC to talk to
   * @param characterId - The character initiating dialogue
   * @returns New dialogue session
   */
  startDialogue(npcId: string, characterId: string): Promise<DialogueSession>;

  /**
   * Advance dialogue by selecting a choice
   * @param sessionId - The active dialogue session
   * @param choiceId - The choice selected by the player
   * @returns The next dialogue node and results
   */
  advanceDialogue(sessionId: string, choiceId: string): Promise<DialogueAdvanceResult>;

  /**
   * Evaluate dialogue conditions
   * @param conditions - Array of conditions to evaluate
   * @param context - Context for evaluation
   * @returns Whether all conditions are met
   */
  evaluateConditions(conditions: DialogueCondition[], context: DialogueContext): Promise<boolean>;

  /**
   * Execute dialogue actions
   * @param actions - Array of actions to execute
   * @param context - Context for execution
   * @returns Results of each action
   */
  executeActions(actions: DialogueAction[], context: DialogueContext): Promise<ActionResult[]>;

  /**
   * Get a dialogue tree by ID
   * @param treeId - The dialogue tree ID
   * @returns The dialogue tree structure
   */
  getDialogueTree(treeId: string): Promise<DialogueTree>;

  /**
   * Get active dialogue session
   * @param characterId - The character to check
   * @returns Active session or null
   */
  getActiveSession(characterId: string): Promise<DialogueSession | null>;

  /**
   * End a dialogue session
   * @param sessionId - The session to end
   * @returns Whether the session was ended
   */
  endDialogue(sessionId: string): Promise<boolean>;

  /**
   * Create or update a dialogue tree
   * @param tree - The dialogue tree to save
   * @returns The saved tree ID
   */
  saveDialogueTree(tree: DialogueTree): Promise<string>;

  /**
   * Get dialogue history for a character
   * @param characterId - The character to check
   * @param npcId - Optional filter by NPC
   * @returns Array of past dialogue sessions
   */
  getDialogueHistory(characterId: string, npcId?: string): Promise<DialogueSession[]>;
}