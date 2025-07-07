import { 
  ICurrencyService, 
  Transaction,
  TransactionType,
  TransactionMetadata,
  TransactionStats
} from '../interfaces/ICurrencyService';
import { CurrencyService } from '../../services/CurrencyService';

/**
 * Real implementation wrapper for CurrencyService
 * Implements ICurrencyService interface and delegates to actual CurrencyService
 */
export class RealCurrencyService implements ICurrencyService {
  private currencyService: CurrencyService;

  constructor() {
    this.currencyService = new CurrencyService();
  }

  async getBalance(characterId: string): Promise<number> {
    const balance = await this.currencyService.getBalance(characterId);
    return balance;
  }

  async modifyBalance(
    characterId: string,
    amount: number,
    type: TransactionType,
    description?: string,
    metadata?: TransactionMetadata,
    relatedCharacterId?: string
  ): Promise<Transaction> {
    const transaction = await this.currencyService.modifyBalance(
      characterId,
      amount,
      type,
      description,
      metadata,
      relatedCharacterId
    );
    return transaction;
  }

  async transferGold(
    fromCharacterId: string,
    toCharacterId: string,
    amount: number,
    description?: string,
    fee?: number
  ): Promise<Transaction> {
    const transaction = await this.currencyService.transferGold(
      fromCharacterId,
      toCharacterId,
      amount,
      description,
      fee
    );
    return transaction;
  }

  async getTransactionHistory(characterId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const history = await this.currencyService.getTransactionHistory(characterId, limit, offset);
    return history;
  }

  async getTransactionStats(characterId: string): Promise<TransactionStats> {
    const stats = await this.currencyService.getTransactionStats(characterId);
    return stats;
  }

  async rewardGold(
    characterId: string,
    amount: number,
    source: string,
    description?: string
  ): Promise<Transaction> {
    const transaction = await this.currencyService.rewardGold(characterId, amount, source, description);
    return transaction;
  }

  async purchaseItem(
    characterId: string,
    itemId: string,
    cost: number,
    quantity: number = 1,
    vendorId?: string
  ): Promise<Transaction> {
    const transaction = await this.currencyService.purchaseItem(
      characterId,
      itemId,
      cost,
      quantity,
      vendorId
    );
    return transaction;
  }

  async sellItem(
    characterId: string,
    itemId: string,
    value: number,
    quantity: number = 1,
    vendorId?: string
  ): Promise<Transaction> {
    const transaction = await this.currencyService.sellItem(
      characterId,
      itemId,
      value,
      quantity,
      vendorId
    );
    return transaction;
  }
}