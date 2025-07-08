import { Request, Response } from 'express';
import { ServiceProvider, IDeathService } from '../providers';
import { IDeathRequest } from '../types/death';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

/**
 * Process character death
 * POST /api/v1/death/:characterId
 */
export const processCharacterDeath = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;
    const deathRequest: IDeathRequest = req.body;
    const deathService = ServiceProvider.getInstance().get<IDeathService>('DeathService');

    if (!characterId) {
      return sendValidationError(res, 'Character ID is required');
    }

    const result = await deathService.processCharacterDeath(characterId, deathRequest);

    logger.info('Character death processed via API', { 
      characterId, 
      reason: deathRequest.reason 
    });

    return sendSuccess(res, result);
  } catch (error) {
    logger.error('Error processing character death', { error, params: req.params });

    if (error instanceof ValidationError) {
      return sendValidationError(res, error.message);
    }

    if (error instanceof NotFoundError) {
      return sendNotFound(res, 'Resource', error.message);
    }

    return sendError(res, 'Internal server error', 'Internal server error processing character death');
  }
};

/**
 * Process character respawn
 * POST /api/v1/death/:characterId/respawn
 */
export const processCharacterRespawn = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;
    const deathService = ServiceProvider.getInstance().get<IDeathService>('DeathService');

    if (!characterId) {
      return sendValidationError(res, 'Character ID is required');
    }

    const result = await deathService.processCharacterRespawn(characterId);

    logger.info('Character respawn processed via API', { characterId });

    return sendSuccess(res, result);
  } catch (error) {
    logger.error('Error processing character respawn', { error, params: req.params });

    if (error instanceof ValidationError) {
      return sendValidationError(res, error.message);
    }

    if (error instanceof NotFoundError) {
      return sendNotFound(res, 'Resource', error.message);
    }

    return sendError(res, 'Internal server error', 'Internal server error processing character respawn');
  }
};

/**
 * Get character death status
 * GET /api/v1/death/:characterId/status
 */
export const getCharacterDeathStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;
    const deathService = ServiceProvider.getInstance().get<IDeathService>('DeathService');

    if (!characterId) {
      return sendValidationError(res, 'Character ID is required');
    }

    const status = await deathService.getCharacterDeathStatus(characterId);

    return sendSuccess(res, { status });
  } catch (error) {
    logger.error('Error getting character death status', { error, params: req.params });

    if (error instanceof NotFoundError) {
      return sendNotFound(res, 'Resource', error.message);
    }

    return sendError(res, 'Internal server error', 'Internal server error getting death status');
  }
};

/**
 * Test endpoint for death system validation
 * GET /api/v1/death/test
 */
export const testDeathSystem = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const testData = {
      system: 'Death & Respawn System',
      status: 'operational',
      timestamp: new Date().toISOString(),
      features: {
        characterDeath: 'enabled',
        respawnSystem: 'enabled',
        deathPenalties: 'enabled',
        respawnCooldown: '30 seconds',
        deathReasons: ['combat', 'fall_damage', 'environmental', 'admin', 'unknown']
      },
      endpoints: {
        processCharacterDeath: 'POST /api/v1/death/:characterId',
        processCharacterRespawn: 'POST /api/v1/death/:characterId/respawn',
        getDeathStatus: 'GET /api/v1/death/:characterId/status',
        testSystem: 'GET /api/v1/death/test'
      },
      sampleData: {
        mockCharacterId: '550e8400-e29b-41d4-a716-446655440000',
        supportedDeathReasons: ['combat', 'fall_damage', 'environmental', 'admin'],
        penalties: {
          experienceLoss: '80%',
          goldLoss: '100%',
          durabilityDamage: '15%',
          respawnCooldown: '30 seconds'
        }
      },
      integrations: {
        combatSystem: 'Combat Engine v2.0',
        cacheSystem: 'Redis/Memory Cache',
        database: 'PostgreSQL with Drizzle ORM'
      }
    };

    return sendSuccess(res, testData);
  } catch (error) {
    logger.error('Error in death system test endpoint', { error });

    return sendError(res, 'Death system test failed', error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Test character death with mock data
 * POST /api/v1/death/test-death
 */
export const testCharacterDeath = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const mockCharacterId = '550e8400-e29b-41d4-a716-446655440000';

    // This is a test endpoint, so we'll return mock data instead of actually processing death
    const mockResponse = {
      success: true,
      deathAt: new Date().toISOString(),
      penalties: {
        xpLoss: 4000,
        xpLossPercentage: 80,
        durabilityDamage: [],
        goldLoss: 1000
      }
    };

    logger.info('Death system test completed', { mockCharacterId });

    return sendSuccess(res, {
      testData: mockResponse,
      note: 'This is a test endpoint with mock data - no actual character was harmed'
    }, 'Death system test completed successfully');
  } catch (error) {
    logger.error('Error in test character death', { error });

    return sendError(res, 'Test character death failed', error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Test character respawn with mock data
 * POST /api/v1/death/test-respawn
 */
export const testCharacterRespawn = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const mockCharacterId = '550e8400-e29b-41d4-a716-446655440000';

    // Mock respawn response
    const mockResponse = {
      success: true,
      location: {
        zoneId: 'starter_zone',
        x: 100,
        y: 200,
      },
      revivedAt: new Date().toISOString(),
    };

    logger.info('Respawn system test completed', { mockCharacterId });

    return res.status(200).json({
      message: 'Respawn system test completed successfully',
      testData: mockResponse,
      note: 'This is a test endpoint with mock data'
    });
  } catch (error) {
    logger.error('Error in test character respawn', { error });

    return res.status(500).json({
      success: false,
      message: 'Test character respawn failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test character death status with mock data
 * GET /api/v1/death/test-status
 */
export const testCharacterDeathStatus = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const mockCharacterId = '550e8400-e29b-41d4-a716-446655440000';

    // Mock death status response
    const mockStatus = {
      characterId: mockCharacterId,
      isDead: true,
      deathAt: new Date(Date.now() - 60000).toISOString(), // Died 1 minute ago
      deathReason: 'combat',
      killerId: 'test_goblin_001',
      respawnCooldownRemaining: 0, // Ready to respawn
      canRespawn: true,
      penalties: {
        xpLoss: 4000,
        xpLossPercentage: 80,
        goldLoss: 1000,
        durabilityDamage: []
      },
      respawnLocation: {
        zoneId: 'starter_zone',
        x: 100,
        y: 200
      }
    };

    logger.info('Death status test completed', { mockCharacterId });

    return sendSuccess(res, {
      status: mockStatus,
      note: 'This is a test endpoint with mock data'
    }, 'Death status test completed successfully');
  } catch (error) {
    logger.error('Error in test character death status', { error });

    return sendError(res, 'Test character death status failed', error instanceof Error ? error.message : 'Unknown error');
  }
};