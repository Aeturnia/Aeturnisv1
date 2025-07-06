import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Global mock monsters data for testing
let mockMonsters = [
  {
    id: 'monster-001',
    name: 'Forest Goblin',
    level: 5,
    position: { x: 110, y: 0, z: 95 },
    state: 'idle',
    spawnPointId: 'spawn-001',
    stats: {
      hp: 45,
      maxHp: 45,
      attack: 12,
      defense: 8,
      speed: 10
    }
  },
  {
    id: 'monster-002', 
    name: 'Cave Orc',
    level: 8,
    position: { x: 145, y: 2, z: 80 },
    state: 'patrolling',
    spawnPointId: 'spawn-002',
    stats: {
      hp: 80,
      maxHp: 80,
      attack: 18,
      defense: 12,
      speed: 8
    }
  }
];

// Get monsters in a specific zone (MOCK DATA FOR TESTING)
router.get('/zone/:zoneId', asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  
  res.json({ 
    success: true, 
    data: { 
      monsters: mockMonsters.map(monster => ({
        ...monster,
        // Flatten stats for frontend compatibility
        hp: monster.stats.hp,
        maxHp: monster.stats.maxHp
      })),
      count: mockMonsters.length,
      zone: zoneId,
      message: 'Mock monster data for testing'
    }
  });
}));

// Spawn a monster at a spawn point (MOCK FOR TESTING)
router.post('/spawn', asyncHandler(async (req, res) => {
  const { spawnPointId } = req.body;
  
  if (!spawnPointId) {
    return res.status(400).json({
      success: false,
      error: 'Spawn point ID is required'
    });
  }
  
  // Mock spawned monster data
  const mockSpawnedMonster = {
    id: `monster-${Date.now()}`,
    name: spawnPointId === 'spawn-001' ? 'Forest Goblin' : 'Cave Orc',
    level: spawnPointId === 'spawn-001' ? 5 : 8,
    position: spawnPointId === 'spawn-001' ? { x: 102, y: 0, z: 98 } : { x: 148, y: 3, z: 77 },
    state: 'spawned',
    spawnPointId: spawnPointId,
    stats: spawnPointId === 'spawn-001' ? {
      hp: 45, maxHp: 45, attack: 12, defense: 8, speed: 10
    } : {
      hp: 80, maxHp: 80, attack: 18, defense: 12, speed: 8
    }
  };
  
  res.json({ 
    success: true, 
    data: { 
      monster: {
        ...mockSpawnedMonster,
        hp: mockSpawnedMonster.stats.hp,
        maxHp: mockSpawnedMonster.stats.maxHp
      },
      message: 'Monster spawned successfully (mock data)' 
    }
  });
}));

// PATCH monster state endpoint (for testing)
router.patch('/:monsterId/state', asyncHandler(async (req, res) => {
  const { monsterId } = req.params;
  const { state } = req.body;
  
  // Validate state
  const validStates = ['alive', 'dead', 'spawning', 'respawning'];
  if (!validStates.includes(state)) {
    return res.status(400).json({
      success: false,
      message: `Invalid state. Must be one of: ${validStates.join(', ')}`
    });
  }
  
  // Simulate monster state update
  res.json({
    success: true,
    data: {
      monsterId,
      oldState: 'alive',
      newState: state,
      message: `Monster ${monsterId} state changed to ${state}`
    }
  });
}));

// DELETE monster endpoint (for testing)
router.delete('/:monsterId', asyncHandler(async (req, res) => {
  const { monsterId } = req.params;
  
  // Update mock data to remove the monster
  mockMonsters = mockMonsters.filter(m => m.id !== monsterId);
  
  // Simulate monster deletion with detailed response
  res.json({
    success: true,
    data: {
      deletedMonsterId: monsterId,
      message: `Monster ${monsterId} has been killed and removed from zone`,
      action: 'killed',
      timestamp: new Date().toISOString()
    }
  });
}));

// Update monster state (MOCK FOR TESTING)
router.patch('/:monsterId/state', asyncHandler(async (req, res) => {
  const { monsterId } = req.params;
  const { state, newState } = req.body;
  
  const finalState = state || newState;
  
  if (!finalState) {
    return res.status(400).json({
      success: false,
      error: 'State is required'
    });
  }
  
  // Validate state
  const validStates = ['alive', 'dead', 'spawning', 'respawning'];
  if (!validStates.includes(finalState)) {
    return res.status(400).json({
      success: false,
      error: `Invalid state. Must be one of: ${validStates.join(', ')}`
    });
  }
  
  // Update the actual mock monster in the array
  const monsterIndex = mockMonsters.findIndex(m => m.id === monsterId);
  if (monsterIndex !== -1) {
    const oldState = mockMonsters[monsterIndex].state;
    mockMonsters[monsterIndex] = {
      ...mockMonsters[monsterIndex],
      state: finalState
    };
    
    res.json({ 
      success: true, 
      data: {
        monsterId: monsterId,
        oldState: oldState,
        newState: finalState,
        updatedMonster: mockMonsters[monsterIndex],
        timestamp: new Date().toISOString()
      },
      message: `Monster ${monsterId} state changed to ${finalState}` 
    });
  } else {
    res.status(404).json({
      success: false,
      message: `Monster ${monsterId} not found`
    });
  }
}));

// Get monster types (MOCK DATA FOR TESTING)
router.get('/types', asyncHandler(async (_req, res) => {
  // Mock monster types data for testing
  const mockMonsterTypes = [
    {
      id: 'goblin',
      name: 'Goblin',
      level: 5,
      baseStats: { hp: 45, attack: 12, defense: 8, speed: 10 },
      description: 'Small, aggressive forest creature'
    },
    {
      id: 'orc', 
      name: 'Orc',
      level: 8,
      baseStats: { hp: 80, attack: 18, defense: 12, speed: 8 },
      description: 'Large, brutish cave dweller'
    },
    {
      id: 'skeleton',
      name: 'Skeleton',
      level: 6,
      baseStats: { hp: 40, attack: 14, defense: 6, speed: 12 },
      description: 'Undead bones animated by dark magic'
    }
  ];
  
  res.json({ 
    success: true, 
    data: { 
      monsterTypes: mockMonsterTypes,
      count: mockMonsterTypes.length,
      message: 'Mock monster types for testing'
    }
  });
}));

// Get spawn points for a zone (MOCK DATA FOR TESTING)
router.get('/spawn-points/:zoneId', asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  
  // Mock spawn points data for testing
  const mockSpawnPoints = [
    {
      id: 'spawn-001',
      name: 'Forest Clearing',
      position: { x: 100, y: 0, z: 100 },
      maxSpawns: 3,
      currentSpawns: 1,
      respawnTime: 30,
      monsterTypeId: 'goblin',
      isActive: true
    },
    {
      id: 'spawn-002',
      name: 'Dark Cave Entrance',
      position: { x: 150, y: 5, z: 75 },
      maxSpawns: 2,
      currentSpawns: 0,
      respawnTime: 60,
      monsterTypeId: 'orc', 
      isActive: true
    }
  ];
  
  res.json({ 
    success: true, 
    data: { 
      spawnPoints: mockSpawnPoints,
      count: mockSpawnPoints.length,
      zone: zoneId,
      message: 'Mock spawn points data for testing'
    }
  });
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