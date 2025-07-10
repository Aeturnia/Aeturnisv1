/**
 * Mock Progression Service Implementation
 * Handles character experience, leveling, stat allocation, and power scoring with BigInt support
 */

import { 
  CharacterProgression, 
  AwardXPRequest, 
  AwardXPResponse, 
  AllocateStatRequest, 
  AllocateStatResponse, 
  PowerScoreResponse, 
  ExperienceGain, 
  StatAllocation
} from '@aeturnis/shared';
import { logger } from '../../utils/logger';

export class MockProgressionService {
  /**
   * Get the service name (from IService)
   */
  getName(): string {
    return 'MockProgressionService';
  }
  private characterProgressions: Map<string, CharacterProgression> = new Map();
  private experienceHistory: ExperienceGain[] = [];
  private statHistory: StatAllocation[] = [];

  constructor() {
    this.initializeMockProgressions();
    logger.info('MockProgressionService initialized');
  }

  /**
   * Initialize mock character progressions
   */
  private initializeMockProgressions(): void {
    const mockProgressions: CharacterProgression[] = [
      {
        characterId: "char_001",
        level: 5,
        experience: 2500n,
        nextLevelExp: this.calculateNextLevelExp(5),
        statPoints: 2,
        allocatedStats: {
          strength: 8,
          agility: 6,
          intelligence: 5,
          stamina: 6
        }
      },
      {
        characterId: "test_player",
        level: 1,
        experience: 0n,
        nextLevelExp: this.calculateNextLevelExp(1),
        statPoints: 0,
        allocatedStats: {
          strength: 5,
          agility: 5,
          intelligence: 5,
          stamina: 5
        }
      },
      {
        characterId: "high_level_test",
        level: 25,
        experience: 156250n,
        nextLevelExp: this.calculateNextLevelExp(25),
        statPoints: 15,
        allocatedStats: {
          strength: 20,
          agility: 15,
          intelligence: 12,
          stamina: 18
        }
      }
    ];

    mockProgressions.forEach(progression => {
      this.characterProgressions.set(progression.characterId, progression);
    });
  }

  /**
   * Calculate experience required for next level
   * Formula: baseExp * level * growthFactor / 100
   */
  private calculateNextLevelExp(level: number): bigint {
    const baseExp = 100n;
    const growthFactor = 115n; // 15% increase per level
    return baseExp * BigInt(level) * growthFactor / 100n;
  }

  /**
   * Calculate total experience required to reach a specific level
   */
  private calculateTotalExpForLevel(targetLevel: number): bigint {
    let totalExp = 0n;
    for (let level = 1; level < targetLevel; level++) {
      totalExp += this.calculateNextLevelExp(level);
    }
    return totalExp;
  }

  /**
   * Get character progression
   */
  async getCharacterProgression(characterId: string): Promise<CharacterProgression | null> {
    return this.characterProgressions.get(characterId) || null;
  }

  /**
   * Award experience to character
   */
  async awardExperience(request: AwardXPRequest): Promise<AwardXPResponse> {
    const { characterId, amount, source } = request;

    let progression = this.characterProgressions.get(characterId);
    if (!progression) {
      // Create new progression for unknown character
      progression = {
        characterId,
        level: 1,
        experience: 0n,
        nextLevelExp: this.calculateNextLevelExp(1),
        statPoints: 0,
        allocatedStats: {
          strength: 5,
          agility: 5,
          intelligence: 5,
          stamina: 5
        }
      };
    }

    const previousLevel = progression.level;
    const previousExp = progression.experience;
    
    // Add experience
    progression.experience += amount;
    
    // Check for level ups
    let levelsGained = 0;
    while (progression.experience >= progression.nextLevelExp) {
      progression.experience -= progression.nextLevelExp;
      progression.level++;
      levelsGained++;
      progression.nextLevelExp = this.calculateNextLevelExp(progression.level);
    }

    // Award stat points for levels gained (1 point per level)
    const statPointsGained = levelsGained;
    progression.statPoints += statPointsGained;

    // Update stored progression
    this.characterProgressions.set(characterId, progression);

    // Record experience gain
    const experienceGain: ExperienceGain = {
      characterId,
      amount,
      source,
      timestamp: Date.now(),
      levelBefore: previousLevel,
      levelAfter: progression.level
    };
    this.experienceHistory.push(experienceGain);

    // Keep only last 1000 experience gains
    if (this.experienceHistory.length > 1000) {
      this.experienceHistory = this.experienceHistory.slice(-1000);
    }

    const response: AwardXPResponse = {
      previousLevel,
      newLevel: progression.level,
      previousExp: previousExp.toString(),
      newExp: (this.calculateTotalExpForLevel(progression.level) + progression.experience).toString(),
      nextLevelExp: progression.nextLevelExp.toString(),
      leveledUp: levelsGained > 0,
      statPointsGained,
      message: levelsGained > 0 
        ? `Gained ${amount} experience! Level up! You are now level ${progression.level}!`
        : `Gained ${amount} experience from ${source}.`
    };

    logger.info(`Character ${characterId} gained ${amount} XP from ${source}. Level: ${previousLevel} -> ${progression.level}`);
    
    return response;
  }

  /**
   * Allocate stat points
   */
  async allocateStatPoints(request: AllocateStatRequest): Promise<AllocateStatResponse> {
    const { characterId, stat, amount } = request;

    const progression = this.characterProgressions.get(characterId);
    if (!progression) {
      return {
        success: false,
        newStats: { strength: 0, agility: 0, intelligence: 0, stamina: 0 },
        remainingPoints: 0,
        message: "Character not found"
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        newStats: progression.allocatedStats,
        remainingPoints: progression.statPoints,
        message: "Amount must be positive"
      };
    }

    // Check if character has enough stat points
    if (progression.statPoints < amount) {
      return {
        success: false,
        newStats: progression.allocatedStats,
        remainingPoints: progression.statPoints,
        message: `Not enough stat points. Available: ${progression.statPoints}, Required: ${amount}`
      };
    }

    // Allocate stat points
    const previousValue = progression.allocatedStats[stat];
    progression.allocatedStats[stat] += amount;
    progression.statPoints -= amount;

    // Update stored progression
    this.characterProgressions.set(characterId, progression);

    // Record stat allocation
    const statAllocation: StatAllocation = {
      characterId,
      stat,
      amount,
      timestamp: Date.now(),
      pointsBefore: progression.statPoints + amount,
      pointsAfter: progression.statPoints
    };
    this.statHistory.push(statAllocation);

    // Keep only last 1000 stat allocations
    if (this.statHistory.length > 1000) {
      this.statHistory = this.statHistory.slice(-1000);
    }

    logger.info(`Character ${characterId} allocated ${amount} points to ${stat}. ${previousValue} -> ${progression.allocatedStats[stat]}`);

    return {
      success: true,
      newStats: { ...progression.allocatedStats },
      remainingPoints: progression.statPoints,
      message: `Allocated ${amount} points to ${stat}. ${stat} is now ${progression.allocatedStats[stat]}.`
    };
  }

  /**
   * Calculate character power score
   */
  async calculatePowerScore(characterId: string): Promise<PowerScoreResponse | null> {
    const progression = this.characterProgressions.get(characterId);
    if (!progression) return null;

    const levelPower = progression.level * 10;
    const statPower = (
      progression.allocatedStats.strength * 2 +
      progression.allocatedStats.agility * 2 +
      progression.allocatedStats.intelligence * 2 +
      progression.allocatedStats.stamina * 1.5
    );
    const equipmentPower = progression.level * 5; // Mock equipment contribution

    const powerScore = Math.floor(levelPower + statPower + equipmentPower);

    // Calculate percentile (mock calculation based on level and stats)
    const maxPossibleStats = progression.level * 4; // 1 point per level per stat
    const currentStatTotal = Object.values(progression.allocatedStats).reduce((sum, stat) => sum + stat, 0);
    const statEfficiency = Math.min(100, (currentStatTotal / Math.max(20, maxPossibleStats)) * 100);
    const percentile = Math.min(99, Math.floor(statEfficiency + (progression.level / 100) * 50));

    return {
      characterId,
      powerScore,
      breakdown: {
        levelContribution: levelPower,
        statContribution: Math.floor(statPower),
        equipmentContribution: equipmentPower
      },
      percentile
    };
  }

  /**
   * Get experience history for character
   */
  async getExperienceHistory(characterId: string, limit: number = 10): Promise<ExperienceGain[]> {
    return this.experienceHistory
      .filter(gain => gain.characterId === characterId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get stat allocation history for character
   */
  async getStatHistory(characterId: string, limit: number = 10): Promise<StatAllocation[]> {
    return this.statHistory
      .filter(allocation => allocation.characterId === characterId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Reset character stats (admin function)
   */
  async resetCharacterStats(characterId: string): Promise<boolean> {
    const progression = this.characterProgressions.get(characterId);
    if (!progression) return false;

    // Calculate total allocated points
    const allocatedPoints = Object.values(progression.allocatedStats).reduce((sum, stat) => sum + stat - 5, 0); // Base 5 per stat
    
    // Reset to base stats
    progression.allocatedStats = {
      strength: 5,
      agility: 5,
      intelligence: 5,
      stamina: 5
    };

    // Return allocated points
    progression.statPoints += allocatedPoints;

    this.characterProgressions.set(characterId, progression);
    logger.info(`Character ${characterId} stats reset. Returned ${allocatedPoints} stat points.`);

    return true;
  }

  /**
   * Get all character progressions (admin function)
   */
  async getAllProgressions(): Promise<CharacterProgression[]> {
    return Array.from(this.characterProgressions.values());
  }

  /**
   * Set character level (admin function)
   */
  async setCharacterLevel(characterId: string, targetLevel: number): Promise<boolean> {
    if (targetLevel < 1) return false;

    let progression = this.characterProgressions.get(characterId);
    if (!progression) {
      // Create new progression if not exists
      progression = {
        characterId,
        level: 1,
        experience: 0n,
        nextLevelExp: this.calculateNextLevelExp(1),
        statPoints: 0,
        allocatedStats: {
          strength: 5,
          agility: 5,
          intelligence: 5,
          stamina: 5
        }
      };
    }

    const previousLevel = progression.level;
    progression.level = targetLevel;
    progression.experience = 0n; // Reset experience within level
    progression.nextLevelExp = this.calculateNextLevelExp(targetLevel);
    
    // Award stat points for new levels
    const levelDifference = targetLevel - previousLevel;
    if (levelDifference > 0) {
      progression.statPoints += levelDifference;
    }

    this.characterProgressions.set(characterId, progression);
    logger.info(`Character ${characterId} level set to ${targetLevel} (was ${previousLevel})`);

    return true;
  }
}