// Import types from the actual service
import { Transaction, TransactionType, TransactionMetadata } from '../../types/currency';

// Re-export types for convenience
export { Transaction, TransactionType, TransactionMetadata };

/**
 * Transaction statistics
 */
export interface TransactionStats {
  totalTransactions: number;
  totalEarned: number;
  totalSpent: number;
  netGold: number;
  averageTransaction: number;
  lastTransaction: Date | null;
}

/**
 * Interface for Currency-related operations
 * Handles all monetary transactions in the game
 */
export interface ICurrencyService {
  /**
   * Get gold balance for a character
   * @param characterId - The character to check
   * @returns Current gold balance
   */
  getBalance(characterId: string): Promise<number>;

  /**
   * Modify character's balance (core method)
   * @param characterId - The character
   * @param amount - Amount to add/subtract (negative for deduction)
   * @param type - Transaction type
   * @param description - Optional description
   * @param metadata - Optional metadata
   * @param relatedCharacterId - Optional related character
   * @returns Transaction record
   */
  modifyBalance(
    characterId: string,
    amount: number,
    type: TransactionType,
    description?: string,
    metadata?: TransactionMetadata,
    relatedCharacterId?: string
  ): Promise<Transaction>;

  /**
   * Transfer gold between characters
   * @param fromCharacterId - Sending character
   * @param toCharacterId - Receiving character
   * @param amount - Amount to transfer
   * @param description - Optional description
   * @param fee - Optional transfer fee
   * @returns Transaction record
   */
  transferGold(
    fromCharacterId: string,
    toCharacterId: string,
    amount: number,
    description?: string,
    fee?: number
  ): Promise<Transaction>;

  /**
   * Get transaction history for a character
   * @param characterId - The character to get history for
   * @param limit - Maximum number of transactions
   * @param offset - Offset for pagination
   * @returns Array of transactions
   */
  getTransactionHistory(characterId: string, limit?: number, offset?: number): Promise<Transaction[]>;

  /**
   * Get transaction statistics for a character
   * @param characterId - The character to get stats for
   * @returns Transaction statistics
   */
  getTransactionStats(characterId: string): Promise<TransactionStats>;

  /**
   * Reward gold to a character
   * @param characterId - The character to reward
   * @param amount - Amount to reward
   * @param source - Source of the reward
   * @param description - Optional description
   * @returns Transaction record
   */
  rewardGold(
    characterId: string,
    amount: number,
    source: string,
    description?: string
  ): Promise<Transaction>;

  /**
   * Process item purchase
   * @param characterId - The purchasing character
   * @param itemId - The item being purchased
   * @param cost - Cost of the item
   * @param quantity - Quantity being purchased
   * @param vendorId - Optional vendor ID
   * @returns Transaction record
   */
  purchaseItem(
    characterId: string,
    itemId: string,
    cost: number,
    quantity?: number,
    vendorId?: string
  ): Promise<Transaction>;

  /**
   * Process item sale
   * @param characterId - The selling character
   * @param itemId - The item being sold
   * @param value - Value of the item
   * @param quantity - Quantity being sold
   * @param vendorId - Optional vendor ID
   * @returns Transaction record
   */
  sellItem(
    characterId: string,
    itemId: string,
    value: number,
    quantity?: number,
    vendorId?: string
  ): Promise<Transaction>;
}