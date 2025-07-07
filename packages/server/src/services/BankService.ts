import { eq, and } from 'drizzle-orm';
import { db } from '../database/config';
import { personalBanks, sharedBanks, characters, transactions } from '../database/schema';
import { CacheService } from './CacheService';
import { BankSlot, BankTransferRequest, PersonalBank, SharedBank } from '../types/bank';
import { logger } from '../utils/logger';

export class BankService {
  private readonly CACHE_TTL = 300; // 5 minutes
  
  constructor(private cacheService: CacheService) {}
  private readonly SLOT_COST = BigInt(1000); // Gold per slot
  private readonly MAX_SLOTS = 100;

  async getPersonalBank(characterId: string): Promise<PersonalBank> {
    const cacheKey = `bank:personal:${characterId}`;
    const cached = await this.cacheService.get<PersonalBank>(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get character bank info
    const [character] = await db
      .select({ bankSlots: characters.bankSlots })
      .from(characters)
      .where(eq(characters.id, characterId));

    if (!character) {
      throw new Error('Character not found');
    }

    // Get bank items
    const slots = await db
      .select()
      .from(personalBanks)
      .where(eq(personalBanks.characterId, characterId))
      .orderBy(personalBanks.slot);

    const bankData: PersonalBank = {
      characterId,
      slots: this.formatBankSlots(slots),
      maxSlots: character.bankSlots,
    };

    await this.cacheService.set(cacheKey, bankData, this.CACHE_TTL);
    return bankData;
  }

  async getSharedBank(userId: string): Promise<SharedBank> {
    const cacheKey = `bank:shared:${userId}`;
    const cached = await this.cacheService.get<SharedBank>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const slots = await db
      .select()
      .from(sharedBanks)
      .where(eq(sharedBanks.userId, userId))
      .orderBy(sharedBanks.slot);

    const bankData: SharedBank = {
      userId,
      slots: this.formatBankSlots(slots),
      lastAccessedBy: slots[0]?.lastAccessedBy || undefined,
      lastAccessedAt: slots[0]?.updatedAt || undefined,
    };

    await this.cacheService.set(cacheKey, bankData, this.CACHE_TTL);
    return bankData;
  }

  async addItemToBank(
    characterId: string,
    slot: number,
    itemId: number,
    quantity: number = 1,
    bankType: 'personal' | 'shared' = 'personal'
  ): Promise<void> {
    await db.transaction(async (tx) => {
      if (bankType === 'personal') {
        // Check if slot is already occupied
        const existing = await tx
          .select()
          .from(personalBanks)
          .where(and(
            eq(personalBanks.characterId, characterId),
            eq(personalBanks.slot, slot)
          ))
          .limit(1);

        if (existing.length > 0) {
          // Update quantity if same item
          if (existing[0].itemId === itemId) {
            await tx
              .update(personalBanks)
              .set({
                quantity: existing[0].quantity + quantity,
                updatedAt: new Date(),
              })
              .where(and(
                eq(personalBanks.characterId, characterId),
                eq(personalBanks.slot, slot)
              ));
          } else {
            throw new Error('Slot already occupied by different item');
          }
        } else {
          // Insert new item
          await tx
            .insert(personalBanks)
            .values({
              characterId,
              slot,
              itemId,
              quantity,
            });
        }

        // Clear cache
        await redis.del(`bank:personal:${characterId}`);
      }
    });

    logger.info('Item added to bank', {
      characterId,
      bankType,
      slot,
      itemId,
      quantity,
      service: 'bank',
    });
  }

  async removeItemFromBank(
    characterId: string,
    slot: number,
    quantity?: number,
    bankType: 'personal' | 'shared' = 'personal'
  ): Promise<{ itemId: number; removedQuantity: number }> {
    return await db.transaction(async (tx) => {
      if (bankType === 'personal') {
        const [item] = await tx
          .select()
          .from(personalBanks)
          .where(and(
            eq(personalBanks.characterId, characterId),
            eq(personalBanks.slot, slot)
          ))
          .limit(1);

        if (!item) {
          throw new Error('No item in specified slot');
        }

        const removeQuantity = quantity || item.quantity;
        
        if (removeQuantity > item.quantity) {
          throw new Error('Not enough items in slot');
        }

        if (removeQuantity === item.quantity) {
          // Remove entire stack
          await tx
            .delete(personalBanks)
            .where(and(
              eq(personalBanks.characterId, characterId),
              eq(personalBanks.slot, slot)
            ));
        } else {
          // Update quantity
          await tx
            .update(personalBanks)
            .set({
              quantity: item.quantity - removeQuantity,
              updatedAt: new Date(),
            })
            .where(and(
              eq(personalBanks.characterId, characterId),
              eq(personalBanks.slot, slot)
            ));
        }

        // Clear cache
        await redis.del(`bank:personal:${characterId}`);

        logger.info('Item removed from bank', {
          characterId,
          bankType,
          slot,
          itemId: item.itemId,
          removedQuantity: removeQuantity,
          service: 'bank',
        });

        return {
          itemId: item.itemId!,
          removedQuantity: removeQuantity,
        };
      }

      throw new Error('Shared bank operations not yet implemented');
    });
  }

  async expandBankSlots(
    characterId: string,
    additionalSlots: number
  ): Promise<{ newTotalSlots: number; cost: bigint }> {
    if (additionalSlots <= 0) {
      throw new Error('Additional slots must be positive');
    }

    return await db.transaction(async (tx) => {
      const [character] = await tx
        .select()
        .from(characters)
        .where(eq(characters.id, characterId))
        .for('update');

      if (!character) {
        throw new Error('Character not found');
      }

      const newTotalSlots = character.bankSlots + additionalSlots;
      
      if (newTotalSlots > this.MAX_SLOTS) {
        throw new Error(`Cannot exceed maximum of ${this.MAX_SLOTS} bank slots`);
      }

      const totalCost = this.SLOT_COST * BigInt(additionalSlots);
      
      if (character.gold < totalCost) {
        throw new Error('Insufficient gold for bank expansion');
      }

      // Deduct gold and update slots
      await tx
        .update(characters)
        .set({
          gold: character.gold - Number(totalCost),
          bankSlots: newTotalSlots,
          updatedAt: new Date(),
        })
        .where(eq(characters.id, characterId));

      // Record transaction
      await tx.insert(transactions).values({
        characterId,
        type: 'purchase',
        amount: -Number(totalCost),
        balanceBefore: character.gold,
        balanceAfter: character.gold - Number(totalCost),
        description: `Bank expansion: ${additionalSlots} slots`,
        metadata: { 
          source: 'bank_expansion', 
          quantity: additionalSlots,
          itemName: `Bank slots (${character.bankSlots} → ${newTotalSlots})`,
        },
      });

      // Clear caches
      await redis.del(
        `bank:personal:${characterId}`,
        `currency:balance:${characterId}`
      );

      logger.info('Bank slots expanded', {
        characterId,
        previousSlots: character.bankSlots,
        newSlots: newTotalSlots,
        cost: totalCost.toString(),
        service: 'bank',
      });

      return { newTotalSlots, cost: totalCost };
    });
  }

  async transferItem(
    characterId: string,
    userId: string,
    request: BankTransferRequest
  ): Promise<void> {
    // This is a simplified version - full implementation would integrate with inventory system
    await db.transaction(async (tx) => {
      // Validate character owns the account
      const [character] = await tx
        .select()
        .from(characters)
        .where(and(
          eq(characters.id, characterId),
          eq(characters.accountId, userId)
        ));

      if (!character) {
        throw new Error('Character not found or unauthorized');
      }

      // For now, just handle bank-to-bank transfers
      if (request.fromType === 'bank' && request.toType === 'bank') {
        // Remove from source slot
        const removed = await this.removeItemFromBank(
          characterId,
          request.fromSlot,
          request.quantity,
          'personal'
        );

        // Add to destination slot
        await this.addItemToBank(
          characterId,
          request.toSlot,
          removed.itemId,
          removed.removedQuantity,
          'personal'
        );
      } else {
        throw new Error('Transfer type not yet implemented');
      }

      logger.info('Item transferred', {
        characterId,
        fromType: request.fromType,
        fromSlot: request.fromSlot,
        toType: request.toType,
        toSlot: request.toSlot,
        quantity: request.quantity,
        service: 'bank',
      });
    });
  }

  private formatBankSlots(rawSlots: any[]): BankSlot[] {
    return rawSlots.map(slot => ({
      slot: slot.slot,
      itemId: slot.itemId,
      quantity: slot.quantity,
    }));
  }
}

// Export singleton instance
export const bankService = new BankService();