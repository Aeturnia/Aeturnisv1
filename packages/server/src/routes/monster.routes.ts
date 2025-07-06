import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { MonsterService } from '../services/MonsterService';

const router = Router();
const monsterService = new MonsterService();

// Get monsters in a specific zone
router.get('/zone/:zoneId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { zoneId } = req.params;
  
  const monsters = await monsterService.getMonstersInZone(zoneId);
  
  res.json({ 
    success: true, 
    data: { 
      monsters,
      count: monsters.length 
    }
  });
}));

// Spawn a monster at a spawn point (admin only)
router.post('/spawn', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { spawnPointId } = req.body;
  
  if (!spawnPointId) {
    return res.status(400).json({
      success: false,
      error: 'Spawn point ID is required'
    });
  }
  
  const monster = await monsterService.spawnMonster(spawnPointId);
  
  res.json({ 
    success: true, 
    data: { 
      monster,
      message: 'Monster spawned successfully' 
    }
  });
}));

// Update monster state
router.patch('/:monsterId/state', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { monsterId } = req.params;
  const { newState, targetId } = req.body;
  
  if (!newState) {
    return res.status(400).json({
      success: false,
      error: 'New state is required'
    });
  }
  
  const monster = await monsterService.updateMonsterState(monsterId, newState, targetId);
  
  res.json({ 
    success: true, 
    data: monster,
    message: 'Monster state updated' 
  });
}));

// Get monster types
router.get('/types', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const monsterTypes = await monsterService.getMonsterTypes();
  
  res.json({ 
    success: true, 
    data: { 
      monsterTypes,
      count: monsterTypes.length 
    }
  });
}));

// Get spawn points for a zone
router.get('/spawn-points/:zoneId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { zoneId } = req.params;
  
  const spawnPoints = await monsterService.getSpawnPointsByZone(zoneId);
  
  res.json({ 
    success: true, 
    data: { 
      spawnPoints,
      count: spawnPoints.length 
    }
  });
}));

// Test endpoint for monster system
router.get('/test', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Monster system API is operational',
      version: '1.0.0',
      features: [
        'Zone-based monster queries',
        'Monster spawning (admin)',
        'Monster state updates',
        'Monster type management',
        'Spawn point management'
      ],
      timestamp: new Date().toISOString()
    }
  });
}));

export default router;