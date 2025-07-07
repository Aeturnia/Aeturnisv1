/**
 * Tutorial System Type Definitions
 * Comprehensive types for tutorial zones, quests, and progress tracking
 */

export interface Boundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface TutorialNPC {
  id: string;
  name: string;
  dialogueId: string;
  position: {
    x: number;
    y: number;
  };
  questGiver: boolean;
  relatedQuests: string[];
}

export interface TutorialZone {
  id: string;
  name: string;
  description: string;
  boundaries: Boundaries;
  entryRequirements: string[];
  npcs: TutorialNPC[];
  backgroundImage?: string;
  safeZone: boolean;
}

export interface TutorialStep {
  id: string;
  name: string;
  description: string;
  instructions: string;
  objectiveType: TutorialObjectiveType;
  targetNPC?: string;
  targetAction?: string;
  completionCriteria: string;
  hints: string[];
}

export enum TutorialObjectiveType {
  TALK_TO_NPC = 'talk_to_npc',
  MOVE_TO_LOCATION = 'move_to_location',
  OPEN_INVENTORY = 'open_inventory',
  EQUIP_ITEM = 'equip_item',
  ATTACK_TARGET = 'attack_target',
  CAST_SPELL = 'cast_spell',
  COLLECT_ITEM = 'collect_item',
  LEVEL_UP = 'level_up'
}

export interface TutorialReward {
  type: TutorialRewardType;
  quantity: number;
  itemId?: string;
  experienceAmount?: number;
  goldAmount?: number;
  description: string;
}

export enum TutorialRewardType {
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  ITEM = 'item',
  SKILL_POINT = 'skill_point'
}

export interface TutorialQuest {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  prerequisites: string[];
  rewards: TutorialReward[];
  isMainQuest: boolean;
  estimatedDuration: number; // in minutes
  difficulty: TutorialDifficulty;
}

export enum TutorialDifficulty {
  BEGINNER = 'beginner',
  EASY = 'easy',
  INTERMEDIATE = 'intermediate'
}

export interface TutorialStatus {
  characterId: string;
  currentQuestId: string | null;
  currentStepIndex: number;
  completedQuests: string[];
  completedSteps: string[];
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number; // in minutes
}

export interface TutorialGuidance {
  characterId: string;
  currentMessage: string;
  nextAction: string;
  questName?: string;
  stepName?: string;
  hints: string[];
  npcToTalk?: string;
  locationToVisit?: string;
  urgency: TutorialUrgency;
}

export enum TutorialUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TutorialHelpMessage {
  id: string;
  context: string;
  title: string;
  message: string;
  category: TutorialHelpCategory;
  relatedTopics: string[];
  examples?: string[];
}

export enum TutorialHelpCategory {
  NAVIGATION = 'navigation',
  COMBAT = 'combat',
  INVENTORY = 'inventory',
  MAGIC = 'magic',
  SOCIAL = 'social',
  PROGRESSION = 'progression',
  GENERAL = 'general'
}

// Request/Response DTOs
export interface UpdateTutorialProgressRequest {
  characterId: string;
  questId: string;
  stepIndex: number;
  actionData?: Record<string, unknown>;
}

export interface UpdateTutorialProgressResponse {
  success: boolean;
  newStatus: TutorialStatus;
  guidance: TutorialGuidance;
  completedStep?: boolean;
  completedQuest?: boolean;
  rewards?: TutorialReward[];
}

export interface TutorialHelpRequest {
  context: string;
  characterId?: string;
  category?: TutorialHelpCategory;
}

export interface TutorialHelpResponse {
  messages: TutorialHelpMessage[];
  totalFound: number;
  suggestedActions: string[];
}