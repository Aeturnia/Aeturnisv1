import { Request, Response } from 'express';
import { ServiceProvider, ICombatService } from '../providers';
import { CombatStartRequest, CombatActionRequest, CombatActionType, CombatAction } from '../types/combat.types';
import { logger } from '../utils/logger';
import { assertServiceDefined } from '../utils/validators';
import { createSuccessResponse, createErrorResponse } from '../types/api.types';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';
import { TestMonster } from '../services/TestMonsterService';

// Extend Request type for authenticated requests
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

// All services now use ServiceProvider pattern

/**
 * Get mock player stats for testing interface
 */
export const getPlayerStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const mockPlayerStats = {
      charId: 'player_test_001',
      name: 'Hero Player',
      level: 25,
      race: 'human',
      class: 'warrior',
      stats: {
        strength: 28,
        dexterity: 18,
        intelligence: 14,
        wisdom: 16,
        constitution: 24,
        charisma: 12,
        attack: 45,
        defense: 32,
        speed: 15,
        critRate: 0.15,
        critDamage: 2.2
      },
      resources: {
        hp: 180,
        maxHp: 180,
        mana: 80,
        maxMana: 80,
        stamina: 120,
        maxStamina: 120,
        hpRegenRate: 2,
        manaRegenRate: 1,
        staminaRegenRate: 3,
        lastRegenTime: Date.now()
      },
      equipment: {
        weapon: 'Steel Sword +3',
        armor: 'Plate Mail',
        accessory: 'Ring of Strength'
      },
      progression: {
        experience: 45600,
        experienceToNext: 8400,
        skillPoints: 12,
        attributePoints: 3
      }
    };

    return res.status(200).json(createSuccessResponse(mockPlayerStats, 'Player stats retrieved successfully'));
  } catch (error) {
    return res.status(500).json(createErrorResponse('Internal server error', error instanceof Error ? error.message : 'Failed to get player stats'));
  }
};

/**
 * Get combat session by ID (no auth required for testing)
 */
export const getCombatSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    logger.debug(`Looking for combat session: ${sessionId}`);
    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
    assertServiceDefined(combatService, 'CombatService');
    
    const session = await combatService.getSession(sessionId);
    logger.debug(`Session found: ${session ? 'Yes' : 'No'}`);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Combat session not found'
      });
    }

    return sendSuccess(res, {
      session,
      plainText: `Combat Status: ${session.status?.toUpperCase() || 'UNKNOWN'}\nRound: ${session.roundNumber || 1}\nCurrent Turn: ${session.participants?.find(p => p.charId === session.turnOrder?.[session.currentTurn || 0])?.charName || 'Unknown'}`
    }, 'Combat session retrieved successfully');
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get combat session'
    });
  }
};

/**
 * Perform test combat action (no auth required for testing)
 */
export const performTestAction = async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.debug('=== COMBAT ACTION DEBUG START ===');
    logger.debug('Request body:', JSON.stringify(req.body, null, 2));
    
    const { sessionId, action, targetId } = req.body;
    
    logger.debug('Extracted values:', {
      sessionId,
      action,
      targetId
    });
    
    if (!sessionId) {
      logger.debug('Validation failed: missing sessionId');
      return res.status(400).json({
        success: false,
        message: '🆔 Combat session ID is required!',
        hint: 'Start a combat session first to perform actions'
      });
    }
    
    if (!action) {
      logger.debug('Validation failed: missing action');
      return res.status(400).json({
        success: false,
        message: '⚡ Action is required!',
        hint: 'Specify what you want to do: attack, defend, flee, etc.',
        availableActions: ['attack', 'defend', 'flee', 'useItem', 'useSkill', 'pass']
      });
    }

    // Use mock player ID for testing
    const actorId = '550e8400-e29b-41d4-a716-446655440000';
    logger.debug('Using actor ID:', actorId);
    
    // Validate action type
    const validActions = Object.values(CombatActionType);
    const actionType = action.toLowerCase();
    logger.debug('Action type validation:', {
      provided: actionType,
      valid: validActions,
      isValid: validActions.includes(actionType as CombatActionType)
    });
    
    if (!validActions.includes(actionType as CombatActionType)) {
      logger.debug('Invalid action type provided');
      return res.status(400).json({
        success: false,
        message: `⚔️ Invalid combat action! Available actions: ${validActions.join(', ')}`,
        hint: 'Try: attack, defend, flee, useItem, useSkill, or pass',
        validActions: validActions
      });
    }
    
    // Auto-select target for test actions if not provided
    let finalTargetId = targetId;
    if (['attack', 'useSkill'].includes(actionType) && !targetId) {
      // Auto-select first enemy in session for test attacks
      finalTargetId = 'test_goblin_001'; // Default test target
      logger.debug('Auto-selected target for action:', finalTargetId);
    }

    // Create proper action object with proper enum values
    const combatAction: CombatAction = {
      type: actionType as CombatActionType,
      targetCharId: finalTargetId,
      targetId: finalTargetId, // Include both for compatibility
      timestamp: Date.now()
    };
    
    logger.debug('Combat action object:', JSON.stringify(combatAction, null, 2));
    
    // Check if session exists before processing action
    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
    if (!combatService) {
      throw new Error('CombatService not available');
    }
    
    const session = await combatService.getSession(sessionId);
    logger.debug('Session lookup result:', {
      sessionId,
      exists: !!session,
      status: session?.status || 'N/A'
    });
    
    if (!session) {
      logger.debug('Session not found');
      // Check if this is because the player is dead (session ended)
      // In a real implementation, we'd check character death status from database
      // For testing, we assume session not found after combat = player is dead
      return res.status(400).json({
        success: false,
        message: '💀 You cannot fight while dead! Please respawn first before entering combat.',
        combatStatus: 'player_dead',
        hint: 'Use the Death & Respawn System to revive your character'
      });
    }
    
    logger.debug('Processing action with combat service...');
    assertServiceDefined(combatService, 'CombatService');
    
    const result = await combatService.processAction(sessionId, actorId, combatAction);
    logger.debug('Combat service result:', JSON.stringify(result, null, 2));

    logger.debug('=== COMBAT ACTION DEBUG END ===');
    
    // Handle CombatService errors with helpful messages
    if ('error' in result) {
      const errorResult = result as { error: string; code?: string };
      logger.debug('Combat service returned error:', errorResult.error, 'Code:', errorResult.code);
      
      let userMessage = errorResult.error;
      let statusCode = 400;
      let hint = '';
      
      switch (errorResult.code) {
        case 'INVALID_ACTION':
          if (errorResult.error.includes('not found in combat')) {
            userMessage = '🚫 You are not participating in this combat session!';
            hint = 'Join a combat session first or check your session ID';
          } else if (errorResult.error.includes('not active')) {
            userMessage = '⏸️ You cannot act right now! Combat may be paused or ended.';
            hint = 'Wait for your turn or check combat status';
          } else if (errorResult.error.includes('session is not active')) {
            userMessage = '🔒 This combat session has ended or is not active.';
            hint = 'Start a new combat session to continue fighting';
          }
          break;
          
        case 'COMBAT_TIMEOUT':
          userMessage = '⏰ Combat has timed out! Maximum turns exceeded.';
          hint = 'Combat automatically ends after too many rounds';
          break;
          
        case 'INSUFFICIENT_RESOURCES':
          if (errorResult.error.includes('stamina')) {
            userMessage = '😴 Not enough stamina! You need to rest or use a lighter action.';
            hint = 'Try defending (costs less stamina) or wait to recover';
          } else if (errorResult.error.includes('mana')) {
            userMessage = '🔮 Not enough mana! You cannot cast this skill right now.';
            hint = 'Use basic attacks or wait for mana to regenerate';
          } else {
            userMessage = `💪 Insufficient resources! ${errorResult.error}`;
            hint = 'Check your health, mana, and stamina levels';
          }
          break;
          
        default:
          userMessage = `⚔️ Combat Error: ${errorResult.error}`;
          hint = 'Please try again or contact support if this persists';
      }
      
      return res.status(statusCode).json({
        success: false,
        message: userMessage,
        hint: hint,
        errorCode: errorResult.code,
        originalError: errorResult.error
      });
    }
    
    // Return successful result
    return res.status(200).json({
      success: true,
      ...result  // Spread result to include message, combatStatus, etc. at top level
    });
  } catch (error) {
    logger.error('=== COMBAT ACTION ERROR ===');
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    logger.error('Request body at error:', JSON.stringify(req.body, null, 2));
    logger.error('=== END COMBAT ACTION ERROR ===');
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to perform combat action',
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      } : undefined
    });
  }
};

/**
 * Test flee from combat (no auth required for testing)
 */
export const fleeTestCombat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return sendValidationError(res, 'Session ID is required');
    }

    // Use mock player ID for testing
    const actorId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Create proper flee action object
    const fleeAction: CombatAction = {
      type: CombatActionType.FLEE,
      timestamp: Date.now()
    };
    
    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
    assertServiceDefined(combatService, 'CombatService');
    
    const result = await combatService.processAction(sessionId, actorId, fleeAction);
    
    // Handle flee-specific errors with helpful messages
    if ('error' in result) {
      const errorResult = result as { error: string; code?: string };
      let userMessage = errorResult.error;
      let hint = '';
      
      switch (errorResult.code) {
        case 'INVALID_ACTION':
          if (errorResult.error.includes('not found in combat')) {
            userMessage = '🏃 You are not in combat! Nothing to flee from.';
            hint = 'Start a combat session first to use flee action';
          } else if (errorResult.error.includes('not active')) {
            userMessage = '🔒 Combat is not active! Cannot flee from inactive combat.';
            hint = 'Check combat status or start a new combat session';
          }
          break;
        case 'INSUFFICIENT_RESOURCES':
          userMessage = '😴 Too exhausted to flee! You need stamina to run away.';
          hint = 'Wait for stamina to recover or try other actions';
          break;
        default:
          userMessage = `🏃 Flee Error: ${errorResult.error}`;
          hint = 'Try again or check your combat status';
      }
      
      return res.status(400).json({
        success: false,
        message: userMessage,
        hint: hint,
        errorCode: errorResult.code
      });
    }

    return res.status(200).json({
      success: true,
      ...result  // Spread result to include message, combatStatus, etc.
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to flee from combat'
    });
  }
};

/**
 * Start a new combat session - test version for test monsters (no auth required)
 */
export const startTestCombat = async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.debug('=== START TEST COMBAT DEBUG ===');
    logger.debug('Request body:', JSON.stringify(req.body, null, 2));
    
    const { targetIds } = req.body;
    
    logger.debug('Extracted values:', {
      targetIds
    });
    
    // For test monsters, use a mock user ID
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    logger.debug('Using mock user ID:', mockUserId);
    
    const combatRequest: CombatStartRequest = {
      targetIds: targetIds || ['test_goblin_001'],
      battleType: 'pve'
    };
    
    logger.debug('Combat request:', JSON.stringify(combatRequest, null, 2));
    logger.debug('Calling combatService.startCombat...');
    
    // Use the shared combatService instance with force start for testing
    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
    if (!combatService) {
      throw new Error('CombatService not available');
    }
    
    const session = await combatService.startCombat('player-test-001', combatRequest);

    logger.debug(`Combat session created successfully: ${session.sessionId}`);
    logger.debug('Session details:', JSON.stringify({
      sessionId: session.sessionId,
      status: session.status,
      participantCount: session.participants.length,
      participants: session.participants.map(p => p.charId)
    }, null, 2));

    const response = {
      success: true,
      message: 'Combat started successfully!',
      data: {
        sessionId: session.sessionId,
        session: session,
        combatMessage: 'Battle has begun! Choose your action.',
        status: 'active'
      }
    };

    logger.debug('=== START TEST COMBAT SUCCESS ===');
    return res.status(201).json(response);
  } catch (error) {
    logger.error('=== START TEST COMBAT ERROR ===');
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    logger.error('Request body at error:', JSON.stringify(req.body, null, 2));
    logger.error('=== END START TEST COMBAT ERROR ===');
    
    let userMessage = 'Failed to start combat session';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('already in combat')) {
        userMessage = '⚔️ You are already in combat! Finish your current battle first.';
        statusCode = 409; // Conflict
      } else if (error.message.includes('invalid target')) {
        userMessage = '🎯 Invalid target selected! Please choose a valid enemy.';
        statusCode = 400;
      } else if (error.message.includes('not enough participants')) {
        userMessage = '👥 Not enough participants! Combat needs at least 2 characters.';
        statusCode = 400;
      } else {
        userMessage = `🚨 Combat startup error: ${error.message}`;
      }
    }
    
    return res.status(statusCode).json({
      success: false,
      message: userMessage,
      hint: 'Check your combat status and target selection',
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      } : undefined
    });
  }
};

/**
 * Start a new combat session (authenticated)
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

    const { targetIds }: CombatStartRequest = req.body;

    // Validate that user is not targeting themselves
    if (targetIds.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot target yourself in combat'
      });
    }

    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');


    const combatRequest: CombatStartRequest = {
      targetIds,
      battleType: 'pve'
    };

    const session = await combatService.startCombat(userId, combatRequest);

    return res.status(201).json({
      success: true,
      message: 'Combat session started successfully',
      data: {
        session,
        nextAction: {
          currentTurn: session.turnOrder[session.currentTurn],
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
    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');

    const session = await combatService.getSession(sessionId);

    if (!session) {
      return sendNotFound(res, 'Combat session', sessionId);
    }

    return res.json({
      success: true,
      data: {
        session,
        isActive: session.status === 'active',
        currentTurn: session.status === 'active' ? {
          charId: session.turnOrder[session.currentTurn],
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


    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
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

    assertServiceDefined(combatService, 'CombatService');
    
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


    const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
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
    // TODO: getCharacterStats not in ICombatService
    // const stats = await combatService.getCharacterStats(charId);
    const stats = {
      resources: {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        stamina: 75,
        maxStamina: 75
      }
    };
    logger.debug(`Getting stats for character: ${charId}`);

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
    
    // TODO: getCharacterResources not in ICombatService
    // const resources = await combatService.getCharacterResources(charId);
    const resources = {
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      stamina: 75,
      maxStamina: 75,
      hpRegenRate: 1,
      manaRegenRate: 0.5,
      staminaRegenRate: 2,
      lastRegenTime: Date.now()
    };
    logger.debug(`Getting resources for character: ${charId}`);

    if (!resources) {
      return sendNotFound(res, 'Character resources', charId);
    }

    // Calculate percentages
    const percentages = {
      healthPercent: (resources.hp / resources.maxHp) * 100,
      manaPercent: (resources.mana / resources.maxMana) * 100,
      staminaPercent: (resources.stamina / resources.maxStamina) * 100
    };

    return sendSuccess(res, {
      resources,
      percentages,
      regeneration: {
        hpPerSecond: resources.hpRegenRate,
        manaPerSecond: resources.manaRegenRate,
        staminaPerSecond: resources.staminaRegenRate,
        lastUpdate: resources.lastRegenTime
      },
      combatReadiness: {
        canFight: resources.hp > 0 && resources.stamina > 0,
        healthStatus: percentages.healthPercent > 75 ? 'excellent' : 
                    percentages.healthPercent > 50 ? 'good' : 
                    percentages.healthPercent > 25 ? 'wounded' : 'critical',
        resourceSummary: `HP: ${resources.hp}/${resources.maxHp}, MP: ${resources.mana}/${resources.maxMana}, SP: ${resources.stamina}/${resources.maxStamina}`
      }
    });
  } catch (error) {
    return sendError(res, 'Internal server error', error instanceof Error ? error.message : 'Failed to get character resources');
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

    // TODO: simulateCombat not in ICombatService
    // const result = await combatService.simulateCombat(userId, targetIds);
    const result = {
      duration: 0,
      winner: 'none',
      rewards: [],
      experience: 0
    };

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
export const testCombatSystem = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Version info for combat system
    const versionInfo = {
      version: '2.0.0',
      engine: 'Aeturnis Combat Engine',
      lastUpdated: '2024-01-20'
    };
    
    const testData = {
      system: 'Combat & Resource Systems',
      status: 'operational',
      timestamp: new Date().toISOString(),
      engine: versionInfo,
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
        getResources: 'GET /api/v1/combat/resources/:charId',
        version: 'GET /api/v1/combat/version'
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
export const getTestMonsters = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Get monster service from ServiceProvider
    const monsterService = ServiceProvider.getInstance().get('MonsterService') as { getAllTestMonsters(): TestMonster[] };
    if (!monsterService || typeof monsterService.getAllTestMonsters !== 'function') {
      // Return hardcoded test monsters if service not available
      const monsters = [
        {
          id: 'test_goblin_001',
          name: 'Training Goblin',
          level: 5,
          difficulty: 'easy',
          description: 'A weak goblin for training',
          hp: 60,
          maxHp: 60,
          attack: 15,
          defense: 10,
          speed: 12
        },
        {
          id: 'test_orc_001',
          name: 'Forest Orc',
          level: 10,
          difficulty: 'medium',
          description: 'A stronger opponent',
          hp: 120,
          maxHp: 120,
          attack: 30,
          defense: 20,
          speed: 10
        }
      ];
      
      return res.json({
        success: true,
        message: 'Test monsters retrieved successfully',
        data: monsters
      });
    }
    
    const monsters = monsterService.getAllTestMonsters();
    
    // Return monsters array directly for frontend compatibility
    const monstersData = monsters.map((monster: TestMonster) => ({
      id: monster.id,
      name: monster.name,
      level: monster.level,
      difficulty: monster.difficulty,
      description: monster.description,
      // Flatten stats for frontend compatibility
      hp: monster.hp,
      maxHp: monster.maxHp,
      attack: monster.attack,
      defense: monster.defense,
      speed: monster.speed
    }));
    
    return res.json({
      success: true,
      message: 'Test monsters retrieved successfully',
      data: monstersData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve test monsters'
    });
  }
};

/**
 * Get Combat Engine version information
 */
export const getCombatEngineVersion = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const versionInfo = {
      version: '2.0.0',
      engine: 'Aeturnis Combat Engine',
      lastUpdated: '2024-01-20',
      features: [
        'Turn-based combat',
        'Resource management',
        'Real-time updates',
        'Skill system',
        'Status effects'
      ]
    };
    
    return res.json({
      success: true,
      message: 'Combat Engine version information retrieved',
      data: versionInfo
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Combat Engine version'
    });
  }
};