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

// Simple test endpoints for Combat Engine (no auth required)
router.get('/test', (req, res) => res.json({ success: true, message: 'Combat system operational' }));
router.get('/test-monsters', (req, res) => res.json({ 
  success: true, 
  data: { 
    monsters: [
      { id: 'test_goblin_001', name: 'Training Goblin', level: 3, hp: 45 },
      { id: 'test_orc_001', name: 'Orc Warrior', level: 5, hp: 80 }
    ] 
  } 
}));
router.get('/engine-info', (req, res) => res.json({
  success: true,
  data: {
    version: '2.0.0',
    name: 'Combat Engine v2.0',
    features: ['Enhanced AI', 'Resource Management'],
    status: 'operational'
  }
}));
router.post('/test-start', (req, res) => res.json({
  success: true,
  data: {
    sessionId: `test_combat_${Date.now()}`,
    status: 'active',
    message: 'Combat started successfully!'
  }
}));

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