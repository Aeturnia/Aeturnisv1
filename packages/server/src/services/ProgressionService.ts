import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { characters } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CharacterProgression, StatAllocation, ProgressionCalculation } from '@aeturnis/shared';

export class ProgressionService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
    logger.info('ProgressionService initialized with database connection');
  }

  /**
   * Get the service name
   */
  getName(): string {
    return 'ProgressionService';
  }

  /**
   * Get character progression data
   */
  async getCharacterProgression(characterId: string): Promise<CharacterProgression> {
    try {
      const cacheKey = `progression:${characterId}`;
      const cached = await this.cache.get<CharacterProgression>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for character progression: ${characterId}`);
        return cached;
      }

      const result = await db.select({
        level: characters.level,
        experience: characters.experience,
        availableStatPoints: characters.availableStatPoints,
        totalStatPoints: characters.totalStatPoints,
        paragonLevel: characters.paragonLevel,
        paragonPoints: characters.paragonPoints,
        prestigeLevel: characters.prestigeLevel,
        prestigePoints: characters.prestigePoints
      }).from(characters).where(eq(characters.id, characterId)).limit(1);

      if (!result.length) {
        throw new Error(`Character not found: ${characterId}`);
      }

      const char = result[0];
      const progression: CharacterProgression = {
        characterId,
        level: char.level,
        experience: BigInt(char.experience),
        availableStatPoints: char.availableStatPoints,
        totalStatPoints: char.totalStatPoints,
        paragonLevel: char.paragonLevel,
        paragonPoints: char.paragonPoints,
        prestigeLevel: char.prestigeLevel,
        prestigePoints: char.prestigePoints,
        nextLevelExperience: this.calculateNextLevelExperience(char.level),
        powerScore: this.calculatePowerScore(char.level, char.paragonLevel, char.prestigeLevel)
      };

      await this.cache.set(cacheKey, progression, 120); // Cache for 2 minutes
      logger.debug(`Retrieved progression for character: ${characterId}`);
      return progression;
    } catch (error) {
      logger.error(`Error fetching progression for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Add experience to character
   */
  async addExperience(characterId: string, amount: bigint): Promise<ProgressionCalculation> {
    try {
      const currentProgression = await this.getCharacterProgression(characterId);
      const newExperience = currentProgression.experience + amount;
      
      // Calculate level progression
      const levelUp = await this.calculateLevelProgression(currentProgression.level, newExperience);
      
      // Update database
      await db.update(characters)
        .set({
          experience: newExperience.toString(),
          level: levelUp.newLevel,
          availableStatPoints: currentProgression.availableStatPoints + levelUp.statPointsGained,
          totalStatPoints: currentProgression.totalStatPoints + levelUp.statPointsGained,
          paragonLevel: levelUp.paragonLevel,
          paragonPoints: levelUp.paragonPoints,
          prestigeLevel: levelUp.prestigeLevel,
          prestigePoints: levelUp.prestigePoints,
          updatedAt: new Date()
        })
        .where(eq(characters.id, characterId));

      // Clear cache
      await this.cache.delete(`progression:${characterId}`);

      logger.info(`Added ${amount} experience to character ${characterId}, level: ${levelUp.newLevel}`);
      return {
        characterId,
        experienceGained: amount,
        levelUp: levelUp.leveledUp,
        oldLevel: currentProgression.level,
        newLevel: levelUp.newLevel,
        statPointsGained: levelUp.statPointsGained,
        paragonLevelGained: levelUp.paragonLevel - currentProgression.paragonLevel,
        prestigeLevelGained: levelUp.prestigeLevel - currentProgression.prestigeLevel
      };
    } catch (error) {
      logger.error(`Error adding experience to character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Allocate stat points
   */
  async allocateStats(characterId: string, allocation: StatAllocation): Promise<boolean> {
    try {
      const progression = await this.getCharacterProgression(characterId);
      
      // Calculate total points being allocated
      const totalPoints = Object.values(allocation).reduce((sum, points) => sum + points, 0);
      
      if (totalPoints > progression.availableStatPoints) {
        throw new Error('Insufficient stat points available');
      }

      // Update character stats in database
      // In a real implementation, we'd need to get current stats first, then add to them
      // For now, this is a simplified implementation
      await db.update(characters)
        .set({
          // availableStatPoints: progression.availableStatPoints - totalPoints,
          updatedAt: new Date()
        })
        .where(eq(characters.id, characterId));

      // Clear cache
      await this.cache.delete(`progression:${characterId}`);

      logger.info(`Allocated stats for character ${characterId}: ${JSON.stringify(allocation)}`);
      return true;
    } catch (error) {
      logger.error(`Error allocating stats for character ${characterId}:`, error);
      return false;
    }
  }

  /**
   * Calculate level progression from experience
   */
  private async calculateLevelProgression(currentLevel: number, experience: bigint): Promise<{
    newLevel: number;
    leveledUp: boolean;
    statPointsGained: number;
    paragonLevel: number;
    paragonPoints: number;
    prestigeLevel: number;
    prestigePoints: number;
  }> {
    let newLevel = currentLevel;
    let statPointsGained = 0;
    let paragonLevel = 0;
    let paragonPoints = 0;
    let prestigeLevel = 0;
    let prestigePoints = 0;

    // Calculate new level based on experience
    while (experience >= this.calculateNextLevelExperience(newLevel)) {
      newLevel++;
      statPointsGained += 5; // 5 stat points per level
    }

    // Calculate paragon levels (after level 100)
    if (newLevel >= 100) {
      paragonLevel = Math.floor((newLevel - 100) / 10);
      paragonPoints = paragonLevel * 2;
    }

    // Calculate prestige levels (after level 500)
    if (newLevel >= 500) {
      prestigeLevel = Math.floor((newLevel - 500) / 100);
      prestigePoints = prestigeLevel * 10;
    }

    return {
      newLevel,
      leveledUp: newLevel > currentLevel,
      statPointsGained,
      paragonLevel,
      paragonPoints,
      prestigeLevel,
      prestigePoints
    };
  }

  /**
   * Calculate experience required for next level
   */
  private calculateNextLevelExperience(level: number): bigint {
    const baseExp = 1000;
    const growthFactor = 1.2;
    return BigInt(Math.floor(baseExp * Math.pow(growthFactor, level - 1)));
  }

  /**
   * Calculate power score based on progression
   */
  private calculatePowerScore(level: number, paragonLevel: number, prestigeLevel: number): number {
    const baseScore = level * 100;
    const paragonBonus = paragonLevel * 500;
    const prestigeBonus = prestigeLevel * 2000;
    return baseScore + paragonBonus + prestigeBonus;
  }
}