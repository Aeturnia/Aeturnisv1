import { Request, Response } from 'express';
import { MockMonsterService } from '../providers/mock/MockMonsterService';

// Create a singleton instance for all controller methods
const mockMonsterService = new MockMonsterService();

/**
 * Get monsters in a specific zone
 */
export const getMonstersInZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const monsters = await mockMonsterService.getMonstersInZone(zoneId);
    
    res.json({ 
      success: true, 
      data: { 
        monsters: monsters.map(monster => ({
          ...monster,
          // Ensure compatibility with frontend expectations
          hp: monster.currentHealth || monster.baseHealth,
          maxHp: monster.baseHealth,
          name: monster.displayName || monster.name
        })),
        count: monsters.length,
        zone: zoneId
      }
    });
  } catch (error) {
    console.error('Error getting monsters in zone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get monsters'
    });
  }
};

/**
 * Get monster by ID
 */
export const getMonsterById = async (req: Request, res: Response) => {
  try {
    const { monsterId } = req.params;
    const monster = await mockMonsterService.getMonsterById(monsterId);
    
    if (!monster) {
      return res.status(404).json({
        success: false,
        error: 'Monster not found'
      });
    }
    
    return res.json({ 
      success: true, 
      data: {
        ...monster,
        hp: monster.currentHealth || monster.baseHealth,
        maxHp: monster.baseHealth,
        name: monster.displayName || monster.name
      }
    });
  } catch (error) {
    console.error('Error getting monster by ID:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get monster'
    });
  }
};

/**
 * Get all monster types
 */
export const getMonsterTypes = async (req: Request, res: Response) => {
  try {
    const types = await mockMonsterService.getMonsterTypes();
    
    res.json({ 
      success: true, 
      data: { 
        types,
        count: types.length
      }
    });
  } catch (error) {
    console.error('Error getting monster types:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get monster types'
    });
  }
};

/**
 * Get spawn points for a zone
 */
export const getSpawnPointsByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    
    // Mock spawn points data
    const mockSpawnPoints = [
      {
        id: "spawn_001",
        name: "Forest Clearing",
        zone: zoneId,
        x: 100,
        y: 200,
        spawnRadius: 25,
        maxMonsters: 3,
        respawnTime: 300,
        monsterTypes: ["goblin", "wolf"],
        isActive: true
      },
      {
        id: "spawn_002", 
        name: "Dark Cave Entrance",
        zone: zoneId,
        x: 300,
        y: 150,
        spawnRadius: 15,
        maxMonsters: 2,
        respawnTime: 600,
        monsterTypes: ["orc", "skeleton"],
        isActive: true
      }
    ];
    
    res.json({ 
      success: true, 
      data: { 
        spawnPoints: mockSpawnPoints,
        count: mockSpawnPoints.length,
        zone: zoneId
      }
    });
  } catch (error) {
    console.error('Error getting spawn points:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get spawn points'
    });
  }
};

/**
 * Spawn a monster (admin only)
 */
export const spawnMonster = async (req: Request, res: Response) => {
  try {
    const { monsterTypeId, spawnPointId } = req.body;
    
    // Mock spawn result
    const mockSpawnResult = {
      monsterId: `monster_${Date.now()}`,
      monsterTypeId,
      spawnPointId,
      spawnedAt: new Date().toISOString(),
      location: { x: 150, y: 175 },
      level: Math.floor(Math.random() * 10) + 1,
      health: 100,
      status: "spawned"
    };
    
    res.json({ 
      success: true, 
      data: mockSpawnResult,
      message: 'Monster spawned successfully'
    });
  } catch (error) {
    console.error('Error spawning monster:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to spawn monster'
    });
  }
};

/**
 * Kill a monster
 */
export const killMonster = async (req: Request, res: Response) => {
  try {
    const { monsterId } = req.params;
    
    // For mock implementation, simulate killing the monster
    const monster = await mockMonsterService.getMonsterById(monsterId);
    
    if (!monster) {
      return res.status(404).json({
        success: false,
        error: 'Monster not found'
      });
    }
    
    // Simulate monster death
    const killResult = {
      action: 'kill',
      monsterId: monsterId,
      monsterName: monster.displayName || monster.name,
      success: true,
      message: `${monster.displayName || monster.name} has been defeated!`,
      timestamp: new Date().toISOString(),
      rewards: {
        experience: Math.floor(Math.random() * 100) + 50,
        gold: Math.floor(Math.random() * 50) + 25,
        items: [] // Could add random loot here
      }
    };
    
    console.log(`Monster killed: ${monsterId} - ${monster.displayName || monster.name}`);
    
    res.json({
      success: true,
      data: killResult
    });
  } catch (error) {
    console.error('Error killing monster:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to kill monster'
    });
  }
};

/**
 * Update monster state
 */
export const updateMonsterState = async (req: Request, res: Response) => {
  try {
    const { monsterId } = req.params;
    const { state, targetId } = req.body;

    if (!monsterId) {
      return res.status(400).json({
        success: false,
        error: 'Monster ID is required'
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'New state is required'
      });
    }

    // Update monster state using mock service
    const updatedMonster = await mockMonsterService.updateMonsterState(monsterId, state, targetId);
    
    const result = {
      success: true,
      message: `Monster ${monsterId} state updated to ${state}`,
      data: {
        monsterId: updatedMonster.id,
        newState: updatedMonster.state,
        targetId: updatedMonster.targetId,
        position: updatedMonster.position,
        health: `${updatedMonster.currentHp}/${updatedMonster.maxHp}`
      }
    };

    console.log(`Monster state updated: ${monsterId} -> ${state}`);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating monster state:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update monster state'
    });
  }
};

/**
 * Test monster system
 */
export const testMonsterSystem = async (req: Request, res: Response) => {
  try {
    const testData = {
      system: "Monster Management System",
      status: "operational",
      timestamp: new Date().toISOString(),
      features: {
        monsterRetrieval: "enabled",
        zoneFiltering: "enabled", 
        spawnPointManagement: "enabled",
        monsterTypes: "enabled"
      },
      mockData: {
        monstersInTutorialArea: 2,
        spawnPointsInTutorialArea: 2,
        monsterTypesAvailable: 6
      }
    };
    
    res.json(testData);
  } catch (error) {
    console.error('Error testing monster system:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test monster system'
    });
  }
};