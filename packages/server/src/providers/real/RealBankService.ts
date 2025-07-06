import { 
  IBankService, 
  BankType, 
  BankContents, 
  DepositResult, 
  WithdrawResult, 
  TransferResult, 
  ExpansionResult, 
  BankTransaction,
  PersonalBank,
  SharedBank,
  BankTransferRequest
} from '../interfaces/IBankService';
import { BankService } from '../../services/BankService';

/**
 * Real implementation wrapper for BankService
 * Implements IBankService interface and delegates to actual BankService
 */
export class RealBankService implements IBankService {
  private bankService: BankService;

  constructor() {
    this.bankService = new BankService();
  }

  async getBankContents(characterId: string, bankType: BankType): Promise<BankContents> {
    // Use the actual methods available
    if (bankType === BankType.PERSONAL) {
      const bank = await this.bankService.getPersonalBank(characterId);
      return {
        bankType,
        characterId,
        slots: bank.slots,
        totalSlots: bank.maxSlots,
        usedSlots: bank.slots.filter(s => !s.isEmpty).length,
        gold: BigInt(0), // Bank doesn't track gold
        lastAccessed: new Date()
      };
    } else if (bankType === BankType.SHARED) {
      const bank = await this.bankService.getSharedBank(characterId);
      return {
        bankType,
        characterId,
        slots: bank.slots,
        totalSlots: 48, // Default shared bank size
        usedSlots: bank.slots.filter(s => !s.isEmpty).length,
        gold: BigInt(0),
        lastAccessed: bank.lastAccessedAt || new Date()
      };
    } else {
      // Guild bank not implemented
      return {
        bankType,
        characterId,
        slots: [],
        totalSlots: 0,
        usedSlots: 0,
        gold: BigInt(0),
        lastAccessed: new Date()
      };
    }
  }

  async depositItem(characterId: string, itemId: string, bankType: BankType, quantity: number = 1): Promise<DepositResult> {
    try {
      // Find first empty slot
      const bank = await this.getBankContents(characterId, bankType);
      const emptySlot = bank.slots.findIndex(s => s.isEmpty);
      
      if (emptySlot === -1) {
        return {
          success: false,
          itemId,
          quantity,
          slotIndex: -1,
          message: 'No empty slots available'
        };
      }
      
      // Use addItemToBank method
      const bankTypeStr = bankType === BankType.PERSONAL ? 'personal' : 'shared';
      await this.bankService.addItemToBank(
        characterId,
        emptySlot,
        parseInt(itemId.replace('item_', '')),
        quantity,
        bankTypeStr
      );
      
      return {
        success: true,
        itemId,
        quantity,
        slotIndex: emptySlot,
        message: 'Item deposited'
      };
    } catch (error: any) {
      return {
        success: false,
        itemId,
        quantity,
        slotIndex: -1,
        message: error.message || 'Failed to deposit item'
      };
    }
  }

  async withdrawItem(characterId: string, itemId: string, bankType: BankType, quantity: number = 1): Promise<WithdrawResult> {
    try {
      // Find slot with the item
      const bank = await this.getBankContents(characterId, bankType);
      const slot = bank.slots.findIndex(s => s.itemId === itemId);
      
      if (slot === -1) {
        return {
          success: false,
          itemId,
          quantity: 0,
          message: 'Item not found in bank'
        };
      }
      
      // Use removeItemFromBank method
      const bankTypeStr = bankType === BankType.PERSONAL ? 'personal' : 'shared';
      const result = await this.bankService.removeItemFromBank(
        characterId,
        slot,
        quantity,
        bankTypeStr
      );
      
      return {
        success: true,
        itemId,
        quantity: result.removedQuantity,
        message: 'Item withdrawn'
      };
    } catch (error: any) {
      return {
        success: false,
        itemId,
        quantity: 0,
        message: error.message || 'Failed to withdraw item'
      };
    }
  }

  async transferGold(characterId: string, amount: bigint, bankType: BankType, direction: 'deposit' | 'withdraw'): Promise<TransferResult> {
    // The real BankService doesn't support gold transfers
    // This is a placeholder implementation
    return {
      success: false,
      amount,
      previousBalance: BigInt(0),
      newBalance: BigInt(0),
      bankBalance: BigInt(0),
      message: 'Gold transfers not implemented in bank service'
    };
  }

  // Moved expandBankSlots to the end with overload support

  async getTransactionHistory(characterId: string, bankType?: BankType, limit: number = 50): Promise<BankTransaction[]> {
    // Real service may not have transaction history
    // Would need to implement or return empty
    return [];
  }

  async hasAccess(characterId: string, bankType: BankType): Promise<boolean> {
    // Check access based on bank type
    switch (bankType) {
      case BankType.PERSONAL:
        return true;
      case BankType.SHARED:
        // Would check account permissions
        return true;
      case BankType.GUILD:
        // Would check guild membership
        return false;
      default:
        return false;
    }
  }

  // New required methods from actual implementation

  async getPersonalBank(characterId: string): Promise<PersonalBank> {
    const bank = await this.bankService.getPersonalBank(characterId);
    return bank;
  }

  async getSharedBank(userId: string): Promise<SharedBank> {
    const bank = await this.bankService.getSharedBank(userId);
    return bank;
  }

  async addItemToBank(
    characterId: string,
    slot: number,
    itemId: number,
    quantity?: number,
    bankType?: 'personal' | 'shared'
  ): Promise<void> {
    await this.bankService.addItemToBank(characterId, slot, itemId, quantity, bankType);
  }

  async removeItemFromBank(
    characterId: string,
    slot: number,
    quantity?: number,
    bankType?: 'personal' | 'shared'
  ): Promise<{ itemId: number; removedQuantity: number }> {
    const result = await this.bankService.removeItemFromBank(characterId, slot, quantity, bankType);
    return result;
  }

  async transferItem(
    characterId: string,
    userId: string,
    request: BankTransferRequest
  ): Promise<void> {
    await this.bankService.transferItem(characterId, userId, request);
  }

  // Overloaded expandBankSlots to handle both signatures
  async expandBankSlots(characterId: string, bankType: BankType): Promise<ExpansionResult>;
  async expandBankSlots(characterId: string, additionalSlots: number): Promise<{ newTotalSlots: number; cost: bigint }>;
  async expandBankSlots(
    characterId: string,
    bankTypeOrSlots: BankType | number
  ): Promise<ExpansionResult | { newTotalSlots: number; cost: bigint }> {
    if (typeof bankTypeOrSlots === 'number') {
      // New signature: expandBankSlots(characterId, additionalSlots)
      const result = await this.bankService.expandBankSlots(characterId, bankTypeOrSlots);
      return result;
    } else {
      // Original signature: expandBankSlots(characterId, bankType)
      // The real service doesn't have expandBank method, use the slots version
      const bank = await this.getBankContents(characterId, bankTypeOrSlots);
      const additionalSlots = 6; // Default expansion size
      const result = await this.bankService.expandBankSlots(characterId, additionalSlots);
      
      return {
        success: true,
        previousSlots: bank.totalSlots,
        newSlots: result.newTotalSlots,
        cost: result.cost,
        message: 'Bank expanded'
      };
    }
  }
}