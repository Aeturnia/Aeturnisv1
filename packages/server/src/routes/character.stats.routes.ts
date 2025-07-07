import { Router } from 'express';
import { CharacterService } from '../services/CharacterService';
import { StatsService } from '../services/StatsService';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
  validateStatModification, 
  statModificationRateLimit, 
  preventStatRecursion,
  auditStatModification 
} from '../middleware/statSecurity.middleware';

const router = Router();
const characterService = new CharacterService();

/**
 * GET /api/v1/characters/:id/stats
 * Get character's effective stats breakdown
 */
router.get('/:id/stats', 
  authenticateToken,
  async (req, res) => {
    try {
      const characterId = req.params.id;
      const userId = (req as any).user.id;
      
      const character = await characterService.getCharacter(characterId);
      if (!character || character.accountId !== userId) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      const derivedStats = StatsService.calculateDerivedStats(character);
      
      return res.json({
        characterId,
        effectiveStats: {
          strength: derivedStats.effectiveStrength,
          dexterity: derivedStats.effectiveDexterity,
          intelligence: derivedStats.effectiveIntelligence,
          wisdom: derivedStats.effectiveWisdom,
          constitution: derivedStats.effectiveConstitution,
          charisma: derivedStats.effectiveCharisma
        },
        derivedStats: {
          physicalDamage: derivedStats.physicalDamage,
          magicalDamage: derivedStats.magicalDamage,
          physicalDefense: derivedStats.physicalDefense,
          magicalDefense: derivedStats.magicalDefense,
          criticalChance: derivedStats.criticalChance,
          criticalDamage: derivedStats.criticalDamage,
          dodgeChance: derivedStats.dodgeChance,
          blockChance: derivedStats.blockChance
        },
        resources: {
          maxHp: derivedStats.maxHp.toString(),
          maxMp: derivedStats.maxMp.toString(),
          maxStamina: derivedStats.maxStamina.toString()
        },
        progression: {
          level: character.level,
          prestigeLevel: character.prestigeLevel,
          paragonPoints: character.paragonPoints.toString(),
          canPrestige: StatsService.canPrestige(character),
          hasParagonUnlocked: StatsService.hasParagonUnlocked(character)
        }
      });
    } catch (error) {
      console.error('Error fetching character stats:', error);
      return res.status(500).json({ error: 'Failed to fetch character stats' });
    }
  }
);

/**
 * GET /api/v1/characters/:id/stats/breakdown/:stat
 * Get detailed breakdown of how a specific stat is calculated
 */
router.get('/:id/stats/breakdown/:stat',
  authenticateToken,
  async (req, res) => {
    try {
      const characterId = req.params.id;
      const statName = req.params.stat as keyof import('../../../../../packages/shared/src/types/character.types').BaseStats;
      const userId = (req as any).user.id;
      
      const character = await characterService.getCharacter(characterId);
      if (!character || character.accountId !== userId) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      if (!['strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma'].includes(statName)) {
        return res.status(400).json({ error: 'Invalid stat name' });
      }
      
      const breakdown = StatsService.getStatBreakdown(character, statName);
      return res.json(breakdown);
    } catch (error) {
      console.error('Error in stat breakdown:', error);
      return res.status(500).json({ error: 'Failed to get stat breakdown' });
    }
  });

/**
 * POST /api/v1/characters/:id/stats/update
 * Update character base stats (server-authoritative)
 */
router.post('/:id/stats/update',
  authenticateToken,
  statModificationRateLimit,
  preventStatRecursion,
  validateStatModification,
  auditStatModification,
  async (req, res) => {
    try {
      const characterId = req.params.id;
      const userId = (req as any).user.id;
      const statUpdates = (req as any).validatedStats;
      
      const character = await characterService.getCharacter(characterId);
      if (!character || character.accountId !== userId) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      const updatedCharacter = await characterService.updateStats(characterId, statUpdates);
      
      if (!updatedCharacter) {
        return res.status(500).json({ error: 'Failed to update character stats' });
      }
      
      // Return updated effective stats
      const derivedStats = StatsService.calculateDerivedStats(updatedCharacter);
      
      return res.json({
        success: true,
        message: 'Character stats updated successfully',
        characterId,
        updatedStats: statUpdates,
        newEffectiveStats: {
          strength: derivedStats.effectiveStrength,
          dexterity: derivedStats.effectiveDexterity,
          intelligence: derivedStats.effectiveIntelligence,
          wisdom: derivedStats.effectiveWisdom,
          constitution: derivedStats.effectiveConstitution,
          charisma: derivedStats.effectiveCharisma
        }
      });
    } catch (error) {
      console.error('Error updating character stats:', error);
      return res.status(500).json({ error: 'Failed to update character stats' });
    }
  }
);

/**
 * POST /api/v1/characters/:id/paragon/redistribute
 * Redistribute paragon points (requires level 100+)
 */
router.post('/:id/paragon/redistribute',
  authenticateToken,
  statModificationRateLimit,
  preventStatRecursion,
  auditStatModification,
  async (req, res) => {
    try {
      const characterId = req.params.id;
      const userId = (req as any).user.id;
      const { paragonDistribution } = req.body;
      
      if (!paragonDistribution || typeof paragonDistribution !== 'object') {
        return res.status(400).json({ error: 'Invalid paragon distribution' });
      }
      
      const character = await characterService.getCharacter(characterId);
      if (!character || character.accountId !== userId) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      const updatedCharacter = await characterService.updateParagonDistribution(characterId, {
        strength: BigInt(paragonDistribution.strength || 0),
        dexterity: BigInt(paragonDistribution.dexterity || 0),
        intelligence: BigInt(paragonDistribution.intelligence || 0),
        wisdom: BigInt(paragonDistribution.wisdom || 0),
        constitution: BigInt(paragonDistribution.constitution || 0),
        charisma: BigInt(paragonDistribution.charisma || 0)
      });
      
      if (!updatedCharacter) {
        return res.status(500).json({ error: 'Failed to redistribute paragon points' });
      }
      
      return res.json({
        success: true,
        message: 'Paragon points redistributed successfully',
        characterId,
        newDistribution: paragonDistribution
      });
    } catch (error) {
      console.error('Error redistributing paragon points:', error);
      return res.status(500).json({ 
        error: 'Failed to redistribute paragon points',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/v1/characters/:id/prestige
 * Perform character prestige (requires level 500+)
 */
router.post('/:id/prestige',
  authenticateToken,
  statModificationRateLimit,
  preventStatRecursion,
  auditStatModification,
  async (req, res) => {
    try {
      const characterId = req.params.id;
      const userId = (req as any).user.id;
      
      const character = await characterService.getCharacter(characterId);
      if (!character || character.accountId !== userId) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      if (!StatsService.canPrestige(character)) {
        return res.status(400).json({ 
          error: 'Character not eligible for prestige',
          message: 'Requires level 500+ and available prestige level'
        });
      }
      
      const newPrestigeLevel = character.prestigeLevel + 1;
      const updatedCharacter = await characterService.updatePrestige(characterId, newPrestigeLevel);
      
      if (!updatedCharacter) {
        return res.status(500).json({ error: 'Failed to prestige character' });
      }
      
      return res.json({
        success: true,
        message: 'Character prestiged successfully',
        characterId,
        newPrestigeLevel,
        resetLevel: 1,
        bonusMultiplier: 1 + (newPrestigeLevel * 0.1)
      });
    } catch (error) {
      console.error('Error prestiging character:', error);
      return res.status(500).json({ 
        error: 'Failed to prestige character',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;