import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database/config';
import { characters, transactions } from '../database/schema';
import { CacheService } from './CacheService';
import { Transaction, TransactionType, TransactionMetadata } from '../types/currency';
import { logger } from '../utils/logger';

export class CurrencyService {
  private readonly CACHE_TTL = 300; // 5 minutes
  
  constructor(private cacheService: CacheService) {}

  async getBalance(characterId: string): Promise<number> {
    const cacheKey = `currency:balance:${characterId}`;
    const cached = await this.cacheService.get<number>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const [character] = await db
      .select({ gold: characters.gold })
      .from(characters)
      .where(eq(characters.id, characterId));

    if (!character) {
      throw new Error('Character not found');
    }

    await this.cacheService.set(cacheKey, character.gold, this.CACHE_TTL);
    return character.gold;
  }

  async modifyBalance(
    characterId: string,
    amount: number,
    type: TransactionType,
    description?: string,
    metadata?: TransactionMetadata,
    relatedCharacterId?: string
  ): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      // Lock character row for update
      const [character] = await tx
        .select()
        .from(characters)
        .where(eq(characters.id, characterId))
        .for('update');

      if (!character) {
        throw new Error('Character not found');
      }

      const balanceBefore = character.gold;
      const balanceAfter = balanceBefore + amount;

      if (balanceAfter < 0) {
        throw new Error('Insufficient funds');
      }

      // Update balance
      await tx
        .update(characters)
        .set({ 
          gold: balanceAfter,
          updatedAt: new Date() 
        })
        .where(eq(characters.id, characterId));

      // Record transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          characterId,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          relatedCharacterId,
          description,
          metadata,
        })
        .returning();

      // Invalidate cache
      await this.cacheService.delete(`currency:balance:${characterId}`);

      logger.info('Currency transaction completed', {
        characterId,
        type,
        amount: amount.toString(),
        balanceAfter: balanceAfter.toString(),
        service: 'currency',
      });

      return {
        ...transaction,
        amount: transaction.amount,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        createdAt: transaction.createdAt,
      } as Transaction;
    });
  }

  async transferGold(
    fromCharacterId: string,
    toCharacterId: string,
    amount: number,
    description?: string
  ): Promise<{ senderTransaction: Transaction; receiverTransaction: Transaction }> {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    if (fromCharacterId === toCharacterId) {
      throw new Error('Cannot transfer to self');
    }

    return await db.transaction(async (tx) => {
      // Verify both characters exist
      const [sender, receiver] = await Promise.all([
        tx.select().from(characters).where(eq(characters.id, fromCharacterId)).limit(1),
        tx.select().from(characters).where(eq(characters.id, toCharacterId)).limit(1),
      ]);

      if (!sender[0] || !receiver[0]) {
        throw new Error('One or both characters not found');
      }

      // Deduct from sender
      const senderTransaction = await this.modifyBalance(
        fromCharacterId,
        -amount,
        'transfer',
        description || `Transfer to ${receiver[0].name}`,
        { transferType: 'send' },
        toCharacterId
      );

      // Add to receiver
      const receiverTransaction = await this.modifyBalance(
        toCharacterId,
        amount,
        'transfer',
        description || `Transfer from ${sender[0].name}`,
        { transferType: 'receive' },
        fromCharacterId
      );

      logger.info('Gold transfer completed', {
        from: fromCharacterId,
        to: toCharacterId,
        amount: amount.toString(),
        service: 'currency',
      });

      return { senderTransaction, receiverTransaction };
    });
  }

  async getTransactionHistory(
    characterId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaction[]> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.characterId, characterId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(tx => ({
      ...tx,
      amount: tx.amount,
      balanceBefore: tx.balanceBefore,
      balanceAfter: tx.balanceAfter,
      createdAt: tx.createdAt,
    } as Transaction));
  }

  async getTransactionStats(characterId: string): Promise<{
    totalEarned: bigint;
    totalSpent: bigint;
    netFlow: bigint;
    transactionCount: number;
  }> {
    const stats = await db
      .select({
        totalEarned: sql<string>`COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)`,
        totalSpent: sql<string>`COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)::int`,
      })
      .from(transactions)
      .where(eq(transactions.characterId, characterId));

    const result = stats[0];
    const totalEarned = BigInt(result.totalEarned);
    const totalSpent = BigInt(result.totalSpent);

    return {
      totalEarned,
      totalSpent,
      netFlow: totalEarned - totalSpent,
      transactionCount: result.transactionCount,
    };
  }

  async rewardGold(
    characterId: string,
    amount: number,
    source: string,
    metadata?: TransactionMetadata
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new Error('Reward amount must be positive');
    }

    return await this.modifyBalance(
      characterId,
      amount,
      'reward',
      `Reward from ${source}`,
      { ...metadata, source }
    );
  }

  async purchaseItem(
    characterId: string,
    itemId: number,
    itemName: string,
    price: number,
    quantity: number = 1,
    shopId?: number
  ): Promise<Transaction> {
    const totalCost = price * quantity;

    return await this.modifyBalance(
      characterId,
      -totalCost,
      'purchase',
      `Purchased ${quantity}x ${itemName}`,
      {
        itemId,
        itemName,
        quantity,
        unitPrice: Number(price),
        shopId,
      }
    );
  }

  async sellItem(
    characterId: string,
    itemId: number,
    itemName: string,
    price: number,
    quantity: number = 1,
    shopId?: number
  ): Promise<Transaction> {
    const totalValue = price * quantity;

    return await this.modifyBalance(
      characterId,
      totalValue,
      'sale',
      `Sold ${quantity}x ${itemName}`,
      {
        itemId,
        itemName,
        quantity,
        unitPrice: Number(price),
        shopId,
      }
    );
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();