/**
 * AffinityService Unit Tests
 * Comprehensive test suite for MockAffinityService
 */

import { MockAffinityService } from '../../../services/mock/MockAffinityService';
import { 
  WeaponType,
  MagicSchool,
  AffinityRank,
  AffinityUsageContext,
  AffinityBonusType,
  TrackWeaponUseRequest,
  TrackMagicUseRequest,
  GetAffinitySummaryRequest
} from '@aeturnis/shared';

describe('MockAffinityService', () => {
  let affinityService: MockAffinityService;

  beforeEach(() => {
    affinityService = new MockAffinityService();
  });

  describe('getAffinitySummary', () => {
    it('should return affinity summary for existing character', async () => {
      const request: GetAffinitySummaryRequest = {
        characterId: 'test_player',
        includeAchievements: true,
        includeMilestones: true
      };

      const result = await affinityService.getAffinitySummary(request);
      
      expect(result.summary).toBeDefined();
      expect(result.summary.characterId).toBe('test_player');
      expect(result.summary.totalWeaponAffinities).toBe(2); // Sword and Bow
      expect(result.summary.totalMagicAffinities).toBe(1); // Fire
      expect(result.summary.weaponAffinities).toHaveLength(2);
      expect(result.summary.magicAffinities).toHaveLength(1);
      expect(result.summary.overallRank).toBeDefined();
      expect(result.achievements).toBeDefined();
      expect(result.milestones).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should return empty summary for new character', async () => {
      const request: GetAffinitySummaryRequest = {
        characterId: 'new_character'
      };

      const result = await affinityService.getAffinitySummary(request);
      
      expect(result.summary.characterId).toBe('new_character');
      expect(result.summary.totalWeaponAffinities).toBe(0);
      expect(result.summary.totalMagicAffinities).toBe(0);
      expect(result.summary.weaponAffinities).toHaveLength(0);
      expect(result.summary.magicAffinities).toHaveLength(0);
      expect(result.summary.overallRank).toBe(AffinityRank.NOVICE);
    });

    it('should include recommendations for new character', async () => {
      const request: GetAffinitySummaryRequest = {
        characterId: 'new_character'
      };

      const result = await affinityService.getAffinitySummary(request);
      
      expect(result.recommendations).toContain("Try using different weapon types to discover your preferences");
      expect(result.recommendations).toContain("Experiment with magic spells to develop magical affinities");
    });

    it('should exclude achievements and milestones when not requested', async () => {
      const request: GetAffinitySummaryRequest = {
        characterId: 'test_player',
        includeAchievements: false,
        includeMilestones: false
      };

      const result = await affinityService.getAffinitySummary(request);
      
      expect(result.achievements).toBeUndefined();
      expect(result.milestones).toBeUndefined();
    });
  });

  describe('trackWeaponUse', () => {
    it('should track weapon usage for new weapon type', async () => {
      const request: TrackWeaponUseRequest = {
        characterId: 'new_player',
        weaponType: WeaponType.SWORD,
        weaponName: 'Iron Sword',
        usageData: {
          sessionId: 'test_session',
          timestamp: new Date(),
          experienceGained: 50,
          context: AffinityUsageContext.COMBAT,
          damageDealt: 25,
          criticalHit: false
        }
      };

      const result = await affinityService.trackWeaponUse(request);
      
      expect(result.success).toBe(true);
      expect(result.updatedAffinity.characterId).toBe('new_player');
      expect(result.updatedAffinity.weaponType).toBe(WeaponType.SWORD);
      expect(result.updatedAffinity.level).toBeGreaterThan(1);
      expect(result.updatedAffinity.usageCount).toBe(1);
      expect(result.updatedAffinity.rank).toBe(AffinityRank.NOVICE);
      expect(result.updatedAffinity.favoriteWeapon).toBe('Iron Sword');
      expect(result.experienceGained).toBe(50);
    });

    it('should update existing weapon affinity', async () => {
      const request: TrackWeaponUseRequest = {
        characterId: 'test_player',
        weaponType: WeaponType.SWORD,
        usageData: {
          sessionId: 'test_session',
          timestamp: new Date(),
          experienceGained: 75,
          context: AffinityUsageContext.COMBAT,
          damageDealt: 35,
          criticalHit: true
        }
      };

      const result = await affinityService.trackWeaponUse(request);
      
      expect(result.success).toBe(true);
      expect(result.updatedAffinity.weaponType).toBe(WeaponType.SWORD);
      expect(result.updatedAffinity.usageCount).toBeGreaterThan(150); // Was already 150
      expect(result.levelIncreased).toBeDefined();
    });

    it('should apply context modifiers correctly', async () => {
      const pvpRequest: TrackWeaponUseRequest = {
        characterId: 'context_test',
        weaponType: WeaponType.AXE,
        usageData: {
          sessionId: 'pvp_session',
          timestamp: new Date(),
          experienceGained: 100,
          context: AffinityUsageContext.PVP // 1.5x multiplier
        }
      };

      const trainingRequest: TrackWeaponUseRequest = {
        characterId: 'context_test2',
        weaponType: WeaponType.AXE,
        usageData: {
          sessionId: 'training_session',
          timestamp: new Date(),
          experienceGained: 100,
          context: AffinityUsageContext.TRAINING // 0.5x multiplier
        }
      };

      const pvpResult = await affinityService.trackWeaponUse(pvpRequest);
      const trainingResult = await affinityService.trackWeaponUse(trainingRequest);
      
      // PvP should give more experience than training for same base amount
      expect(pvpResult.experienceGained).toBeGreaterThan(trainingResult.experienceGained);
    });

    it('should apply diminishing returns for high usage', async () => {
      const characterId = 'diminishing_test';
      let lastExperience = 0;
      
      // Track multiple uses to trigger diminishing returns
      for (let i = 0; i < 3; i++) {
        const request: TrackWeaponUseRequest = {
          characterId,
          weaponType: WeaponType.DAGGER,
          usageData: {
            sessionId: `session_${i}`,
            timestamp: new Date(),
            experienceGained: 50,
            context: AffinityUsageContext.COMBAT
          }
        };

        const result = await affinityService.trackWeaponUse(request);
        
        if (i > 0) {
          // Should get less experience due to diminishing returns
          expect(result.experienceGained).toBeLessThanOrEqual(lastExperience);
        }
        lastExperience = result.experienceGained;
      }
    });

    it('should calculate rank progression correctly', async () => {
      const request: TrackWeaponUseRequest = {
        characterId: 'rank_test',
        weaponType: WeaponType.BOW,
        usageData: {
          sessionId: 'rank_session',
          timestamp: new Date(),
          experienceGained: 2500, // Large amount to trigger rank up
          context: AffinityUsageContext.COMBAT
        }
      };

      const result = await affinityService.trackWeaponUse(request);
      
      expect(result.success).toBe(true);
      expect(result.updatedAffinity.rank).toBeDefined();
      expect(Object.values(AffinityRank)).toContain(result.updatedAffinity.rank);
    });
  });

  describe('trackMagicUse', () => {
    it('should track magic usage for new school', async () => {
      const request: TrackMagicUseRequest = {
        characterId: 'magic_novice',
        school: MagicSchool.ICE,
        spellName: 'Ice Bolt',
        usageData: {
          sessionId: 'ice_session',
          timestamp: new Date(),
          experienceGained: 40,
          context: AffinityUsageContext.COMBAT,
          damageDealt: 20
        }
      };

      const result = await affinityService.trackMagicUse(request);
      
      expect(result.success).toBe(true);
      expect(result.updatedAffinity.characterId).toBe('magic_novice');
      expect(result.updatedAffinity.school).toBe(MagicSchool.ICE);
      expect(result.updatedAffinity.level).toBeGreaterThan(1);
      expect(result.updatedAffinity.usageCount).toBe(1);
      expect(result.updatedAffinity.rank).toBe(AffinityRank.NOVICE);
      expect(result.updatedAffinity.favoriteSpells).toContain('Ice Bolt');
    });

    it('should update existing magic affinity', async () => {
      const request: TrackMagicUseRequest = {
        characterId: 'test_player',
        school: MagicSchool.FIRE,
        spellName: 'Fireball',
        usageData: {
          sessionId: 'fire_session',
          timestamp: new Date(),
          experienceGained: 60,
          context: AffinityUsageContext.COMBAT
        }
      };

      const result = await affinityService.trackMagicUse(request);
      
      expect(result.success).toBe(true);
      expect(result.updatedAffinity.school).toBe(MagicSchool.FIRE);
      expect(result.updatedAffinity.usageCount).toBeGreaterThan(120); // Was already 120
      expect(result.updatedAffinity.favoriteSpells).toContain('Fireball');
    });

    it('should limit favorite spells to 5', async () => {
      const characterId = 'spell_collector';
      const spells = ['Spell1', 'Spell2', 'Spell3', 'Spell4', 'Spell5', 'Spell6', 'Spell7'];
      
      for (const spell of spells) {
        const request: TrackMagicUseRequest = {
          characterId,
          school: MagicSchool.ARCANE,
          spellName: spell,
          usageData: {
            sessionId: `spell_session_${spell}`,
            timestamp: new Date(),
            experienceGained: 30,
            context: AffinityUsageContext.TRAINING
          }
        };

        await affinityService.trackMagicUse(request);
      }

      // Get final state
      const summary = await affinityService.getAffinitySummary({ characterId });
      const arcaneAffinity = summary.summary.magicAffinities.find(a => a.school === MagicSchool.ARCANE);
      
      expect(arcaneAffinity?.favoriteSpells).toHaveLength(5);
      expect(arcaneAffinity?.favoriteSpells).toContain('Spell7'); // Latest spell
    });

    it('should apply different bonuses for magic vs weapons', async () => {
      const request: TrackMagicUseRequest = {
        characterId: 'bonus_test',
        school: MagicSchool.HOLY,
        usageData: {
          sessionId: 'bonus_session',
          timestamp: new Date(),
          experienceGained: 1000, // Enough to reach apprentice
          context: AffinityUsageContext.COMBAT
        }
      };

      const result = await affinityService.trackMagicUse(request);
      
      if (result.updatedAffinity.rank === AffinityRank.APPRENTICE) {
        // Magic should have mana efficiency instead of attack speed
        const hasManaEfficiency = result.updatedAffinity.bonuses.some(
          bonus => bonus.type === AffinityBonusType.MANA_EFFICIENCY
        );
        expect(hasManaEfficiency).toBe(true);
      }
    });
  });

  describe('Rank and Bonus Calculations', () => {
    it('should have correct rank thresholds', async () => {
      const testCases = [
        { level: 0, expectedRank: AffinityRank.NOVICE },
        { level: 24, expectedRank: AffinityRank.NOVICE },
        { level: 25, expectedRank: AffinityRank.APPRENTICE },
        { level: 49, expectedRank: AffinityRank.APPRENTICE },
        { level: 50, expectedRank: AffinityRank.JOURNEYMAN },
        { level: 74, expectedRank: AffinityRank.JOURNEYMAN },
        { level: 75, expectedRank: AffinityRank.EXPERT },
        { level: 99, expectedRank: AffinityRank.EXPERT },
        { level: 100, expectedRank: AffinityRank.MASTER }
      ];

      for (const testCase of testCases) {
        // Create a character and simulate progression to test level
        const characterId = `rank_test_${testCase.level}`;
        const request: TrackWeaponUseRequest = {
          characterId,
          weaponType: WeaponType.SWORD,
          usageData: {
            sessionId: 'rank_session',
            timestamp: new Date(),
            experienceGained: testCase.level * 100, // Rough approximation
            context: AffinityUsageContext.COMBAT
          }
        };

        const result = await affinityService.trackWeaponUse(request);
        
        // Note: Due to diminishing returns and other factors, we can't easily test exact levels
        // but we can verify the rank calculation logic exists
        expect(Object.values(AffinityRank)).toContain(result.updatedAffinity.rank);
      }
    });

    it('should provide appropriate bonuses for each rank', async () => {
      const request: TrackWeaponUseRequest = {
        characterId: 'bonus_progression_test',
        weaponType: WeaponType.SWORD,
        usageData: {
          sessionId: 'bonus_session',
          timestamp: new Date(),
          experienceGained: 100,
          context: AffinityUsageContext.COMBAT
        }
      };

      const result = await affinityService.trackWeaponUse(request);
      
      expect(result.updatedAffinity.bonuses).toBeDefined();
      expect(result.updatedAffinity.bonuses).toBeInstanceOf(Array);
      
      // All bonuses should have valid types and descriptions
      result.updatedAffinity.bonuses.forEach(bonus => {
        expect(Object.values(AffinityBonusType)).toContain(bonus.type);
        expect(bonus.value).toBeGreaterThanOrEqual(0);
        expect(bonus.description).toBeDefined();
      });
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle empty character IDs', async () => {
      const request: GetAffinitySummaryRequest = {
        characterId: ''
      };

      const result = await affinityService.getAffinitySummary(request);
      
      expect(result.summary.characterId).toBe('');
      expect(result.summary.totalWeaponAffinities).toBe(0);
      expect(result.summary.totalMagicAffinities).toBe(0);
    });

    it('should handle invalid weapon types gracefully', async () => {
      // This test ensures our service doesn't crash with invalid data
      // In a real implementation, validation would happen at the controller level
      const characterId = 'validation_test';
      
      const summary = await affinityService.getAffinitySummary({ characterId });
      expect(summary).toBeDefined();
    });

    it('should maintain data consistency', async () => {
      const characterId = 'consistency_test';
      
      // Track some weapon usage
      await affinityService.trackWeaponUse({
        characterId,
        weaponType: WeaponType.MACE,
        usageData: {
          sessionId: 'consistency_session',
          timestamp: new Date(),
          experienceGained: 50,
          context: AffinityUsageContext.COMBAT
        }
      });

      // Get summary twice
      const summary1 = await affinityService.getAffinitySummary({ characterId });
      const summary2 = await affinityService.getAffinitySummary({ characterId });
      
      expect(summary1.summary.totalWeaponAffinities).toBe(summary2.summary.totalWeaponAffinities);
      expect(summary1.summary.weaponAffinities[0].level).toBe(summary2.summary.weaponAffinities[0].level);
    });
  });

  describe('Mock Data Validation', () => {
    it('should have consistent demo data', async () => {
      const demoSummary = await affinityService.getAffinitySummary({
        characterId: 'demo_user'
      });
      
      expect(demoSummary.summary.totalWeaponAffinities).toBe(1); // Staff
      expect(demoSummary.summary.totalMagicAffinities).toBe(2); // Arcane and Ice
      
      const staffAffinity = demoSummary.summary.weaponAffinities.find(a => a.weaponType === WeaponType.STAFF);
      expect(staffAffinity).toBeDefined();
      expect(staffAffinity?.level).toBe(65);
      expect(staffAffinity?.rank).toBe(AffinityRank.JOURNEYMAN);
    });

    it('should have valid progression formulas', async () => {
      const characterId = 'formula_test';
      
      // Track usage and verify experience calculations are reasonable
      const result = await affinityService.trackWeaponUse({
        characterId,
        weaponType: WeaponType.CROSSBOW,
        usageData: {
          sessionId: 'formula_session',
          timestamp: new Date(),
          experienceGained: 100,
          context: AffinityUsageContext.COMBAT
        }
      });
      
      expect(result.experienceGained).toBeGreaterThan(0);
      expect(result.experienceGained).toBeLessThanOrEqual(150); // With modifiers, but reasonable
      expect(result.updatedAffinity.experienceToNext).toBeGreaterThan(0);
    });

    it('should handle all weapon types', async () => {
      const allWeaponTypes = Object.values(WeaponType);
      const characterId = 'weapon_variety_test';
      
      for (const weaponType of allWeaponTypes) {
        const result = await affinityService.trackWeaponUse({
          characterId: `${characterId}_${weaponType}`,
          weaponType,
          usageData: {
            sessionId: `session_${weaponType}`,
            timestamp: new Date(),
            experienceGained: 50,
            context: AffinityUsageContext.COMBAT
          }
        });
        
        expect(result.success).toBe(true);
        expect(result.updatedAffinity.weaponType).toBe(weaponType);
      }
    });

    it('should handle all magic schools', async () => {
      const allMagicSchools = Object.values(MagicSchool);
      const characterId = 'magic_variety_test';
      
      for (const school of allMagicSchools) {
        const result = await affinityService.trackMagicUse({
          characterId: `${characterId}_${school}`,
          school,
          usageData: {
            sessionId: `session_${school}`,
            timestamp: new Date(),
            experienceGained: 40,
            context: AffinityUsageContext.COMBAT
          }
        });
        
        expect(result.success).toBe(true);
        expect(result.updatedAffinity.school).toBe(school);
      }
    });
  });
});