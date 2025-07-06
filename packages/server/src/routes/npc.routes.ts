import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as npcController from '../controllers/npc.controller';

const router = Router();

// Test endpoints (no auth required for testing)
router.get('/test', npcController.testNPCSystem);

// Get NPCs in a specific zone
router.get('/zone/:zoneId', npcController.getNPCsInZone);

// Get NPC by ID
router.get('/:npcId', npcController.getNPCById);

// Interact with NPC
router.post('/:npcId/interact', authenticate, npcController.interactWithNPC);

// Get available interactions for NPC
router.get('/:npcId/interactions', npcController.getNPCInteractions);

export default router;