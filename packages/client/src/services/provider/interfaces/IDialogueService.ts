import { IService } from './IService';
import { 
  DialogueNode, 
  DialogueSession, 
  DialogueCondition, 
  DialogueAction,
  DialogueContext 
} from '@aeturnis/shared';

export interface IDialogueService extends IService {
  startDialogue(npcId: string, characterId: string): Promise<DialogueSession>;
  advanceDialogue(sessionId: string, choiceId: string): Promise<DialogueNode>;
  endDialogue(sessionId: string): Promise<void>;
  evaluateConditions(conditions: DialogueCondition[], context: DialogueContext): Promise<boolean>;
  executeActions(actions: DialogueAction[], context: DialogueContext): Promise<void>;
  getActiveDialogue(characterId: string): Promise<DialogueSession | null>;
  subscribeToDialogue(sessionId: string, handler: (update: any) => void): () => void;
}