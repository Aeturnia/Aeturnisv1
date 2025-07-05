import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { currencyService } from '../services/CurrencyService';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = Router();

// Test endpoint for visual testing interface
router.get('/test-balance', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Currency system is operational',
    timestamp: new Date().toISOString(),
    testData: {
      currency: 'gold',
      balance: '1000',
      status: 'connected'
    }
  });
});

// Get character balance
router.get('/characters/:characterId/balance', 
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const balance = await currencyService.getBalance(req.params.characterId);
      return res.json({ 
        characterId: req.params.characterId,
        balance: balance.toString(),
        currency: 'gold' 
      });
    } catch (error) {
      logger.error('Failed to get balance', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        service: 'currency-routes' 
      });
      return res.status(500).json({ error: 'Failed to retrieve balance' });
    }
  }
);

// Transfer gold between characters
router.post('/transfer',
  requireAuth,
  body('fromCharacterId').isUUID().withMessage('Invalid sender character ID'),
  body('toCharacterId').isUUID().withMessage('Invalid recipient character ID'),
  body('amount').isInt({ min: 1 }).withMessage('Amount must be positive'),
  body('description').optional().isString().isLength({ max: 200 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fromCharacterId, toCharacterId, amount, description } = req.body;
      const result = await currencyService.transferGold(
        fromCharacterId,
        toCharacterId,
        amount,
        description
      );

      res.json({
        success: true,
        transfer: {
          from: fromCharacterId,
          to: toCharacterId,
          amount: amount.toString(),
          senderNewBalance: result.senderTransaction.balanceAfter.toString(),
          receiverNewBalance: result.receiverTransaction.balanceAfter.toString(),
          timestamp: result.senderTransaction.createdAt,
        }
      });
    } catch (error) {
      logger.error('Transfer failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        service: 'currency-routes' 
      });
      
      if (error instanceof Error && error.message.includes('Insufficient funds')) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      
      return res.status(500).json({ error: 'Transfer failed' });
    }
  }
);

// Get transaction history
router.get('/characters/:characterId/transactions',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const transactions = await currencyService.getTransactionHistory(
        req.params.characterId,
        limit,
        offset
      );

      res.json({
        characterId: req.params.characterId,
        transactions: transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount.toString(),
          balanceBefore: tx.balanceBefore.toString(),
          balanceAfter: tx.balanceAfter.toString(),
          description: tx.description,
          metadata: tx.metadata,
          createdAt: tx.createdAt,
        })),
        pagination: {
          limit,
          offset,
          total: transactions.length
        }
      });
    } catch (error) {
      logger.error('Failed to get transaction history', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        service: 'currency-routes' 
      });
      return res.status(500).json({ error: 'Failed to retrieve transaction history' });
    }
  }
);

// Get transaction statistics
router.get('/characters/:characterId/stats',
  requireAuth,
  param('characterId').isUUID().withMessage('Invalid character ID'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const stats = await currencyService.getTransactionStats(req.params.characterId);
      
      res.json({
        characterId: req.params.characterId,
        stats: {
          totalEarned: stats.totalEarned.toString(),
          totalSpent: stats.totalSpent.toString(),
          netFlow: stats.netFlow.toString(),
          transactionCount: stats.transactionCount,
        }
      });
    } catch (error) {
      logger.error('Failed to get transaction stats', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        characterId: req.params.characterId,
        service: 'currency-routes' 
      });
      return res.status(500).json({ error: 'Failed to retrieve transaction statistics' });
    }
  }
);

// Admin: Reward gold
router.post('/admin/reward',
  requireAuth,
  // TODO: Add admin role check middleware
  body('characterId').isUUID().withMessage('Invalid character ID'),
  body('amount').isInt({ min: 1 }).withMessage('Amount must be positive'),
  body('source').isString().isLength({ min: 1, max: 100 }).withMessage('Source is required'),
  body('metadata').optional().isObject(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { characterId, amount, source, metadata } = req.body;
      const transaction = await currencyService.rewardGold(
        characterId,
        amount,
        source,
        metadata
      );

      res.json({
        success: true,
        transaction: {
          id: transaction.id,
          characterId: transaction.characterId,
          amount: transaction.amount.toString(),
          newBalance: transaction.balanceAfter.toString(),
          source,
          createdAt: transaction.createdAt,
        }
      });
    } catch (error) {
      logger.error('Failed to reward gold', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        service: 'currency-routes' 
      });
      return res.status(500).json({ error: 'Failed to reward gold' });
    }
  }
);

export default router;