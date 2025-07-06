/**
 * Bank types available
 */
export enum BankType {
  PERSONAL = 'personal',
  SHARED = 'shared',
  GUILD = 'guild'
}

/**
 * Bank contents including items and gold
 */
export interface BankContents {
  bankType: BankType;
  characterId: string;
  slots: BankSlot[];
  totalSlots: number;
  usedSlots: number;
  gold: bigint;
  lastAccessed: Date;
}

/**
 * Individual bank slot
 */
export interface BankSlot {
  slotIndex: number;
  itemId?: string;
  quantity?: number;
  isEmpty: boolean;
}

/**
 * Result of depositing an item
 */
export interface DepositResult {
  success: boolean;
  itemId: string;
  quantity: number;
  slotIndex: number;
  message: string;
}

/**
 * Result of withdrawing an item
 */
export interface WithdrawResult {
  success: boolean;
  itemId: string;
  quantity: number;
  message: string;
}

/**
 * Result of gold transfer
 */
export interface TransferResult {
  success: boolean;
  amount: bigint;
  previousBalance: bigint;
  newBalance: bigint;
  bankBalance: bigint;
  message: string;
}

/**
 * Result of bank expansion
 */
export interface ExpansionResult {
  success: boolean;
  previousSlots: number;
  newSlots: number;
  cost: bigint;
  message: string;
}

/**
 * Bank transaction log entry
 */
export interface BankTransaction {
  id: string;
  characterId: string;
  bankType: BankType;
  action: 'deposit' | 'withdraw' | 'transfer';
  itemId?: string;
  gold?: bigint;
  quantity?: number;
  timestamp: Date;
}

/**
 * Interface for Bank-related operations
 * Handles personal, shared, and guild banking
 */
export interface IBankService {
  /**
   * Get bank contents for a character
   * @param characterId - The character accessing the bank
   * @param bankType - Type of bank to access
   * @returns Bank contents including items and gold
   */
  getBankContents(characterId: string, bankType: BankType): Promise<BankContents>;

  /**
   * Deposit an item into the bank
   * @param characterId - The character depositing
   * @param itemId - The item to deposit
   * @param bankType - Which bank to deposit to
   * @param quantity - Optional quantity for stackable items
   * @returns Result of the deposit
   */
  depositItem(characterId: string, itemId: string, bankType: BankType, quantity?: number): Promise<DepositResult>;

  /**
   * Withdraw an item from the bank
   * @param characterId - The character withdrawing
   * @param itemId - The item to withdraw
   * @param bankType - Which bank to withdraw from
   * @param quantity - Optional quantity for stackable items
   * @returns Result of the withdrawal
   */
  withdrawItem(characterId: string, itemId: string, bankType: BankType, quantity?: number): Promise<WithdrawResult>;

  /**
   * Transfer gold to/from bank
   * @param characterId - The character transferring
   * @param amount - Amount to transfer
   * @param bankType - Which bank to use
   * @param direction - Deposit or withdraw
   * @returns Result of the transfer
   */
  transferGold(characterId: string, amount: bigint, bankType: BankType, direction: 'deposit' | 'withdraw'): Promise<TransferResult>;

  /**
   * Expand bank slots
   * @param characterId - The character expanding
   * @param bankType - Which bank to expand
   * @returns Result of the expansion
   */
  expandBankSlots(characterId: string, bankType: BankType): Promise<ExpansionResult>;

  /**
   * Get bank transaction history
   * @param characterId - The character to get history for
   * @param bankType - Optional filter by bank type
   * @param limit - Maximum number of transactions
   * @returns Array of transactions
   */
  getTransactionHistory(characterId: string, bankType?: BankType, limit?: number): Promise<BankTransaction[]>;

  /**
   * Check if character has access to a bank type
   * @param characterId - The character to check
   * @param bankType - The bank type to check
   * @returns Whether access is allowed
   */
  hasAccess(characterId: string, bankType: BankType): Promise<boolean>;
}