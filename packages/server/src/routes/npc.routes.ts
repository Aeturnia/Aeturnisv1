import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { NPCService } from '../services/NPCService';

const router = Router();
const npcService = new NPCService();

// Get NPCs in a specific zone (MOCK DATA FOR TESTING)
router.get('/zone/:zoneId', asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  
  // Mock NPCs data for testing
  const mockNPCs = [
    {
      id: 'npc-001',
      name: 'Tutorial Guide',
      level: 1,
      position: { x: 95, y: 0, z: 105 },
      npcType: 'guide',
      dialogue: 'Welcome to Aeturnis Online! I can help you get started.',
      isInteractable: true,
      questGiver: true,
      shopkeeper: false
    },
    {
      id: 'npc-002', 
      name: 'Village Merchant',
      level: 5,
      position: { x: 120, y: 0, z: 85 },
      npcType: 'merchant',
      dialogue: 'Looking to buy some gear? I have the finest equipment!',
      isInteractable: true,
      questGiver: false,
      shopkeeper: true
    }
  ];
  
  res.json({ 
    success: true, 
    data: { 
      npcs: mockNPCs,
      count: mockNPCs.length,
      zone: zoneId,
      message: 'Mock NPC data for testing'
    }
  });
}));

// Start interaction with an NPC (MOCK DATA FOR TESTING)
router.post('/:npcId/interact', asyncHandler(async (req, res) => {
  const { npcId } = req.params;
  const { characterId } = req.body;
  
  if (!characterId) {
    return res.status(400).json({
      success: false,
      error: 'Character ID is required'
    });
  }
  
  // Mock dialogue response based on NPC
  const mockDialogue = {
    npcId,
    characterId,
    dialogueNodeId: 'greeting',
    text: npcId === 'npc-001' ? 
      'Welcome, brave adventurer! This is the tutorial area. Would you like me to explain the basics?' :
      'Welcome to my shop! I have potions, weapons, and armor. What interests you?',
    choices: [
      { id: 'quest', text: 'Tell me about quests' },
      { id: 'shop', text: 'Show me your wares' }, 
      { id: 'goodbye', text: 'Goodbye' }
    ],
    timestamp: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    data: mockDialogue,
    message: 'NPC interaction started (mock data)'
  });
}));

// Advance dialogue with an NPC
router.post('/:npcId/dialogue/advance', asyncHandler(async (req, res) => {
  const { npcId } = req.params;
  const { characterId, choiceId } = req.body;
  
  if (!characterId || !choiceId) {
    return res.status(400).json({
      success: false,
      error: 'Character ID and choice ID are required'
    });
  }
  
  // Mock dialogue advancement for testing
  const mockAdvancedDialogue = {
    id: `dialogue-${npcId}-${Date.now()}`,
    npcId,
    characterId,
    node: 'next',
    text: "That's interesting! Let me think about that...",
    choices: [
      { id: 1, text: "Continue conversation", nextNode: 'continue' },
      { id: 2, text: "End conversation", nextNode: 'end' }
    ],
    npcResponse: "Thanks for chatting with me!",
    isComplete: false
  };
  
  res.json({ 
    success: true, 
    data: mockAdvancedDialogue,
    message: 'Dialogue advanced (mock data)'
  });
}));

// Get NPC interaction history for a character
router.get('/interactions/character/:characterId', authenticate, asyncHandler<AuthRequest>(async (req, res) => {
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
router.get('/quest-givers', authenticate, asyncHandler<AuthRequest>(async (_req, res) => {
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