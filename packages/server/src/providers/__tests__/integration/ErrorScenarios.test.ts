import { ServiceProvider, initializeProviders } from '../../index';
import { IMonsterService } from '../../interfaces/IMonsterService';
import { INPCService } from '../../interfaces/INPCService';
import { ICurrencyService } from '../../interfaces/ICurrencyService';
import { IBankService, BankType } from '../../interfaces/IBankService';
import { ICombatService } from '../../interfaces/ICombatService';
import { MonsterState } from '@aeturnis/shared';

describe('Service Provider Error Scenarios', () => {
  beforeEach(async () => {
    // Clear ServiceProvider instance
    (ServiceProvider as any).instance = undefined;
    process.env.USE_MOCKS = 'true';
    await initializeProviders(true);
  });

  afterEach(() => {
    // Clear ServiceProvider instance
    (ServiceProvider as any).instance = undefined;
  });

  describe('Service Registration Errors', () => {
    it('should throw error when getting unregistered service', () => {
      const provider = ServiceProvider.getInstance();
      
      expect(() => provider.get('NonExistentService')).toThrow(
        'Service NonExistentService not registered'
      );
    });

    it('should handle null service registration', () => {
      const provider = ServiceProvider.getInstance();
      
      // Register null service
      provider.register('NullService', null);
      
      // Should retrieve null without error
      const service = provider.get('NullService');
      expect(service).toBeNull();
    });

    it('should allow re-registration of services', () => {
      const provider = ServiceProvider.getInstance();
      
      // Register a mock service
      const mockService1 = { test: 'service1' };
      provider.register('TestService', mockService1);
      expect(provider.get('TestService')).toBe(mockService1);
      
      // Re-register with different service
      const mockService2 = { test: 'service2' };
      provider.register('TestService', mockService2);
      expect(provider.get('TestService')).toBe(mockService2);
    });
  });

  describe('Monster Service Error Scenarios', () => {
    let monsterService: IMonsterService;

    beforeEach(() => {
      const provider = ServiceProvider.getInstance();
      monsterService = provider.get<IMonsterService>('MonsterService');
    });

    it('should handle non-existent monster updates', async () => {
      await expect(
        monsterService.updateMonsterState('non-existent-id', MonsterState.DEAD)
      ).rejects.toThrow('Monster non-existent-id not found');
    });

    it('should handle invalid zone queries', async () => {
      const monsters = await monsterService.getMonstersInZone('invalid-zone-!@#$%');
      expect(monsters).toEqual([]);
    });

    it('should handle killing non-existent monster', async () => {
      // Should not throw
      await expect(
        monsterService.killMonster('non-existent-id')
      ).resolves.not.toThrow();
    });

    it('should handle spawning at non-existent spawn point', async () => {
      await expect(
        monsterService.spawnMonster('non-existent-spawn')
      ).rejects.toThrow('Spawn point non-existent-spawn not found');
    });
  });

  describe('NPC Service Error Scenarios', () => {
    let npcService: INPCService;

    beforeEach(() => {
      const provider = ServiceProvider.getInstance();
      npcService = provider.get<INPCService>('NPCService');
    });

    it('should handle interaction with non-existent NPC', async () => {
      await expect(
        npcService.startInteraction('non-existent-npc', 'character-001')
      ).rejects.toThrow('NPC non-existent-npc not found');
    });

    it('should handle advancing non-existent dialogue', async () => {
      await expect(
        npcService.advanceDialogue('non-existent-interaction', '1')
      ).rejects.toThrow('Interaction non-existent-interaction not found');
    });

    it('should return null for non-existent NPC lookup', async () => {
      const npc = await npcService.getNPCById('non-existent-npc');
      expect(npc).toBeNull();
    });
  });

  describe('Currency Service Error Scenarios', () => {
    let currencyService: ICurrencyService;

    beforeEach(() => {
      const provider = ServiceProvider.getInstance();
      currencyService = provider.get<ICurrencyService>('CurrencyService');
    });

    it('should handle insufficient funds for deduction', async () => {
      const result = await currencyService.deductCurrency(
        'poor-character',
        1000000n,
        'expensive-purchase'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient funds');
    });

    it('should handle insufficient funds for transfer', async () => {
      const result = await currencyService.transferCurrency(
        'poor-sender',
        'receiver',
        1000000n,
        true
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient funds');
    });

    it('should handle negative amounts gracefully', async () => {
      // TypeScript should prevent this, but test runtime behavior
      const result = await currencyService.addCurrency(
        'character',
        -100n as any,
        'negative-test'
      );
      
      // Mock implementation might accept it, but real service should validate
      expect(result.amount).toBe(-100n);
    });
  });

  describe('Bank Service Error Scenarios', () => {
    let bankService: IBankService;

    beforeEach(() => {
      const provider = ServiceProvider.getInstance();
      bankService = provider.get<IBankService>('BankService');
    });

    it('should handle depositing to full bank', async () => {
      // Fill the bank
      const characterId = 'full-bank-character';
      const contents = await bankService.getBankContents(characterId, BankType.PERSONAL);
      
      // Try to deposit when full (assuming limited slots)
      const fullSlots = contents.totalSlots;
      for (let i = 0; i < fullSlots; i++) {
        await bankService.depositItem(characterId, `item-${i}`, BankType.PERSONAL, 1);
      }
      
      // Try one more
      const result = await bankService.depositItem(
        characterId,
        'overflow-item',
        BankType.PERSONAL,
        1
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Bank is full');
    });

    it('should handle withdrawing non-existent item', async () => {
      const result = await bankService.withdrawItem(
        'character',
        'non-existent-item',
        BankType.PERSONAL,
        1
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Item not found');
    });

    it('should handle invalid bank type access', async () => {
      const hasAccess = await bankService.hasAccess(
        'character',
        'INVALID_TYPE' as any
      );
      
      expect(hasAccess).toBe(false);
    });
  });

  describe('Combat Service Error Scenarios', () => {
    let combatService: ICombatService;

    beforeEach(() => {
      const provider = ServiceProvider.getInstance();
      combatService = provider.get<ICombatService>('CombatService');
    });

    it('should handle combat with non-existent target', async () => {
      await expect(
        combatService.initiateCombat('attacker-id', 'non-existent-target')
      ).rejects.toThrow();
    });

    it('should handle actions on non-existent session', async () => {
      await expect(
        combatService.processCombatAction('non-existent-session', {
          type: 'attack',
          targetId: 'target'
        })
      ).rejects.toThrow();
    });

    it('should return null for non-existent combat session', async () => {
      const session = await combatService.getActiveCombat('non-participant');
      expect(session).toBeNull();
    });
  });

  describe('Concurrent Access Scenarios', () => {
    it('should handle concurrent service access', async () => {
      const provider = ServiceProvider.getInstance();
      const promises: Promise<any>[] = [];
      
      // Simulate 100 concurrent requests
      for (let i = 0; i < 100; i++) {
        promises.push(
          provider.get<IMonsterService>('MonsterService').getMonstersInZone('starter-zone'),
          provider.get<INPCService>('NPCService').getNPCsInZone('starter-zone'),
          provider.get<ICurrencyService>('CurrencyService').getBalance(`char-${i}`)
        );
      }
      
      // All should resolve without errors
      const results = await Promise.allSettled(promises);
      const rejected = results.filter(r => r.status === 'rejected');
      expect(rejected.length).toBe(0);
    });

    it('should handle concurrent modifications', async () => {
      const provider = ServiceProvider.getInstance();
      const currencyService = provider.get<ICurrencyService>('CurrencyService');
      const characterId = 'concurrent-character';
      
      // Add initial balance
      await currencyService.addCurrency(characterId, 1000n, 'initial');
      
      // Simulate 10 concurrent additions
      const additions = Array(10).fill(null).map((_, i) => 
        currencyService.addCurrency(characterId, 10n, `concurrent-${i}`)
      );
      
      await Promise.all(additions);
      
      // Check final balance
      const balance = await currencyService.getBalance(characterId);
      expect(balance.totalInCopper).toBe(1100n); // 1000 + (10 * 10)
    });
  });

  describe('Service Lifecycle Errors', () => {
    it('should handle service initialization failures gracefully', async () => {
      // Clear instance
      (ServiceProvider as any).instance = undefined;
      
      // Set invalid configuration
      process.env.USE_MOCKS = 'invalid-value';
      
      // Should still initialize (defaulting to false)
      await expect(initializeProviders(false)).resolves.not.toThrow();
    });

    it('should maintain service state after errors', async () => {
      const provider = ServiceProvider.getInstance();
      const monsterService = provider.get<IMonsterService>('MonsterService');
      
      // Cause an error
      try {
        await monsterService.updateMonsterState('non-existent', MonsterState.DEAD);
      } catch (error) {
        // Expected error
      }
      
      // Service should still be functional
      const monsters = await monsterService.getMonstersInZone('starter-zone');
      expect(monsters.length).toBeGreaterThan(0);
    });
  });
});