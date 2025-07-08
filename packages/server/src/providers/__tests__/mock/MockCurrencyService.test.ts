import { MockCurrencyService } from '../../mock/MockCurrencyService';

describe('MockCurrencyService', () => {
  let service: MockCurrencyService;

  beforeEach(() => {
    service = new MockCurrencyService();
  });

  describe('getBalance', () => {
    it('should return balance for a character', async () => {
      const balance = await service.getBalance('character-001');
      
      expect(balance).toBeDefined();
      expect(balance.characterId).toBe('character-001');
      expect(balance.gold).toBeDefined();
      expect(balance.silver).toBeDefined();
      expect(balance.copper).toBeDefined();
      expect(balance.totalInCopper).toBeDefined();
      expect(balance.lastUpdated).toBeInstanceOf(Date);
    });

    it('should return zero balance for new character', async () => {
      const balance = await service.getBalance('new-character');
      
      expect(balance.gold).toBe(0n);
      expect(balance.silver).toBe(0n);
      expect(balance.copper).toBe(0n);
      expect(balance.totalInCopper).toBe(0n);
    });

    it('should calculate totalInCopper correctly', async () => {
      const characterId = 'test-calc';
      await service.addCurrency(characterId, 12345n, 'test'); // 1g 23s 45c
      
      const balance = await service.getBalance(characterId);
      expect(balance.gold).toBe(1n);
      expect(balance.silver).toBe(23n);
      expect(balance.copper).toBe(45n);
      expect(balance.totalInCopper).toBe(12345n);
    });
  });

  describe('addCurrency', () => {
    it('should add currency to character balance', async () => {
      const characterId = 'character-add';
      const amount = 1000n;
      
      const result = await service.addCurrency(characterId, amount, 'quest_reward');
      
      expect(result.success).toBe(true);
      expect(result.previousBalance).toBe(0n);
      expect(result.newBalance).toBe(amount);
      expect(result.amount).toBe(amount);
      expect(result.transactionId).toBeDefined();
    });

    it('should accumulate multiple additions', async () => {
      const characterId = 'character-accumulate';
      
      await service.addCurrency(characterId, 100n, 'source1');
      await service.addCurrency(characterId, 200n, 'source2');
      const result = await service.addCurrency(characterId, 300n, 'source3');
      
      expect(result.newBalance).toBe(600n);
    });
  });

  describe('deductCurrency', () => {
    it('should deduct currency from character balance', async () => {
      const characterId = 'character-deduct';
      
      // Add initial balance
      await service.addCurrency(characterId, 1000n, 'initial');
      
      // Deduct
      const result = await service.deductCurrency(characterId, 300n, 'purchase');
      
      expect(result.success).toBe(true);
      expect(result.previousBalance).toBe(1000n);
      expect(result.newBalance).toBe(700n);
    });

    it('should fail when insufficient funds', async () => {
      const characterId = 'character-poor';
      
      const result = await service.deductCurrency(characterId, 100n, 'purchase');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient funds');
    });
  });

  describe('transferCurrency', () => {
    it('should transfer currency between characters', async () => {
      const fromId = 'character-from';
      const toId = 'character-to';
      
      // Add initial balance to sender
      await service.addCurrency(fromId, 1000n, 'initial');
      
      // Transfer
      const result = await service.transferCurrency(fromId, toId, 200n, 'Test transfer', true);
      
      expect(result.success).toBe(true);
      expect(result.senderNewBalance).toBeLessThan(800n); // Less due to fee
      expect(result.recipientNewBalance).toBe(200n);
      expect(result.fee).toBeGreaterThan(0n);
    });

    it('should transfer without fee when specified', async () => {
      const fromId = 'character-from-no-fee';
      const toId = 'character-to-no-fee';
      
      await service.addCurrency(fromId, 1000n, 'initial');
      
      const result = await service.transferCurrency(fromId, toId, 200n, 'Test transfer', false);
      
      expect(result.success).toBe(true);
      expect(result.senderNewBalance).toBe(800n);
      expect(result.recipientNewBalance).toBe(200n);
      expect(result.fee).toBe(0n);
    });

    it('should fail when sender has insufficient funds', async () => {
      const fromId = 'character-poor-sender';
      const toId = 'character-receiver';
      
      const result = await service.transferCurrency(fromId, toId, 100n, 'Test transfer', true);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient funds');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return empty history for new character', async () => {
      const history = await service.getTransactionHistory('new-character');
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('should track transaction history', async () => {
      const characterId = 'character-history';
      
      await service.addCurrency(characterId, 100n, 'source1', { description: 'First transaction' });
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      await service.deductCurrency(characterId, 50n, 'reason1', { description: 'Second transaction' });
      
      const history = await service.getTransactionHistory(characterId);
      
      expect(history.length).toBe(2);
      expect(history[0].type).toBe('purchase'); // Most recent first (deduct creates purchase type)
      expect(history[0].amount).toBe(-50); // Stored as negative number in transaction
      expect(history[1].type).toBe('reward'); // add creates reward type
      expect(history[1].amount).toBe(100);
    });

    it('should respect limit parameter', async () => {
      const characterId = 'character-many-transactions';
      
      // Create many transactions
      for (let i = 0; i < 10; i++) {
        await service.addCurrency(characterId, BigInt(i + 1), `source${i}`);
      }
      
      const history = await service.getTransactionHistory(characterId, 5);
      expect(history.length).toBe(5);
    });
  });

  describe('canAfford', () => {
    it('should return true when character has enough currency', async () => {
      const characterId = 'character-afford';
      await service.addCurrency(characterId, 1000n, 'initial');
      
      const canAfford = await service.canAfford(characterId, 500n);
      expect(canAfford).toBe(true);
    });

    it('should return false when character lacks currency', async () => {
      const characterId = 'character-cannot-afford';
      await service.addCurrency(characterId, 100n, 'initial');
      
      const canAfford = await service.canAfford(characterId, 500n);
      expect(canAfford).toBe(false);
    });
  });

  describe('convertCurrency', () => {
    it('should convert copper to silver correctly', () => {
      const result = service.convertCurrency(250n, 'copper', 'silver');
      expect(result).toBe(2n); // 250 copper = 2 silver (50 copper leftover)
    });

    it('should convert silver to gold correctly', () => {
      const result = service.convertCurrency(150n, 'silver', 'gold');
      expect(result).toBe(1n); // 150 silver = 1 gold (50 silver leftover)
    });

    it('should convert gold to copper correctly', () => {
      const result = service.convertCurrency(2n, 'gold', 'copper');
      expect(result).toBe(20000n); // 2 gold = 20,000 copper
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with all denominations', () => {
      const formatted = service.formatCurrency(12345n);
      expect(formatted).toBe('1g 23s 45c');
    });

    it('should omit zero denominations', () => {
      const formatted = service.formatCurrency(10000n);
      expect(formatted).toBe('1g');
    });

    it('should show 0c for zero amount', () => {
      const formatted = service.formatCurrency(0n);
      expect(formatted).toBe('0c');
    });
  });
});