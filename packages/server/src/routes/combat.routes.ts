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

// Debug service registry
router.get('/debug-services', (req, res) => {
  const ServiceProvider = require('../providers/ServiceProvider');
  const registeredServices = ServiceProvider.ServiceProvider.getRegisteredServices();
  res.json({
    success: true,
    data: {
      registeredServices,
      globalServicesSize: ServiceProvider.globalServices.size,
      globalServicesKeys: Array.from(ServiceProvider.globalServices.keys())
    }
  });
});
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
// Removed duplicate - using controller instead

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
// Simple mock start combat endpoint (bypassing complex service layer)
router.post('/test-start', (req, res) => {
  const { targetIds, battleType } = req.body;
  const mockSessionId = `test_combat_${Date.now()}`;
  
  const mockStartResult = {
    sessionId: mockSessionId,
    status: 'active',
    battleType: battleType || 'pve',
    targets: targetIds || ['test_goblin_001'],
    message: `Combat started against ${targetIds?.[0] || 'Training Goblin'}!`,
    participants: [
      { id: 'player-test-001', name: 'Player', hp: 100, maxHp: 100 },
      { id: targetIds?.[0] || 'test_goblin_001', name: 'Training Goblin', hp: 45, maxHp: 45 }
    ],
    timestamp: Date.now()
  };
  
  res.json({
    success: true,
    data: mockStartResult,
    message: mockStartResult.message
  });
});
// Simple mock endpoints for testing (bypassing complex service layer)
router.post('/test-action', (req, res) => {
  const { sessionId, action, targetId } = req.body;
  const mockResult = {
    sessionId,
    action,
    targetId: targetId || 'test_goblin_001',
    result: 'success',
    message: action === 'attack' ? 'Player attacks Training Goblin for 15 damage!' :
             action === 'defend' ? 'Player defends and reduces incoming damage!' :
             action === 'flee' ? '💨 You successfully fled from combat!' :
             'Action completed!',
    timestamp: Date.now()
  };
  
  res.json({
    success: true,
    data: mockResult,
    message: mockResult.message
  });
});

router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const mockSession = {
    id: sessionId,
    status: 'active',
    participants: [
      { id: 'player-test-001', name: 'Player', hp: 85, maxHp: 100 },
      { id: 'test_goblin_001', name: 'Training Goblin', hp: 30, maxHp: 45 }
    ],
    currentTurn: 'player-test-001',
    message: 'Combat session is active'
  };
  
  res.json({
    success: true,
    data: mockSession,
    message: 'Combat session retrieved successfully'
  });
});

router.post('/flee/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const mockFleeResult = {
    sessionId,
    action: 'flee',
    result: 'success',
    message: '💨 You fled from combat! Better luck next time.',
    timestamp: Date.now()
  };
  
  res.json({
    success: true,
    data: mockFleeResult,
    message: mockFleeResult.message
  });
});

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