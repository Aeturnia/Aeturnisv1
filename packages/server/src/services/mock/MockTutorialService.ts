/**
 * Mock Tutorial Service Implementation
 * Provides tutorial zone, quest, and progress tracking functionality
 */

import { 
  TutorialZone, 
  TutorialQuest, 
  TutorialStatus, 
  TutorialGuidance, 
  TutorialHelpMessage,
  TutorialObjectiveType,
  TutorialDifficulty,
  TutorialRewardType,
  TutorialUrgency,
  TutorialHelpCategory,
  UpdateTutorialProgressRequest,
  UpdateTutorialProgressResponse,
  TutorialHelpRequest,
  TutorialHelpResponse
} from '../../../../shared/types/tutorial.types';
import { logger } from '../../utils/logger';

export class MockTutorialService {
  private readonly tutorialZone: TutorialZone;
  private readonly tutorialQuests: TutorialQuest[];
  private readonly characterStatuses: Map<string, TutorialStatus>;
  private readonly helpMessages: TutorialHelpMessage[];

  constructor() {
    this.tutorialZone = this.createTutorialZone();
    this.tutorialQuests = this.createTutorialQuests();
    this.characterStatuses = new Map();
    this.helpMessages = this.createHelpMessages();
    this.initializeMockData();
  }

  /**
   * Get tutorial zone information
   */
  async getTutorialZone(): Promise<TutorialZone> {
    logger.info('Retrieved tutorial zone data');
    return this.tutorialZone;
  }

  /**
   * Get character's tutorial status
   */
  async getTutorialStatus(characterId: string): Promise<TutorialStatus> {
    const status = this.characterStatuses.get(characterId) || this.createDefaultStatus(characterId);
    logger.info(`Retrieved tutorial status for character ${characterId}: Quest ${status.currentQuestId}, Step ${status.currentStepIndex}`);
    return status;
  }

  /**
   * Get all tutorial quests
   */
  async getAllQuests(): Promise<TutorialQuest[]> {
    logger.info('Retrieved all tutorial quests');
    return this.tutorialQuests;
  }

  /**
   * Update tutorial progress
   */
  async updateProgress(request: UpdateTutorialProgressRequest): Promise<UpdateTutorialProgressResponse> {
    const { characterId, questId, stepIndex } = request;
    
    const currentStatus = await this.getTutorialStatus(characterId);
    const quest = this.tutorialQuests.find(q => q.id === questId);
    
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    if (stepIndex >= quest.steps.length) {
      throw new Error(`Invalid step index ${stepIndex} for quest ${questId}`);
    }

    // Update status
    const newStatus: TutorialStatus = {
      ...currentStatus,
      currentQuestId: questId,
      currentStepIndex: stepIndex,
      completedSteps: [...currentStatus.completedSteps, quest.steps[stepIndex - 1]?.id || ''].filter(Boolean)
    };

    // Check for quest completion
    const completedQuest = stepIndex >= quest.steps.length - 1;
    if (completedQuest) {
      newStatus.completedQuests = [...newStatus.completedQuests, questId];
      newStatus.currentQuestId = this.getNextQuestId(questId);
      newStatus.currentStepIndex = 0;
      
      // Check for full tutorial completion
      if (newStatus.completedQuests.length >= this.tutorialQuests.length) {
        newStatus.isComplete = true;
        newStatus.completedAt = new Date();
      }
    }

    this.characterStatuses.set(characterId, newStatus);

    const guidance = await this.getGuidance(characterId);
    
    logger.info(`Updated tutorial progress for ${characterId}: Quest ${questId}, Step ${stepIndex}, Completed: ${completedQuest}`);

    return {
      success: true,
      newStatus,
      guidance,
      completedStep: true,
      completedQuest,
      rewards: completedQuest ? quest.rewards : undefined
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
        currentMessage: "Tutorial complete! You're ready to explore Aeturnis Online.",
        nextAction: "Leave the tutorial zone and begin your adventure!",
        hints: ["Visit the main city", "Talk to NPCs for quests", "Practice combat with monsters"],
        urgency: TutorialUrgency.LOW
      };
    }

    const currentQuest = this.tutorialQuests.find(q => q.id === status.currentQuestId);
    if (!currentQuest) {
      return this.getDefaultGuidance(characterId);
    }

    const currentStep = currentQuest.steps[status.currentStepIndex];
    if (!currentStep) {
      return this.getDefaultGuidance(characterId);
    }

    return {
      characterId,
      currentMessage: currentStep.instructions,
      nextAction: currentStep.description,
      questName: currentQuest.name,
      stepName: currentStep.name,
      hints: currentStep.hints,
      npcToTalk: currentStep.targetNPC,
      urgency: TutorialUrgency.MEDIUM
    };
  }

  /**
   * Get help messages based on context
   */
  async getHelp(request: TutorialHelpRequest): Promise<TutorialHelpResponse> {
    const { context, category } = request;
    
    let filteredMessages = this.helpMessages;
    
    if (category) {
      filteredMessages = filteredMessages.filter(msg => msg.category === category);
    }
    
    if (context) {
      filteredMessages = filteredMessages.filter(msg => 
        msg.context.includes(context) || 
        msg.title.toLowerCase().includes(context.toLowerCase()) ||
        msg.message.toLowerCase().includes(context.toLowerCase())
      );
    }

    const suggestedActions = this.getSuggestedActions(context, category);

    logger.info(`Retrieved ${filteredMessages.length} help messages for context: ${context}`);

    return {
      messages: filteredMessages,
      totalFound: filteredMessages.length,
      suggestedActions
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
      safeZone: true,
      npcs: [
        {
          id: 'trainer_marcus',
          name: 'Trainer Marcus',
          dialogueId: 'marcus_intro',
          position: { x: 25, y: 50 },
          questGiver: true,
          relatedQuests: ['basic_movement', 'combat_basics']
        },
        {
          id: 'sage_elara',
          name: 'Sage Elara',
          dialogueId: 'elara_magic',
          position: { x: 75, y: 30 },
          questGiver: true,
          relatedQuests: ['magic_fundamentals']
        },
        {
          id: 'merchant_finn',
          name: 'Merchant Finn',
          dialogueId: 'finn_trade',
          position: { x: 50, y: 75 },
          questGiver: false,
          relatedQuests: ['inventory_management']
        }
      ]
    };
  }

  private createTutorialQuests(): TutorialQuest[] {
    return [
      {
        id: 'basic_movement',
        name: 'First Steps',
        description: 'Learn how to move around and navigate the world',
        isMainQuest: true,
        difficulty: TutorialDifficulty.BEGINNER,
        estimatedDuration: 5,
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
            quantity: 100,
            experienceAmount: 100,
            description: 'Experience for completing basic movement training'
          },
          {
            type: TutorialRewardType.GOLD,
            quantity: 50,
            goldAmount: 50,
            description: 'Gold coins for your first quest'
          }
        ]
      },
      {
        id: 'combat_basics',
        name: 'Combat Training',
        description: 'Learn the fundamentals of combat in Aeturnis Online',
        isMainQuest: true,
        difficulty: TutorialDifficulty.EASY,
        estimatedDuration: 10,
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
            quantity: 200,
            experienceAmount: 200,
            description: 'Combat training experience'
          },
          {
            type: TutorialRewardType.ITEM,
            quantity: 1,
            itemId: 'health_potion_small',
            description: 'Small health potion for emergencies'
          }
        ]
      },
      {
        id: 'magic_fundamentals',
        name: 'Magical Arts',
        description: 'Learn about magic and spellcasting',
        isMainQuest: true,
        difficulty: TutorialDifficulty.INTERMEDIATE,
        estimatedDuration: 15,
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
            quantity: 300,
            experienceAmount: 300,
            description: 'Magical arts training experience'
          },
          {
            type: TutorialRewardType.ITEM,
            quantity: 1,
            itemId: 'mana_potion_small',
            description: 'Small mana potion to restore magical energy'
          }
        ]
      }
    ];
  }

  private createHelpMessages(): TutorialHelpMessage[] {
    return [
      {
        id: 'movement_help',
        context: 'movement',
        title: 'How to Move',
        message: 'Use WASD keys or arrow keys to move your character around the world. Hold Shift to run faster.',
        category: TutorialHelpCategory.NAVIGATION,
        relatedTopics: ['controls', 'basic_movement'],
        examples: ['W or ↑ to move forward', 'S or ↓ to move backward', 'A or ← to move left', 'D or → to move right']
      },
      {
        id: 'combat_help',
        context: 'combat',
        title: 'Combat Basics',
        message: 'Left-click on enemies to attack them. Watch your health (red bar) and stamina (yellow bar) during combat.',
        category: TutorialHelpCategory.COMBAT,
        relatedTopics: ['attacking', 'health', 'stamina'],
        examples: ['Left-click to attack', 'Spacebar for quick attack', 'Right-click to block']
      },
      {
        id: 'inventory_help',
        context: 'inventory',
        title: 'Managing Your Inventory',
        message: 'Press I to open your inventory. Right-click items to use them or equip them if they are equipment.',
        category: TutorialHelpCategory.INVENTORY,
        relatedTopics: ['items', 'equipment', 'storage'],
        examples: ['Press I to open inventory', 'Right-click to use items', 'Drag items to move them']
      },
      {
        id: 'magic_help',
        context: 'magic',
        title: 'Using Magic',
        message: 'Magic spells consume mana (blue bar). Press number keys 1-9 to cast spells you have learned.',
        category: TutorialHelpCategory.MAGIC,
        relatedTopics: ['spells', 'mana', 'casting'],
        examples: ['Press 1-9 to cast spells', 'Watch your mana bar', 'Learn spells from NPCs']
      },
      {
        id: 'progression_help',
        context: 'leveling',
        title: 'Character Progression',
        message: 'Gain experience by completing quests and defeating enemies. Level up to increase your stats and unlock new abilities.',
        category: TutorialHelpCategory.PROGRESSION,
        relatedTopics: ['experience', 'leveling', 'stats'],
        examples: ['Complete quests for XP', 'Defeat enemies for XP', 'Level up to get stronger']
      }
    ];
  }

  private createDefaultStatus(characterId: string): TutorialStatus {
    return {
      characterId,
      currentQuestId: 'basic_movement',
      currentStepIndex: 0,
      completedQuests: [],
      completedSteps: [],
      isComplete: false,
      startedAt: new Date(),
      totalTimeSpent: 0
    };
  }

  private getDefaultGuidance(characterId: string): TutorialGuidance {
    return {
      characterId,
      currentMessage: "Welcome to Aeturnis Online! Start by talking to Trainer Marcus.",
      nextAction: "Find and speak with Trainer Marcus to begin your tutorial",
      hints: ["Look for NPCs with exclamation marks", "Use WASD to move around"],
      npcToTalk: 'trainer_marcus',
      urgency: TutorialUrgency.MEDIUM
    };
  }

  private getNextQuestId(currentQuestId: string): string | null {
    const currentIndex = this.tutorialQuests.findIndex(q => q.id === currentQuestId);
    if (currentIndex >= 0 && currentIndex < this.tutorialQuests.length - 1) {
      return this.tutorialQuests[currentIndex + 1].id;
    }
    return null;
  }

  private getSuggestedActions(context?: string, category?: TutorialHelpCategory): string[] {
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

    if (category === TutorialHelpCategory.MAGIC) {
      return [
        "Talk to Sage Elara about magic",
        "Make sure you have enough mana before casting",
        "Practice with simple spells first"
      ];
    }

    return actions;
  }

  private initializeMockData(): void {
    // Initialize some mock character statuses
    this.characterStatuses.set('test_player', {
      characterId: 'test_player',
      currentQuestId: 'basic_movement',
      currentStepIndex: 1,
      completedQuests: [],
      completedSteps: ['talk_to_marcus'],
      isComplete: false,
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      totalTimeSpent: 5
    });

    this.characterStatuses.set('demo_user', {
      characterId: 'demo_user',
      currentQuestId: 'magic_fundamentals',
      currentStepIndex: 0,
      completedQuests: ['basic_movement', 'combat_basics'],
      completedSteps: ['talk_to_marcus', 'move_around', 'open_character_panel', 'equip_weapon', 'attack_dummy'],
      isComplete: false,
      startedAt: new Date(Date.now() - 900000), // 15 minutes ago
      totalTimeSpent: 15
    });

    logger.info('Initialized MockTutorialService with mock data');
  }
}