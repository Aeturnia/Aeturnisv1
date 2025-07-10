import { IService } from './IService';
import { CurrencyBalance, CurrencyAmount, TransactionSource, TransactionMetadata } from '@aeturnis/shared';

export interface ICurrencyService extends IService {
  getBalance(characterId: string): Promise<CurrencyBalance>;
  addCurrency(
    characterId: string, 
    amount: CurrencyAmount, 
    source: TransactionSource, 
    metadata?: TransactionMetadata
  ): Promise<CurrencyBalance>;
  deductCurrency(
    characterId: string, 
    amount: CurrencyAmount, 
    reason: string, 
    metadata?: TransactionMetadata
  ): Promise<CurrencyBalance>;
  transferCurrency(
    fromCharacterId: string, 
    toCharacterId: string, 
    amount: CurrencyAmount, 
    description?: string, 
    applyFee?: boolean
  ): Promise<{ from: CurrencyBalance; to: CurrencyBalance }>;
  getTransactionHistory(characterId: string, limit?: number): Promise<any[]>;
  subscribeToCurrencyUpdates(characterId: string, handler: (balance: CurrencyBalance) => void): () => void;
}