import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ServiceProvider, IMonsterService, globalServices } from '../providers';

const router = Router();

// Get monsters in a specific zone
router.get('/zone/:zoneId', asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  
  // Debug ServiceProvider state
  const registeredServices = Array.from(globalServices.keys());
  console.log('Debug Monster Route - Registered services:', registeredServices);
  console.log('Debug Monster Route - Direct globalServices size:', globalServices.size);
  
  const monsterService = globalServices.get('MonsterService') as IMonsterService;
  
  try {
    const monsters = await monsterService.getMonstersInZone(zoneId);
    
    res.json({ 
      success: true, 
      data: { 
        monsters: monsters.map(monster => ({
          ...monster,
          // Flatten stats for frontend compatibility
          hp: monster.stats?.hp || monster.hp,
          maxHp: monster.stats?.maxHp || monster.maxHp
        })),
        count: monsters.length,
        zone: zoneId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monsters'
    });
  }
}));

// Spawn a monster at a spawn point
router.post('/spawn', asyncHandler(async (req, res) => {
  const { spawnPointId } = req.body;
  const monsterService = ServiceProvider.getInstance().get<IMonsterService>('MonsterService');
  
  if (!spawnPointId) {
    return res.status(400).json({
      success: false,
      error: 'Spawn point ID is required'
    });
  }
  
  try {
    const monster = await monsterService.spawnMonster(spawnPointId);
    
    res.json({ 
      success: true, 
      data: { 
        monster: {
          ...monster,
          hp: monster.stats?.hp || monster.hp,
          maxHp: monster.stats?.maxHp || monster.maxHp
        },
        message: `${monster.name} spawned successfully!` 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to spawn monster'
    });
  }
}));

// Update monster state endpoint
router.patch('/:monsterId/state', asyncHandler(async (req, res) => {
  const { monsterId } = req.params;
  const { state } = req.body;
  const monsterService = ServiceProvider.getInstance().get<IMonsterService>('MonsterService');
  
  // Validate state
  const validStates = ['alive', 'dead', 'spawning', 'respawning'];
  if (!validStates.includes(state)) {
    return res.status(400).json({
      success: false,
      message: `Invalid state. Must be one of: ${validStates.join(', ')}`
    });
  }
  
  try {
    const monster = await monsterService.updateMonsterState(monsterId, state);
    
    res.json({
      success: true,
      data: {
        monsterId,
        newState: state,
        monster,
        message: `Monster ${monsterId} state changed to ${state}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update monster state'
    });
  }
}));

// Delete monster endpoint
router.delete('/:monsterId', asyncHandler(async (req, res) => {
  const { monsterId } = req.params;
  const monsterService = ServiceProvider.getInstance().get<IMonsterService>('MonsterService');
  
  try {
    await monsterService.killMonster(monsterId);
    
    res.json({
      success: true,
      data: {
        deletedMonsterId: monsterId,
        message: `Monster ${monsterId} has been killed and removed from zone`,
        action: 'killed',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to kill monster'
    });
  }
}));


// Get monster types
router.get('/types', asyncHandler(async (_req, res) => {
  const monsterService = ServiceProvider.getInstance().get<IMonsterService>('MonsterService');
  
  try {
    const monsterTypes = await monsterService.getMonsterTypes();
    
    res.json({ 
      success: true, 
      data: { 
        monsterTypes,
        count: monsterTypes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monster types'
    });
  }
}));

// Get spawn points for a zone
router.get('/spawn-points/:zoneId', asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  const monsterService = ServiceProvider.getInstance().get<IMonsterService>('MonsterService');
  
  try {
    const spawnPoints = await monsterService.getSpawnPoints(zoneId);
    
    res.json({ 
      success: true, 
      data: { 
        spawnPoints,
        count: spawnPoints.length,
        zone: zoneId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch spawn points'
    });
  }
}));

// Test endpoint for monster system
router.get('/test', asyncHandler(async (_req, res) => {
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