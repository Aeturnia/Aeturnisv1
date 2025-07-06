/**
 * Currency balance information
 */
export interface CurrencyBalance {
  characterId: string;
  gold: bigint;
  silver: bigint;
  copper: bigint;
  totalInCopper: bigint; // For easy calculations
  lastUpdated: Date;
}

/**
 * Result of a currency transaction
 */
export interface TransactionResult {
  success: boolean;
  previousBalance: bigint;
  newBalance: bigint;
  amount: bigint;
  transactionId: string;
  message: string;
}

/**
 * Result of a currency transfer between characters
 */
export interface CurrencyTransferResult {
  success: boolean;
  fromBalance: bigint;
  toBalance: bigint;
  amount: bigint;
  fee?: bigint;
  transactionId: string;
  message: string;
}

/**
 * Currency transaction record
 */
export interface Transaction {
  id: string;
  characterId: string;
  type: 'add' | 'deduct' | 'transfer_in' | 'transfer_out';
  amount: bigint;
  source: string; // e.g., 'quest_reward', 'vendor_sale', 'player_trade'
  description: string;
  balanceBefore: bigint;
  balanceAfter: bigint;
  relatedCharacterId?: string; // For transfers
  timestamp: Date;
}

/**
 * Currency exchange rates (for different denominations)
 */
export interface ExchangeRates {
  copperToSilver: number; // Default: 100
  silverToGold: number;   // Default: 100
}

/**
 * Interface for Currency-related operations
 * Handles all monetary transactions in the game
 */
export interface ICurrencyService {
  /**
   * Get currency balance for a character
   * @param characterId - The character to check
   * @returns Current currency balance
   */
  getBalance(characterId: string): Promise<CurrencyBalance>;

  /**
   * Add currency to a character
   * @param characterId - The character receiving currency
   * @param amount - Amount to add (in copper)
   * @param source - Source of the currency
   * @param description - Optional description
   * @returns Transaction result
   */
  addCurrency(characterId: string, amount: bigint, source: string, description?: string): Promise<TransactionResult>;

  /**
   * Deduct currency from a character
   * @param characterId - The character losing currency
   * @param amount - Amount to deduct (in copper)
   * @param reason - Reason for deduction
   * @param description - Optional description
   * @returns Transaction result
   */
  deductCurrency(characterId: string, amount: bigint, reason: string, description?: string): Promise<TransactionResult>;

  /**
   * Transfer currency between characters
   * @param fromId - Sending character
   * @param toId - Receiving character
   * @param amount - Amount to transfer (in copper)
   * @param includeFee - Whether to apply transfer fee
   * @returns Transfer result
   */
  transferCurrency(fromId: string, toId: string, amount: bigint, includeFee?: boolean): Promise<CurrencyTransferResult>;

  /**
   * Get transaction history for a character
   * @param characterId - The character to get history for
   * @param limit - Maximum number of transactions
   * @param offset - Offset for pagination
   * @returns Array of transactions
   */
  getTransactionHistory(characterId: string, limit?: number, offset?: number): Promise<Transaction[]>;

  /**
   * Check if character can afford an amount
   * @param characterId - The character to check
   * @param amount - Amount to check (in copper)
   * @returns Whether they can afford it
   */
  canAfford(characterId: string, amount: bigint): Promise<boolean>;

  /**
   * Convert between currency denominations
   * @param amount - Amount to convert
   * @param from - Source denomination
   * @param to - Target denomination
   * @returns Converted amount
   */
  convertCurrency(amount: bigint, from: 'copper' | 'silver' | 'gold', to: 'copper' | 'silver' | 'gold'): bigint;

  /**
   * Format currency for display
   * @param amount - Amount in copper
   * @returns Formatted string (e.g., "1g 50s 25c")
   */
  formatCurrency(amount: bigint): string;
}