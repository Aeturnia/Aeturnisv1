import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  validateCombatAction, 
  validateCombatStart, 
  validateSessionId,
  combatActionCooldown 
} from '../middleware/combat.middleware';
import * as combatController from '../controllers/combat.controller';

const router = Router();

// Combat session endpoints
router.post('/start', 
  authenticate, 
  validateCombatStart, 
  combatController.startCombat
);

router.get('/session/:sessionId', 
  authenticate, 
  validateSessionId, 
  combatController.getSession
);

router.post('/action', 
  authenticate, 
  validateCombatAction, 
  combatActionCooldown,
  combatController.performAction
);

router.post('/flee/:sessionId', 
  authenticate, 
  validateSessionId, 
  combatActionCooldown,
  combatController.fleeCombat
);

// Resource endpoints
router.get('/stats/:charId', 
  authenticate, 
  combatController.getCharacterStats
);

router.get('/resources/:charId', 
  authenticate, 
  combatController.getResources
);

// Test endpoints for test monsters (no auth required)
router.get('/test-stats/:charId', combatController.getCharacterStats);
router.get('/test-resources/:charId', combatController.getResources);
router.post('/test-start', combatController.startTestCombat);

// Player stats endpoint (no auth required for testing)
router.get('/player-stats', combatController.getPlayerStats);

// Test endpoint (always available for development)
router.get('/test', combatController.testCombatSystem);

// Test monsters endpoint (always available for development)
router.get('/test-monsters', combatController.getTestMonsters);

// Development/QA endpoints
if (process.env.NODE_ENV !== 'production') {
  router.post('/simulate', 
    authenticate, 
    combatController.simulateCombat
  );
}

export default router;