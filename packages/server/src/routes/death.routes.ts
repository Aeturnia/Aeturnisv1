import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as deathController from '../controllers/death.controller';

const router = Router();

// Test endpoints (no auth required for testing)
router.get('/test', deathController.testDeathSystem);
router.post('/test-death', deathController.testCharacterDeath);
router.post('/test-respawn', deathController.testCharacterRespawn);

// Authenticated death management endpoints
router.post('/:characterId', authenticate, deathController.processCharacterDeath);
router.post('/:characterId/respawn', authenticate, deathController.processCharacterRespawn);
router.get('/:characterId/status', authenticate, deathController.getCharacterDeathStatus);

export { router as deathRoutes };