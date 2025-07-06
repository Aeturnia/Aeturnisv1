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

// Test endpoints for live combat (no auth required - MUST BE FIRST)
router.get('/test-monsters', combatController.getTestMonsters);
router.post('/test-start', combatController.startTestCombat);
router.get('/session/:sessionId', combatController.getCombatSession);
router.post('/action', combatController.performTestAction);
router.post('/flee/:sessionId', combatController.fleeTestCombat);

// Combat session endpoints (authenticated)
router.post('/start', 
  authenticate, 
  validateCombatStart, 
  combatController.startCombat
);

router.get('/auth-session/:sessionId', 
  authenticate, 
  validateSessionId, 
  combatController.getSession
);

router.post('/auth-action', 
  authenticate, 
  validateCombatAction, 
  combatActionCooldown,
  combatController.performAction
);

router.post('/auth-flee/:sessionId', 
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