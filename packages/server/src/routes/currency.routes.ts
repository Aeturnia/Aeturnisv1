import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { ServiceProvider, ICurrencyService } from '../providers';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = Router();

// Test endpoint for visual testing interface
router.get('/test-balance', (_req: Request, res: Response) => {
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
      const currencyService = ServiceProvider.getInstance().get<ICurrencyService>('CurrencyService');
      const balance = await currencyService.getBalance(req.params.characterId);
      return res.json({ 
        characterId: req.params.characterId,
        balance: balance.totalInCopper.toString(),
        currency: 'gold',
        gold: balance.gold.toString(),
        silver: balance.silver.toString(),
        copper: balance.copper.toString()
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
      const currencyService = ServiceProvider.getInstance().get<ICurrencyService>('CurrencyService');
      const result = await currencyService.transferCurrency(
        fromCharacterId,
        toCharacterId,
        BigInt(amount),
        description,
        true // applyFee
      );

      return res.json({
        success: true,
        transfer: {
          from: fromCharacterId,
          to: toCharacterId,
          amount: amount.toString(),
          senderNewBalance: result.senderNewBalance.toString(),
          receiverNewBalance: result.recipientNewBalance.toString(),
          fee: result.fee.toString(),
          timestamp: new Date().toISOString(),
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
      
      const currencyService = ServiceProvider.getInstance().get<ICurrencyService>('CurrencyService');
      const transactions = await currencyService.getTransactionHistory(
        req.params.characterId,
        limit,
        offset
      );

      return res.json({
        characterId: req.params.characterId,
        transactions: transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount.toString(),
          balanceBefore: tx.balanceBefore.toString(),
          balanceAfter: tx.balanceAfter.toString(),
          description: tx.description,
          metadata: tx.metadata,
          timestamp: tx.createdAt.toISOString(),
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
      const currencyService = ServiceProvider.getInstance().get<ICurrencyService>('CurrencyService');
      // TODO: getTransactionStats not in ICurrencyService interface
      const balance = await currencyService.getBalance(req.params.characterId);
      const stats = {
        totalEarned: BigInt(0),
        totalSpent: BigInt(0),
        netFlow: balance.totalInCopper,
        transactionCount: 0
      };
      
      return res.json({
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
      const currencyService = ServiceProvider.getInstance().get<ICurrencyService>('CurrencyService');
      const result = await currencyService.addCurrency(
        characterId,
        BigInt(amount),
        source,
        metadata
      );

      return res.json({
        success: true,
        transaction: {
          transactionId: result.transactionId,
          characterId: characterId,
          amount: amount.toString(),
          newBalance: result.newBalance.toString(),
          source,
          timestamp: new Date().toISOString(),
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