/**
 * Mock Tutorial Service Implementation
 * Provides tutorial zone, quest, and progress tracking functionality
 */

import { 
  TutorialZone, 
  TutorialQuest, 
  TutorialStatus, 
  TutorialGuidance,
  TutorialObjectiveType,
  TutorialQuestDifficulty,
  TutorialRewardType,
  TutorialHelpCategory,
  TutorialHelpTopic,
  UpdateTutorialProgressRequest,
  UpdateTutorialProgressResponse,
  GetTutorialHelpRequest,
  GetTutorialHelpResponse,
  TutorialProgress,
  TutorialPhase
} from '@aeturnis/shared';
import { logger } from '../../utils/logger';

export class MockTutorialService {
  /**
   * Get the service name (from IService)
   */
  getName(): string {
    return 'MockTutorialService';
  }
  private readonly tutorialZone: TutorialZone;
  private readonly tutorialQuests: TutorialQuest[];
  private readonly characterStatuses: Map<string, TutorialStatus>;
  private readonly helpTopics: TutorialHelpTopic[];

  constructor() {
    this.tutorialZone = this.createTutorialZone();
    this.tutorialQuests = this.createTutorialQuests();
    this.characterStatuses = new Map();
    this.helpTopics = this.createHelpTopics();
    this.initializeMockData();
  }

  /**
   * Get tutorial zone information
   */
  async getTutorialZone(): Promise<TutorialZone> {
    logger.info('Retrieved tutorial zone information');
    return this.tutorialZone;
  }

  /**
   * Get character's tutorial status
   */
  async getTutorialStatus(characterId: string): Promise<TutorialStatus> {
    let status = this.characterStatuses.get(characterId);
    
    if (!status) {
      status = this.createDefaultStatus(characterId);
      this.characterStatuses.set(characterId, status);
    }
    
    logger.info(`Retrieved tutorial status for character ${characterId}`);
    return status;
  }

  /**
   * Get all tutorial quests
   */
  async getAllQuests(): Promise<TutorialQuest[]> {
    logger.info(`Retrieved ${this.tutorialQuests.length} tutorial quests`);
    return this.tutorialQuests;
  }

  /**
   * Update tutorial progress
   */
  async updateProgress(request: UpdateTutorialProgressRequest): Promise<UpdateTutorialProgressResponse> {
    const { characterId, questId, stepId, action } = request;
    
    const status = await this.getTutorialStatus(characterId);
    const quest = this.tutorialQuests.find(q => q.id === questId);
    
    if (!quest) {
      return {
        success: false,
        updatedProgress: status.progress,
        message: 'Quest not found'
      };
    }

    // Create updated progress
    const updatedProgress: TutorialProgress = {
      ...status.progress,
      currentQuest: questId,
      currentStep: stepId
    };

    // Handle different actions
    if (action === 'complete') {
      const stepIndex = quest.steps.findIndex(s => s.id === stepId);
      const isLastStep = stepIndex === quest.steps.length - 1;
      
      if (isLastStep) {
        // Complete the quest
        updatedProgress.completedQuests = [...status.progress.completedQuests, questId];
        updatedProgress.currentQuest = this.getNextQuestId(questId);
        updatedProgress.currentStep = updatedProgress.currentQuest ? 
          this.tutorialQuests.find(q => q.id === updatedProgress.currentQuest)?.steps[0]?.id : 
          undefined;
      } else {
        // Move to next step
        updatedProgress.currentStep = quest.steps[stepIndex + 1]?.id;
      }
    }

    // Update status
    const newStatus: TutorialStatus = {
      ...status,
      progress: updatedProgress,
      currentPhase: updatedProgress.completedQuests.length >= this.tutorialQuests.length ? 
        TutorialPhase.COMPLETED : 
        TutorialPhase.IN_PROGRESS
    };

    if (newStatus.currentPhase === TutorialPhase.COMPLETED) {
      newStatus.isComplete = true;
      updatedProgress.completedAt = new Date();
    }

    this.characterStatuses.set(characterId, newStatus);
    
    logger.info(`Updated tutorial progress for ${characterId}: Quest ${questId}, Step ${stepId}, Action: ${action}`);

    return {
      success: true,
      updatedProgress,
      message: 'Tutorial progress updated successfully',
      unlockedRewards: action === 'complete' && quest.steps.findIndex(s => s.id === stepId) === quest.steps.length - 1 ? 
        quest.rewards : 
        undefined
    };
  }

  /**
   * Get contextual guidance for character
   */
  async getGuidance(characterId: string): Promise<TutorialGuidance> {
    const status = await this.getTutorialStatus(characterId);
    
    if (status.isComplete) {
      return {
        characterId,
        currentContext: 'tutorial_complete',
        suggestedActions: ['Leave the tutorial zone', 'Begin your adventure in the main world'],
        availableHelp: [],
        warnings: []
      };
    }

    const currentQuest = this.tutorialQuests.find(q => q.id === status.progress.currentQuest);
    const currentStep = currentQuest?.steps.find(s => s.id === status.progress.currentStep);
    
    const suggestedActions: string[] = [];
    if (currentStep) {
      suggestedActions.push(currentStep.instructions);
      suggestedActions.push(...currentStep.hints);
    }

    const relevantHelp = this.helpTopics.filter(topic => 
      currentQuest ? topic.relatedQuests.includes(currentQuest.id) : true
    );

    return {
      characterId,
      currentContext: currentQuest?.id || 'tutorial_start',
      suggestedActions,
      availableHelp: relevantHelp.slice(0, 3),
      warnings: []
    };
  }

  /**
   * Get help messages based on context
   */
  async getHelp(request: GetTutorialHelpRequest): Promise<GetTutorialHelpResponse> {
    const { context, category } = request;
    
    let filteredTopics = this.helpTopics;
    
    if (category) {
      filteredTopics = filteredTopics.filter(topic => topic.category === category);
    }
    
    if (context) {
      filteredTopics = filteredTopics.filter(topic => 
        topic.topic.toLowerCase().includes(context.toLowerCase()) ||
        topic.content.toLowerCase().includes(context.toLowerCase())
      );
    }

    const suggestedActions = this.getSuggestedActions(context, category);
    const relatedQuests = [...new Set(filteredTopics.flatMap(t => t.relatedQuests))];

    logger.info(`Retrieved ${filteredTopics.length} help topics for context: ${context}`);

    return {
      helpTopics: filteredTopics,
      suggestedActions,
      relatedQuests
    };
  }

  private createTutorialZone(): TutorialZone {
    return {
      id: 'tutorial_zone',
      name: 'Training Grounds',
      description: 'A safe environment for new adventurers to learn the basics of Aeturnis Online',
      boundaries: {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100
      },
      entryRequirements: [],
      npcs: [
        {
          id: 'trainer_marcus',
          name: 'Trainer Marcus',
          dialogueId: 'marcus_intro',
          position: { x: 50, y: 50 },
          questGiver: true,
          relatedQuests: ['basic_movement']
        },
        {
          id: 'sage_elara',
          name: 'Sage Elara',
          dialogueId: 'elara_magic',
          position: { x: 75, y: 50 },
          questGiver: true,
          relatedQuests: ['magic_fundamentals']
        },
        {
          id: 'training_dummy',
          name: 'Training Dummy',
          dialogueId: '',
          position: { x: 25, y: 50 },
          questGiver: false,
          relatedQuests: ['combat_basics']
        }
      ],
      safeZone: true
    };
  }

  private createTutorialQuests(): TutorialQuest[] {
    return [
      {
        id: 'basic_movement',
        name: 'First Steps',
        description: 'Learn how to move around and navigate the world',
        difficulty: TutorialQuestDifficulty.BEGINNER,
        prerequisites: [],
        steps: [
          {
            id: 'talk_to_marcus',
            name: 'Meet Your Trainer',
            description: 'Talk to Trainer Marcus to begin your journey',
            instructions: 'Click on Trainer Marcus to start a conversation',
            objectiveType: TutorialObjectiveType.TALK_TO_NPC,
            targetNPC: 'trainer_marcus',
            completionCriteria: 'conversation_completed',
            hints: ['NPCs with quests have exclamation marks above their heads', 'Click directly on the NPC to interact']
          },
          {
            id: 'move_around',
            name: 'Basic Movement',
            description: 'Use the movement controls to walk around',
            instructions: 'Use WASD keys or arrow keys to move your character',
            objectiveType: TutorialObjectiveType.MOVE_TO_LOCATION,
            completionCriteria: 'moved_10_units',
            hints: ['W/↑: Move forward', 'S/↓: Move backward', 'A/←: Move left', 'D/→: Move right']
          },
          {
            id: 'open_character_panel',
            name: 'Character Information',
            description: 'Open your character panel to view your stats',
            instructions: 'Press C or click the character icon to open your character panel',
            objectiveType: TutorialObjectiveType.OPEN_INVENTORY,
            completionCriteria: 'character_panel_opened',
            hints: ['The character panel shows your level, stats, and equipment', 'You can also access it from the menu']
          }
        ],
        rewards: [
          {
            type: TutorialRewardType.EXPERIENCE,
            amount: 100
          },
          {
            type: TutorialRewardType.GOLD,
            amount: 50
          }
        ],
        order: 1,
        optional: false
      },
      {
        id: 'combat_basics',
        name: 'Combat Training',
        description: 'Learn the fundamentals of combat in Aeturnis Online',
        difficulty: TutorialQuestDifficulty.INTERMEDIATE,
        prerequisites: ['basic_movement'],
        steps: [
          {
            id: 'equip_weapon',
            name: 'Equip Your Weapon',
            description: 'Equip the training sword from your inventory',
            instructions: 'Open your inventory and right-click the training sword to equip it',
            objectiveType: TutorialObjectiveType.EQUIP_ITEM,
            completionCriteria: 'weapon_equipped',
            hints: ['Equipped items appear in your character panel', 'Weapons increase your damage in combat']
          },
          {
            id: 'attack_dummy',
            name: 'Practice Combat',
            description: 'Attack the training dummy to practice combat',
            instructions: 'Target the training dummy and left-click to attack',
            objectiveType: TutorialObjectiveType.ATTACK_TARGET,
            completionCriteria: 'dummy_attacked_5_times',
            hints: ['You can also use the spacebar to attack', 'Watch your stamina bar during combat']
          }
        ],
        rewards: [
          {
            type: TutorialRewardType.EXPERIENCE,
            amount: 200
          },
          {
            type: TutorialRewardType.ITEM,
            amount: 1,
            itemId: 'health_potion_small'
          }
        ],
        order: 2,
        optional: false
      },
      {
        id: 'magic_fundamentals',
        name: 'Magical Arts',
        description: 'Learn about magic and spellcasting',
        difficulty: TutorialQuestDifficulty.INTERMEDIATE,
        prerequisites: ['combat_basics'],
        steps: [
          {
            id: 'talk_to_sage',
            name: 'Meet the Sage',
            description: 'Speak with Sage Elara about magic',
            instructions: 'Find Sage Elara in the eastern part of the training grounds',
            objectiveType: TutorialObjectiveType.TALK_TO_NPC,
            targetNPC: 'sage_elara',
            completionCriteria: 'sage_conversation_completed',
            hints: ['Sage Elara can teach you about different schools of magic']
          },
          {
            id: 'cast_first_spell',
            name: 'First Spell',
            description: 'Cast your first spell',
            instructions: 'Use the Fire Bolt spell by pressing 1 or clicking the spell icon',
            objectiveType: TutorialObjectiveType.CAST_SPELL,
            completionCriteria: 'spell_cast_successfully',
            hints: ['Spells consume mana', 'Your mana bar is the blue bar below your health']
          }
        ],
        rewards: [
          {
            type: TutorialRewardType.EXPERIENCE,
            amount: 300
          },
          {
            type: TutorialRewardType.ITEM,
            amount: 1,
            itemId: 'mana_potion_small'
          }
        ],
        order: 3,
        optional: false
      }
    ];
  }

  private createHelpTopics(): TutorialHelpTopic[] {
    return [
      {
        id: 'movement_help',
        topic: 'How to Move',
        content: 'Use WASD keys or arrow keys to move your character around the world. Hold Shift to run faster.',
        category: TutorialHelpCategory.MOVEMENT,
        relatedQuests: ['basic_movement']
      },
      {
        id: 'combat_help',
        topic: 'Combat Basics',
        content: 'Left-click on enemies to attack them. Watch your health (red bar) and stamina (yellow bar) during combat.',
        category: TutorialHelpCategory.COMBAT,
        relatedQuests: ['combat_basics']
      },
      {
        id: 'inventory_help',
        topic: 'Managing Your Inventory',
        content: 'Press I to open your inventory. Right-click items to use them or equip them if they are equipment.',
        category: TutorialHelpCategory.INVENTORY,
        relatedQuests: ['basic_movement', 'combat_basics']
      },
      {
        id: 'magic_help',
        topic: 'Using Magic',
        content: 'Magic spells consume mana (blue bar). Press number keys 1-9 to cast spells you have learned.',
        category: TutorialHelpCategory.SKILLS,
        relatedQuests: ['magic_fundamentals']
      },
      {
        id: 'quest_help',
        topic: 'Quest System',
        content: 'Talk to NPCs with exclamation marks to receive quests. Check your quest log (L) to track progress.',
        category: TutorialHelpCategory.QUESTING,
        relatedQuests: ['basic_movement']
      }
    ];
  }

  private createDefaultStatus(characterId: string): TutorialStatus {
    const progress: TutorialProgress = {
      characterId,
      completedQuests: [],
      currentQuest: 'basic_movement',
      currentStep: 'talk_to_marcus',
      startedAt: new Date(),
      skipCount: 0,
      helpRequestCount: 0
    };

    return {
      characterId,
      isComplete: false,
      currentPhase: TutorialPhase.IN_PROGRESS,
      progress,
      achievements: [],
      unlockedFeatures: []
    };
  }

  private getNextQuestId(currentQuestId: string): string | undefined {
    const currentIndex = this.tutorialQuests.findIndex(q => q.id === currentQuestId);
    if (currentIndex >= 0 && currentIndex < this.tutorialQuests.length - 1) {
      return this.tutorialQuests[currentIndex + 1].id;
    }
    return undefined;
  }

  private getSuggestedActions(_context?: string, category?: TutorialHelpCategory): string[] {
    const actions = [
      "Talk to NPCs for quests and information",
      "Practice combat with training dummies",
      "Explore the tutorial zone to familiarize yourself",
      "Open your character panel to view your progress"
    ];

    if (category === TutorialHelpCategory.COMBAT) {
      return [
        "Equip a weapon before fighting",
        "Watch your health and stamina bars",
        "Practice on training dummies first"
      ];
    }

    if (category === TutorialHelpCategory.SKILLS) {
      return [
        "Talk to Sage Elara about magic",
        "Make sure you have enough mana before casting",
        "Practice with simple spells first"
      ];
    }

    return actions;
  }

  private initializeMockData(): void {
    // Initialize test character statuses
    const testProgress1: TutorialProgress = {
      characterId: 'test-char-001',
      completedQuests: [],
      currentQuest: 'basic_movement',
      currentStep: 'move_around',
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      skipCount: 0,
      helpRequestCount: 1
    };

    this.characterStatuses.set('test-char-001', {
      characterId: 'test-char-001',
      isComplete: false,
      currentPhase: TutorialPhase.IN_PROGRESS,
      progress: testProgress1,
      achievements: [],
      unlockedFeatures: []
    });

    const testProgress2: TutorialProgress = {
      characterId: 'demo_user',
      completedQuests: ['basic_movement', 'combat_basics'],
      currentQuest: 'magic_fundamentals',
      currentStep: 'talk_to_sage',
      startedAt: new Date(Date.now() - 900000), // 15 minutes ago
      skipCount: 0,
      helpRequestCount: 3
    };

    this.characterStatuses.set('demo_user', {
      characterId: 'demo_user',
      isComplete: false,
      currentPhase: TutorialPhase.IN_PROGRESS,
      progress: testProgress2,
      achievements: ['fast_learner'],
      unlockedFeatures: ['combat_system', 'inventory_system']
    });

    logger.info('Initialized MockTutorialService with mock data');
  }
}