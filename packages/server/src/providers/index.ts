/**
 * Service Provider exports
 * Central location for all provider-related exports
 */

// Core provider
export { ServiceProvider } from './ServiceProvider';

// Interfaces
export { IMonsterService } from './interfaces/IMonsterService';
export { INPCService } from './interfaces/INPCService';
export { IDeathService } from './interfaces/IDeathService';
export { ILootService } from './interfaces/ILootService';
export { ICombatService } from './interfaces/ICombatService';
export { IBankService, BankType } from './interfaces/IBankService';
export { ICurrencyService } from './interfaces/ICurrencyService';
export { IDialogueService } from './interfaces/IDialogueService';
export { ISpawnService } from './interfaces/ISpawnService';

// Mock implementations
export { MockMonsterService } from './mock/MockMonsterService';
export { MockNPCService } from './mock/MockNPCService';
export { MockDeathService } from './mock/MockDeathService';
export { MockLootService } from './mock/MockLootService';
export { MockCombatService } from './mock/MockCombatService';
export { MockBankService } from './mock/MockBankService';
export { MockCurrencyService } from './mock/MockCurrencyService';
export { MockDialogueService } from './mock/MockDialogueService';
export { MockSpawnService } from './mock/MockSpawnService';

// Real implementations
export { RealMonsterService } from './real/RealMonsterService';
export { RealNPCService } from './real/RealNPCService';
export { RealDeathService } from './real/RealDeathService';
export { RealLootService } from './real/RealLootService';
export { RealCombatService } from './real/RealCombatService';
export { RealBankService } from './real/RealBankService';
export { RealCurrencyService } from './real/RealCurrencyService';
export { RealDialogueService } from './real/RealDialogueService';
export { RealSpawnService } from './real/RealSpawnService';

/**
 * Initialize providers based on configuration
 * This is a helper function that can be called during server startup
 */
export async function initializeProviders(useMocks: boolean): Promise<void> {
  const { ServiceProvider } = await import('./ServiceProvider');
  const provider = ServiceProvider.getInstance();

  if (useMocks) {
    // Register mock services
    const { MockMonsterService } = await import('./mock/MockMonsterService');
    const { MockNPCService } = await import('./mock/MockNPCService');
    const { MockDeathService } = await import('./mock/MockDeathService');
    const { MockLootService } = await import('./mock/MockLootService');
    const { MockCombatService } = await import('./mock/MockCombatService');
    const { MockBankService } = await import('./mock/MockBankService');
    const { MockCurrencyService } = await import('./mock/MockCurrencyService');
    const { MockDialogueService } = await import('./mock/MockDialogueService');
    const { MockSpawnService } = await import('./mock/MockSpawnService');
    
    provider.register('MonsterService', new MockMonsterService());
    provider.register('NPCService', new MockNPCService());
    provider.register('DeathService', new MockDeathService());
    provider.register('LootService', new MockLootService());
    provider.register('CombatService', new MockCombatService());
    provider.register('BankService', new MockBankService());
    provider.register('CurrencyService', new MockCurrencyService());
    provider.register('DialogueService', new MockDialogueService());
    provider.register('SpawnService', new MockSpawnService());
    
    console.log('Service Provider initialized with MOCK services (9 services registered)');
  } else {
    // Register real services
    const { RealMonsterService } = await import('./real/RealMonsterService');
    const { RealNPCService } = await import('./real/RealNPCService');
    const { RealDeathService } = await import('./real/RealDeathService');
    const { RealLootService } = await import('./real/RealLootService');
    const { RealCombatService } = await import('./real/RealCombatService');
    const { RealBankService } = await import('./real/RealBankService');
    const { RealCurrencyService } = await import('./real/RealCurrencyService');
    const { RealDialogueService } = await import('./real/RealDialogueService');
    const { RealSpawnService } = await import('./real/RealSpawnService');
    
    provider.register('MonsterService', new RealMonsterService());
    provider.register('NPCService', new RealNPCService());
    provider.register('DeathService', new RealDeathService());
    provider.register('LootService', new RealLootService());
    provider.register('CombatService', new RealCombatService());
    provider.register('BankService', new RealBankService());
    provider.register('CurrencyService', new RealCurrencyService());
    provider.register('DialogueService', new RealDialogueService());
    provider.register('SpawnService', new RealSpawnService());
    
    console.log('Service Provider initialized with REAL services (9 services registered)');
  }
}