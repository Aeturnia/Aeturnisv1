import { 
  ICurrencyService, 
  CurrencyBalance,
  CurrencyOperationResult,
  TransferResult,
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
  // Mock character balances: characterId -> copper amount (as bigint)
  private balances: Map<string, bigint> = new Map();
  
  // Mock transaction history
  private transactions: Transaction[] = [];

  // Currency conversion constants
  private readonly COPPER_PER_SILVER = 100n;
  private readonly COPPER_PER_GOLD = 10000n;

  constructor() {
    logger.info('MockCurrencyService initialized');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize test characters with some gold (converted to copper)
    this.balances.set('player-test-001', 150000000n); // 15,000 gold
    this.balances.set('player-test-002', 50000000n);  // 5,000 gold
    this.balances.set('550e8400-e29b-41d4-a716-446655440000', 100000000n); // 10,000 gold
    this.balances.set('character-001', 12345n); // 1g 23s 45c
  }

  async getBalance(characterId: string): Promise<CurrencyBalance> {
    logger.info(`MockCurrencyService: Getting balance for character ${characterId}`);
    
    const totalInCopper = this.balances.get(characterId) || 0n;
    
    // Convert copper to gold, silver, copper
    const gold = totalInCopper / this.COPPER_PER_GOLD;
    const remainingAfterGold = totalInCopper % this.COPPER_PER_GOLD;
    const silver = remainingAfterGold / this.COPPER_PER_SILVER;
    const copper = remainingAfterGold % this.COPPER_PER_SILVER;
    
    return {
      characterId,
      gold,
      silver,
      copper,
      totalInCopper,
      lastUpdated: new Date()
    };
  }

  async addCurrency(
    characterId: string,
    amount: bigint,
    source: string,
    metadata?: TransactionMetadata
  ): Promise<CurrencyOperationResult> {
    logger.info(`MockCurrencyService: Adding ${amount} copper to ${characterId} from ${source}`);
    
    const previousBalance = this.balances.get(characterId) || 0n;
    const newBalance = previousBalance + amount;
    
    // Update balance
    this.balances.set(characterId, newBalance);
    
    // Create transaction
    const transactionId = uuidv4();
    const transaction: Transaction = {
      id: transactionId,
      characterId,
      type: 'reward',
      amount: Number(amount),
      balanceBefore: Number(previousBalance / this.COPPER_PER_GOLD),
      balanceAfter: Number(newBalance / this.COPPER_PER_GOLD),
      description: `Currency from ${source}`,
      metadata: { ...metadata, source },
      createdAt: new Date()
    };
    
    this.transactions.push(transaction);
    
    return {
      success: true,
      previousBalance,
      newBalance,
      amount,
      transactionId
    };
  }

  async deductCurrency(
    characterId: string,
    amount: bigint,
    reason: string,
    metadata?: TransactionMetadata
  ): Promise<CurrencyOperationResult> {
    logger.info(`MockCurrencyService: Deducting ${amount} copper from ${characterId} for ${reason}`);
    
    const previousBalance = this.balances.get(characterId) || 0n;
    
    if (previousBalance < amount) {
      return {
        success: false,
        previousBalance,
        newBalance: previousBalance,
        amount: 0n,
        transactionId: '',
        message: 'Insufficient funds'
      };
    }
    
    const newBalance = previousBalance - amount;
    
    // Update balance
    this.balances.set(characterId, newBalance);
    
    // Create transaction
    const transactionId = uuidv4();
    const transaction: Transaction = {
      id: transactionId,
      characterId,
      type: 'purchase',
      amount: -Number(amount),
      balanceBefore: Number(previousBalance / this.COPPER_PER_GOLD),
      balanceAfter: Number(newBalance / this.COPPER_PER_GOLD),
      description: reason,
      metadata,
      createdAt: new Date()
    };
    
    this.transactions.push(transaction);
    
    return {
      success: true,
      previousBalance,
      newBalance,
      amount,
      transactionId
    };
  }

  async transferCurrency(
    fromCharacterId: string,
    toCharacterId: string,
    amount: bigint,
    description?: string,
    applyFee: boolean = true
  ): Promise<TransferResult> {
    logger.info(`MockCurrencyService: Transferring ${amount} copper from ${fromCharacterId} to ${toCharacterId}`);
    
    const fee = applyFee ? amount / 20n : 0n; // 5% fee
    const totalDeduction = amount + fee;
    
    const senderBalance = this.balances.get(fromCharacterId) || 0n;
    
    if (senderBalance < totalDeduction) {
      return {
        success: false,
        senderNewBalance: senderBalance,
        recipientNewBalance: this.balances.get(toCharacterId) || 0n,
        fee: 0n,
        transactionId: '',
        message: 'Insufficient funds for transfer'
      };
    }
    
    // Deduct from sender
    const senderNewBalance = senderBalance - totalDeduction;
    this.balances.set(fromCharacterId, senderNewBalance);
    
    // Add to recipient
    const recipientPreviousBalance = this.balances.get(toCharacterId) || 0n;
    const recipientNewBalance = recipientPreviousBalance + amount;
    this.balances.set(toCharacterId, recipientNewBalance);
    
    // Create transactions
    const transactionId = uuidv4();
    
    // Sender transaction
    const senderTransaction: Transaction = {
      id: transactionId,
      characterId: fromCharacterId,
      type: 'transfer',
      amount: -Number(totalDeduction),
      balanceBefore: Number(senderBalance / this.COPPER_PER_GOLD),
      balanceAfter: Number(senderNewBalance / this.COPPER_PER_GOLD),
      relatedCharacterId: toCharacterId,
      description: description || `Transfer to ${toCharacterId}`,
      metadata: { fee: Number(fee), recipient: toCharacterId },
      createdAt: new Date()
    };
    
    // Recipient transaction
    const recipientTransaction: Transaction = {
      id: uuidv4(),
      characterId: toCharacterId,
      type: 'transfer',
      amount: Number(amount),
      balanceBefore: Number(recipientPreviousBalance / this.COPPER_PER_GOLD),
      balanceAfter: Number(recipientNewBalance / this.COPPER_PER_GOLD),
      relatedCharacterId: fromCharacterId,
      description: description || `Transfer from ${fromCharacterId}`,
      metadata: { sender: fromCharacterId },
      createdAt: new Date()
    };
    
    this.transactions.push(senderTransaction, recipientTransaction);
    
    return {
      success: true,
      senderNewBalance,
      recipientNewBalance,
      fee,
      transactionId
    };
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
    
    const balanceBefore = this.balances.get(characterId) || 0n;
    const goldBefore = Number(balanceBefore / this.COPPER_PER_GOLD);
    const goldAfter = goldBefore + amount;
    
    if (goldAfter < 0) {
      throw new Error('Insufficient funds');
    }
    
    // Convert gold amount to copper for internal storage
    const copperAmount = BigInt(amount) * this.COPPER_PER_GOLD;
    const balanceAfter = balanceBefore + copperAmount;
    
    // Update balance
    this.balances.set(characterId, balanceAfter);
    
    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      characterId,
      type,
      amount,
      balanceBefore: goldBefore,
      balanceAfter: goldAfter,
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
    const senderBalance = this.balances.get(fromCharacterId) || 0n;
    const senderGold = Number(senderBalance / this.COPPER_PER_GOLD);
    if (senderGold < totalDeduction) {
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

  formatCurrency(amount: bigint): string {
    const gold = amount / this.COPPER_PER_GOLD;
    const remainingAfterGold = amount % this.COPPER_PER_GOLD;
    const silver = remainingAfterGold / this.COPPER_PER_SILVER;
    const copper = remainingAfterGold % this.COPPER_PER_SILVER;
    
    const parts: string[] = [];
    
    if (gold > 0n) {
      parts.push(`${gold}g`);
    }
    
    if (silver > 0n) {
      parts.push(`${silver}s`);
    }
    
    if (copper > 0n || parts.length === 0) {
      parts.push(`${copper}c`);
    }
    
    return parts.join(' ');
  }

  convertCurrency(amount: bigint, from: 'gold' | 'silver' | 'copper', to: 'gold' | 'silver' | 'copper'): bigint {
    // First convert to copper
    let copperAmount: bigint;
    
    switch (from) {
      case 'gold':
        copperAmount = amount * this.COPPER_PER_GOLD;
        break;
      case 'silver':
        copperAmount = amount * this.COPPER_PER_SILVER;
        break;
      case 'copper':
        copperAmount = amount;
        break;
    }
    
    // Then convert from copper to target denomination
    switch (to) {
      case 'gold':
        return copperAmount / this.COPPER_PER_GOLD;
      case 'silver':
        return copperAmount / this.COPPER_PER_SILVER;
      case 'copper':
        return copperAmount;
    }
  }

  async canAfford(characterId: string, amount: bigint): Promise<boolean> {
    const balance = this.balances.get(characterId) || 0n;
    return balance >= amount;
  }
}