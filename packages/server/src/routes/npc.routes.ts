import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { ServiceProvider, INPCService } from '../providers';

const router = Router();

// Get NPCs in a specific zone
router.get('/zone/:zoneId', asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  const npcService = ServiceProvider.getInstance().get<INPCService>('NPCService');
  
  try {
    const npcs = await npcService.getNPCsInZone(zoneId);
    
    res.json({ 
      success: true, 
      data: { 
        npcs,
        count: npcs.length,
        zone: zoneId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch NPCs'
    });
  }
}));

// Start interaction with an NPC
router.post('/:npcId/interact', asyncHandler(async (req, res) => {
  const { npcId } = req.params;
  const { characterId } = req.body;
  const npcService = ServiceProvider.getInstance().get<INPCService>('NPCService');
  
  if (!characterId) {
    return res.status(400).json({
      success: false,
      error: 'Character ID is required'
    });
  }
  
  try {
    const interaction = await npcService.startInteraction(npcId, characterId);
    
    res.json({ 
      success: true, 
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start interaction'
    });
  }
}));

// Advance dialogue with an NPC
router.post('/:npcId/dialogue/advance', asyncHandler(async (req, res) => {
  const { npcId } = req.params;
  const { characterId, choice } = req.body;
  const npcService = ServiceProvider.getInstance().get<INPCService>('NPCService');
  
  if (!characterId || choice === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Character ID and choice are required'
    });
  }
  
  try {
    const advancedDialogue = await npcService.advanceDialogue(npcId, characterId, choice);
    
    res.json({ 
      success: true, 
      data: advancedDialogue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to advance dialogue'
    });
  }
}));

// Get NPC interaction history for a character
router.get('/interactions/character/:characterId', authenticate, asyncHandler<AuthRequest>(async (req, res) => {
  const { characterId } = req.params;
  const npcService = ServiceProvider.getInstance().get<INPCService>('NPCService');
  
  try {
    const interactions = await npcService.getInteractionHistory(characterId);
    
    res.json({ 
      success: true, 
      data: { 
        interactions,
        count: interactions.length 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch interaction history'
    });
  }
}));

// Get all quest-giving NPCs
router.get('/quest-givers', authenticate, asyncHandler<AuthRequest>(async (_req, res) => {
  const npcService = ServiceProvider.getInstance().get<INPCService>('NPCService');
  
  try {
    const questGivers = await npcService.getQuestGivers();
    
    res.json({ 
      success: true, 
      data: { 
        questGivers,
        count: questGivers.length 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch quest givers'
    });
  }
}));

// Test endpoint for NPC system
router.get('/test', asyncHandler(async (_req, res) => {
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