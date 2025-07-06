import { 
  ICurrencyService, 
  Transaction,
  TransactionType,
  TransactionMetadata,
  TransactionStats
} from '../interfaces/ICurrencyService';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of CurrencyService for testing
 * Uses in-memory storage for currency data
 */
export class MockCurrencyService implements ICurrencyService {
  // Mock character balances: characterId -> gold amount
  private balances: Map<string, number> = new Map();
  
  // Mock transaction history
  private transactions: Transaction[] = [];

  constructor() {
    logger.info('MockCurrencyService initialized');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize test characters with some gold
    this.balances.set('player-test-001', 15000); // 15,000 gold
    this.balances.set('player-test-002', 5000);  // 5,000 gold
    this.balances.set('550e8400-e29b-41d4-a716-446655440000', 10000); // 10,000 gold
  }

  async getBalance(characterId: string): Promise<number> {
    logger.info(`MockCurrencyService: Getting balance for character ${characterId}`);
    
    return this.balances.get(characterId) || 0;
  }

  async modifyBalance(
    characterId: string,
    amount: number,
    type: TransactionType,
    description?: string,
    metadata?: TransactionMetadata,
    relatedCharacterId?: string
  ): Promise<Transaction> {
    logger.info(`MockCurrencyService: Modifying balance for ${characterId} by ${amount}`);
    
    const balanceBefore = this.balances.get(characterId) || 0;
    const balanceAfter = balanceBefore + amount;
    
    if (balanceAfter < 0) {
      throw new Error('Insufficient funds');
    }
    
    // Update balance
    this.balances.set(characterId, balanceAfter);
    
    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      characterId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      relatedCharacterId,
      description: description || `${type} transaction`,
      metadata,
      createdAt: new Date()
    };
    
    this.transactions.push(transaction);
    
    return transaction;
  }

  async transferGold(
    fromCharacterId: string,
    toCharacterId: string,
    amount: number,
    description?: string,
    fee?: number
  ): Promise<Transaction> {
    logger.info(`MockCurrencyService: Transferring ${amount} gold from ${fromCharacterId} to ${toCharacterId}`);
    
    const actualFee = fee || Math.floor(amount * 0.05); // 5% default fee
    const totalDeduction = amount + actualFee;
    
    // Check if sender has enough funds
    const senderBalance = this.balances.get(fromCharacterId) || 0;
    if (senderBalance < totalDeduction) {
      throw new Error('Insufficient funds for transfer');
    }
    
    // Deduct from sender
    await this.modifyBalance(
      fromCharacterId,
      -totalDeduction,
      'transfer',
      description || `Transfer to ${toCharacterId}`,
      { fee: actualFee, recipient: toCharacterId },
      toCharacterId
    );
    
    // Add to recipient (without fee)
    const receiverTransaction = await this.modifyBalance(
      toCharacterId,
      amount,
      'transfer',
      description || `Transfer from ${fromCharacterId}`,
      { sender: fromCharacterId },
      fromCharacterId
    );
    
    return receiverTransaction;
  }

  async getTransactionHistory(characterId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    logger.info(`MockCurrencyService: Getting transaction history for ${characterId}`);
    
    const characterTransactions = this.transactions
      .filter(t => t.characterId === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    
    return characterTransactions;
  }

  async getTransactionStats(characterId: string): Promise<TransactionStats> {
    logger.info(`MockCurrencyService: Getting transaction stats for ${characterId}`);
    
    const characterTransactions = this.transactions.filter(t => t.characterId === characterId);
    
    const totalEarned = characterTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = Math.abs(characterTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    const netGold = totalEarned - totalSpent;
    const averageTransaction = characterTransactions.length > 0 
      ? characterTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / characterTransactions.length
      : 0;
    
    const lastTransaction = characterTransactions.length > 0
      ? characterTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : null;
    
    return {
      totalTransactions: characterTransactions.length,
      totalEarned,
      totalSpent,
      netGold,
      averageTransaction,
      lastTransaction
    };
  }

  async rewardGold(
    characterId: string,
    amount: number,
    source: string,
    description?: string
  ): Promise<Transaction> {
    logger.info(`MockCurrencyService: Rewarding ${amount} gold to ${characterId} from ${source}`);
    
    return await this.modifyBalance(
      characterId,
      amount,
      'reward',
      description || `Reward from ${source}`,
      { source }
    );
  }

  async purchaseItem(
    characterId: string,
    itemId: string,
    cost: number,
    quantity: number = 1,
    vendorId?: string
  ): Promise<Transaction> {
    logger.info(`MockCurrencyService: ${characterId} purchasing ${quantity}x ${itemId} for ${cost} gold`);
    
    const totalCost = cost * quantity;
    
    return await this.modifyBalance(
      characterId,
      -totalCost,
      'purchase',
      `Purchased ${quantity}x ${itemId}`,
      { itemId, quantity, unitCost: cost, vendor: vendorId }
    );
  }

  async sellItem(
    characterId: string,
    itemId: string,
    value: number,
    quantity: number = 1,
    vendorId?: string
  ): Promise<Transaction> {
    logger.info(`MockCurrencyService: ${characterId} selling ${quantity}x ${itemId} for ${value} gold`);
    
    const totalValue = value * quantity;
    
    return await this.modifyBalance(
      characterId,
      totalValue,
      'sale',
      `Sold ${quantity}x ${itemId}`,
      { itemId, quantity, unitValue: value, vendor: vendorId }
    );
  }
}