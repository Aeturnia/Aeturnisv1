import { Position3D } from './monster.types';

export enum NPCType {
  MERCHANT = 'merchant',
  QUEST_GIVER = 'quest_giver',
  GUARD = 'guard',
  TRAINER = 'trainer',
  INNKEEPER = 'innkeeper'
}

export interface NPC {
  id: string;
  name: string;
  displayName: string;
  type: NPCType;
  zoneId: string;
  position: Position3D;
  dialogueTreeId?: string;
  isQuestGiver: boolean;
  metadata: Record<string, unknown>;
}

export interface NPCInteraction {
  id: string;
  npcId: string;
  characterId: string;
  interactionType: string;
  dialogueState: Record<string, unknown>;
  createdAt: Date;
}

export interface DialogueNode {
  id: string;
  text: string;
  choices?: DialogueChoice[];
  actions?: DialogueAction[];
  conditions?: DialogueCondition[];
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: DialogueCondition[];
}

export interface DialogueAction {
  type: string;
  parameters?: Record<string, unknown>;
}

export interface DialogueCondition {
  type: string;
  parameters?: Record<string, unknown>;
}

export interface StartInteractionRequest {
  characterId: string;
}

export interface AdvanceDialogueRequest {
  characterId: string;
  choiceId: string;
}