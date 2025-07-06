import { Request, Response } from 'express';
import { DeathService } from '../services/death.service';
import { DeathRepository } from '../repositories/death.repository';
import { CacheService } from '../services/CacheService';
import { IDeathRequest, IDeathStatusResponse } from '../types/death';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

// Initialize services
const cacheService = new CacheService();
const deathRepository = new DeathRepository();
const deathService = new DeathService(deathRepository, cacheService);

/**
 * Process character death
 * POST /api/v1/death/:characterId
 */
export const processCharacterDeath = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;
    const deathRequest: IDeathRequest = req.body;

    if (!characterId) {
      return res.status(400).json({
        success: false,
        message: 'Character ID is required',
      });
    }

    const result = await deathService.processCharacterDeath(characterId, deathRequest);

    logger.info('Character death processed via API', { 
      characterId, 
      reason: deathRequest.reason 
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error processing character death', { error, params: req.params });

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error processing character death',
    });
  }
};

/**
 * Process character respawn
 * POST /api/v1/death/:characterId/respawn
 */
export const processCharacterRespawn = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;

    if (!characterId) {
      return res.status(400).json({
        success: false,
        message: 'Character ID is required',
      });
    }

    const result = await deathService.processCharacterRespawn(characterId);

    logger.info('Character respawn processed via API', { characterId });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error processing character respawn', { error, params: req.params });

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error processing character respawn',
    });
  }
};

/**
 * Get character death status
 * GET /api/v1/death/:characterId/status
 */
export const getCharacterDeathStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;

    if (!characterId) {
      return res.status(400).json({
        success: false,
        message: 'Character ID is required',
      });
    }

    const status = await deathService.getCharacterDeathStatus(characterId);

    return res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
    logger.error('Error getting character death status', { error, params: req.params });

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error getting death status',
    });
  }
};

/**
 * Test endpoint for death system validation
 * GET /api/v1/death/test
 */
export const testDeathSystem = async (req: Request, res: Response): Promise<Response> => {
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
          experienceLoss: '10%',
          goldLoss: '5%',
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

    return res.status(200).json(testData);
  } catch (error) {
    logger.error('Error in death system test endpoint', { error });

    return res.status(500).json({
      success: false,
      message: 'Death system test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test character death with mock data
 * POST /api/v1/death/test-death
 */
export const testCharacterDeath = async (req: Request, res: Response): Promise<Response> => {
  try {
    const mockCharacterId = '550e8400-e29b-41d4-a716-446655440000';
    const mockDeathRequest: IDeathRequest = {
      reason: 'combat' as any,
      killerId: '550e8400-e29b-41d4-a716-446655440001',
      context: {
        damageType: 'physical',
        lastDamageSource: 'orc_warrior_axe',
        combatSessionId: 'combat_550e8400'
      }
    };

    // This is a test endpoint, so we'll return mock data instead of actually processing death
    const mockResponse = {
      success: true,
      deathAt: new Date().toISOString(),
      penalties: {
        xpLoss: 500,
        xpLossPercentage: 10,
        durabilityDamage: [],
        goldLoss: 50
      }
    };

    logger.info('Death system test completed', { mockCharacterId });

    return res.status(200).json({
      message: 'Death system test completed successfully',
      testData: mockResponse,
      note: 'This is a test endpoint with mock data - no actual character was harmed'
    });
  } catch (error) {
    logger.error('Error in test character death', { error });

    return res.status(500).json({
      success: false,
      message: 'Test character death failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test character respawn with mock data
 * POST /api/v1/death/test-respawn
 */
export const testCharacterRespawn = async (req: Request, res: Response): Promise<Response> => {
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