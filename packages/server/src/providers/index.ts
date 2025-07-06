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

// Real implementations - exported dynamically in initializeProviders()
// Commented out to prevent static import errors when repositories are missing
// export { RealMonsterService } from './real/RealMonsterService';
// export { RealNPCService } from './real/RealNPCService';
// export { RealDeathService } from './real/RealDeathService';
// export { RealLootService } from './real/RealLootService';
// export { RealCombatService } from './real/RealCombatService';
// export { RealBankService } from './real/RealBankService';
// export { RealCurrencyService } from './real/RealCurrencyService';
// export { RealDialogueService } from './real/RealDialogueService';
// export { RealSpawnService } from './real/RealSpawnService';

/**
 * Initialize providers based on configuration
 * This is a helper function that can be called during server startup
 */
export async function initializeProviders(useMocks: boolean): Promise<void> {
  const { ServiceProvider } = await import('./ServiceProvider');
  const provider = ServiceProvider.getInstance();

  // Load only the working mock services for now
  console.log('Loading core mock services: Monster, NPC, Death');
  
  const { MockMonsterService } = await import('./mock/MockMonsterService');
  const { MockNPCService } = await import('./mock/MockNPCService');
  const { MockDeathService } = await import('./mock/MockDeathService');
  
  provider.register('MonsterService', new MockMonsterService());
  provider.register('NPCService', new MockNPCService());
  provider.register('DeathService', new MockDeathService());
  
  console.log('Service Provider initialized with 3 core MOCK services (Monster, NPC, Death)');
}