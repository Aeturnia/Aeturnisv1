import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { characters } from '../database/schema';
import { eq } from 'drizzle-orm';
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

export class TutorialService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
    logger.info('TutorialService initialized with database connection');
  }

  /**
   * Get the service name
   */
  getName(): string {
    return 'TutorialService';
  }

  /**
   * Get tutorial zone information
   */
  async getTutorialZone(): Promise<TutorialZone> {
    const tutorialZone: TutorialZone = {
      id: "tutorial_area",
      name: "Tutorial Haven",
      description: "A serene training ground where new adventurers learn the basics of their journey",
      welcomeMessage: "Welcome to Aeturnis Online! Let's begin your adventure.",
      completionMessage: "Congratulations! You've completed your training and are ready to explore the world.",
      npcs: [
        {
          id: "trainer_eldric",
          name: "Trainer Eldric",
          dialogues: [
            "Welcome, young adventurer! I'll teach you the fundamentals of combat.",
            "Press the attack button to swing your weapon at enemies.",
            "Don't forget to defend when enemies attack you!"
          ]
        },
        {
          id: "guide_lyra",
          name: "Guide Lyra",
          dialogues: [
            "Hello there! I'm here to help you navigate the world.",
            "Use the movement controls to explore your surroundings.",
            "Check your map to see where you've been and where you can go."
          ]
        },
        {
          id: "merchant_boris",
          name: "Merchant Boris",
          dialogues: [
            "Greetings, newcomer! I can teach you about equipment and inventory.",
            "Click on items to equip them and improve your abilities.",
            "Don't forget to manage your inventory space wisely!"
          ]
        }
      ],
      areas: [
        {
          id: "training_grounds",
          name: "Training Grounds",
          description: "A safe area to practice combat skills"
        },
        {
          id: "item_shop",
          name: "Equipment Shop",
          description: "Learn about items and equipment here"
        },
        {
          id: "guidance_hall",
          name: "Guidance Hall",
          description: "Get help and guidance from experienced adventurers"
        }
      ]
    };

    logger.info('Retrieved tutorial zone information');
    return tutorialZone;
  }

  /**
   * Get tutorial quests
   */
  async getTutorialQuests(): Promise<TutorialQuest[]> {
    const tutorialQuests: TutorialQuest[] = [
      {
        id: "intro_quest",
        title: "Welcome to Aeturnis",
        description: "Learn the basics of your new adventure",
        objectives: [
          {
            id: "talk_to_trainer",
            type: TutorialObjectiveType.TALK_TO_NPC,
            description: "Speak with Trainer Eldric",
            target: "trainer_eldric",
            completed: false
          },
          {
            id: "equip_weapon",
            type: TutorialObjectiveType.EQUIP_ITEM,
            description: "Equip your starting weapon",
            target: "starting_sword",
            completed: false
          }
        ],
        rewards: [
          {
            type: TutorialRewardType.EXPERIENCE,
            amount: 50
          },
          {
            type: TutorialRewardType.GOLD,
            amount: 25
          }
        ],
        difficulty: TutorialQuestDifficulty.EASY,
        estimatedTime: 120,
        isCompleted: false,
        isOptional: false
      },
      {
        id: "combat_basics",
        title: "Combat Training",
        description: "Master the fundamentals of combat",
        objectives: [
          {
            id: "attack_dummy",
            type: TutorialObjectiveType.ATTACK_TARGET,
            description: "Attack the training dummy 5 times",
            target: "training_dummy",
            requiredCount: 5,
            currentCount: 0,
            completed: false
          },
          {
            id: "block_attack",
            type: TutorialObjectiveType.DEFEND,
            description: "Successfully block an attack",
            target: "training_dummy",
            completed: false
          }
        ],
        rewards: [
          {
            type: TutorialRewardType.EXPERIENCE,
            amount: 100
          },
          {
            type: TutorialRewardType.ITEM,
            itemId: "training_shield",
            amount: 1
          }
        ],
        difficulty: TutorialQuestDifficulty.MEDIUM,
        estimatedTime: 300,
        isCompleted: false,
        isOptional: false
      },
      {
        id: "exploration_basics",
        title: "Explore the World",
        description: "Learn to navigate and explore your surroundings",
        objectives: [
          {
            id: "visit_areas",
            type: TutorialObjectiveType.VISIT_LOCATION,
            description: "Visit all areas in the tutorial zone",
            target: "tutorial_area",
            requiredCount: 3,
            currentCount: 0,
            completed: false
          },
          {
            id: "open_map",
            type: TutorialObjectiveType.USE_INTERFACE,
            description: "Open your map",
            target: "map_interface",
            completed: false
          }
        ],
        rewards: [
          {
            type: TutorialRewardType.EXPERIENCE,
            amount: 75
          },
          {
            type: TutorialRewardType.GOLD,
            amount: 50
          }
        ],
        difficulty: TutorialQuestDifficulty.EASY,
        estimatedTime: 180,
        isCompleted: false,
        isOptional: true
      }
    ];

    logger.info('Retrieved tutorial quests');
    return tutorialQuests;
  }

  /**
   * Get tutorial status for character
   */
  async getTutorialStatus(characterId: string): Promise<TutorialStatus> {
    try {
      const cacheKey = `tutorial_status:${characterId}`;
      const cached = await this.cache.get<TutorialStatus>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for tutorial status: ${characterId}`);
        return cached;
      }

      // Check if character exists and get level
      const result = await db.select({ level: characters.level })
        .from(characters)
        .where(eq(characters.id, characterId))
        .limit(1);

      if (!result.length) {
        throw new Error(`Character not found: ${characterId}`);
      }

      // For now, return a default status - in a real implementation, 
      // this would come from a tutorial_progress table
      const status: TutorialStatus = {
        characterId,
        currentPhase: TutorialPhase.INTRODUCTION,
        isCompleted: false,
        completedQuests: [],
        currentQuest: "intro_quest",
        totalProgress: 0,
        lastUpdated: new Date()
      };

      await this.cache.set(cacheKey, status, 300); // Cache for 5 minutes
      logger.debug(`Retrieved tutorial status for character: ${characterId}`);
      return status;
    } catch (error) {
      logger.error(`Error fetching tutorial status for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Update tutorial progress
   */
  async updateTutorialProgress(characterId: string, request: UpdateTutorialProgressRequest): Promise<UpdateTutorialProgressResponse> {
    try {
      const currentStatus = await this.getTutorialStatus(characterId);
      
      // Update progress based on request
      const updatedStatus: TutorialStatus = {
        ...currentStatus,
        currentPhase: request.phase || currentStatus.currentPhase,
        currentQuest: request.questId || currentStatus.currentQuest,
        totalProgress: Math.min(100, currentStatus.totalProgress + (request.progressIncrement || 0)),
        lastUpdated: new Date()
      };

      // If quest is completed, add to completed quests
      if (request.questCompleted && request.questId) {
        if (!updatedStatus.completedQuests.includes(request.questId)) {
          updatedStatus.completedQuests.push(request.questId);
        }
      }

      // Check if tutorial is completed
      if (updatedStatus.totalProgress >= 100) {
        updatedStatus.isCompleted = true;
        updatedStatus.currentPhase = TutorialPhase.COMPLETED;
      }

      // Update cache
      const cacheKey = `tutorial_status:${characterId}`;
      await this.cache.set(cacheKey, updatedStatus, 300);

      logger.info(`Updated tutorial progress for character ${characterId}: ${updatedStatus.totalProgress}%`);
      return {
        success: true,
        updatedStatus,
        message: request.questCompleted ? "Quest completed successfully!" : "Progress updated"
      };
    } catch (error) {
      logger.error(`Error updating tutorial progress for character ${characterId}:`, error);
      return {
        success: false,
        message: "Failed to update tutorial progress"
      };
    }
  }

  /**
   * Get tutorial guidance
   */
  async getTutorialGuidance(characterId: string): Promise<TutorialGuidance> {
    try {
      const status = await this.getTutorialStatus(characterId);
      
      const guidance: TutorialGuidance = {
        characterId,
        currentPhase: status.currentPhase,
        nextSteps: this.getNextSteps(status),
        hints: this.getHints(status),
        availableHelp: this.getAvailableHelp(status)
      };

      logger.debug(`Retrieved tutorial guidance for character: ${characterId}`);
      return guidance;
    } catch (error) {
      logger.error(`Error fetching tutorial guidance for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Get tutorial help topics
   */
  async getTutorialHelp(request: GetTutorialHelpRequest): Promise<GetTutorialHelpResponse> {
    const helpTopics: TutorialHelpTopic[] = [
      {
        id: "combat_help",
        title: "Combat System",
        category: TutorialHelpCategory.COMBAT,
        content: "Learn how to fight enemies, use weapons, and defend yourself effectively.",
        tags: ["combat", "weapons", "defense", "attack"],
        difficulty: TutorialQuestDifficulty.EASY,
        estimatedReadTime: 120
      },
      {
        id: "movement_help",
        title: "Movement & Navigation",
        category: TutorialHelpCategory.MOVEMENT,
        content: "Master movement controls, zone navigation, and map usage for efficient exploration.",
        tags: ["movement", "navigation", "map", "zones"],
        difficulty: TutorialQuestDifficulty.EASY,
        estimatedReadTime: 90
      },
      {
        id: "inventory_help",
        title: "Inventory Management",
        category: TutorialHelpCategory.INVENTORY,
        content: "Organize your items, equip gear, and manage your inventory space effectively.",
        tags: ["inventory", "equipment", "items", "gear"],
        difficulty: TutorialQuestDifficulty.MEDIUM,
        estimatedReadTime: 150
      }
    ];

    const filteredTopics = request.category 
      ? helpTopics.filter(topic => topic.category === request.category)
      : helpTopics;

    logger.info(`Retrieved ${filteredTopics.length} tutorial help topics`);
    return {
      topics: filteredTopics,
      totalCount: filteredTopics.length
    };
  }

  /**
   * Get next steps based on tutorial status
   */
  private getNextSteps(status: TutorialStatus): string[] {
    switch (status.currentPhase) {
      case TutorialPhase.INTRODUCTION:
        return ["Talk to Trainer Eldric", "Equip your starting weapon"];
      case TutorialPhase.COMBAT_TRAINING:
        return ["Attack the training dummy", "Practice blocking"];
      case TutorialPhase.EXPLORATION:
        return ["Visit all tutorial areas", "Open your map"];
      case TutorialPhase.COMPLETED:
        return ["Exit the tutorial area", "Begin your adventure"];
      default:
        return ["Continue your tutorial"];
    }
  }

  /**
   * Get hints based on tutorial status
   */
  private getHints(status: TutorialStatus): string[] {
    const hints = [
      "Take your time to learn each concept",
      "Don't hesitate to ask NPCs for help",
      "Practice makes perfect!"
    ];

    if (status.totalProgress < 25) {
      hints.push("You're just getting started - keep going!");
    } else if (status.totalProgress < 75) {
      hints.push("You're making good progress!");
    } else {
      hints.push("Almost done with the tutorial!");
    }

    return hints;
  }

  /**
   * Get available help based on tutorial status
   */
  private getAvailableHelp(status: TutorialStatus): string[] {
    return [
      "Visit the Guidance Hall for additional help",
      "Check the tutorial help topics",
      "Ask NPCs for specific guidance"
    ];
  }
}