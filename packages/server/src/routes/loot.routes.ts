import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as lootController from '../controllers/loot.controller';

const router = Router();

// Test endpoints (no auth required for testing)
router.get('/test', lootController.testLootSystem);
router.post('/generate', lootController.generateLoot);
router.get('/table/:tableId', lootController.getLootTable);
router.post('/test-drop', lootController.testItemDrop);
router.post('/test-claim', lootController.testLootClaim);
router.post('/test-calculate', lootController.testLootCalculation);
router.get('/tables', lootController.getLootTables);

// Authenticated loot management endpoints
router.post('/combat/:sessionId/claim', authenticate, lootController.claimCombatLoot);
router.get('/history/:characterId', authenticate, lootController.getLootHistory);
router.post('/calculate', authenticate, lootController.calculateLootDrops);

export { router as lootRoutes };