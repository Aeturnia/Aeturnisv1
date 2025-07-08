/**
 * Mock Affinity Service Implementation
 * Provides weapon and magic affinity tracking functionality
 */

import {
  WeaponType,
  MagicSchool,
  AffinityRank,
  WeaponAffinity,
  MagicAffinity,
  AffinitySummary,
  AffinityProgression,
  AffinityBonus,
  AffinityBonusType,
  AffinityUsageContext,
  AffinityMilestone,
  AffinityAchievement,
  AffinityRewardType,
  TrackWeaponUseRequest,
  TrackWeaponUseResponse,
  TrackMagicUseRequest,
  TrackMagicUseResponse,
  GetAffinitySummaryRequest,
  GetAffinitySummaryResponse,
  AffinityCalculationResult
} from '@aeturnis/shared';
import { logger } from '../../utils/logger';

export class MockAffinityService {
  private readonly weaponAffinities: Map<string, WeaponAffinity[]>;
  private readonly magicAffinities: Map<string, MagicAffinity[]>;
  private readonly progressionConfig: AffinityProgression;
  private readonly achievements: AffinityAchievement[];

  constructor() {
    this.weaponAffinities = new Map();
    this.magicAffinities = new Map();
    this.progressionConfig = this.createProgressionConfig();
    this.achievements = this.createAchievements();
    this.initializeMockData();
  }

  /**
   * Get affinity summary for character
   */
  async getAffinitySummary(request: GetAffinitySummaryRequest): Promise<GetAffinitySummaryResponse> {
    const { characterId, includeAchievements = false, includeMilestones = false } = request;
    
    const weaponAffinities = this.weaponAffinities.get(characterId) || [];
    const magicAffinities = this.magicAffinities.get(characterId) || [];
    
    const summary: AffinitySummary = {
      characterId,
      totalWeaponAffinities: weaponAffinities.length,
      totalMagicAffinities: magicAffinities.length,
      weaponAffinities,
      magicAffinities,
      overallRank: this.calculateOverallRank(weaponAffinities, magicAffinities),
      specializations: this.getSpecializations(weaponAffinities, magicAffinities),
      achievementCount: this.getUnlockedAchievements(characterId).length,
      lastUpdated: new Date()
    };

    const recommendations = this.getRecommendations(weaponAffinities, magicAffinities);

    logger.info(`Retrieved affinity summary for ${characterId}: ${weaponAffinities.length} weapons, ${magicAffinities.length} magic schools`);

    return {
      summary,
      achievements: includeAchievements ? this.getUnlockedAchievements(characterId) : undefined,
      milestones: includeMilestones ? this.getMilestones(weaponAffinities, magicAffinities) : undefined,
      recommendations
    };
  }

  /**
   * Track weapon usage and update affinity
   */
  async trackWeaponUse(request: TrackWeaponUseRequest): Promise<TrackWeaponUseResponse> {
    const { characterId, weaponType, usageData, weaponName } = request;
    
    let affinities = this.weaponAffinities.get(characterId) || [];
    let affinity = affinities.find(a => a.weaponType === weaponType);

    if (!affinity) {
      affinity = this.createInitialWeaponAffinity(characterId, weaponType, weaponName);
      affinities.push(affinity);
    }

    const calculationResult = this.calculateAffinityProgression(
      affinity.level,
      affinity.usageCount,
      usageData.experienceGained,
      usageData.context
    );

    // Update affinity
    affinity.level = calculationResult.newLevel;
    affinity.rank = calculationResult.newRank;
    affinity.usageCount += 1;
    affinity.bonuses = this.calculateBonuses(calculationResult.newRank, 'weapon');
    affinity.experienceToNext = this.calculateExperienceToNext(calculationResult.newLevel);
    affinity.lastUsed = new Date();

    if (weaponName && !affinity.favoriteWeapon) {
      affinity.favoriteWeapon = weaponName;
    }

    this.weaponAffinities.set(characterId, affinities);

    logger.info(`Tracked weapon usage for ${characterId}: ${weaponType} level ${affinity.level} (${affinity.rank})`);

    return {
      success: true,
      updatedAffinity: affinity,
      levelIncreased: calculationResult.newLevel > (calculationResult.newLevel - Math.floor(calculationResult.experienceGained / 100)),
      newRank: calculationResult.rankUp ? calculationResult.newRank : undefined,
      bonusesGained: calculationResult.bonusesGained,
      experienceGained: calculationResult.experienceGained,
      milestone: calculationResult.milestone
    };
  }

  /**
   * Track magic usage and update affinity
   */
  async trackMagicUse(request: TrackMagicUseRequest): Promise<TrackMagicUseResponse> {
    const { characterId, school, usageData, spellName } = request;
    
    let affinities = this.magicAffinities.get(characterId) || [];
    let affinity = affinities.find(a => a.school === school);

    if (!affinity) {
      affinity = this.createInitialMagicAffinity(characterId, school);
      affinities.push(affinity);
    }

    const calculationResult = this.calculateAffinityProgression(
      affinity.level,
      affinity.usageCount,
      usageData.experienceGained,
      usageData.context
    );

    // Update affinity
    affinity.level = calculationResult.newLevel;
    affinity.rank = calculationResult.newRank;
    affinity.usageCount += 1;
    affinity.bonuses = this.calculateBonuses(calculationResult.newRank, 'magic');
    affinity.experienceToNext = this.calculateExperienceToNext(calculationResult.newLevel);
    affinity.lastUsed = new Date();

    if (spellName && !affinity.favoriteSpells.includes(spellName)) {
      affinity.favoriteSpells.push(spellName);
      if (affinity.favoriteSpells.length > 5) {
        affinity.favoriteSpells = affinity.favoriteSpells.slice(-5); // Keep last 5
      }
    }

    this.magicAffinities.set(characterId, affinities);

    logger.info(`Tracked magic usage for ${characterId}: ${school} level ${affinity.level} (${affinity.rank})`);

    return {
      success: true,
      updatedAffinity: affinity,
      levelIncreased: calculationResult.newLevel > (calculationResult.newLevel - Math.floor(calculationResult.experienceGained / 100)),
      newRank: calculationResult.rankUp ? calculationResult.newRank : undefined,
      bonusesGained: calculationResult.bonusesGained,
      experienceGained: calculationResult.experienceGained,
      milestone: calculationResult.milestone
    };
  }

  private createProgressionConfig(): AffinityProgression {
    return {
      rankThresholds: {
        [AffinityRank.NOVICE]: 0,
        [AffinityRank.APPRENTICE]: 25,
        [AffinityRank.JOURNEYMAN]: 50,
        [AffinityRank.EXPERT]: 75,
        [AffinityRank.MASTER]: 100
      },
      experienceFormula: {
        baseExperience: 100,
        growthFactor: 1.5,
        diminishingReturns: 0.02
      },
      maxLevel: 100,
      rankBonuses: {
        [AffinityRank.NOVICE]: [
          { type: AffinityBonusType.DAMAGE, value: 0, description: 'No bonus' }
        ],
        [AffinityRank.APPRENTICE]: [
          { type: AffinityBonusType.DAMAGE, value: 5, description: '+5% damage' },
          { type: AffinityBonusType.ACCURACY, value: 3, description: '+3% accuracy' }
        ],
        [AffinityRank.JOURNEYMAN]: [
          { type: AffinityBonusType.DAMAGE, value: 10, description: '+10% damage' },
          { type: AffinityBonusType.ACCURACY, value: 5, description: '+5% accuracy' },
          { type: AffinityBonusType.CRITICAL_CHANCE, value: 2, description: '+2% critical chance' }
        ],
        [AffinityRank.EXPERT]: [
          { type: AffinityBonusType.DAMAGE, value: 20, description: '+20% damage' },
          { type: AffinityBonusType.ACCURACY, value: 10, description: '+10% accuracy' },
          { type: AffinityBonusType.CRITICAL_CHANCE, value: 5, description: '+5% critical chance' },
          { type: AffinityBonusType.ATTACK_SPEED, value: 8, description: '+8% attack speed' }
        ],
        [AffinityRank.MASTER]: [
          { type: AffinityBonusType.DAMAGE, value: 35, description: '+35% damage' },
          { type: AffinityBonusType.ACCURACY, value: 15, description: '+15% accuracy' },
          { type: AffinityBonusType.CRITICAL_CHANCE, value: 10, description: '+10% critical chance' },
          { type: AffinityBonusType.CRITICAL_DAMAGE, value: 25, description: '+25% critical damage' },
          { type: AffinityBonusType.ATTACK_SPEED, value: 15, description: '+15% attack speed' }
        ]
      }
    };
  }

  private createAchievements(): AffinityAchievement[] {
    return [
      {
        id: 'first_weapon_mastery',
        name: 'Weapon Master',
        description: 'Reach Master rank with any weapon type',
        requirements: ['weapon_level_100'],
        rewardType: AffinityRewardType.TITLE,
        rewardValue: 1,
        isUnlocked: false
      },
      {
        id: 'magic_scholar',
        name: 'Arcane Scholar',
        description: 'Reach Expert rank in 3 different magic schools',
        requirements: ['magic_expert_3'],
        rewardType: AffinityRewardType.SKILL_POINT,
        rewardValue: 5,
        isUnlocked: false
      },
      {
        id: 'balanced_warrior',
        name: 'Balanced Warrior',
        description: 'Reach Journeyman rank in both weapons and magic',
        requirements: ['weapon_journeyman_1', 'magic_journeyman_1'],
        rewardType: AffinityRewardType.EXPERIENCE,
        rewardValue: 1000,
        isUnlocked: false
      }
    ];
  }

  private createInitialWeaponAffinity(characterId: string, weaponType: WeaponType, weaponName?: string): WeaponAffinity {
    return {
      characterId,
      weaponType,
      level: 1,
      usageCount: 0,
      rank: AffinityRank.NOVICE,
      bonuses: this.calculateBonuses(AffinityRank.NOVICE, 'weapon'),
      experienceToNext: this.calculateExperienceToNext(1),
      lastUsed: new Date(),
      favoriteWeapon: weaponName
    };
  }

  private createInitialMagicAffinity(characterId: string, school: MagicSchool): MagicAffinity {
    return {
      characterId,
      school,
      level: 1,
      usageCount: 0,
      rank: AffinityRank.NOVICE,
      bonuses: this.calculateBonuses(AffinityRank.NOVICE, 'magic'),
      experienceToNext: this.calculateExperienceToNext(1),
      lastUsed: new Date(),
      favoriteSpells: []
    };
  }

  private calculateAffinityProgression(
    currentLevel: number,
    usageCount: number,
    experienceGained: number,
    context: AffinityUsageContext
  ): AffinityCalculationResult {
    // Apply context modifiers
    let modifiedExperience = experienceGained;
    switch (context) {
      case AffinityUsageContext.COMBAT:
        modifiedExperience *= 1.0; // Base experience
        break;
      case AffinityUsageContext.TRAINING:
        modifiedExperience *= 0.5; // Reduced experience for training
        break;
      case AffinityUsageContext.PVP:
        modifiedExperience *= 1.5; // Bonus for PvP
        break;
      case AffinityUsageContext.QUEST:
        modifiedExperience *= 1.2; // Bonus for quests
        break;
      default:
        modifiedExperience *= 0.8;
    }

    // Apply diminishing returns for high usage counts
    const diminishingFactor = Math.max(0.1, 1 - (usageCount * this.progressionConfig.experienceFormula.diminishingReturns));
    modifiedExperience *= diminishingFactor;

    // Calculate new level (simplified)
    const levelIncrease = Math.floor(modifiedExperience / 100);
    const newLevel = Math.min(this.progressionConfig.maxLevel, currentLevel + levelIncrease);
    
    // Determine new rank
    const newRank = this.determineRank(newLevel);
    const oldRank = this.determineRank(currentLevel);
    const rankUp = newRank !== oldRank;

    // Get bonuses gained
    const bonusesGained = rankUp ? this.progressionConfig.rankBonuses[newRank] : [];

    // Check for milestone
    const milestone = this.checkMilestone(newLevel, newRank);

    return {
      newLevel,
      newRank,
      experienceGained: modifiedExperience,
      bonusesGained,
      rankUp,
      milestone
    };
  }

  private determineRank(level: number): AffinityRank {
    if (level >= 100) return AffinityRank.MASTER;
    if (level >= 75) return AffinityRank.EXPERT;
    if (level >= 50) return AffinityRank.JOURNEYMAN;
    if (level >= 25) return AffinityRank.APPRENTICE;
    return AffinityRank.NOVICE;
  }

  private calculateBonuses(rank: AffinityRank, type: 'weapon' | 'magic'): AffinityBonus[] {
    const baseBonuses = this.progressionConfig.rankBonuses[rank] || [];
    
    if (type === 'magic') {
      // Add magic-specific bonuses
      return baseBonuses.map(bonus => {
        if (bonus.type === AffinityBonusType.ATTACK_SPEED) {
          return { ...bonus, type: AffinityBonusType.MANA_EFFICIENCY, description: bonus.description.replace('attack speed', 'mana efficiency') };
        }
        return bonus;
      });
    }
    
    return baseBonuses;
  }

  private calculateExperienceToNext(level: number): number {
    if (level >= this.progressionConfig.maxLevel) return 0;
    
    const { baseExperience, growthFactor } = this.progressionConfig.experienceFormula;
    return Math.floor(baseExperience * Math.pow(growthFactor, level / 10));
  }

  private calculateOverallRank(weaponAffinities: WeaponAffinity[], magicAffinities: MagicAffinity[]): AffinityRank {
    const allLevels = [
      ...weaponAffinities.map(a => a.level),
      ...magicAffinities.map(a => a.level)
    ];
    
    if (allLevels.length === 0) return AffinityRank.NOVICE;
    
    const averageLevel = allLevels.reduce((sum, level) => sum + level, 0) / allLevels.length;
    return this.determineRank(averageLevel);
  }

  private getSpecializations(weaponAffinities: WeaponAffinity[], magicAffinities: MagicAffinity[]): string[] {
    const specializations: string[] = [];
    
    // Weapon specializations
    weaponAffinities
      .filter(a => a.rank === AffinityRank.EXPERT || a.rank === AffinityRank.MASTER)
      .forEach(a => specializations.push(`${a.weaponType} ${a.rank}`));
    
    // Magic specializations
    magicAffinities
      .filter(a => a.rank === AffinityRank.EXPERT || a.rank === AffinityRank.MASTER)
      .forEach(a => specializations.push(`${a.school} ${a.rank}`));
    
    return specializations;
  }

  private getUnlockedAchievements(_characterId: string): AffinityAchievement[] {
    // In a real implementation, this would check actual conditions
    return this.achievements.filter(_achievement => {
      // Simple mock logic
      return Math.random() > 0.7; // 30% chance each achievement is unlocked
    });
  }

  private getMilestones(weaponAffinities: WeaponAffinity[], magicAffinities: MagicAffinity[]): AffinityMilestone[] {
    const milestones: AffinityMilestone[] = [];
    
    // Generate milestones for each affinity
    [...weaponAffinities, ...magicAffinities].forEach(affinity => {
      for (const level of [25, 50, 75, 100]) {
        const rank = this.determineRank(level);
        milestones.push({
          level,
          rank,
          bonuses: this.progressionConfig.rankBonuses[rank],
          title: `${rank} ${(affinity as WeaponAffinity).weaponType || (affinity as MagicAffinity).school}`,
          description: `Reached ${rank} rank in ${(affinity as WeaponAffinity).weaponType || (affinity as MagicAffinity).school}`,
          isReached: affinity.level >= level
        });
      }
    });
    
    return milestones;
  }

  private getRecommendations(weaponAffinities: WeaponAffinity[], magicAffinities: MagicAffinity[]): string[] {
    const recommendations: string[] = [];
    
    if (weaponAffinities.length === 0) {
      recommendations.push("Try using different weapon types to discover your preferences");
    }
    
    if (magicAffinities.length === 0) {
      recommendations.push("Experiment with magic spells to develop magical affinities");
    }
    
    if (weaponAffinities.length > 0 && magicAffinities.length > 0) {
      recommendations.push("Consider specializing in your highest affinity weapons or magic schools");
    }
    
    const lowLevel = [...weaponAffinities, ...magicAffinities].filter(a => a.level < 25);
    if (lowLevel.length > 3) {
      recommendations.push("Focus on fewer weapon/magic types to gain mastery faster");
    }
    
    return recommendations;
  }

  private checkMilestone(level: number, rank: AffinityRank): AffinityMilestone | undefined {
    const milestonelevels = [25, 50, 75, 100];
    if (milestonelevels.includes(level)) {
      return {
        level,
        rank,
        bonuses: this.progressionConfig.rankBonuses[rank],
        title: `${rank} Milestone`,
        description: `Reached ${rank} rank at level ${level}`,
        isReached: true
      };
    }
    return undefined;
  }

  private initializeMockData(): void {
    // Initialize mock data for test characters
    this.weaponAffinities.set('test_player', [
      {
        characterId: 'test_player',
        weaponType: WeaponType.SWORD,
        level: 32,
        usageCount: 150,
        rank: AffinityRank.APPRENTICE,
        bonuses: this.calculateBonuses(AffinityRank.APPRENTICE, 'weapon'),
        experienceToNext: 850,
        lastUsed: new Date(),
        favoriteWeapon: 'Iron Sword'
      },
      {
        characterId: 'test_player',
        weaponType: WeaponType.BOW,
        level: 18,
        usageCount: 75,
        rank: AffinityRank.NOVICE,
        bonuses: this.calculateBonuses(AffinityRank.NOVICE, 'weapon'),
        experienceToNext: 650,
        lastUsed: new Date(Date.now() - 86400000), // 1 day ago
        favoriteWeapon: 'Training Bow'
      }
    ]);

    this.magicAffinities.set('test_player', [
      {
        characterId: 'test_player',
        school: MagicSchool.FIRE,
        level: 28,
        usageCount: 120,
        rank: AffinityRank.APPRENTICE,
        bonuses: this.calculateBonuses(AffinityRank.APPRENTICE, 'magic'),
        experienceToNext: 720,
        lastUsed: new Date(),
        favoriteSpells: ['Fire Bolt', 'Flame Strike', 'Burning Hands']
      }
    ]);

    this.weaponAffinities.set('demo_user', [
      {
        characterId: 'demo_user',
        weaponType: WeaponType.STAFF,
        level: 65,
        usageCount: 400,
        rank: AffinityRank.JOURNEYMAN,
        bonuses: this.calculateBonuses(AffinityRank.JOURNEYMAN, 'weapon'),
        experienceToNext: 1200,
        lastUsed: new Date(),
        favoriteWeapon: 'Crystal Staff'
      }
    ]);

    this.magicAffinities.set('demo_user', [
      {
        characterId: 'demo_user',
        school: MagicSchool.ARCANE,
        level: 78,
        usageCount: 500,
        rank: AffinityRank.EXPERT,
        bonuses: this.calculateBonuses(AffinityRank.EXPERT, 'magic'),
        experienceToNext: 2200,
        lastUsed: new Date(),
        favoriteSpells: ['Arcane Missile', 'Mage Armor', 'Polymorph', 'Teleport']
      },
      {
        characterId: 'demo_user',
        school: MagicSchool.ICE,
        level: 45,
        usageCount: 200,
        rank: AffinityRank.JOURNEYMAN,
        bonuses: this.calculateBonuses(AffinityRank.JOURNEYMAN, 'magic'),
        experienceToNext: 950,
        lastUsed: new Date(Date.now() - 3600000), // 1 hour ago
        favoriteSpells: ['Ice Bolt', 'Frost Nova']
      }
    ]);

    logger.info('Initialized MockAffinityService with mock data');
  }
}