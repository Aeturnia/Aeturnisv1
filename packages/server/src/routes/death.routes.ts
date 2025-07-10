import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as deathController from '../controllers/death.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Test endpoints (no auth required for testing)
router.get('/test', asyncHandler(deathController.testDeathSystem));
router.post('/test-death', asyncHandler(deathController.testCharacterDeath));
router.post('/test-respawn', asyncHandler(deathController.testCharacterRespawn));
router.get('/test-status', asyncHandler(deathController.testCharacterDeathStatus));

// Authenticated death management endpoints
router.post('/:characterId', authenticate, asyncHandler(deathController.processCharacterDeath));
router.post('/:characterId/respawn', authenticate, asyncHandler(deathController.processCharacterRespawn));
router.get('/:characterId/status', authenticate, asyncHandler(deathController.getCharacterDeathStatus));

export { router as deathRoutes };