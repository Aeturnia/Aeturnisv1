// Import types from the actual service
import type { BankTransferRequest as TypeBankTransferRequest } from '../../types/bank';

/**
 * Bank types available
 */
export enum BankType {
  PERSONAL = 'personal',
  SHARED = 'shared',
  GUILD = 'guild'
}

/**
 * Bank slot for interface
 */
export interface BankSlot {
  slot: number;
  slotIndex?: number; // Alternative name for slot
  itemId?: string | number;
  quantity: number;
  isEmpty?: boolean;
  item?: any; // populated on fetch
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
// Define types for the interface
export interface PersonalBank {
  characterId: string;
  slots: BankSlot[];
  maxSlots: number;
}

export interface SharedBank {
  userId: string;
  slots: BankSlot[];
  lastAccessedBy?: string;
  lastAccessedAt?: Date;
}

export interface BankTransferRequest extends TypeBankTransferRequest {
  fromBankType?: 'personal' | 'shared';
  toBankType?: 'personal' | 'shared';
}

export interface IBankService {
  /**
   * Get personal bank for a character
   * @param characterId - The character ID
   * @returns Personal bank data
   */
  getPersonalBank(characterId: string): Promise<PersonalBank>;

  /**
   * Get shared bank for a user
   * @param userId - The user ID
   * @returns Shared bank data
   */
  getSharedBank(userId: string): Promise<SharedBank>;

  /**
   * Add item to bank
   * @param characterId - The character ID
   * @param slot - The slot number
   * @param itemId - The item ID
   * @param quantity - Item quantity
   * @param bankType - Bank type ('personal' or 'shared')
   */
  addItemToBank(
    characterId: string,
    slot: number,
    itemId: number,
    quantity?: number,
    bankType?: 'personal' | 'shared'
  ): Promise<void>;

  /**
   * Remove item from bank
   * @param characterId - The character ID
   * @param slot - The slot number
   * @param quantity - Quantity to remove
   * @param bankType - Bank type
   * @returns Removed item details
   */
  removeItemFromBank(
    characterId: string,
    slot: number,
    quantity?: number,
    bankType?: 'personal' | 'shared'
  ): Promise<{ itemId: number; removedQuantity: number }>;

  /**
   * Transfer item between banks
   * @param characterId - The character ID
   * @param userId - The user ID
   * @param request - Transfer request details
   */
  transferItem(
    characterId: string,
    userId: string,
    request: BankTransferRequest
  ): Promise<void>;

  /**
   * Expand bank slots (with different signature)
   * @param characterId - The character ID
   * @param additionalSlots - Number of slots to add
   * @returns New total slots and cost
   */
  expandBankSlots(
    characterId: string,
    additionalSlots: number
  ): Promise<{ newTotalSlots: number; cost: bigint }>;

  // Alternative/future interface methods
  /**
   * Get bank contents for a character (unified approach)
   * @param characterId - The character accessing the bank
   * @param bankType - Type of bank to access
   * @returns Bank contents including items and gold
   */
  getBankContents?(characterId: string, bankType: BankType): Promise<BankContents>;

  /**
   * Deposit an item into the bank (alternative)
   * @param characterId - The character depositing
   * @param itemId - The item to deposit
   * @param bankType - Which bank to deposit to
   * @param quantity - Optional quantity for stackable items
   * @returns Result of the deposit
   */
  depositItem?(characterId: string, itemId: string, bankType: BankType, quantity?: number): Promise<DepositResult>;

  /**
   * Withdraw an item from the bank (alternative)
   * @param characterId - The character withdrawing
   * @param itemId - The item to withdraw
   * @param bankType - Which bank to withdraw from
   * @param quantity - Optional quantity for stackable items
   * @returns Result of the withdrawal
   */
  withdrawItem?(characterId: string, itemId: string, bankType: BankType, quantity?: number): Promise<WithdrawResult>;

  /**
   * Transfer gold to/from bank
   * @param characterId - The character transferring
   * @param amount - Amount to transfer
   * @param bankType - Which bank to use
   * @param direction - Deposit or withdraw
   * @returns Result of the transfer
   */
  transferGold?(characterId: string, amount: bigint, bankType: BankType, direction: 'deposit' | 'withdraw'): Promise<TransferResult>;

  /**
   * Get bank transaction history
   * @param characterId - The character to get history for
   * @param bankType - Optional filter by bank type
   * @param limit - Maximum number of transactions
   * @returns Array of transactions
   */
  getTransactionHistory?(characterId: string, bankType?: BankType, limit?: number): Promise<BankTransaction[]>;

  /**
   * Check if character has access to a bank type
   * @param characterId - The character to check
   * @param bankType - The bank type to check
   * @returns Whether access is allowed
   */
  hasAccess?(characterId: string, bankType: BankType): Promise<boolean>;
}