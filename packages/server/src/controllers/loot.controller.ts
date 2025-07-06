import { Request, Response } from 'express';
import { LootService } from '../services/loot.service';
import { LootRepository } from '../repositories/loot.repository';
import { ILootClaimRequest, IDropModifierInput } from '../types/loot';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

// Initialize services
const lootRepository = new LootRepository();
const lootService = new LootService(lootRepository);

/**
 * Claim loot from combat session
 * POST /api/v1/loot/combat/:sessionId/claim
 */
export const claimCombatLoot = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sessionId } = req.params;
    const claimRequest: ILootClaimRequest = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Combat session ID is required',
      });
    }

    if (!claimRequest.characterId) {
      return res.status(400).json({
        success: false,
        message: 'Character ID is required',
      });
    }

    const result = await lootService.claimLoot(sessionId, claimRequest);

    logger.info('Loot claimed successfully', { 
      sessionId, 
      characterId: claimRequest.characterId,
      itemCount: result.loot.length
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error claiming loot', { error, params: req.params });

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
      message: 'Internal server error claiming loot',
    });
  }
};

/**
 * Get loot history for character
 * GET /api/v1/loot/history/:characterId
 */
export const getLootHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!characterId) {
      return res.status(400).json({
        success: false,
        message: 'Character ID is required',
      });
    }

    const history = await lootService.getLootHistory(characterId, limit);

    return res.status(200).json({
      success: true,
      history,
      total: history.length,
    });
  } catch (error) {
    logger.error('Error getting loot history', { error, params: req.params });

    return res.status(500).json({
      success: false,
      message: 'Internal server error getting loot history',
    });
  }
};

/**
 * Calculate loot drops from loot table
 * POST /api/v1/loot/calculate
 */
export const calculateLootDrops = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { lootTableName, modifiers } = req.body;

    if (!lootTableName) {
      return res.status(400).json({
        success: false,
        message: 'Loot table name is required',
      });
    }

    const dropModifiers: IDropModifierInput = {
      characterLevel: modifiers?.characterLevel || 1,
      partySize: modifiers?.partySize || 1,
      luckBonus: modifiers?.luckBonus || 0,
      eventModifiers: modifiers?.eventModifiers || {},
      seed: modifiers?.seed,
    };

    const drops = await lootService.calculateLootDrops(lootTableName, dropModifiers);

    return res.status(200).json({
      success: true,
      drops,
      total: drops.length,
      modifiers: dropModifiers,
    });
  } catch (error) {
    logger.error('Error calculating loot drops', { error, body: req.body });

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error calculating loot drops',
    });
  }
};

/**
 * Test endpoint for loot system validation
 * GET /api/v1/loot/test
 */
export const testLootSystem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const testData = {
      system: 'Loot & Rewards System',
      status: 'operational',
      timestamp: new Date().toISOString(),
      features: {
        lootCalculation: 'enabled',
        lootClaim: 'enabled',
        lootHistory: 'enabled',
        dropModifiers: 'enabled',
        raritySystem: ['common', 'uncommon', 'rare', 'epic', 'legendary']
      },
      endpoints: {
        claimCombatLoot: 'POST /api/v1/loot/combat/:sessionId/claim',
        getLootHistory: 'GET /api/v1/loot/history/:characterId',
        calculateLootDrops: 'POST /api/v1/loot/calculate',
        testSystem: 'GET /api/v1/loot/test',
        testClaim: 'POST /api/v1/loot/test-claim',
        testCalculate: 'POST /api/v1/loot/test-calculate'
      },
      sampleData: {
        mockCombatSession: 'combat_550e8400-e29b-41d4-a716-446655440000',
        mockCharacterId: '550e8400-e29b-41d4-a716-446655440000',
        supportedRarities: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        modifiers: {
          characterLevel: 'number (1-100+)',
          partySize: 'number (1-8)',
          luckBonus: 'number (0.0-1.0)',
          eventModifiers: 'object with multipliers'
        }
      },
      integrations: {
        combatSystem: 'Combat Engine v2.0',
        database: 'PostgreSQL with Drizzle ORM',
        itemSystem: 'Equipment & Inventory System'
      }
    };

    return res.status(200).json(testData);
  } catch (error) {
    logger.error('Error in loot system test endpoint', { error });

    return res.status(500).json({
      success: false,
      message: 'Loot system test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test loot claim with mock data
 * POST /api/v1/loot/test-claim
 */
export const testLootClaim = async (req: Request, res: Response): Promise<Response> => {
  try {
    const mockSessionId = 'combat_550e8400-e29b-41d4-a716-446655440000';
    const mockCharacterId = '550e8400-e29b-41d4-a716-446655440000';

    // Generate mock loot claim
    const mockClaim = await lootService.claimLoot(mockSessionId, {
      characterId: mockCharacterId
    });

    logger.info('Loot system test claim completed', { 
      mockSessionId, 
      mockCharacterId,
      itemCount: mockClaim.loot.length
    });

    return res.status(200).json({
      message: 'Loot claim test completed successfully',
      testData: mockClaim,
      note: 'This used mock loot generation for testing'
    });
  } catch (error) {
    logger.error('Error in test loot claim', { error });

    return res.status(500).json({
      success: false,
      message: 'Test loot claim failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test loot calculation with mock data
 * POST /api/v1/loot/test-calculate
 */
export const testLootCalculation = async (req: Request, res: Response): Promise<Response> => {
  try {
    // First create a test loot table if it doesn't exist
    try {
      await lootService.createTestLootTable();
    } catch (error) {
      // Table might already exist, continue
    }

    const mockModifiers: IDropModifierInput = {
      characterLevel: 10,
      partySize: 2,
      luckBonus: 0.1,
      eventModifiers: { double_drop_weekend: 2.0 },
      seed: 'test_seed_123'
    };

    const drops = await lootService.calculateLootDrops('test_monster_loot', mockModifiers);

    logger.info('Loot calculation test completed', { 
      drops: drops.length,
      modifiers: mockModifiers
    });

    return res.status(200).json({
      message: 'Loot calculation test completed successfully',
      testData: {
        drops,
        modifiers: mockModifiers,
        lootTable: 'test_monster_loot'
      },
      note: 'This used test loot table data for calculation'
    });
  } catch (error) {
    logger.error('Error in test loot calculation', { error });

    return res.status(500).json({
      success: false,
      message: 'Test loot calculation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all available loot tables
 * GET /api/v1/loot/tables
 */
export const getLootTables = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tables = await lootRepository.getAllLootTables();

    return res.status(200).json({
      success: true,
      tables,
      total: tables.length,
    });
  } catch (error) {
    logger.error('Error getting loot tables', { error });

    return res.status(500).json({
      success: false,
      message: 'Internal server error getting loot tables',
    });
  }
};