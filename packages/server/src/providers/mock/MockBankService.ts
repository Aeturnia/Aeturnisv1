import { 
  IBankService, 
  BankType, 
  BankContents, 
  BankSlot, 
  DepositResult, 
  WithdrawResult, 
  TransferResult, 
  ExpansionResult, 
  BankTransaction 
} from '../interfaces/IBankService';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of BankService for testing
 * Uses in-memory storage for bank data
 */
export class MockBankService implements IBankService {
  // Mock bank storage: characterId -> bankType -> contents
  private banks: Map<string, Map<BankType, BankContents>> = new Map();
  
  // Mock transaction history
  private transactions: BankTransaction[] = [];
  
  // Mock item database for testing
  private mockItems = new Map([
    ['item_001', { name: 'Iron Sword', stackable: false }],
    ['item_002', { name: 'Health Potion', stackable: true }],
    ['item_003', { name: 'Leather Armor', stackable: false }],
    ['item_101', { name: 'Steel Sword', stackable: false }],
    ['item_201', { name: 'Silver Ring', stackable: false }]
  ]);
  
  // Bank slot costs for expansion
  private expansionCosts = {
    [BankType.PERSONAL]: [BigInt(1000), BigInt(5000), BigInt(10000), BigInt(25000)],
    [BankType.SHARED]: [BigInt(5000), BigInt(15000), BigInt(30000), BigInt(50000)],
    [BankType.GUILD]: [BigInt(10000), BigInt(50000), BigInt(100000), BigInt(250000)]
  };

  constructor() {
    logger.info('MockBankService initialized');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize test character with some bank items
    const testCharacterId = 'player-test-001';
    const personalBank = this.createEmptyBank(testCharacterId, BankType.PERSONAL);
    
    // Add some test items
    personalBank.slots[0] = { slotIndex: 0, itemId: 'item_001', quantity: 1, isEmpty: false };
    personalBank.slots[1] = { slotIndex: 1, itemId: 'item_002', quantity: 5, isEmpty: false };
    personalBank.slots[5] = { slotIndex: 5, itemId: 'item_201', quantity: 1, isEmpty: false };
    personalBank.usedSlots = 3;
    personalBank.gold = BigInt(5000);
    
    const characterBanks = new Map<BankType, BankContents>();
    characterBanks.set(BankType.PERSONAL, personalBank);
    characterBanks.set(BankType.SHARED, this.createEmptyBank(testCharacterId, BankType.SHARED));
    
    this.banks.set(testCharacterId, characterBanks);
  }

  async getBankContents(characterId: string, bankType: BankType): Promise<BankContents> {
    logger.info(`MockBankService: Getting ${bankType} bank for character ${characterId}`);
    
    let characterBanks = this.banks.get(characterId);
    if (!characterBanks) {
      characterBanks = new Map();
      this.banks.set(characterId, characterBanks);
    }
    
    let bank = characterBanks.get(bankType);
    if (!bank) {
      bank = this.createEmptyBank(characterId, bankType);
      characterBanks.set(bankType, bank);
    }
    
    bank.lastAccessed = new Date();
    return { ...bank };
  }

  async depositItem(characterId: string, itemId: string, bankType: BankType, quantity: number = 1): Promise<DepositResult> {
    logger.info(`MockBankService: Depositing ${quantity} of ${itemId} to ${bankType} bank for ${characterId}`);
    
    const bank = await this.getBankContents(characterId, bankType);
    const item = this.mockItems.get(itemId);
    
    if (!item) {
      return {
        success: false,
        itemId,
        quantity: 0,
        slotIndex: -1,
        message: 'Item not found'
      };
    }
    
    // Check if item is stackable and already exists
    if (item.stackable) {
      const existingSlot = bank.slots.find(slot => slot.itemId === itemId);
      if (existingSlot) {
        existingSlot.quantity! += quantity;
        this.saveBank(characterId, bankType, bank);
        this.recordTransaction(characterId, bankType, 'deposit', itemId, undefined, quantity);
        
        return {
          success: true,
          itemId,
          quantity,
          slotIndex: existingSlot.slotIndex,
          message: `Added ${quantity} to existing stack`
        };
      }
    }
    
    // Find empty slot
    const emptySlot = bank.slots.find(slot => slot.isEmpty);
    if (!emptySlot) {
      return {
        success: false,
        itemId,
        quantity: 0,
        slotIndex: -1,
        message: 'No empty bank slots'
      };
    }
    
    // Deposit item
    emptySlot.itemId = itemId;
    emptySlot.quantity = quantity;
    emptySlot.isEmpty = false;
    bank.usedSlots++;
    
    this.saveBank(characterId, bankType, bank);
    this.recordTransaction(characterId, bankType, 'deposit', itemId, undefined, quantity);
    
    return {
      success: true,
      itemId,
      quantity,
      slotIndex: emptySlot.slotIndex,
      message: 'Item deposited successfully'
    };
  }

  async withdrawItem(characterId: string, itemId: string, bankType: BankType, quantity: number = 1): Promise<WithdrawResult> {
    logger.info(`MockBankService: Withdrawing ${quantity} of ${itemId} from ${bankType} bank for ${characterId}`);
    
    const bank = await this.getBankContents(characterId, bankType);
    const slot = bank.slots.find(s => s.itemId === itemId);
    
    if (!slot || slot.isEmpty) {
      return {
        success: false,
        itemId,
        quantity: 0,
        message: 'Item not found in bank'
      };
    }
    
    // Check quantity
    if (slot.quantity && slot.quantity < quantity) {
      return {
        success: false,
        itemId,
        quantity: 0,
        message: `Only ${slot.quantity} available`
      };
    }
    
    // Withdraw item
    if (slot.quantity && slot.quantity > quantity) {
      slot.quantity -= quantity;
    } else {
      // Remove item completely
      slot.itemId = undefined;
      slot.quantity = undefined;
      slot.isEmpty = true;
      bank.usedSlots--;
    }
    
    this.saveBank(characterId, bankType, bank);
    this.recordTransaction(characterId, bankType, 'withdraw', itemId, undefined, quantity);
    
    return {
      success: true,
      itemId,
      quantity,
      message: 'Item withdrawn successfully'
    };
  }

  async transferGold(characterId: string, amount: bigint, bankType: BankType, direction: 'deposit' | 'withdraw'): Promise<TransferResult> {
    logger.info(`MockBankService: ${direction} ${amount} gold for ${characterId} in ${bankType} bank`);
    
    const bank = await this.getBankContents(characterId, bankType);
    const previousBalance = bank.gold;
    
    if (direction === 'deposit') {
      bank.gold += amount;
    } else {
      if (bank.gold < amount) {
        return {
          success: false,
          amount,
          previousBalance,
          newBalance: previousBalance,
          bankBalance: bank.gold,
          message: 'Insufficient gold in bank'
        };
      }
      bank.gold -= amount;
    }
    
    this.saveBank(characterId, bankType, bank);
    this.recordTransaction(characterId, bankType, 'transfer', undefined, amount);
    
    return {
      success: true,
      amount,
      previousBalance,
      newBalance: direction === 'deposit' ? previousBalance - amount : previousBalance + amount,
      bankBalance: bank.gold,
      message: `Gold ${direction} successful`
    };
  }

  async expandBankSlots(characterId: string, bankType: BankType): Promise<ExpansionResult> {
    logger.info(`MockBankService: Expanding ${bankType} bank for ${characterId}`);
    
    const bank = await this.getBankContents(characterId, bankType);
    const costs = this.expansionCosts[bankType];
    const expansionLevel = Math.floor((bank.totalSlots - 24) / 6); // Each expansion adds 6 slots
    
    if (expansionLevel >= costs.length) {
      return {
        success: false,
        previousSlots: bank.totalSlots,
        newSlots: bank.totalSlots,
        cost: BigInt(0),
        message: 'Bank is already at maximum size'
      };
    }
    
    const cost = costs[expansionLevel];
    
    // For mock, assume player has enough gold
    const newSlots = bank.totalSlots + 6;
    
    // Add new empty slots
    for (let i = bank.totalSlots; i < newSlots; i++) {
      bank.slots.push({
        slotIndex: i,
        isEmpty: true
      });
    }
    
    bank.totalSlots = newSlots;
    this.saveBank(characterId, bankType, bank);
    
    return {
      success: true,
      previousSlots: bank.totalSlots - 6,
      newSlots: bank.totalSlots,
      cost,
      message: `Bank expanded to ${newSlots} slots`
    };
  }

  async getTransactionHistory(characterId: string, bankType?: BankType, limit: number = 50): Promise<BankTransaction[]> {
    logger.info(`MockBankService: Getting transaction history for ${characterId}`);
    
    let filtered = this.transactions.filter(t => t.characterId === characterId);
    
    if (bankType) {
      filtered = filtered.filter(t => t.bankType === bankType);
    }
    
    // Sort by timestamp descending and limit
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async hasAccess(characterId: string, bankType: BankType): Promise<boolean> {
    logger.info(`MockBankService: Checking access for ${characterId} to ${bankType} bank`);
    
    // For mock, allow access to personal and shared banks
    // Guild bank would require guild membership check
    switch (bankType) {
      case BankType.PERSONAL:
        return true;
      case BankType.SHARED:
        return true; // In real implementation, might check account status
      case BankType.GUILD:
        return false; // Would check guild membership
      default:
        return false;
    }
  }

  // Helper methods
  private createEmptyBank(characterId: string, bankType: BankType): BankContents {
    const totalSlots = 24; // Base slots
    const slots: BankSlot[] = [];
    
    for (let i = 0; i < totalSlots; i++) {
      slots.push({
        slotIndex: i,
        isEmpty: true
      });
    }
    
    return {
      bankType,
      characterId,
      slots,
      totalSlots,
      usedSlots: 0,
      gold: BigInt(0),
      lastAccessed: new Date()
    };
  }

  private saveBank(characterId: string, bankType: BankType, bank: BankContents): void {
    const characterBanks = this.banks.get(characterId);
    if (characterBanks) {
      characterBanks.set(bankType, bank);
    }
  }

  private recordTransaction(
    characterId: string,
    bankType: BankType,
    action: 'deposit' | 'withdraw' | 'transfer',
    itemId?: string,
    gold?: bigint,
    quantity?: number
  ): void {
    const transaction: BankTransaction = {
      id: uuidv4(),
      characterId,
      bankType,
      action,
      itemId,
      gold,
      quantity,
      timestamp: new Date()
    };
    
    this.transactions.push(transaction);
  }
}