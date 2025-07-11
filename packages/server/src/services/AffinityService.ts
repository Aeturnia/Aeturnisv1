import { logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { db } from '../database/config';
import { characters } from '../database/schema';
import { eq } from 'drizzle-orm';
import {
  WeaponType,
  MagicSchool,
  AffinityRank,
  WeaponAffinity,
  MagicAffinity,
  AffinityProgress,
  AffinityBonuses,
  AffinityModifier,
  AffinityContext,
  UpdateAffinityRequest,
  UpdateAffinityResponse,
  AffinityRecommendation,
  AffinityProgressSummary
} from '@aeturnis/shared';

export class AffinityService {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
    logger.info('AffinityService initialized with database connection');
  }

  /**
   * Get the service name
   */
  getName(): string {
    return 'AffinityService';
  }

  /**
   * Get character's weapon affinities
   */
  async getWeaponAffinities(characterId: string): Promise<WeaponAffinity[]> {
    try {
      const cacheKey = `weapon_affinities:${characterId}`;
      const cached = await this.cache.get<WeaponAffinity[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for weapon affinities: ${characterId}`);
        return cached;
      }

      // In a real implementation, this would come from a character_weapon_affinities table
      // For now, return default affinities
      const defaultAffinities: WeaponAffinity[] = [
        {
          characterId,
          weaponType: WeaponType.SWORD,
          rank: AffinityRank.NOVICE,
          experience: 0,
          experienceToNext: 100,
          bonuses: this.calculateWeaponBonuses(WeaponType.SWORD, AffinityRank.NOVICE),
          lastUsed: new Date()
        },
        {
          characterId,
          weaponType: WeaponType.BOW,
          rank: AffinityRank.NOVICE,
          experience: 0,
          experienceToNext: 100,
          bonuses: this.calculateWeaponBonuses(WeaponType.BOW, AffinityRank.NOVICE),
          lastUsed: new Date()
        },
        {
          characterId,
          weaponType: WeaponType.STAFF,
          rank: AffinityRank.NOVICE,
          experience: 0,
          experienceToNext: 100,
          bonuses: this.calculateWeaponBonuses(WeaponType.STAFF, AffinityRank.NOVICE),
          lastUsed: new Date()
        }
      ];

      await this.cache.set(cacheKey, defaultAffinities, 300); // Cache for 5 minutes
      logger.debug(`Retrieved weapon affinities for character: ${characterId}`);
      return defaultAffinities;
    } catch (error) {
      logger.error(`Error fetching weapon affinities for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Get character's magic affinities
   */
  async getMagicAffinities(characterId: string): Promise<MagicAffinity[]> {
    try {
      const cacheKey = `magic_affinities:${characterId}`;
      const cached = await this.cache.get<MagicAffinity[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for magic affinities: ${characterId}`);
        return cached;
      }

      // In a real implementation, this would come from a character_magic_affinities table
      // For now, return default affinities
      const defaultAffinities: MagicAffinity[] = [
        {
          characterId,
          magicSchool: MagicSchool.FIRE,
          rank: AffinityRank.NOVICE,
          experience: 0,
          experienceToNext: 100,
          bonuses: this.calculateMagicBonuses(MagicSchool.FIRE, AffinityRank.NOVICE),
          lastUsed: new Date()
        },
        {
          characterId,
          magicSchool: MagicSchool.WATER,
          rank: AffinityRank.NOVICE,
          experience: 0,
          experienceToNext: 100,
          bonuses: this.calculateMagicBonuses(MagicSchool.WATER, AffinityRank.NOVICE),
          lastUsed: new Date()
        },
        {
          characterId,
          magicSchool: MagicSchool.EARTH,
          rank: AffinityRank.NOVICE,
          experience: 0,
          experienceToNext: 100,
          bonuses: this.calculateMagicBonuses(MagicSchool.EARTH, AffinityRank.NOVICE),
          lastUsed: new Date()
        }
      ];

      await this.cache.set(cacheKey, defaultAffinities, 300); // Cache for 5 minutes
      logger.debug(`Retrieved magic affinities for character: ${characterId}`);
      return defaultAffinities;
    } catch (error) {
      logger.error(`Error fetching magic affinities for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Update weapon affinity
   */
  async updateWeaponAffinity(characterId: string, request: UpdateAffinityRequest): Promise<UpdateAffinityResponse> {
    try {
      const currentAffinities = await this.getWeaponAffinities(characterId);
      const affinityToUpdate = currentAffinities.find(a => a.weaponType === request.weaponType);

      if (!affinityToUpdate) {
        return {
          success: false,
          message: `Weapon affinity not found for ${request.weaponType}`
        };
      }

      // Calculate experience gain with context modifiers
      const baseExperience = request.experienceGain || 10;
      const modifiedExperience = this.applyContextModifiers(baseExperience, request.context);
      
      // Update affinity
      affinityToUpdate.experience += modifiedExperience;
      affinityToUpdate.lastUsed = new Date();

      // Check for rank up
      const newRank = this.calculateNewRank(affinityToUpdate.experience);
      const rankUp = newRank > affinityToUpdate.rank;
      
      if (rankUp) {
        affinityToUpdate.rank = newRank;
        affinityToUpdate.bonuses = this.calculateWeaponBonuses(request.weaponType!, newRank);
      }

      affinityToUpdate.experienceToNext = this.calculateExperienceToNext(affinityToUpdate.experience, affinityToUpdate.rank);

      // Update cache
      const cacheKey = `weapon_affinities:${characterId}`;
      await this.cache.set(cacheKey, currentAffinities, 300);

      logger.info(`Updated weapon affinity for character ${characterId}: ${request.weaponType} +${modifiedExperience} exp`);
      return {
        success: true,
        experienceGained: modifiedExperience,
        newRank: rankUp ? newRank : undefined,
        message: rankUp ? `Rank up! New rank: ${this.getRankName(newRank)}` : "Experience gained"
      };
    } catch (error) {
      logger.error(`Error updating weapon affinity for character ${characterId}:`, error);
      return {
        success: false,
        message: "Failed to update weapon affinity"
      };
    }
  }

  /**
   * Update magic affinity
   */
  async updateMagicAffinity(characterId: string, request: UpdateAffinityRequest): Promise<UpdateAffinityResponse> {
    try {
      const currentAffinities = await this.getMagicAffinities(characterId);
      const affinityToUpdate = currentAffinities.find(a => a.magicSchool === request.magicSchool);

      if (!affinityToUpdate) {
        return {
          success: false,
          message: `Magic affinity not found for ${request.magicSchool}`
        };
      }

      // Calculate experience gain with context modifiers
      const baseExperience = request.experienceGain || 10;
      const modifiedExperience = this.applyContextModifiers(baseExperience, request.context);
      
      // Update affinity
      affinityToUpdate.experience += modifiedExperience;
      affinityToUpdate.lastUsed = new Date();

      // Check for rank up
      const newRank = this.calculateNewRank(affinityToUpdate.experience);
      const rankUp = newRank > affinityToUpdate.rank;
      
      if (rankUp) {
        affinityToUpdate.rank = newRank;
        affinityToUpdate.bonuses = this.calculateMagicBonuses(request.magicSchool!, newRank);
      }

      affinityToUpdate.experienceToNext = this.calculateExperienceToNext(affinityToUpdate.experience, affinityToUpdate.rank);

      // Update cache
      const cacheKey = `magic_affinities:${characterId}`;
      await this.cache.set(cacheKey, currentAffinities, 300);

      logger.info(`Updated magic affinity for character ${characterId}: ${request.magicSchool} +${modifiedExperience} exp`);
      return {
        success: true,
        experienceGained: modifiedExperience,
        newRank: rankUp ? newRank : undefined,
        message: rankUp ? `Rank up! New rank: ${this.getRankName(newRank)}` : "Experience gained"
      };
    } catch (error) {
      logger.error(`Error updating magic affinity for character ${characterId}:`, error);
      return {
        success: false,
        message: "Failed to update magic affinity"
      };
    }
  }

  /**
   * Get affinity recommendations
   */
  async getAffinityRecommendations(characterId: string): Promise<AffinityRecommendation[]> {
    try {
      const weaponAffinities = await this.getWeaponAffinities(characterId);
      const magicAffinities = await this.getMagicAffinities(characterId);

      const recommendations: AffinityRecommendation[] = [];

      // Find weapon recommendations
      const lowestWeaponAffinity = weaponAffinities.reduce((lowest, current) => 
        current.experience < lowest.experience ? current : lowest
      );
      
      recommendations.push({
        type: 'weapon',
        weaponType: lowestWeaponAffinity.weaponType,
        currentRank: lowestWeaponAffinity.rank,
        reason: `Your ${lowestWeaponAffinity.weaponType} affinity could use some practice`,
        priority: 'medium'
      });

      // Find magic recommendations
      const lowestMagicAffinity = magicAffinities.reduce((lowest, current) => 
        current.experience < lowest.experience ? current : lowest
      );
      
      recommendations.push({
        type: 'magic',
        magicSchool: lowestMagicAffinity.magicSchool,
        currentRank: lowestMagicAffinity.rank,
        reason: `Consider practicing ${lowestMagicAffinity.magicSchool} magic`,
        priority: 'low'
      });

      logger.debug(`Generated ${recommendations.length} affinity recommendations for character: ${characterId}`);
      return recommendations;
    } catch (error) {
      logger.error(`Error generating affinity recommendations for character ${characterId}:`, error);
      return [];
    }
  }

  /**
   * Get affinity progress summary
   */
  async getAffinityProgressSummary(characterId: string): Promise<AffinityProgressSummary> {
    try {
      const weaponAffinities = await this.getWeaponAffinities(characterId);
      const magicAffinities = await this.getMagicAffinities(characterId);

      const totalWeaponExperience = weaponAffinities.reduce((sum, affinity) => sum + affinity.experience, 0);
      const totalMagicExperience = magicAffinities.reduce((sum, affinity) => sum + affinity.experience, 0);

      const highestWeaponRank = Math.max(...weaponAffinities.map(a => a.rank));
      const highestMagicRank = Math.max(...magicAffinities.map(a => a.rank));

      const summary: AffinityProgressSummary = {
        characterId,
        totalWeaponExperience,
        totalMagicExperience,
        highestWeaponRank,
        highestMagicRank,
        weaponAffinityCount: weaponAffinities.length,
        magicAffinityCount: magicAffinities.length,
        recommendedFocus: highestWeaponRank > highestMagicRank ? 'weapon' : 'magic'
      };

      logger.debug(`Generated affinity progress summary for character: ${characterId}`);
      return summary;
    } catch (error) {
      logger.error(`Error generating affinity progress summary for character ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate weapon bonuses based on type and rank
   */
  private calculateWeaponBonuses(weaponType: WeaponType, rank: AffinityRank): AffinityBonuses {
    const baseBonus = rank * 2; // 2% per rank
    
    switch (weaponType) {
      case WeaponType.SWORD:
        return { damageBonus: baseBonus, accuracyBonus: baseBonus / 2 };
      case WeaponType.BOW:
        return { damageBonus: baseBonus, criticalChance: baseBonus / 4 };
      case WeaponType.STAFF:
        return { magicPower: baseBonus, manaEfficiency: baseBonus / 2 };
      default:
        return { damageBonus: baseBonus };
    }
  }

  /**
   * Calculate magic bonuses based on school and rank
   */
  private calculateMagicBonuses(magicSchool: MagicSchool, rank: AffinityRank): AffinityBonuses {
    const baseBonus = rank * 3; // 3% per rank for magic
    
    switch (magicSchool) {
      case MagicSchool.FIRE:
        return { magicPower: baseBonus, burnChance: baseBonus / 5 };
      case MagicSchool.WATER:
        return { magicPower: baseBonus, healingBonus: baseBonus / 3 };
      case MagicSchool.EARTH:
        return { magicPower: baseBonus, defenseBonus: baseBonus / 2 };
      default:
        return { magicPower: baseBonus };
    }
  }

  /**
   * Apply context modifiers to experience gain
   */
  private applyContextModifiers(baseExperience: number, context?: AffinityContext): number {
    if (!context) return baseExperience;

    let modifier = 1.0;

    // Combat context gives more experience
    if (context.inCombat) {
      modifier *= 1.5;
    }

    // Training context gives less experience
    if (context.isTraining) {
      modifier *= 0.8;
    }

    // Difficulty modifier
    if (context.difficulty) {
      switch (context.difficulty) {
        case 'easy':
          modifier *= 0.8;
          break;
        case 'hard':
          modifier *= 1.3;
          break;
        case 'extreme':
          modifier *= 1.5;
          break;
      }
    }

    return Math.floor(baseExperience * modifier);
  }

  /**
   * Calculate new rank based on experience
   */
  private calculateNewRank(experience: number): AffinityRank {
    if (experience >= 1000) return AffinityRank.GRANDMASTER;
    if (experience >= 500) return AffinityRank.MASTER;
    if (experience >= 250) return AffinityRank.EXPERT;
    if (experience >= 100) return AffinityRank.SKILLED;
    return AffinityRank.NOVICE;
  }

  /**
   * Calculate experience needed for next rank
   */
  private calculateExperienceToNext(currentExperience: number, currentRank: AffinityRank): number {
    const thresholds = [0, 100, 250, 500, 1000, 2000]; // NOVICE to GRANDMASTER+
    const nextThreshold = thresholds[currentRank + 1] || 2000;
    return Math.max(0, nextThreshold - currentExperience);
  }

  /**
   * Get rank name as string
   */
  private getRankName(rank: AffinityRank): string {
    const names = ['Novice', 'Skilled', 'Expert', 'Master', 'Grandmaster'];
    return names[rank] || 'Unknown';
  }
}