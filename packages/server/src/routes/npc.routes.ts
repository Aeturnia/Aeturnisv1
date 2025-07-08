import { Router } from 'express';
import * as npcController from '../controllers/npc.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Test endpoints (no auth required for testing)
router.get('/test', asyncHandler(npcController.testNPCSystem));

// Get NPCs in a specific zone
router.get('/zone/:zoneId', asyncHandler(npcController.getNPCsInZone));

// Get NPC by ID
router.get('/:npcId', asyncHandler(npcController.getNPCById));

// Interact with NPC (no authentication required for testing)
router.post('/:npcId/interact', asyncHandler(npcController.interactWithNPC));

// Get available interactions for NPC
router.get('/:npcId/interactions', asyncHandler(npcController.getNPCInteractions));

export default router;