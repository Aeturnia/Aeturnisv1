import { Request, Response } from 'express';

/**
 * Test Combat System - Simple Mock Implementation
 */
export const testCombatSystem = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Combat system test successful',
      data: {
        engine: 'Combat Engine v2.0',
        status: 'operational',
        features: ['Enhanced AI', 'Resource Management', 'Real-time Combat']
      }
    });
  } catch (error) {
    console.error('Combat system test error:', error);
    res.status(500).json({
      success: false,
      message: 'Combat system test failed'
    });
  }
};

/**
 * Get Engine Info - Simple Mock Implementation
 */
export const getEngineInfo = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        version: '2.0.0',
        name: 'Combat Engine v2.0',
        features: [
          'Enhanced AI & Resource Management',
          'Dynamic action selection',
          'Smart target prioritization',
          'Resource tracking'
        ],
        lastUpdate: '2025-07-06',
        status: 'operational'
      }
    });
  } catch (error) {
    console.error('Engine info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get engine info'
    });
  }
};

/**
 * Get Test Monsters - Simple Mock Implementation
 */
export const getTestMonsters = async (_req: Request, res: Response) => {
  try {
    const testMonsters = [
      {
        id: 'test_goblin_001',
        name: 'Training Goblin',
        level: 3,
        hp: 45,
        maxHp: 45,
        damage: 8,
        defense: 2
      },
      {
        id: 'test_orc_001', 
        name: 'Orc Warrior',
        level: 5,
        hp: 80,
        maxHp: 80,
        damage: 15,
        defense: 5
      },
      {
        id: 'test_skeleton_001',
        name: 'Skeleton Fighter',
        level: 4,
        hp: 60,
        maxHp: 60,
        damage: 12,
        defense: 3
      }
    ];

    res.json({
      success: true,
      data: {
        monsters: testMonsters,
        count: testMonsters.length,
        message: 'Test monsters retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Get test monsters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve test monsters'
    });
  }
};

/**
 * Start Test Combat - Simple Mock Implementation
 */
export const startTestCombat = async (req: Request, res: Response) => {
  try {
    const { monsterId } = req.body;
    
    if (!monsterId) {
      return res.status(400).json({
        success: false,
        message: 'Monster ID required'
      });
    }

    const sessionId = `test_combat_${Date.now()}`;
    
    return res.json({
      success: true,
      data: {
        sessionId,
        status: 'active',
        player: {
          name: 'Test Player',
          hp: 100,
          maxHp: 100
        },
        enemy: {
          id: monsterId,
          name: 'Training Goblin',
          hp: 45,
          maxHp: 45
        },
        message: 'Combat started successfully!'
      }
    });
  } catch (error) {
    console.error('Start test combat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start combat'
    });
  }
};