import { Router } from 'express';
import { body, param } from 'express-validator';
import { CharacterService } from '../services/CharacterService';
import { StatsService } from '../services/StatsService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { CharacterRace, CharacterClass, CharacterGender } from '../types/character.types';

const router = Router();
const characterService = new CharacterService();

// Test endpoint to verify character system is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Character system is operational',
    timestamp: new Date().toISOString()
  });
});

// Get all characters for the authenticated user
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
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
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
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

// Get character by ID with full stats
router.get(
  '/:id',
  authenticate,
  param('id').isUUID('4').withMessage('Invalid character ID'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
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

export default router;