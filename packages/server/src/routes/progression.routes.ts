/**
 * Progression Routes
 * Defines API endpoints for character experience, leveling, and stat allocation
 */

import { Router } from 'express';
import { 
  awardExperience, 
  allocateStatPoints, 
  getPowerScore, 
  getCharacterProgression, 
  getProgressionTest 
} from '../controllers/progression.controller';

const router = Router();

/**
 * @route GET /api/v1/progression/test
 * @desc Get progression service test data
 * @access Public
 */
router.get('/test', getProgressionTest);

/**
 * @route GET /api/v1/progression/:characterId
 * @desc Get character progression data
 * @access Public (for testing)
 * @param characterId - Character ID
 */
router.get('/:characterId', getCharacterProgression);

/**
 * @route GET /api/v1/progression/power-score/:characterId
 * @desc Get character power score calculation
 * @access Public (for testing)
 * @param characterId - Character ID
 */
router.get('/power-score/:characterId', getPowerScore);

/**
 * @route POST /api/v1/progression/award-xp
 * @desc Award experience to character
 * @access Public (for testing)
 * @body { characterId: string, amount: bigint, source: string }
 */
router.post('/award-xp', awardExperience);

/**
 * @route POST /api/v1/progression/allocate-stat
 * @desc Allocate stat points for character
 * @access Public (for testing)
 * @body { characterId: string, stat: StatType, amount: number }
 */
router.post('/allocate-stat', allocateStatPoints);

export default router;