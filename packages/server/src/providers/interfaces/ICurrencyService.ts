// Import types from the actual service
import { Transaction, TransactionType, TransactionMetadata } from '../../types/currency';

// Re-export types for convenience
export { Transaction, TransactionType, TransactionMetadata };

/**
 * Currency balance with denominations
 */
export interface CurrencyBalance {
  characterId: string;
  gold: bigint;
  silver: bigint;
  copper: bigint;
  totalInCopper: bigint;
  lastUpdated: Date;
}

/**
 * Currency operation result
 */
export interface CurrencyOperationResult {
  success: boolean;
  previousBalance: bigint;
  newBalance: bigint;
  amount: bigint;
  transactionId: string;
  message?: string;
}

/**
 * Transfer result
 */
export interface TransferResult {
  success: boolean;
  senderNewBalance: bigint;
  recipientNewBalance: bigint;
  fee: bigint;
  transactionId: string;
  message?: string;
}

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
   * Get balance with currency denominations for a character
   * @param characterId - The character to check
   * @returns Currency balance with denominations
   */
  getBalance(characterId: string): Promise<CurrencyBalance>;

  /**
   * Add currency to a character's balance
   * @param characterId - The character
   * @param amount - Amount to add (in copper)
   * @param source - Source of the currency
   * @param metadata - Optional metadata
   * @returns Operation result
   */
  addCurrency(
    characterId: string,
    amount: bigint,
    source: string,
    metadata?: TransactionMetadata
  ): Promise<CurrencyOperationResult>;

  /**
   * Deduct currency from a character's balance
   * @param characterId - The character
   * @param amount - Amount to deduct (in copper)
   * @param reason - Reason for deduction
   * @param metadata - Optional metadata
   * @returns Operation result
   */
  deductCurrency(
    characterId: string,
    amount: bigint,
    reason: string,
    metadata?: TransactionMetadata
  ): Promise<CurrencyOperationResult>;

  /**
   * Transfer currency between characters
   * @param fromCharacterId - Sending character
   * @param toCharacterId - Receiving character
   * @param amount - Amount to transfer (in copper)
   * @param description - Optional description
   * @param applyFee - Whether to apply transfer fee (default: true)
   * @returns Transfer result
   */
  transferCurrency(
    fromCharacterId: string,
    toCharacterId: string,
    amount: bigint,
    description?: string,
    applyFee?: boolean
  ): Promise<TransferResult>;

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

  /**
   * Format currency amount into human-readable string
   * @param amount - Amount in copper
   * @returns Formatted string (e.g., "1g 23s 45c")
   */
  formatCurrency(amount: bigint): string;

  /**
   * Convert currency between denominations
   * @param amount - Amount to convert
   * @param from - Source denomination ('gold', 'silver', 'copper')
   * @param to - Target denomination ('gold', 'silver', 'copper')
   * @returns Converted amount
   */
  convertCurrency(amount: bigint, from: 'gold' | 'silver' | 'copper', to: 'gold' | 'silver' | 'copper'): bigint;

  /**
   * Check if character can afford an amount
   * @param characterId - The character to check
   * @param amount - Amount to check (in copper)
   * @returns True if character has enough currency
   */
  canAfford(characterId: string, amount: bigint): Promise<boolean>;
}