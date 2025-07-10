import { Router } from 'express';
import { body, param } from 'express-validator';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate as authenticateToken } from '../middleware/auth';
import { EquipmentService } from '../services/EquipmentService';
import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { CharacterRepository } from '../repositories/CharacterRepository';
import { CacheService } from '../services/CacheService';
import { logger } from '../utils/logger';
import { EquipmentSlotType } from '../types/equipment.types';

const router = Router();

// Initialize services
const equipmentRepo = new EquipmentRepository();
const characterRepo = new CharacterRepository();

// Create cache service with default config (Redis disabled for now)
const cacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

const cache = new CacheService(cacheConfig);
const equipmentService = new EquipmentService(equipmentRepo, characterRepo, cache);

// =========================================================================
// EQUIPMENT ENDPOINTS
// =========================================================================

/**
 * GET /api/v1/equipment/:charId
 * Get character's equipped items and stats
 */
router.get(
  '/:charId',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    
    try {
      const equipment = await equipmentService.getCharacterEquipment(charId);
      
      res.json({
        success: true,
        message: 'Equipment retrieved successfully',
        data: equipment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * POST /api/v1/equipment/:charId/equip
 * Equip an item from inventory to equipment slot
 */
router.post(
  '/:charId/equip',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  body('inventorySlot').isInt({ min: 0 }).withMessage('Invalid inventory slot'),
  body('equipmentSlot').isString().withMessage('Equipment slot is required'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    const { inventorySlot, equipmentSlot } = req.body;
    
    try {
      const result = await equipmentService.equipItem(charId, inventorySlot, equipmentSlot);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            equipment: result.equipment,
            inventory: result.inventory,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors,
        });
      }
    } catch (error) {
      logger.error('Error equipping item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to equip item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * POST /api/v1/equipment/:charId/unequip
 * Unequip an item from equipment slot to inventory
 */
router.post(
  '/:charId/unequip',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  body('equipmentSlot').isString().withMessage('Equipment slot is required'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    const { equipmentSlot } = req.body;
    
    try {
      const result = await equipmentService.unequipItem(charId, equipmentSlot);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            equipment: result.equipment,
            inventory: result.inventory,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors,
        });
      }
    } catch (error) {
      logger.error('Error unequipping item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unequip item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * GET /api/v1/equipment/:charId/stats
 * Get character's equipment stats breakdown
 */
router.get(
  '/:charId/stats',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    
    try {
      const equipment = await equipmentService.getCharacterEquipment(charId);
      
      res.json({
        success: true,
        message: 'Equipment stats retrieved successfully',
        data: {
          stats: equipment.stats,
          activeSets: equipment.stats.activeSets,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching equipment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

// =========================================================================
// INVENTORY ENDPOINTS
// =========================================================================

/**
 * GET /api/v1/equipment/:charId/inventory
 * Get character's inventory
 */
router.get(
  '/:charId/inventory',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    
    try {
      const inventory = await equipmentService.getCharacterInventory(charId);
      
      res.json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: inventory,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * POST /api/v1/equipment/:charId/inventory/move
 * Move item between inventory slots
 */
router.post(
  '/:charId/inventory/move',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  body('fromSlot').isInt({ min: 0 }).withMessage('Invalid from slot'),
  body('toSlot').isInt({ min: 0 }).withMessage('Invalid to slot'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    const { fromSlot, toSlot } = req.body;
    
    try {
      const result = await equipmentService.moveInventoryItem(charId, fromSlot, toSlot);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.inventory,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors,
        });
      }
    } catch (error) {
      logger.error('Error moving inventory item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to move item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * POST /api/v1/equipment/:charId/inventory/drop
 * Drop item from inventory
 */
router.post(
  '/:charId/inventory/drop',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  body('slotPosition').isInt({ min: 0 }).withMessage('Invalid slot position'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Invalid quantity'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    const { slotPosition, quantity = 1 } = req.body;
    
    try {
      const result = await equipmentService.dropItem(charId, slotPosition, quantity);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.inventory,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors,
        });
      }
    } catch (error) {
      logger.error('Error dropping item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to drop item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

// =========================================================================
// ITEM INFORMATION ENDPOINTS
// =========================================================================

/**
 * GET /api/v1/equipment/items/:itemId
 * Get detailed item information including stats and set bonuses
 */
router.get(
  '/items/:itemId',
  authenticateToken,
  param('itemId').isInt({ min: 1 }).withMessage('Invalid item ID'),
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    
    try {
      const item = await equipmentService.getItemDetails(parseInt(itemId));
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }
      
      return res.json({
        success: true,
        message: 'Item details retrieved successfully',
        data: item,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching item details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch item details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * GET /api/v1/equipment/:charId/can-equip/:itemId/:slot
 * Check if character can equip an item in a specific slot
 */
router.get(
  '/:charId/can-equip/:itemId/:slot',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  param('itemId').isInt({ min: 1 }).withMessage('Invalid item ID'),
  param('slot').isString().withMessage('Equipment slot is required'),
  asyncHandler(async (req, res) => {
    const { charId, itemId, slot } = req.params;
    
    try {
      const result = await equipmentService.canEquipItem(
        charId,
        parseInt(itemId),
        slot as EquipmentSlotType
      );
      
      res.json({
        success: true,
        message: 'Equip validation completed',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error validating equip:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate equip',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

// =========================================================================
// UTILITY ENDPOINTS
// =========================================================================

/**
 * GET /api/v1/equipment/:charId/value
 * Get total value of character's equipment and inventory
 */
router.get(
  '/:charId/value',
  authenticateToken,
  param('charId').isUUID().withMessage('Invalid character ID'),
  asyncHandler(async (req, res) => {
    const { charId } = req.params;
    
    try {
      const [equipmentValue, inventoryValue] = await Promise.all([
        equipmentService.getEquipmentValue(charId),
        equipmentService.getInventoryValue(charId),
      ]);
      
      res.json({
        success: true,
        message: 'Values calculated successfully',
        data: {
          equipmentValue,
          inventoryValue,
          totalValue: equipmentValue + inventoryValue,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error calculating values:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate values',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * GET /api/v1/equipment/test
 * Test endpoint for equipment system
 */
router.get('/test', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    message: 'Equipment system is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      equipment: 'GET /api/v1/equipment/:charId',
      equip: 'POST /api/v1/equipment/:charId/equip',
      unequip: 'POST /api/v1/equipment/:charId/unequip',
      stats: 'GET /api/v1/equipment/:charId/stats',
      inventory: 'GET /api/v1/equipment/:charId/inventory',
      moveItem: 'POST /api/v1/equipment/:charId/inventory/move',
      dropItem: 'POST /api/v1/equipment/:charId/inventory/drop',
      itemDetails: 'GET /api/v1/equipment/items/:itemId',
      canEquip: 'GET /api/v1/equipment/:charId/can-equip/:itemId/:slot',
      value: 'GET /api/v1/equipment/:charId/value',
    },
  });
}));

export default router;