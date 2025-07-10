import { 
  IBankService, 
  BankType, 
  BankContents, 
  BankSlot, 
  DepositResult, 
  WithdrawResult, 
  TransferResult, 
  ExpansionResult, 
  BankTransaction,
  PersonalBank,
  SharedBank,
  BankTransferRequest
} from '../interfaces/IBankService';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of BankService for testing
 * Uses in-memory storage for bank data
 */
export class MockBankService implements IBankService {
  /**
   * Get the service name (from IService)
   */
  getName(): string {
    return 'MockBankService';
  }
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
    personalBank.slots[0] = { slot: 0, slotIndex: 0, itemId: 'item_001', quantity: 1, isEmpty: false };
    personalBank.slots[1] = { slot: 1, slotIndex: 1, itemId: 'item_002', quantity: 5, isEmpty: false };
    personalBank.slots[5] = { slot: 5, slotIndex: 5, itemId: 'item_201', quantity: 1, isEmpty: false };
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
          slotIndex: existingSlot.slotIndex || existingSlot.slot,
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
      slotIndex: emptySlot.slotIndex || emptySlot.slot,
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
      slot.quantity = 0;
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

  private async expandBankSlotsOriginal(characterId: string, bankType: BankType): Promise<ExpansionResult> {
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
        slot: i,
        slotIndex: i,
        quantity: 0,
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
        slot: i,
        slotIndex: i,
        quantity: 0,
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

  // New required methods from actual implementation

  async getPersonalBank(characterId: string): Promise<PersonalBank> {
    logger.info(`MockBankService: Getting personal bank for ${characterId}`);
    
    const bank = await this.getBankContents(characterId, BankType.PERSONAL);
    
    return {
      characterId,
      slots: bank.slots,
      maxSlots: bank.totalSlots
    };
  }

  async getSharedBank(userId: string): Promise<SharedBank> {
    logger.info(`MockBankService: Getting shared bank for user ${userId}`);
    
    // For mock, use userId as characterId
    const bank = await this.getBankContents(userId, BankType.SHARED);
    
    return {
      userId,
      slots: bank.slots,
      lastAccessedBy: userId,
      lastAccessedAt: bank.lastAccessed
    };
  }

  async addItemToBank(
    characterId: string,
    slot: number,
    itemId: number,
    quantity: number = 1,
    bankType: 'personal' | 'shared' = 'personal'
  ): Promise<void> {
    logger.info(`MockBankService: Adding item ${itemId} to ${bankType} bank slot ${slot}`);
    
    const type = bankType === 'personal' ? BankType.PERSONAL : BankType.SHARED;
    const bank = await this.getBankContents(characterId, type);
    
    if (slot >= bank.totalSlots) {
      throw new Error('Invalid slot index');
    }
    
    // Update the slot
    bank.slots[slot] = {
      slot: slot,
      slotIndex: slot,
      itemId: `item_${itemId}`,
      quantity,
      isEmpty: false
    };
    
    // Update used slots count
    bank.usedSlots = bank.slots.filter(s => !s.isEmpty).length;
    
    this.saveBank(characterId, type, bank);
    this.recordTransaction(characterId, type, 'deposit', `item_${itemId}`, undefined, quantity);
  }

  async removeItemFromBank(
    characterId: string,
    slot: number,
    quantity?: number,
    bankType: 'personal' | 'shared' = 'personal'
  ): Promise<{ itemId: number; removedQuantity: number }> {
    logger.info(`MockBankService: Removing item from ${bankType} bank slot ${slot}`);
    
    const type = bankType === 'personal' ? BankType.PERSONAL : BankType.SHARED;
    const bank = await this.getBankContents(characterId, type);
    
    if (slot >= bank.totalSlots || bank.slots[slot].isEmpty) {
      throw new Error('Invalid slot or slot is empty');
    }
    
    const slotData = bank.slots[slot];
    const itemIdNum = typeof slotData.itemId === 'string' 
      ? parseInt(slotData.itemId.replace('item_', ''))
      : slotData.itemId!;
    const removedQuantity = quantity || slotData.quantity || 1;
    
    if (removedQuantity >= (slotData.quantity || 1)) {
      // Remove entire item
      bank.slots[slot] = {
        slot: slot,
        slotIndex: slot,
        quantity: 0,
        isEmpty: true
      };
    } else {
      // Reduce quantity
      bank.slots[slot].quantity = (slotData.quantity || 1) - removedQuantity;
    }
    
    // Update used slots count
    bank.usedSlots = bank.slots.filter(s => !s.isEmpty).length;
    
    this.saveBank(characterId, type, bank);
    this.recordTransaction(characterId, type, 'withdraw', slotData.itemId?.toString(), undefined, removedQuantity);
    
    return {
      itemId: itemIdNum,
      removedQuantity
    };
  }

  async transferItem(
    characterId: string,
    userId: string,
    request: BankTransferRequest
  ): Promise<void> {
    logger.info(`MockBankService: Transferring item between banks`);
    
    // Remove from source
    const removed = await this.removeItemFromBank(
      characterId,
      request.fromSlot,
      request.quantity,
      request.fromBankType
    );
    
    // Add to destination
    await this.addItemToBank(
      request.toBankType === 'shared' ? userId : characterId,
      request.toSlot,
      removed.itemId,
      removed.removedQuantity,
      request.toBankType
    );
  }

  // Overloaded expandBankSlots methods
  async expandBankSlots(characterId: string, bankType: BankType): Promise<ExpansionResult>;
  async expandBankSlots(characterId: string, additionalSlots: number): Promise<{ newTotalSlots: number; cost: bigint }>;
  async expandBankSlots(
    characterId: string,
    bankTypeOrSlots: BankType | number
  ): Promise<ExpansionResult | { newTotalSlots: number; cost: bigint }> {
    if (typeof bankTypeOrSlots === 'number') {
      // New signature: expandBankSlots(characterId, additionalSlots)
      const additionalSlots = bankTypeOrSlots;
      logger.info(`MockBankService: Expanding bank slots by ${additionalSlots}`);
      
      const bank = await this.getBankContents(characterId, BankType.PERSONAL);
      const newTotalSlots = bank.totalSlots + additionalSlots;
      const cost = BigInt(additionalSlots * 1000); // 1000 gold per slot
      
      // Expand the slots
      for (let i = bank.totalSlots; i < newTotalSlots; i++) {
        bank.slots.push({
          slot: i,
          slotIndex: i,
          quantity: 0,
          isEmpty: true
        });
      }
      
      bank.totalSlots = newTotalSlots;
      this.saveBank(characterId, BankType.PERSONAL, bank);
      
      return {
        newTotalSlots,
        cost
      };
    } else {
      // Original signature: expandBankSlots(characterId, bankType)
      // Delegate to the original method
      return this.expandBankSlotsOriginal(characterId, bankTypeOrSlots);
    }
  }
}