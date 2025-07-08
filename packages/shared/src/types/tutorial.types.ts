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
  USE_ABILITY = 'use_ability',
  COMPLETE_COMBAT = 'complete_combat',
  INTERACT_OBJECT = 'interact_object'
}

export enum TutorialQuestDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface TutorialQuest {
  id: string;
  name: string;
  description: string;
  difficulty: TutorialQuestDifficulty;
  prerequisites: string[];
  steps: TutorialStep[];
  rewards: TutorialReward[];
  order: number;
  optional: boolean;
}

export interface TutorialReward {
  type: TutorialRewardType;
  amount: number;
  itemId?: string;
  skillId?: string;
}

export enum TutorialRewardType {
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  ITEM = 'item',
  SKILL_UNLOCK = 'skill_unlock',
  ABILITY_POINT = 'ability_point'
}

export interface TutorialProgress {
  characterId: string;
  completedQuests: string[];
  currentQuest?: string;
  currentStep?: string;
  startedAt: Date;
  completedAt?: Date;
  skipCount: number;
  helpRequestCount: number;
}

export interface TutorialGuidance {
  characterId: string;
  currentContext: string;
  suggestedActions: string[];
  availableHelp: TutorialHelpTopic[];
  warnings: string[];
}

export interface TutorialHelpTopic {
  id: string;
  topic: string;
  content: string;
  relatedQuests: string[];
  category: TutorialHelpCategory;
}

export enum TutorialHelpCategory {
  COMBAT = 'combat',
  MOVEMENT = 'movement',
  INVENTORY = 'inventory',
  SKILLS = 'skills',
  QUESTING = 'questing',
  SOCIAL = 'social',
  ECONOMY = 'economy'
}

export interface TutorialStatus {
  characterId: string;
  isComplete: boolean;
  currentPhase: TutorialPhase;
  progress: TutorialProgress;
  achievements: string[];
  unlockedFeatures: string[];
}

export enum TutorialPhase {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

// Request/Response DTOs
export interface GetTutorialStatusRequest {
  characterId: string;
}

export interface GetTutorialStatusResponse {
  status: TutorialStatus;
  nextQuest?: TutorialQuest;
  guidance: TutorialGuidance;
}

export interface UpdateTutorialProgressRequest {
  characterId: string;
  questId: string;
  stepId: string;
  action: TutorialAction;
}

export enum TutorialAction {
  START = 'start',
  COMPLETE = 'complete',
  SKIP = 'skip',
  REQUEST_HELP = 'request_help'
}

export interface UpdateTutorialProgressResponse {
  success: boolean;
  updatedProgress: TutorialProgress;
  unlockedRewards?: TutorialReward[];
  newFeatures?: string[];
  message: string;
}

export interface GetTutorialGuidanceRequest {
  characterId: string;
  context?: string;
}

export interface GetTutorialGuidanceResponse {
  guidance: TutorialGuidance;
  currentObjective?: string;
  hints: string[];
}

export interface GetTutorialHelpRequest {
  characterId: string;
  category?: TutorialHelpCategory;
  context?: string;
}

export interface GetTutorialHelpResponse {
  helpTopics: TutorialHelpTopic[];
  suggestedActions: string[];
  relatedQuests: string[];
}

export enum TutorialMessageType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
  HINT = 'hint'
}

export interface TutorialMessage {
  type: TutorialMessageType;
  title: string;
  content: string;
  duration: number;
  actionButton?: {
    label: string;
    action: string;
  };
}

export enum TutorialHelpPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TutorialContext {
  characterId: string;
  location: string;
  recentActions: string[];
  currentObjective?: string;
  strugglingWith?: string[];
}