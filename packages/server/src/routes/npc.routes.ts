import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { NPCService } from '../services/NPCService';

const router = Router();
const npcService = new NPCService();

// Get NPCs in a specific zone
router.get('/zone/:zoneId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { zoneId } = req.params;
  
  const npcs = await npcService.getNPCsInZone(zoneId);
  
  res.json({ 
    success: true, 
    data: { 
      npcs,
      count: npcs.length 
    }
  });
}));

// Start interaction with an NPC
router.post('/:npcId/interact', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { npcId } = req.params;
  const { characterId } = req.body;
  
  if (!characterId) {
    return res.status(400).json({
      success: false,
      error: 'Character ID is required'
    });
  }
  
  const interaction = await npcService.startInteraction(npcId, characterId);
  
  res.json({ 
    success: true, 
    data: interaction
  });
}));

// Advance dialogue with an NPC
router.post('/:npcId/dialogue/advance', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { npcId } = req.params;
  const { characterId, choiceId } = req.body;
  
  if (!characterId || !choiceId) {
    return res.status(400).json({
      success: false,
      error: 'Character ID and choice ID are required'
    });
  }
  
  const dialogue = await npcService.advanceDialogue(npcId, characterId, choiceId);
  
  res.json({ 
    success: true, 
    data: {
      dialogue,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get NPC interaction history for a character
router.get('/interactions/character/:characterId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { characterId } = req.params;
  
  const interactions = await npcService.getInteractionHistory(characterId);
  
  res.json({ 
    success: true, 
    data: { 
      interactions,
      count: interactions.length 
    }
  });
}));

// Get all quest-giving NPCs
router.get('/quest-givers', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const questGivers = await npcService.getQuestGivers();
  
  res.json({ 
    success: true, 
    data: { 
      questGivers,
      count: questGivers.length 
    }
  });
}));

// Test endpoint for NPC system
router.get('/test', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'NPC system API is operational',
      version: '1.0.0',
      features: [
        'Zone-based NPC queries',
        'NPC interaction system',
        'Dialogue tree advancement',
        'Interaction history tracking',
        'Quest giver management'
      ],
      timestamp: new Date().toISOString()
    }
  });
}));

export default router;