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

/**
 * Generate loot for testing
 * POST /api/v1/loot/generate
 */
export const generateLoot = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { characterId, enemyLevel, lootType } = req.body;
    
    // Mock loot generation for testing
    const mockLoot = {
      lootId: 'loot_' + Date.now(),
      characterId: characterId || 'player-test-001',
      enemyLevel: enemyLevel || 5,
      lootType: lootType || 'monster_kill',
      items: [
        {
          itemId: 'item_001',
          name: 'Iron Sword',
          rarity: 'common',
          quantity: 1,
          stats: { damage: 15, durability: 100 },
          value: 50
        },
        {
          itemId: 'item_002', 
          name: 'Health Potion',
          rarity: 'common',
          quantity: 3,
          healing: 25,
          value: 10
        },
        {
          itemId: 'item_003',
          name: 'Silver Ring',
          rarity: 'rare',
          quantity: 1,
          stats: { defense: 5, luck: 2 },
          value: 150
        }
      ],
      totalValue: 210,
      experience: 125,
      gold: 45,
      generatedAt: new Date().toISOString()
    };

    logger.info('Loot generation test completed', { 
      characterId: mockLoot.characterId,
      itemCount: mockLoot.items.length,
      totalValue: mockLoot.totalValue
    });

    return res.status(200).json({
      success: true,
      data: mockLoot,
      message: 'Loot generated successfully (mock data)'
    });
  } catch (error) {
    logger.error('Error generating loot', { error });

    return res.status(500).json({
      success: false,
      message: 'Error generating loot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get loot table for testing
 * GET /api/v1/loot/table/:tableId
 */
export const getLootTable = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tableId } = req.params;
    
    // Mock different loot tables based on tableId
    const mockLootTables: Record<string, any> = {
      'basic_monster_loot': {
        tableId: 'basic_monster_loot',
        name: 'Basic Monster Loot Table',
        enemyType: 'basic_monsters',
        levelRange: [1, 15],
        dropRates: {
          common: 0.65,
          uncommon: 0.25,
          rare: 0.08,
          epic: 0.02,
          legendary: 0.001
        },
        items: [
          { name: 'Iron Sword', rarity: 'common', dropChance: 0.25 },
          { name: 'Leather Armor', rarity: 'common', dropChance: 0.2 },
          { name: 'Health Potion', rarity: 'common', dropChance: 0.5 },
          { name: 'Magic Scroll', rarity: 'uncommon', dropChance: 0.15 },
          { name: 'Silver Ring', rarity: 'rare', dropChance: 0.05 },
          { name: 'Ancient Gem', rarity: 'epic', dropChance: 0.01 }
        ],
        goldRange: { min: 10, max: 50 },
        experienceBase: 75
      },
      'goblin_loot_table': {
        tableId: 'goblin_loot_table',
        name: 'Goblin Loot Table',
        enemyType: 'goblin',
        levelRange: [1, 10],
        dropRates: {
          common: 0.7,
          uncommon: 0.2,
          rare: 0.08,
          epic: 0.02,
          legendary: 0.001
        },
        items: [
          { name: 'Rusty Dagger', rarity: 'common', dropChance: 0.3 },
          { name: 'Leather Boots', rarity: 'common', dropChance: 0.25 },
          { name: 'Health Potion', rarity: 'common', dropChance: 0.4 },
          { name: 'Silver Coin', rarity: 'common', dropChance: 0.8 },
          { name: 'Goblin Earring', rarity: 'uncommon', dropChance: 0.15 },
          { name: 'Magic Scroll', rarity: 'rare', dropChance: 0.05 }
        ],
        goldRange: { min: 5, max: 25 },
        experienceBase: 50
      }
    };

    const lootTable = mockLootTables[tableId] || mockLootTables['basic_monster_loot'];

    logger.info('Loot table retrieved', { 
      tableId,
      tableName: lootTable.name,
      itemCount: lootTable.items.length
    });

    return res.status(200).json({
      success: true,
      data: lootTable,
      message: `Loot table '${lootTable.name}' retrieved successfully (mock data)`
    });
  } catch (error) {
    logger.error('Error getting loot table', { error, tableId: req.params.tableId });

    return res.status(500).json({
      success: false,
      message: 'Error getting loot table',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test item drop mechanics
 * POST /api/v1/loot/test-drop
 */
export const testItemDrop = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { itemId, position, playerLevel } = req.body;
    
    const mockDrop = {
      dropId: 'drop_' + Date.now(),
      itemId: itemId || 'test_item_001',
      position: position || { x: 100, y: 0, z: 150 },
      playerLevel: playerLevel || 10,
      dropTime: new Date().toISOString(),
      pickupExpiry: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      canPickup: true,
      item: {
        name: 'Test Treasure Chest',
        rarity: 'rare',
        description: 'A mysterious chest containing valuable items',
        value: 200
      }
    };

    logger.info('Item drop test completed', { 
      dropId: mockDrop.dropId,
      position: mockDrop.position,
      playerLevel: mockDrop.playerLevel
    });

    return res.status(200).json({
      success: true,
      data: mockDrop,
      message: 'Item drop simulated successfully (mock data)'
    });
  } catch (error) {
    logger.error('Error testing item drop', { error });

    return res.status(500).json({
      success: false,
      message: 'Error testing item drop',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};