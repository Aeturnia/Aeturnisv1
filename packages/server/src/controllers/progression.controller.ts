/**
 * Progression Controller
 * Handles HTTP requests for character experience, leveling, and stat allocation
 */

import { Request, Response } from 'express';
import { 
  AwardXPRequest, 
  AwardXPResponse, 
  AllocateStatRequest, 
  AllocateStatResponse, 
  PowerScoreResponse,
  CharacterProgression
} from '@aeturnis/shared/types/progression.types';
import logger from '../utils/logger';

// Mock character progressions for testing
const mockProgressions: Record<string, CharacterProgression> = {
  "char_001": {
    characterId: "char_001",
    level: 5,
    experience: 2500n,
    nextLevelExp: 575n, // Level 6 requires 575 exp
    statPoints: 2,
    allocatedStats: {
      strength: 8,
      agility: 6,
      intelligence: 5,
      stamina: 6
    }
  },
  "test_player": {
    characterId: "test_player",
    level: 1,
    experience: 0n,
    nextLevelExp: 115n, // Level 2 requires 115 exp
    statPoints: 0,
    allocatedStats: {
      strength: 5,
      agility: 5,
      intelligence: 5,
      stamina: 5
    }
  },
  "high_level_test": {
    characterId: "high_level_test",
    level: 25,
    experience: 156250n,
    nextLevelExp: 2875n,
    statPoints: 15,
    allocatedStats: {
      strength: 20,
      agility: 15,
      intelligence: 12,
      stamina: 18
    }
  }
};

/**
 * Calculate experience required for next level
 * Formula: baseExp * level * growthFactor / 100
 */
function calculateNextLevelExp(level: number): bigint {
  const baseExp = 100n;
  const growthFactor = 115n; // 15% increase per level
  return baseExp * BigInt(level) * growthFactor / 100n;
}

/**
 * Award experience to character
 * POST /api/v1/progression/award-xp
 */
export const awardExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId, amount, source }: AwardXPRequest = req.body;

    // Validate request
    if (!characterId || !source) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Character ID and source are required'
      });
      return;
    }

    // Parse amount (handle both string and number input)
    let expAmount: bigint;
    try {
      expAmount = typeof amount === 'string' ? BigInt(amount) : BigInt(amount);
      if (expAmount <= 0n) {
        throw new Error('Amount must be positive');
      }
    } catch (error) {
      res.status(400).json({
        error: 'Invalid experience amount',
        message: 'Experience amount must be a positive number'
      });
      return;
    }

    // Get or create character progression
    let progression = mockProgressions[characterId];
    if (!progression) {
      progression = {
        characterId,
        level: 1,
        experience: 0n,
        nextLevelExp: calculateNextLevelExp(1),
        statPoints: 0,
        allocatedStats: {
          strength: 5,
          agility: 5,
          intelligence: 5,
          stamina: 5
        }
      };
      mockProgressions[characterId] = progression;
    }

    const previousLevel = progression.level;
    const previousExp = progression.experience;
    
    // Add experience
    progression.experience += expAmount;
    
    // Check for level ups
    let levelsGained = 0;
    while (progression.experience >= progression.nextLevelExp) {
      progression.experience -= progression.nextLevelExp;
      progression.level++;
      levelsGained++;
      progression.nextLevelExp = calculateNextLevelExp(progression.level);
    }

    // Award stat points for levels gained
    const statPointsGained = levelsGained;
    progression.statPoints += statPointsGained;

    // Calculate total experience for response
    function calculateTotalExpForLevel(targetLevel: number): bigint {
      let totalExp = 0n;
      for (let level = 1; level < targetLevel; level++) {
        totalExp += calculateNextLevelExp(level);
      }
      return totalExp;
    }

    const response: AwardXPResponse = {
      previousLevel,
      newLevel: progression.level,
      previousExp: previousExp.toString(),
      newExp: (calculateTotalExpForLevel(progression.level) + progression.experience).toString(),
      nextLevelExp: progression.nextLevelExp.toString(),
      leveledUp: levelsGained > 0,
      statPointsGained,
      message: levelsGained > 0 
        ? `Gained ${expAmount} experience! Level up! You are now level ${progression.level}!`
        : `Gained ${expAmount} experience from ${source}.`
    };

    res.status(200).json(response);
    logger.info(`Character ${characterId} gained ${expAmount} XP from ${source}. Level: ${previousLevel} -> ${progression.level}`);

  } catch (error) {
    logger.error('Error awarding experience:', error);
    res.status(500).json({
      error: 'Failed to award experience',
      message: 'An error occurred while awarding experience'
    });
  }
};

/**
 * Allocate stat points
 * POST /api/v1/progression/allocate-stat
 */
export const allocateStatPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId, stat, amount }: AllocateStatRequest = req.body;

    // Validate request
    if (!characterId || !stat || !amount) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Character ID, stat, and amount are required'
      });
      return;
    }

    const validStats = ['strength', 'agility', 'intelligence', 'stamina'];
    if (!validStats.includes(stat)) {
      res.status(400).json({
        error: 'Invalid stat',
        message: 'Stat must be one of: strength, agility, intelligence, stamina'
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be positive'
      });
      return;
    }

    const progression = mockProgressions[characterId];
    if (!progression) {
      res.status(404).json({
        error: 'Character not found',
        message: `Character '${characterId}' not found`
      });
      return;
    }

    // Check if character has enough stat points
    if (progression.statPoints < amount) {
      res.status(400).json({
        error: 'Insufficient stat points',
        message: `Not enough stat points. Available: ${progression.statPoints}, Required: ${amount}`
      });
      return;
    }

    // Allocate stat points
    const previousValue = progression.allocatedStats[stat];
    progression.allocatedStats[stat] += amount;
    progression.statPoints -= amount;

    const response: AllocateStatResponse = {
      success: true,
      newStats: { ...progression.allocatedStats },
      remainingPoints: progression.statPoints,
      message: `Allocated ${amount} points to ${stat}. ${stat} is now ${progression.allocatedStats[stat]}.`
    };

    res.status(200).json(response);
    logger.info(`Character ${characterId} allocated ${amount} points to ${stat}. ${previousValue} -> ${progression.allocatedStats[stat]}`);

  } catch (error) {
    logger.error('Error allocating stat points:', error);
    res.status(500).json({
      error: 'Failed to allocate stat points',
      message: 'An error occurred while allocating stat points'
    });
  }
};

/**
 * Get character power score
 * GET /api/v1/progression/power-score/:characterId
 */
export const getPowerScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    if (!characterId) {
      res.status(400).json({
        error: 'Character ID required',
        message: 'Character ID parameter is required'
      });
      return;
    }

    const progression = mockProgressions[characterId];
    if (!progression) {
      res.status(404).json({
        error: 'Character not found',
        message: `Character '${characterId}' not found`
      });
      return;
    }

    // Calculate power score
    const levelPower = progression.level * 10;
    const statPower = (
      progression.allocatedStats.strength * 2 +
      progression.allocatedStats.agility * 2 +
      progression.allocatedStats.intelligence * 2 +
      progression.allocatedStats.stamina * 1.5
    );
    const equipmentPower = progression.level * 5; // Mock equipment contribution

    const powerScore = Math.floor(levelPower + statPower + equipmentPower);

    // Calculate percentile (mock calculation)
    const maxPossibleStats = progression.level * 4; // 1 point per level per stat
    const currentStatTotal = Object.values(progression.allocatedStats).reduce((sum, stat) => sum + stat, 0);
    const statEfficiency = Math.min(100, (currentStatTotal / Math.max(20, maxPossibleStats)) * 100);
    const percentile = Math.min(99, Math.floor(statEfficiency + (progression.level / 100) * 50));

    const response: PowerScoreResponse = {
      characterId,
      powerScore,
      breakdown: {
        levelContribution: levelPower,
        statContribution: Math.floor(statPower),
        equipmentContribution: equipmentPower
      },
      percentile
    };

    res.status(200).json(response);
    logger.info(`Power score calculated for ${characterId}: ${powerScore} (${percentile}th percentile)`);

  } catch (error) {
    logger.error('Error calculating power score:', error);
    res.status(500).json({
      error: 'Failed to calculate power score',
      message: 'An error occurred while calculating power score'
    });
  }
};

/**
 * Get character progression
 * GET /api/v1/progression/:characterId
 */
export const getCharacterProgression = async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    if (!characterId) {
      res.status(400).json({
        error: 'Character ID required',
        message: 'Character ID parameter is required'
      });
      return;
    }

    const progression = mockProgressions[characterId];
    if (!progression) {
      res.status(404).json({
        error: 'Character not found',
        message: `Character '${characterId}' not found`
      });
      return;
    }

    // Convert BigInt values to strings for JSON response
    const response = {
      ...progression,
      experience: progression.experience.toString(),
      nextLevelExp: progression.nextLevelExp.toString()
    };

    res.status(200).json(response);
    logger.info(`Retrieved progression for character ${characterId}: Level ${progression.level}`);

  } catch (error) {
    logger.error('Error getting character progression:', error);
    res.status(500).json({
      error: 'Failed to get character progression',
      message: 'An error occurred while retrieving character progression'
    });
  }
};

/**
 * Get progression test data
 * GET /api/v1/progression/test
 */
export const getProgressionTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const testData = {
      message: "Progression Service Test - Mock Data",
      timestamp: Date.now(),
      features: {
        bigIntSupport: true,
        infiniteProgression: true,
        statAllocation: true,
        powerScoring: true
      },
      sampleProgression: {
        characterId: "test_character",
        level: 5,
        experience: "2500",
        nextLevelExp: "575",
        statPoints: 2,
        allocatedStats: {
          strength: 8,
          agility: 6,
          intelligence: 5,
          stamina: 6
        }
      },
      experienceFormula: {
        description: "baseExp * level * growthFactor / 100",
        baseExp: 100,
        growthFactor: 115,
        example: "Level 5 requires 575 experience points"
      },
      powerScoreFormula: {
        description: "Level * 10 + (Stats weighted) + Equipment * 5",
        weights: {
          strength: 2,
          agility: 2,
          intelligence: 2,
          stamina: 1.5
        }
      }
    };

    res.status(200).json(testData);
    logger.info('Progression service test data retrieved');

  } catch (error) {
    logger.error('Error in progression test endpoint:', error);
    res.status(500).json({
      error: 'Progression test failed',
      message: 'An error occurred during progression service testing'
    });
  }
};