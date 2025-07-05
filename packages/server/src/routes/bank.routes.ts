import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { bankService } from '../services/BankService';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = Router();

// Get personal bank
router.get('/characters/:characterId/bank',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const bank = await bankService.getPersonalBank(req.params.characterId);
      res.json(bank);
    } catch (error) {
      logger.error('Failed to get personal bank', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        service: 'bank-routes' 
      });
      return res.status(500).json({ error: 'Failed to retrieve bank' });
    }
  }
);

// Get shared bank
router.get('/users/:userId/shared-bank',
  requireAuth,
  param('userId').isUUID().withMessage('Invalid user ID'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const bank = await bankService.getSharedBank(req.params.userId);
      res.json(bank);
    } catch (error) {
      logger.error('Failed to get shared bank', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
        service: 'bank-routes' 
      });
      return res.status(500).json({ error: 'Failed to retrieve shared bank' });
    }
  }
);

// Add item to bank
router.post('/characters/:characterId/bank/items',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  body('slot').isInt({ min: 0, max: 99 }).withMessage('Invalid slot number'),
  body('itemId').isInt({ min: 1 }).withMessage('Invalid item ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('bankType').optional().isIn(['personal', 'shared']).withMessage('Invalid bank type'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { slot, itemId, quantity = 1, bankType = 'personal' } = req.body;
      
      await bankService.addItemToBank(
        req.params.characterId,
        slot,
        itemId,
        quantity,
        bankType
      );

      res.json({
        success: true,
        message: 'Item added to bank',
        slot,
        itemId,
        quantity
      });
    } catch (error) {
      logger.error('Failed to add item to bank', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        body: req.body,
        service: 'bank-routes' 
      });
      
      if (error instanceof Error && error.message.includes('occupied')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to add item to bank' });
    }
  }
);

// Remove item from bank
router.delete('/characters/:characterId/bank/items/:slot',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  param('slot').isInt({ min: 0, max: 99 }).withMessage('Invalid slot number'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('bankType').optional().isIn(['personal', 'shared']).withMessage('Invalid bank type'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { quantity, bankType = 'personal' } = req.body;
      const slot = parseInt(req.params.slot);
      
      const result = await bankService.removeItemFromBank(
        req.params.characterId,
        slot,
        quantity,
        bankType
      );

      res.json({
        success: true,
        message: 'Item removed from bank',
        slot,
        itemId: result.itemId,
        removedQuantity: result.removedQuantity
      });
    } catch (error) {
      logger.error('Failed to remove item from bank', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        slot: req.params.slot,
        service: 'bank-routes' 
      });
      
      if (error instanceof Error && error.message.includes('No item')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error instanceof Error && error.message.includes('Not enough')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to remove item from bank' });
    }
  }
);

// Transfer item between storage locations
router.post('/characters/:characterId/bank/transfer',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  body('fromType').isIn(['inventory', 'bank', 'sharedBank']).withMessage('Invalid source type'),
  body('toType').isIn(['inventory', 'bank', 'sharedBank']).withMessage('Invalid destination type'),
  body('fromSlot').isInt({ min: 0 }).withMessage('Invalid source slot'),
  body('toSlot').isInt({ min: 0 }).withMessage('Invalid destination slot'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be positive'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = (req as any).user?.id; // From auth middleware
      
      await bankService.transferItem(
        req.params.characterId,
        userId,
        req.body
      );

      res.json({
        success: true,
        message: 'Item transferred successfully',
        transfer: req.body
      });
    } catch (error) {
      logger.error('Failed to transfer item', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        body: req.body,
        service: 'bank-routes' 
      });
      
      if (error instanceof Error && error.message.includes('not yet implemented')) {
        return res.status(501).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to transfer item' });
    }
  }
);

// Expand bank slots
router.post('/characters/:characterId/bank/expand',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  body('slots').isInt({ min: 1, max: 20 }).withMessage('Slots must be between 1 and 20'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await bankService.expandBankSlots(
        req.params.characterId,
        req.body.slots
      );

      res.json({
        success: true,
        message: 'Bank expanded successfully',
        newTotalSlots: result.newTotalSlots,
        cost: result.cost.toString(),
        slotsAdded: req.body.slots
      });
    } catch (error) {
      logger.error('Failed to expand bank', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        slots: req.body.slots,
        service: 'bank-routes' 
      });
      
      if (error instanceof Error && error.message.includes('Insufficient gold')) {
        return res.status(400).json({ error: error.message });
      }
      
      if (error instanceof Error && error.message.includes('exceed maximum')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to expand bank' });
    }
  }
);

export default router;