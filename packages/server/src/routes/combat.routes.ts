import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  validateCombatAction, 
  validateCombatStart, 
  validateSessionId,
  rateLimitCombatActions 
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
  rateLimitCombatActions,
  combatController.performAction
);

router.post('/flee/:sessionId', 
  authenticate, 
  validateSessionId, 
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

// Test endpoint (always available for development)
router.get('/test', combatController.testCombatSystem);

// Development/QA endpoints
if (process.env.NODE_ENV !== 'production') {
  router.post('/simulate', 
    authenticate, 
    combatController.simulateCombat
  );
}

export default router;