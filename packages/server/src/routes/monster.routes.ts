import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as monsterController from '../controllers/monster.controller';

const router = Router();

// Test endpoints (no auth required for testing)
router.get('/test', monsterController.testMonsterSystem);

// Get monsters in a specific zone
router.get('/zone/:zoneId', monsterController.getMonstersInZone);

// Get monster by ID
router.get('/:monsterId', monsterController.getMonsterById);

// Get all monster types
router.get('/types/all', monsterController.getMonsterTypes);

// Get spawn points for a zone
router.get('/spawn-points/:zoneId', monsterController.getSpawnPointsByZone);

// Update monster state (PATCH endpoint for testing)
router.patch('/:monsterId/state', monsterController.updateMonsterState);

// Spawn a monster (no auth required for testing)
router.post('/spawn', monsterController.spawnMonster);

// Kill a monster (DELETE endpoint)
router.delete('/:monsterId', monsterController.killMonster);

export default router;