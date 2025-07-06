import { 
  ICurrencyService, 
  CurrencyBalance, 
  TransactionResult, 
  CurrencyTransferResult, 
  Transaction 
} from '../interfaces/ICurrencyService';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of CurrencyService for testing
 * Uses in-memory storage for currency data
 */
export class MockCurrencyService implements ICurrencyService {
  // Mock character balances: characterId -> balance in copper
  private balances: Map<string, bigint> = new Map();
  
  // Mock transaction history
  private transactions: Transaction[] = [];
  
  // Currency conversion rates (standard MMO rates)
  private readonly COPPER_TO_SILVER = 100;
  private readonly SILVER_TO_GOLD = 100;
  
  // Transfer fee percentage
  private readonly TRANSFER_FEE_PERCENT = 5;

  constructor() {
    logger.info('MockCurrencyService initialized');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize test characters with some currency
    this.balances.set('player-test-001', BigInt(1500000)); // 150 gold
    this.balances.set('player-test-002', BigInt(500000));  // 50 gold
    this.balances.set('550e8400-e29b-41d4-a716-446655440000', BigInt(1000000)); // 100 gold
  }

  async getBalance(characterId: string): Promise<CurrencyBalance> {
    logger.info(`MockCurrencyService: Getting balance for character ${characterId}`);
    
    const totalInCopper = this.balances.get(characterId) || BigInt(0);
    
    // Convert to gold, silver, copper
    const gold = totalInCopper / BigInt(this.COPPER_TO_SILVER * this.SILVER_TO_GOLD);
    const remainderAfterGold = totalInCopper % BigInt(this.COPPER_TO_SILVER * this.SILVER_TO_GOLD);
    const silver = remainderAfterGold / BigInt(this.COPPER_TO_SILVER);
    const copper = remainderAfterGold % BigInt(this.COPPER_TO_SILVER);
    
    return {
      characterId,
      gold,
      silver,
      copper,
      totalInCopper,
      lastUpdated: new Date()
    };
  }

  async addCurrency(characterId: string, amount: bigint, source: string, description?: string): Promise<TransactionResult> {
    logger.info(`MockCurrencyService: Adding ${amount} copper to character ${characterId} from ${source}`);
    
    if (amount <= BigInt(0)) {
      return {
        success: false,
        previousBalance: this.balances.get(characterId) || BigInt(0),
        newBalance: this.balances.get(characterId) || BigInt(0),
        amount: BigInt(0),
        transactionId: '',
        message: 'Amount must be positive'
      };
    }
    
    const previousBalance = this.balances.get(characterId) || BigInt(0);
    const newBalance = previousBalance + amount;
    
    this.balances.set(characterId, newBalance);
    
    const transaction: Transaction = {
      id: uuidv4(),
      characterId,
      type: 'add',
      amount,
      source,
      description: description || `Currency added from ${source}`,
      balanceBefore: previousBalance,
      balanceAfter: newBalance,
      timestamp: new Date()
    };
    
    this.transactions.push(transaction);
    
    return {
      success: true,
      previousBalance,
      newBalance,
      amount,
      transactionId: transaction.id,
      message: `Added ${this.formatCurrency(amount)} from ${source}`
    };
  }

  async deductCurrency(characterId: string, amount: bigint, reason: string, description?: string): Promise<TransactionResult> {
    logger.info(`MockCurrencyService: Deducting ${amount} copper from character ${characterId} for ${reason}`);
    
    if (amount <= BigInt(0)) {
      return {
        success: false,
        previousBalance: this.balances.get(characterId) || BigInt(0),
        newBalance: this.balances.get(characterId) || BigInt(0),
        amount: BigInt(0),
        transactionId: '',
        message: 'Amount must be positive'
      };
    }
    
    const previousBalance = this.balances.get(characterId) || BigInt(0);
    
    if (previousBalance < amount) {
      return {
        success: false,
        previousBalance,
        newBalance: previousBalance,
        amount,
        transactionId: '',
        message: 'Insufficient funds'
      };
    }
    
    const newBalance = previousBalance - amount;
    this.balances.set(characterId, newBalance);
    
    const transaction: Transaction = {
      id: uuidv4(),
      characterId,
      type: 'deduct',
      amount,
      source: reason,
      description: description || `Currency spent on ${reason}`,
      balanceBefore: previousBalance,
      balanceAfter: newBalance,
      timestamp: new Date()
    };
    
    this.transactions.push(transaction);
    
    return {
      success: true,
      previousBalance,
      newBalance,
      amount,
      transactionId: transaction.id,
      message: `Spent ${this.formatCurrency(amount)} on ${reason}`
    };
  }

  async transferCurrency(fromId: string, toId: string, amount: bigint, includeFee: boolean = true): Promise<CurrencyTransferResult> {
    logger.info(`MockCurrencyService: Transferring ${amount} copper from ${fromId} to ${toId}`);
    
    if (amount <= BigInt(0)) {
      return {
        success: false,
        fromBalance: this.balances.get(fromId) || BigInt(0),
        toBalance: this.balances.get(toId) || BigInt(0),
        amount: BigInt(0),
        transactionId: '',
        message: 'Amount must be positive'
      };
    }
    
    const fromBalance = this.balances.get(fromId) || BigInt(0);
    const fee = includeFee ? (amount * BigInt(this.TRANSFER_FEE_PERCENT)) / BigInt(100) : BigInt(0);
    const totalDeduction = amount + fee;
    
    if (fromBalance < totalDeduction) {
      return {
        success: false,
        fromBalance,
        toBalance: this.balances.get(toId) || BigInt(0),
        amount,
        fee,
        transactionId: '',
        message: 'Insufficient funds (including transfer fee)'
      };
    }
    
    // Deduct from sender
    const newFromBalance = fromBalance - totalDeduction;
    this.balances.set(fromId, newFromBalance);
    
    // Add to receiver
    const toBalance = this.balances.get(toId) || BigInt(0);
    const newToBalance = toBalance + amount;
    this.balances.set(toId, newToBalance);
    
    // Record transactions
    const transactionId = uuidv4();
    
    // Sender transaction
    this.transactions.push({
      id: transactionId + '_out',
      characterId: fromId,
      type: 'transfer_out',
      amount: totalDeduction,
      source: 'player_transfer',
      description: `Transfer to character ${toId}`,
      balanceBefore: fromBalance,
      balanceAfter: newFromBalance,
      relatedCharacterId: toId,
      timestamp: new Date()
    });
    
    // Receiver transaction
    this.transactions.push({
      id: transactionId + '_in',
      characterId: toId,
      type: 'transfer_in',
      amount,
      source: 'player_transfer',
      description: `Transfer from character ${fromId}`,
      balanceBefore: toBalance,
      balanceAfter: newToBalance,
      relatedCharacterId: fromId,
      timestamp: new Date()
    });
    
    return {
      success: true,
      fromBalance: newFromBalance,
      toBalance: newToBalance,
      amount,
      fee,
      transactionId,
      message: `Transferred ${this.formatCurrency(amount)} successfully`
    };
  }

  async getTransactionHistory(characterId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    logger.info(`MockCurrencyService: Getting transaction history for ${characterId}`);
    
    const characterTransactions = this.transactions
      .filter(t => t.characterId === characterId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return characterTransactions.slice(offset, offset + limit);
  }

  async canAfford(characterId: string, amount: bigint): Promise<boolean> {
    logger.info(`MockCurrencyService: Checking if ${characterId} can afford ${amount}`);
    
    const balance = this.balances.get(characterId) || BigInt(0);
    return balance >= amount;
  }

  convertCurrency(amount: bigint, from: 'copper' | 'silver' | 'gold', to: 'copper' | 'silver' | 'gold'): bigint {
    // First convert to copper
    let copper = amount;
    switch (from) {
      case 'silver':
        copper = amount * BigInt(this.COPPER_TO_SILVER);
        break;
      case 'gold':
        copper = amount * BigInt(this.COPPER_TO_SILVER * this.SILVER_TO_GOLD);
        break;
    }
    
    // Then convert to target currency
    switch (to) {
      case 'copper':
        return copper;
      case 'silver':
        return copper / BigInt(this.COPPER_TO_SILVER);
      case 'gold':
        return copper / BigInt(this.COPPER_TO_SILVER * this.SILVER_TO_GOLD);
      default:
        return copper;
    }
  }

  formatCurrency(amount: bigint): string {
    const gold = amount / BigInt(this.COPPER_TO_SILVER * this.SILVER_TO_GOLD);
    const remainderAfterGold = amount % BigInt(this.COPPER_TO_SILVER * this.SILVER_TO_GOLD);
    const silver = remainderAfterGold / BigInt(this.COPPER_TO_SILVER);
    const copper = remainderAfterGold % BigInt(this.COPPER_TO_SILVER);
    
    const parts: string[] = [];
    if (gold > 0) parts.push(`${gold}g`);
    if (silver > 0) parts.push(`${silver}s`);
    if (copper > 0 || parts.length === 0) parts.push(`${copper}c`);
    
    return parts.join(' ');
  }
  
  // Helper method for testing - set balance directly
  async setBalance(characterId: string, amount: bigint): Promise<void> {
    logger.info(`MockCurrencyService: Setting balance for ${characterId} to ${amount}`);
    this.balances.set(characterId, amount);
  }
  
  // Helper method for testing - create test transaction
  async createTestReward(characterId: string, source: string = 'quest_reward'): Promise<TransactionResult> {
    const amount = BigInt(Math.floor(Math.random() * 10000) + 1000); // 10-110 silver
    return this.addCurrency(characterId, amount, source, 'Test quest completion reward');
  }
}