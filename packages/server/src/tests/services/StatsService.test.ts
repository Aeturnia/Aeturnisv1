import { describe, it, expect, beforeEach } from 'vitest';
import { StatsService } from '../../services/StatsService';
import { Character, CharacterRace, CharacterClass, CharacterGender } from '../../types/character.types';

describe('AIPE (Aeturnis Infinite Progression Engine) - StatsService', () => {
  let baseCharacter: Character;

  beforeEach(() => {
    baseCharacter = {
      id: 'test-char-001',
      accountId: 'test-account-001',
      name: 'TestHero',
      race: CharacterRace.HUMAN,
      class: CharacterClass.WARRIOR,
      gender: CharacterGender.MALE,
      level: 1,
      experiencePoints: BigInt(0),
      prestigeLevel: 0,
      paragonPoints: BigInt(0),
      paragonDistribution: {
        strength: BigInt(0),
        dexterity: BigInt(0),
        intelligence: BigInt(0),
        wisdom: BigInt(0),
        constitution: BigInt(0),
        charisma: BigInt(0)
      },
      
      // Base stats (1-100 range)
      baseStrength: 15,
      baseDexterity: 12,
      baseIntelligence: 10,
      baseWisdom: 11,
      baseConstitution: 14,
      baseCharisma: 9,
      
      // Tier progression (0 to infinity)
      strengthTier: 0,
      dexterityTier: 0,
      intelligenceTier: 0,
      wisdomTier: 0,
      constitutionTier: 0,
      charismaTier: 0,
      
      // Bonus stats from equipment
      bonusStrength: 0,
      bonusDexterity: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusConstitution: 0,
      bonusCharisma: 0,
      
      // Resources
      currentHp: BigInt(100),
      currentMp: BigInt(50),
      currentStamina: BigInt(100),
      gold: 0,
      bankSlots: 10,
      
      // Metadata
      zone: 'tutorial_area',
      x: 0,
      y: 0,
      z: 0,
      isOnline: false,
      lastPlayed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
  });

  describe('1. Stat Progression Breakpoints Tests', () => {
    describe('Tier-Up Mechanics', () => {
      it('should calculate tier progression correctly when base stat reaches 100', () => {
        const character = { ...baseCharacter, baseStrength: 100 };
        const progress = StatsService.calculateStatTierProgress(100, 50);
        
        expect(progress.shouldUpgrade).toBe(true);
        expect(progress.newBase).toBe(10);
        expect(progress.newTier).toBe(1);
      });

      it('should not tier up if base stat < 100 even with high total points', () => {
        const progress = StatsService.calculateStatTierProgress(95, 150);
        
        expect(progress.shouldUpgrade).toBe(false);
        expect(progress.newBase).toBe(100); // Capped at 100
        expect(progress.newTier).toBe(0);
      });

      it('should handle multiple tier progressions correctly', () => {
        const character = { 
          ...baseCharacter, 
          baseStrength: 10,
          strengthTier: 5 // Already at tier 5
        };
        
        const stats = StatsService.calculateDerivedStats(character);
        // Tier 5 should provide 5 * 50 = 250 tier bonus
        expect(stats.effectiveStrength).toBeGreaterThan(200);
      });
    });

    describe('Paragon Point Mechanics', () => {
      it('should unlock paragon system at level 100', () => {
        const character = { ...baseCharacter, level: 100 };
        expect(StatsService.hasParagonUnlocked(character)).toBe(true);
      });

      it('should not unlock paragon before level 100', () => {
        const character = { ...baseCharacter, level: 99 };
        expect(StatsService.hasParagonUnlocked(character)).toBe(false);
      });

      it('should apply paragon points with logarithmic scaling', () => {
        const character = {
          ...baseCharacter,
          level: 100,
          paragonDistribution: { ...baseCharacter.paragonDistribution, strength: BigInt(1000) }
        };
        
        const stats = StatsService.calculateDerivedStats(character);
        // log10(1000 + 1) * 10 ≈ 30 bonus points
        expect(stats.effectiveStrength).toBeGreaterThan(baseCharacter.baseStrength + 25);
      });
    });

    describe('Prestige System', () => {
      it('should unlock prestige at level 500', () => {
        const character = { ...baseCharacter, level: 500, prestigeLevel: 0 };
        expect(StatsService.canPrestige(character)).toBe(true);
      });

      it('should apply prestige multiplier correctly', () => {
        const character = { ...baseCharacter, prestigeLevel: 5 };
        const stats = StatsService.calculateDerivedStats(character);
        
        // Prestige multiplier should be 1 + (5 * 0.1) = 1.5
        expect(stats.effectiveStrength).toBeGreaterThan(baseCharacter.baseStrength * 1.4);
      });
    });

    describe('Equipment Stat Changes', () => {
      it('should apply equipment bonuses with logarithmic scaling', () => {
        const character = { ...baseCharacter, bonusStrength: 1000 };
        const stats = StatsService.calculateDerivedStats(character);
        
        // log10(1000 + 1) * 20 ≈ 60 bonus points
        expect(stats.effectiveStrength).toBeGreaterThan(baseCharacter.baseStrength + 50);
      });

      it('should handle zero equipment bonuses', () => {
        const stats = StatsService.calculateDerivedStats(baseCharacter);
        expect(stats.effectiveStrength).toBeGreaterThan(0);
      });
    });
  });

  describe('2. Extreme Value Simulation', () => {
    describe('Tier 50+ Simulation', () => {
      it('should handle extremely high tier values (Tier 50)', () => {
        const character = {
          ...baseCharacter,
          baseStrength: 10,
          strengthTier: 50,
          level: 1000
        };
        
        const stats = StatsService.calculateDerivedStats(character);
        // Tier 50 should provide 50 * 50 = 2500 tier bonus
        expect(stats.effectiveStrength).toBeGreaterThan(2400);
        expect(Number.isFinite(stats.effectiveStrength)).toBe(true);
      });
    });

    describe('Paragon 100K+ Simulation', () => {
      it('should handle massive paragon point allocation (100K)', () => {
        const character = {
          ...baseCharacter,
          level: 1000,
          paragonDistribution: { 
            ...baseCharacter.paragonDistribution, 
            strength: BigInt(100000) 
          }
        };
        
        const stats = StatsService.calculateDerivedStats(character);
        // log10(100000 + 1) * 10 ≈ 50 bonus points
        expect(stats.effectiveStrength).toBeGreaterThan(50);
        expect(Number.isFinite(stats.effectiveStrength)).toBe(true);
      });
    });

    describe('Prestige 1K+ Simulation', () => {
      it('should handle extreme prestige levels (1000)', () => {
        const character = { ...baseCharacter, prestigeLevel: 1000 };
        const stats = StatsService.calculateDerivedStats(character);
        
        // Prestige multiplier: 1 + (1000 * 0.1) = 101
        expect(stats.effectiveStrength).toBeGreaterThan(baseCharacter.baseStrength * 50);
        expect(Number.isFinite(stats.effectiveStrength)).toBe(true);
      });
    });

    describe('Extreme Value Soft Cap', () => {
      it('should apply soft cap for values exceeding 1000', () => {
        const character = {
          ...baseCharacter,
          baseStrength: 100,
          strengthTier: 100, // 100 * 50 = 5000 tier bonus
          prestigeLevel: 50   // 6x multiplier
        };
        
        const stats = StatsService.calculateDerivedStats(character);
        // Should trigger soft cap logarithmic scaling
        expect(stats.effectiveStrength).toBeGreaterThan(1000);
        expect(stats.effectiveStrength).toBeLessThan(10000); // Reasonable upper bound
      });
    });

    describe('BigInt Enforcement', () => {
      it('should handle BigInt values for resource pools', () => {
        const character = {
          ...baseCharacter,
          level: 1000,
          baseConstitution: 100,
          constitutionTier: 50,
          prestigeLevel: 10
        };
        
        const stats = StatsService.calculateDerivedStats(character);
        expect(typeof stats.maxHp).toBe('bigint');
        expect(typeof stats.maxMp).toBe('bigint');
        expect(typeof stats.maxStamina).toBe('bigint');
        expect(stats.maxHp > BigInt(0)).toBe(true);
      });
    });
  });

  describe('3. Race and Class Scaling', () => {
    it('should apply race modifiers correctly', () => {
      const elfWarrior = {
        ...baseCharacter,
        race: CharacterRace.ELF // +2 DEX, +1 INT, -1 CON
      };
      
      const baseStats = StatsService.calculateTotalBaseStats(elfWarrior);
      expect(baseStats.dexterity).toBe(baseCharacter.baseDexterity + 2);
      expect(baseStats.intelligence).toBe(baseCharacter.baseIntelligence + 1);
      expect(baseStats.constitution).toBe(baseCharacter.baseConstitution - 1);
    });

    it('should apply class scaling correctly', () => {
      const mageStats = StatsService.calculateDerivedStats({
        ...baseCharacter,
        class: CharacterClass.MAGE
      });
      
      const warriorStats = StatsService.calculateDerivedStats({
        ...baseCharacter,
        class: CharacterClass.WARRIOR
      });
      
      // Mages should have higher intelligence effectiveness
      expect(mageStats.effectiveIntelligence).toBeGreaterThan(warriorStats.effectiveIntelligence);
      // Warriors should have higher strength effectiveness
      expect(warriorStats.effectiveStrength).toBeGreaterThan(mageStats.effectiveStrength);
    });
  });

  describe('4. Derived Stats Validation', () => {
    it('should calculate all derived stats from effective stats only', () => {
      const character = {
        ...baseCharacter,
        baseStrength: 50,
        strengthTier: 2,
        bonusStrength: 100,
        prestigeLevel: 2
      };
      
      const stats = StatsService.calculateDerivedStats(character);
      
      // Verify derived stats are calculated from effective stats
      expect(stats.physicalDamage).toBeGreaterThan(50 * 2); // Should be much higher due to tiers/bonuses
      expect(stats.physicalDefense).toBeGreaterThan(0);
      expect(stats.criticalChance).toBeGreaterThan(5); // Base 5%
      expect(stats.dodgeChance).toBeGreaterThan(0);
    });

    it('should enforce percentage caps correctly', () => {
      const character = {
        ...baseCharacter,
        baseDexterity: 100,
        dexterityTier: 50,
        level: 1000
      };
      
      const stats = StatsService.calculateDerivedStats(character);
      
      // Critical chance capped at 75%
      expect(stats.criticalChance).toBeLessThanOrEqual(75);
      // Dodge chance capped at 50%
      expect(stats.dodgeChance).toBeLessThanOrEqual(50);
    });
  });

  describe('5. Negative Value Clamping', () => {
    it('should clamp negative base stats to positive values', () => {
      const character = {
        ...baseCharacter,
        baseStrength: -10 // Should be clamped
      };
      
      const stats = StatsService.calculateDerivedStats(character);
      expect(stats.effectiveStrength).toBeGreaterThan(0);
    });

    it('should ensure resource pools are always ≥1', () => {
      const character = {
        ...baseCharacter,
        baseConstitution: 1,
        baseIntelligence: 1,
        level: 1
      };
      
      const stats = StatsService.calculateDerivedStats(character);
      expect(stats.maxHp >= BigInt(1)).toBe(true);
      expect(stats.maxMp >= BigInt(1)).toBe(true);
      expect(stats.maxStamina >= BigInt(1)).toBe(true);
    });
  });

  describe('6. Formula Transparency', () => {
    it('should provide effective stat breakdown for UI transparency', () => {
      const character = {
        ...baseCharacter,
        baseStrength: 50,
        strengthTier: 2,
        bonusStrength: 100,
        paragonDistribution: { 
          ...baseCharacter.paragonDistribution, 
          strength: BigInt(1000) 
        },
        prestigeLevel: 1,
        level: 100
      };
      
      const stats = StatsService.calculateDerivedStats(character);
      
      // This test documents the formula components for UI display
      const expectedComponents = {
        baseStat: Math.min(50, 100), // Soft capped
        tierBonus: 2 * 50, // 100 points
        equipmentBonus: Math.log10(100 + 1) * 20, // ~40 points
        paragonBonus: Math.log10(1000 + 1) * 10, // ~30 points
        classScaling: 1.5, // Warrior STR scaling
        prestigeMultiplier: 1.1 // 10% bonus
      };
      
      expect(stats.effectiveStrength).toBeGreaterThan(expectedComponents.baseStat);
    });
  });
});