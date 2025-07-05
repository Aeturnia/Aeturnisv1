import { Router } from 'express';
import { body, param } from 'express-validator';
import { CharacterService } from '../services/CharacterService';
import { StatsService } from '../services/StatsService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { CharacterRace, CharacterClass, CharacterGender } from '../types/character.types';

const router = Router();
const characterService = new CharacterService();

// Get all characters for the authenticated user
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const characters = await characterService.getCharactersByAccount(userId);
    
    res.json({
      success: true,
      data: {
        characters,
        count: characters.length
      }
    });
  })
);

// Get character by ID with full stats
router.get(
  '/:id',
  authenticate,
  param('id').isUUID('4').withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const result = await characterService.getCharacterWithStats(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      });
    }

    // Verify ownership
    if (result.character.accountId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: result
    });
  })
);

// Create new character
router.post(
  '/',
  authenticate,
  [
    body('name')
      .isLength({ min: 3, max: 32 })
      .withMessage('Name must be between 3 and 32 characters')
      .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
      .withMessage('Name must start with a letter and contain only letters, numbers, and underscores'),
    body('race')
      .isIn(Object.values(CharacterRace))
      .withMessage('Invalid race'),
    body('class')
      .isIn(Object.values(CharacterClass))
      .withMessage('Invalid class'),
    body('gender')
      .isIn(Object.values(CharacterGender))
      .withMessage('Invalid gender'),
    body('appearance')
      .isObject()
      .withMessage('Appearance must be an object')
  ],
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { name, race, class: characterClass, gender, appearance } = req.body;

    try {
      const character = await characterService.createCharacter(userId, {
        name,
        race,
        class: characterClass,
        gender,
        appearance
      });

      res.status(201).json({
        success: true,
        data: character
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create character'
      });
    }
  })
);

// Delete character
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID('4').withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const success = await characterService.deleteCharacter(id, userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Character deleted successfully'
    });
  })
);

// Update character position
router.patch(
  '/:id/position',
  authenticate,
  [
    param('id').isUUID('4').withMessage('Invalid character ID'),
    body('zone').isString().withMessage('Zone must be a string'),
    body('x').isNumeric().withMessage('X coordinate must be numeric'),
    body('y').isNumeric().withMessage('Y coordinate must be numeric'),
    body('z').isNumeric().withMessage('Z coordinate must be numeric'),
    body('rotation').optional().isNumeric().withMessage('Rotation must be numeric')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { zone, x, y, z, rotation } = req.body;
    const userId = req.user!.id;

    // Verify ownership first
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    const updatedCharacter = await characterService.updatePosition(
      id, zone, parseFloat(x), parseFloat(y), parseFloat(z), rotation ? parseFloat(rotation) : undefined
    );

    res.json({
      success: true,
      data: updatedCharacter
    });
  })
);

// Gain experience
router.post(
  '/:id/experience',
  authenticate,
  [
    param('id').isUUID('4').withMessage('Invalid character ID'),
    body('amount').isNumeric().withMessage('Experience amount must be numeric')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user!.id;

    // Verify ownership
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    const updatedCharacter = await characterService.gainExperience(
      id, 
      BigInt(Math.max(0, parseInt(amount)))
    );

    res.json({
      success: true,
      data: updatedCharacter
    });
  })
);

// Allocate stat points
router.post(
  '/:id/stats',
  authenticate,
  [
    param('id').isUUID('4').withMessage('Invalid character ID'),
    body('stat')
      .isIn(['baseStrength', 'baseDexterity', 'baseIntelligence', 'baseWisdom', 'baseConstitution', 'baseCharisma'])
      .withMessage('Invalid stat'),
    body('points').isInt({ min: 1, max: 10 }).withMessage('Points must be between 1 and 10')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stat, points } = req.body;
    const userId = req.user!.id;

    // Verify ownership
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    try {
      const updatedCharacter = await characterService.allocateStatPoint(id, stat, parseInt(points));
      res.json({
        success: true,
        data: updatedCharacter
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to allocate stat points'
      });
    }
  })
);

// Update character resources (HP/MP/Stamina)
router.patch(
  '/:id/resources',
  authenticate,
  [
    param('id').isUUID('4').withMessage('Invalid character ID'),
    body('hp').optional().isNumeric().withMessage('HP must be numeric'),
    body('mp').optional().isNumeric().withMessage('MP must be numeric'),
    body('stamina').optional().isNumeric().withMessage('Stamina must be numeric')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { hp, mp, stamina } = req.body;
    const userId = req.user!.id;

    // Verify ownership
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    const updatedCharacter = await characterService.updateResources(
      id,
      hp ? BigInt(Math.max(0, parseInt(hp))) : undefined,
      mp ? BigInt(Math.max(0, parseInt(mp))) : undefined,
      stamina ? BigInt(Math.max(0, parseInt(stamina))) : undefined
    );

    res.json({
      success: true,
      data: updatedCharacter
    });
  })
);

// Prestige character
router.post(
  '/:id/prestige',
  authenticate,
  param('id').isUUID('4').withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    try {
      const updatedCharacter = await characterService.prestigeCharacter(id);
      res.json({
        success: true,
        data: updatedCharacter,
        message: 'Character prestige successful!'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to prestige character'
      });
    }
  })
);

// Allocate paragon points
router.post(
  '/:id/paragon',
  authenticate,
  [
    param('id').isUUID('4').withMessage('Invalid character ID'),
    body('distribution').isObject().withMessage('Distribution must be an object')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { distribution } = req.body;
    const userId = req.user!.id;

    // Verify ownership
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    try {
      // Convert distribution values to BigInt
      const bigintDistribution: Record<string, bigint> = {};
      for (const [stat, points] of Object.entries(distribution)) {
        bigintDistribution[stat] = BigInt(Math.max(0, parseInt(String(points))));
      }

      const updatedCharacter = await characterService.allocateParagonPoints(id, bigintDistribution);
      res.json({
        success: true,
        data: updatedCharacter
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to allocate paragon points'
      });
    }
  })
);

// Validate character name
router.post(
  '/validate-name',
  [
    body('name')
      .isLength({ min: 3, max: 32 })
      .withMessage('Name must be between 3 and 32 characters')
  ],
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    
    const validation = await characterService.validateCharacterName(name);
    
    res.json({
      success: true,
      data: validation
    });
  })
);

// Get random starting appearance for race
router.get(
  '/appearance/:race',
  param('race').isIn(Object.values(CharacterRace)).withMessage('Invalid race'),
  asyncHandler(async (req, res) => {
    const { race } = req.params;
    
    const appearance = await characterService.getRandomStartingAppearance(race as CharacterRace);
    
    res.json({
      success: true,
      data: appearance
    });
  })
);

// Update last played timestamp
router.patch(
  '/:id/last-played',
  authenticate,
  param('id').isUUID('4').withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    await characterService.updateLastPlayed(id);
    
    res.json({
      success: true,
      message: 'Last played timestamp updated'
    });
  })
);

// Get character stats breakdown
router.get(
  '/:id/stats',
  authenticate,
  param('id').isUUID('4').withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const character = await characterService.getCharacter(id);
    if (!character || character.accountId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Character not found or access denied'
      });
    }

    const baseStats = StatsService.calculateTotalBaseStats(character);
    const derivedStats = StatsService.calculateDerivedStats(character);
    const canPrestige = StatsService.canPrestige(character);
    const hasParagon = StatsService.hasParagonUnlocked(character);

    res.json({
      success: true,
      data: {
        baseStats,
        derivedStats,
        progressionInfo: {
          canPrestige,
          hasParagonUnlocked: hasParagon,
          prestigeLevel: character.prestigeLevel,
          paragonPoints: character.paragonPoints.toString(),
          paragonDistribution: character.paragonDistribution
        }
      }
    });
  })
);

export default router;