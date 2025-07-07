/**
 * Service Provider exports
 * Central location for all provider-related exports
 */

// Core provider
export { ServiceProvider, globalServices } from './ServiceProvider';

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
// World & Movement System Services (Step 2.7)
export { MockZoneService } from '../services/mock/MockZoneService';
export { MockMovementService } from '../services/mock/MockMovementService';  
export { MockProgressionService } from '../services/mock/MockProgressionService';

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

  // Load all mock services
  console.log('Loading all mock services...');
  
  const { MockMonsterService } = await import('./mock/MockMonsterService');
  const { MockNPCService } = await import('./mock/MockNPCService');
  const { MockDeathService } = await import('./mock/MockDeathService');
  
  // Add remaining services incrementally
  console.log('Loading MockLootService...');
  const { MockLootService } = await import('./mock/MockLootService');
  console.log('Loading MockCombatService...');
  const { MockCombatService } = await import('./mock/MockCombatService');
  console.log('Loading MockBankService...');
  const { MockBankService } = await import('./mock/MockBankService');
  console.log('Loading MockCurrencyService...');
  const { MockCurrencyService } = await import('./mock/MockCurrencyService');
  console.log('Loading MockDialogueService...');
  const { MockDialogueService } = await import('./mock/MockDialogueService');
  console.log('Loading MockSpawnService...');
  const { MockSpawnService } = await import('./mock/MockSpawnService');
  
  // Register all services incrementally with error handling
  provider.register('MonsterService', new MockMonsterService());
  provider.register('NPCService', new MockNPCService());
  provider.register('DeathService', new MockDeathService());
  
  // Try registering additional services with error handling
  try {
    console.log('Registering MockLootService...');
    provider.register('LootService', new MockLootService());
    console.log('✅ LootService registered');
  } catch (error) {
    console.error('❌ Failed to register LootService:', error);
  }
  
  try {
    console.log('Registering MockCombatService...');
    provider.register('CombatService', new MockCombatService());
    console.log('✅ CombatService registered');
  } catch (error) {
    console.error('❌ Failed to register CombatService:', error);
  }
  
  try {
    console.log('Registering MockBankService...');
    provider.register('BankService', new MockBankService());
    console.log('✅ BankService registered');
  } catch (error) {
    console.error('❌ Failed to register BankService:', error);
  }
  
  try {
    console.log('Registering MockCurrencyService...');
    provider.register('CurrencyService', new MockCurrencyService());
    console.log('✅ CurrencyService registered');
  } catch (error) {
    console.error('❌ Failed to register CurrencyService:', error);
  }
  
  try {
    console.log('Registering MockDialogueService...');
    provider.register('DialogueService', new MockDialogueService());
    console.log('✅ DialogueService registered');
  } catch (error) {
    console.error('❌ Failed to register DialogueService:', error);
  }
  
  try {
    console.log('Registering MockSpawnService...');
    provider.register('SpawnService', new MockSpawnService());
    console.log('✅ SpawnService registered');
  } catch (error) {
    console.error('❌ Failed to register SpawnService:', error);
  }

  // Register World & Movement System services (Step 2.7)
  try {
    console.log('Registering MockZoneService...');
    const { MockZoneService } = await import('../services/mock/MockZoneService');
    provider.register('ZoneService', new MockZoneService());
    console.log('✅ ZoneService registered');
  } catch (error) {
    console.error('❌ Failed to register ZoneService:', error);
  }

  try {
    console.log('Registering MockMovementService...');
    const { MockMovementService } = await import('../services/mock/MockMovementService');
    provider.register('MovementService', new MockMovementService());
    console.log('✅ MovementService registered');
  } catch (error) {
    console.error('❌ Failed to register MovementService:', error);
  }

  try {
    console.log('Registering MockProgressionService...');
    const { MockProgressionService } = await import('../services/mock/MockProgressionService');
    provider.register('ProgressionService', new MockProgressionService());
    console.log('✅ ProgressionService registered');
  } catch (error) {
    console.error('❌ Failed to register ProgressionService:', error);
  }
  
  const registeredServices = provider.getRegisteredServices();
  console.log(`Service Provider initialized with ${registeredServices.length} MOCK services: ${registeredServices.join(', ')}`);
}