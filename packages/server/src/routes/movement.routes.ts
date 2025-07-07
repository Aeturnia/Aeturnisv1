/**
 * Movement Routes
 * Defines API endpoints for character movement and zone transitions
 */

import { Router } from 'express';
import { 
  executeMovement, 
  validateMovement, 
  getCharacterPosition, 
  getMovementTest 
} from '../controllers/movement.controller';

const router = Router();

/**
 * @route GET /api/v1/movement/test
 * @desc Get movement service test data
 * @access Public
 */
router.get('/test', getMovementTest);

/**
 * @route GET /api/v1/movement/position/:characterId
 * @desc Get character's current position
 * @access Public (for testing)
 * @param characterId - Character ID
 */
router.get('/position/:characterId', getCharacterPosition);

/**
 * @route POST /api/v1/movement/move
 * @desc Execute character movement between zones
 * @access Public (for testing)
 * @body { characterId: string, currentZoneId: string, direction: Direction }
 */
router.post('/move', executeMovement);

/**
 * @route POST /api/v1/movement/validate
 * @desc Validate character movement
 * @access Public (for testing)
 * @body { characterId: string, fromZoneId: string, toZoneId: string, direction: Direction }
 */
router.post('/validate', validateMovement);

export default router;