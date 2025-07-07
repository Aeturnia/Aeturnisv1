import { ServiceProvider, initializeProviders } from '../../index';
import { IMonsterService } from '../../interfaces/IMonsterService';
import { INPCService } from '../../interfaces/INPCService';
import { ICurrencyService } from '../../interfaces/ICurrencyService';

describe('ServiceProvider Integration Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear ServiceProvider instance
    (ServiceProvider as any).instance = undefined;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    
    // Clear ServiceProvider instance
    (ServiceProvider as any).instance = undefined;
  });

  describe('Mock Services', () => {
    beforeEach(async () => {
      process.env.USE_MOCKS = 'true';
      await initializeProviders(true);
    });

    it('should register all mock services', () => {
      const provider = ServiceProvider.getInstance();
      const serviceNames = [
        'MonsterService',
        'NPCService',
        'DeathService',
        'LootService',
        'CombatService',
        'BankService',
        'CurrencyService',
        'DialogueService',
        'SpawnService'
      ];

      serviceNames.forEach(serviceName => {
        expect(() => provider.get(serviceName)).not.toThrow();
      });
    });

    it('should return mock data from services', async () => {
      const provider = ServiceProvider.getInstance();
      
      // Test MonsterService
      const monsterService = provider.get<IMonsterService>('MonsterService');
      const monsters = await monsterService.getMonstersInZone('starter-zone');
      expect(monsters.length).toBeGreaterThan(0);
      expect(monsters[0].id).toContain('mock-');
      
      // Test NPCService
      const npcService = provider.get<INPCService>('NPCService');
      const npcs = await npcService.getNPCsInZone('starter-zone');
      expect(npcs.length).toBeGreaterThan(0);
      expect(npcs[0].name).toBeDefined();
      
      // Test CurrencyService
      const currencyService = provider.get<ICurrencyService>('CurrencyService');
      const balance = await currencyService.getBalance('test-character');
      expect(balance.characterId).toBe('test-character');
    });

    it('should maintain state between calls', async () => {
      const provider = ServiceProvider.getInstance();
      const currencyService = provider.get<ICurrencyService>('CurrencyService');
      
      // Add currency
      await currencyService.addCurrency('state-test', 100n, 'test');
      
      // Check balance persists
      const balance1 = await currencyService.getBalance('state-test');
      expect(balance1.totalInCopper).toBe(100n);
      
      // Add more currency
      await currencyService.addCurrency('state-test', 50n, 'test2');
      
      // Check accumulated balance
      const balance2 = await currencyService.getBalance('state-test');
      expect(balance2.totalInCopper).toBe(150n);
    });
  });

  describe('Real Services', () => {
    beforeEach(async () => {
      process.env.USE_MOCKS = 'false';
      await initializeProviders(false);
    });

    it('should register all real services', () => {
      const provider = ServiceProvider.getInstance();
      const serviceNames = [
        'MonsterService',
        'NPCService',
        'DeathService',
        'LootService',
        'CombatService',
        'BankService',
        'CurrencyService',
        'DialogueService',
        'SpawnService'
      ];

      serviceNames.forEach(serviceName => {
        expect(() => provider.get(serviceName)).not.toThrow();
      });
    });

    it('should use real service implementations', () => {
      const provider = ServiceProvider.getInstance();
      
      // Get services
      const monsterService = provider.get('MonsterService');
      const npcService = provider.get('NPCService');
      
      // Verify they are real service wrappers
      expect(monsterService.constructor.name).toBe('RealMonsterService');
      expect(npcService.constructor.name).toBe('RealNPCService');
    });
  });

  describe('Service Switching', () => {
    it('should switch between mock and real based on environment', async () => {
      // First initialize with mocks
      process.env.USE_MOCKS = 'true';
      await initializeProviders(true);
      
      let provider = ServiceProvider.getInstance();
      let monsterService = provider.get('MonsterService');
      expect(monsterService.constructor.name).toBe('MockMonsterService');
      
      // Clear and reinitialize with real
      (ServiceProvider as any).instance = undefined;
      process.env.USE_MOCKS = 'false';
      await initializeProviders(false);
      
      provider = ServiceProvider.getInstance();
      monsterService = provider.get('MonsterService');
      expect(monsterService.constructor.name).toBe('RealMonsterService');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      process.env.USE_MOCKS = 'true';
      await initializeProviders(true);
    });

    it('should throw error for unregistered service', () => {
      const provider = ServiceProvider.getInstance();
      
      expect(() => provider.get('UnknownService')).toThrow(
        'Service UnknownService not registered'
      );
    });

    it('should handle service errors gracefully', async () => {
      const provider = ServiceProvider.getInstance();
      const monsterService = provider.get<IMonsterService>('MonsterService');
      
      // Mock services should handle errors
      await expect(
        monsterService.updateMonsterState('non-existent', 'dead' as any)
      ).rejects.toThrow('Monster non-existent not found');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ServiceProvider.getInstance();
      const instance2 = ServiceProvider.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should share registered services across calls', async () => {
      process.env.USE_MOCKS = 'true';
      await initializeProviders(true);
      
      const provider1 = ServiceProvider.getInstance();
      const provider2 = ServiceProvider.getInstance();
      
      const service1 = provider1.get('MonsterService');
      const service2 = provider2.get('MonsterService');
      
      expect(service1).toBe(service2);
    });
  });
});