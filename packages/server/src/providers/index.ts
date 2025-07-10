/**
 * Service Provider exports
 * Central location for all provider-related exports
 */

import { logger } from '../utils/logger';

// Core provider
export { ServiceProvider, globalServices } from './ServiceProvider';

// Interfaces
export { IService } from './interfaces/IService';
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
  if (useMocks) {
    logger.info('Loading all mock services...');
  
  const { MockMonsterService } = await import('./mock/MockMonsterService');
  const { MockNPCService } = await import('./mock/MockNPCService');
  const { MockDeathService } = await import('./mock/MockDeathService');
  
    // Add remaining services incrementally
    logger.info('Loading MockLootService...');
    const { MockLootService } = await import('./mock/MockLootService');
    logger.info('Loading MockCombatService...');
    const { MockCombatService } = await import('./mock/MockCombatService');
    logger.info('Loading MockBankService...');
    const { MockBankService } = await import('./mock/MockBankService');
    logger.info('Loading MockCurrencyService...');
    const { MockCurrencyService } = await import('./mock/MockCurrencyService');
    logger.info('Loading MockDialogueService...');
    const { MockDialogueService } = await import('./mock/MockDialogueService');
    logger.info('Loading MockSpawnService...');
    const { MockSpawnService } = await import('./mock/MockSpawnService');
    
    // Register all services incrementally with error handling
    provider.register('MonsterService', new MockMonsterService());
    provider.register('NPCService', new MockNPCService());
    provider.register('DeathService', new MockDeathService());
  
  // Try registering additional services with error handling
  try {
    logger.info('Registering MockLootService...');
    provider.register('LootService', new MockLootService());
    logger.info('✅ LootService registered');
  } catch (error) {
    logger.error('❌ Failed to register LootService:', error);
  }
  
  try {
    logger.info('Registering MockCombatService...');
    provider.register('CombatService', new MockCombatService());
    logger.info('✅ CombatService registered');
  } catch (error) {
    logger.error('❌ Failed to register CombatService:', error);
  }
  
  try {
    logger.info('Registering MockBankService...');
    provider.register('BankService', new MockBankService());
    logger.info('✅ BankService registered');
  } catch (error) {
    logger.error('❌ Failed to register BankService:', error);
  }
  
  try {
    logger.info('Registering MockCurrencyService...');
    provider.register('CurrencyService', new MockCurrencyService());
    logger.info('✅ CurrencyService registered');
  } catch (error) {
    logger.error('❌ Failed to register CurrencyService:', error);
  }
  
  try {
    logger.info('Registering MockDialogueService...');
    provider.register('DialogueService', new MockDialogueService());
    logger.info('✅ DialogueService registered');
  } catch (error) {
    logger.error('❌ Failed to register DialogueService:', error);
  }
  
  try {
    logger.info('Registering MockSpawnService...');
    provider.register('SpawnService', new MockSpawnService());
    logger.info('✅ SpawnService registered');
  } catch (error) {
    logger.error('❌ Failed to register SpawnService:', error);
  }

  // Register World & Movement System services (Step 2.7)
  try {
    logger.info('Registering MockZoneService...');
    const { MockZoneService } = await import('../services/mock/MockZoneService');
    provider.register('ZoneService', new MockZoneService());
    logger.info('✅ ZoneService registered');
  } catch (error) {
    logger.error('❌ Failed to register ZoneService:', error);
  }

  try {
    logger.info('Registering MockMovementService...');
    const { MockMovementService } = await import('../services/mock/MockMovementService');
    provider.register('MovementService', new MockMovementService());
    logger.info('✅ MovementService registered');
  } catch (error) {
    logger.error('❌ Failed to register MovementService:', error);
  }

  try {
    logger.info('Registering MockProgressionService...');
    const { MockProgressionService } = await import('../services/mock/MockProgressionService');
    provider.register('ProgressionService', new MockProgressionService());
    logger.info('✅ ProgressionService registered');
  } catch (error) {
    logger.error('❌ Failed to register ProgressionService:', error);
  }

  // Register Tutorial & Affinity System services (Step 2.8)
  try {
    logger.info('Registering MockTutorialService...');
    const { MockTutorialService } = await import('../services/mock/MockTutorialService');
    provider.register('TutorialService', new MockTutorialService());
    logger.info('✅ TutorialService registered');
  } catch (error) {
    logger.error('❌ Failed to register TutorialService:', error);
  }

  try {
    logger.info('Registering MockAffinityService...');
    const { MockAffinityService } = await import('../services/mock/MockAffinityService');
    provider.register('AffinityService', new MockAffinityService());
    logger.info('✅ AffinityService registered');
  } catch (error) {
    logger.error('❌ Failed to register AffinityService:', error);
  }
  
    const registeredServices = provider.getRegisteredServices();
    logger.info(`Service Provider initialized with ${registeredServices.length} MOCK services: ${registeredServices.join(', ')}`);
  } else {
    // Load real services when not using mocks
    logger.info('Loading real database-connected services...');
    
    // Load production database services
    logger.info('Loading production services with database connections...');
    
    const services = [
      { name: 'MonsterService', path: '../services/MonsterService' },
      { name: 'NPCService', path: '../services/NPCService' },
      { name: 'DeathService', path: '../services/death.service' },
      { name: 'LootService', path: '../services/loot.service' },
      { name: 'CombatService', path: '../services/CombatService' },
      { name: 'BankService', path: '../services/BankService' },
      { name: 'CurrencyService', path: '../services/CurrencyService' },
      { name: 'DialogueService', path: '../services/DialogueService' },
      { name: 'SpawnService', path: '../services/SpawnService' },
      { name: 'ZoneService', path: '../services/ZoneService' },
      { name: 'MovementService', path: '../services/MovementService' },
      { name: 'ProgressionService', path: '../services/ProgressionService' },
      { name: 'TutorialService', path: '../services/TutorialService' },
      { name: 'AffinityService', path: '../services/AffinityService' }
    ];

    const loadedServices: string[] = [];
    const failedServices: string[] = [];

    for (const service of services) {
      try {
        const serviceModule = await import(service.path);
        const ServiceClass = serviceModule[service.name];
        provider.register(service.name, new ServiceClass());
        loadedServices.push(service.name);
      } catch (error) {
        logger.error(`Failed to register ${service.name}:`, error);
        failedServices.push(service.name);
      }
    }
    
    const registeredServices = provider.getRegisteredServices();
    logger.info(`Service Provider: ${registeredServices.length}/14 real database services active`);
    
    if (failedServices.length > 0) {
      logger.warn(`Failed services: ${failedServices.join(', ')}`);
    }
  }
}