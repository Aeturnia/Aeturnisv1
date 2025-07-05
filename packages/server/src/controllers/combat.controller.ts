import { Request, Response } from 'express';
import { CombatService } from '../services/CombatService';
import { ResourceService } from '../services/ResourceService';
import { testMonsterService } from '../services/TestMonsterService';
import { CombatStartRequest, CombatActionRequest } from '../types/combat.types';

// Extend Request type for authenticated requests
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

const combatService = new CombatService();
const resourceService = new ResourceService();

/**
 * Start a new combat session
 */
export const startCombat = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { targetIds, battleType }: CombatStartRequest = req.body;

    // Validate that user is not targeting themselves
    if (targetIds.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot target yourself in combat'
      });
    }

    const session = await combatService.startCombat(userId, { targetIds, battleType });

    return res.status(201).json({
      success: true,
      message: 'Combat session started successfully',
      data: {
        session,
        nextAction: {
          currentTurn: session.turnOrder[session.currentTurnIndex],
          turnTimeLimit: 30000, // 30 seconds per turn
          availableActions: ['attack', 'defend', 'flee', 'useItem', 'useSkill']
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start combat'
    });
  }
};

/**
 * Get combat session details
 */
export const getSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sessionId } = req.params;
    const session = await combatService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Combat session not found'
      });
    }

    return res.json({
      success: true,
      data: {
        session,
        isActive: session.status === 'active',
        currentTurn: session.status === 'active' ? {
          charId: session.turnOrder[session.currentTurnIndex],
          roundNumber: session.roundNumber,
          turnTimeRemaining: 30000 // Mock - should calculate actual time
        } : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get combat session'
    });
  }
};

/**
 * Perform a combat action
 */
export const performAction = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { sessionId, action }: CombatActionRequest = req.body;

    // Check if session exists first
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: '⚔️ You are not in combat! Start a combat session first to attack or defend.'
      });
    }

    // Check if session exists
    const existingSession = await combatService.getSession(sessionId);
    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: '⚔️ Combat session not found! You are not currently in combat. Start a new combat session first.'
      });
    }

    // Check if session is active
    if (existingSession.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '⚔️ Combat session has ended! Start a new combat session to continue fighting.'
      });
    }

    const result = await combatService.processAction(sessionId, userId, action);

    // Get updated session state
    const session = await combatService.getSession(sessionId);

    return res.json({
      success: true,
      message: 'Action performed successfully',
      data: {
        result,
        session
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to perform action'
    });
  }
};

/**
 * Flee from combat
 */
export const fleeCombat = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { sessionId } = req.params;
    
    // Check if session exists first
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: '💨 You are not in combat! There is nothing to flee from.'
      });
    }

    // Check if session exists
    const existingSession = await combatService.getSession(sessionId);
    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: '💨 Combat session not found! You are not currently in combat. There is nothing to flee from.'
      });
    }

    // Check if session is active
    if (existingSession.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '💨 Combat has already ended! There is nothing to flee from.'
      });
    }

    const result = await combatService.fleeCombat(sessionId, userId);

    return res.json({
      success: true,
      message: 'Successfully fled from combat',
      data: { result }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to flee from combat'
    });
  }
};

/**
 * Get character combat stats
 */
export const getCharacterStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { charId } = req.params;
    const stats = await combatService.getCharacterStats(charId);

    return res.json({
      success: true,
      data: {
        stats,
        combatReadiness: {
          healthPercent: (stats.resources.hp / stats.resources.maxHp) * 100,
          manaPercent: (stats.resources.mana / stats.resources.maxMana) * 100,
          staminaPercent: (stats.resources.stamina / stats.resources.maxStamina) * 100,
          canFight: stats.resources.hp > 0 && stats.resources.stamina > 0
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get character stats'
    });
  }
};

/**
 * Get character resources
 */
export const getResources = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { charId } = req.params;
    const resources = await resourceService.getResources(charId);

    if (!resources) {
      return res.status(404).json({
        success: false,
        message: 'Character resources not found'
      });
    }

    const percentages = await resourceService.getResourcePercentages(charId);

    return res.json({
      success: true,
      data: {
        resources,
        percentages,
        regeneration: {
          hpPerSecond: resources.hpRegenRate,
          manaPerSecond: resources.manaRegenRate,
          staminaPerSecond: resources.staminaRegenRate,
          lastUpdate: resources.lastRegenTime
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get character resources'
    });
  }
};

/**
 * Simulate combat (development/testing only)
 */
export const simulateCombat = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { targetIds } = req.body;

    if (!targetIds || !Array.isArray(targetIds)) {
      return res.status(400).json({
        success: false,
        message: 'Target IDs are required for simulation'
      });
    }

    const result = await combatService.simulateCombat(userId, targetIds);

    return res.json({
      success: true,
      message: 'Combat simulation completed',
      data: {
        result,
        simulationInfo: {
          duration: result.duration,
          winner: result.winner,
          rewards: result.rewards,
          experience: result.experience
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Combat simulation failed'
    });
  }
};

/**
 * Test endpoint for combat system validation
 */
export const testCombatSystem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const testData = {
      system: 'Combat & Resource Systems',
      status: 'operational',
      timestamp: new Date().toISOString(),
      features: {
        turnBasedCombat: 'enabled',
        resourceManagement: 'enabled',
        realTimeUpdates: 'socket.io',
        actionTypes: ['attack', 'defend', 'flee', 'useItem', 'useSkill', 'pass']
      },
      endpoints: {
        startCombat: 'POST /api/v1/combat/start',
        getSession: 'GET /api/v1/combat/session/:sessionId',
        performAction: 'POST /api/v1/combat/action',
        fleeCombat: 'POST /api/v1/combat/flee/:sessionId',
        getStats: 'GET /api/v1/combat/stats/:charId',
        getResources: 'GET /api/v1/combat/resources/:charId'
      },
      sampleData: {
        mockCombatSession: {
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          participants: ['Player_550e', 'Enemy_550f'],
          status: 'active',
          currentRound: 1
        },
        mockResources: {
          hp: 100,
          maxHp: 100,
          mana: 50,
          maxMana: 50,
          stamina: 30,
          maxStamina: 30
        }
      }
    };

    return res.json({
      success: true,
      message: 'Combat system test successful',
      data: testData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Combat system test failed'
    });
  }
};

/**
 * Get available test monsters
 */
export const getTestMonsters = async (req: Request, res: Response): Promise<Response> => {
  try {
    const monsters = testMonsterService.getAllTestMonsters();
    
    return res.json({
      success: true,
      message: 'Test monsters retrieved successfully',
      data: {
        monsters: monsters.map(monster => ({
          id: monster.id,
          name: monster.name,
          level: monster.level,
          difficulty: monster.difficulty,
          description: monster.description,
          stats: {
            hp: monster.hp,
            maxHp: monster.maxHp,
            attack: monster.attack,
            defense: monster.defense,
            speed: monster.speed
          }
        })),
        count: monsters.length,
        usage: 'Use monster.id in targetIds array when starting combat'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve test monsters'
    });
  }
};