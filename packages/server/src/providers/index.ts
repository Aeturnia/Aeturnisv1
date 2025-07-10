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
    
    // Register real services from the services directory
    try {
      logger.info('Registering real MonsterService...');
      const { MonsterService } = await import('../services/MonsterService');
      provider.register('MonsterService', new MonsterService());
      logger.info('✅ MonsterService registered');
    } catch (error) {
      logger.error('❌ Failed to register MonsterService:', error);
    }
    
    try {
      logger.info('Registering real NPCService...');
      const { NPCService } = await import('../services/NPCService');
      provider.register('NPCService', new NPCService());
      logger.info('✅ NPCService registered');
    } catch (error) {
      logger.error('❌ Failed to register NPCService:', error);
    }
    
    try {
      logger.info('Registering real DeathService...');
      const { DeathService } = await import('../services/death.service');
      provider.register('DeathService', new DeathService());
      logger.info('✅ DeathService registered');
    } catch (error) {
      logger.error('❌ Failed to register DeathService:', error);
    }
    
    try {
      logger.info('Registering real LootService...');
      const { LootService } = await import('../services/loot.service');
      provider.register('LootService', new LootService());
      logger.info('✅ LootService registered');
    } catch (error) {
      logger.error('❌ Failed to register LootService:', error);
    }
    
    try {
      logger.info('Registering real CombatService...');
      const { CombatService } = await import('../services/CombatService');
      provider.register('CombatService', new CombatService());
      logger.info('✅ CombatService registered');
    } catch (error) {
      logger.error('❌ Failed to register CombatService:', error);
    }
    
    try {
      logger.info('Registering real BankService...');
      const { BankService } = await import('../services/BankService');
      provider.register('BankService', new BankService());
      logger.info('✅ BankService registered');
    } catch (error) {
      logger.error('❌ Failed to register BankService:', error);
    }
    
    try {
      logger.info('Registering real CurrencyService...');
      const { CurrencyService } = await import('../services/CurrencyService');
      provider.register('CurrencyService', new CurrencyService());
      logger.info('✅ CurrencyService registered');
    } catch (error) {
      logger.error('❌ Failed to register CurrencyService:', error);
    }
    
    try {
      logger.info('Registering real DialogueService...');
      const { DialogueService } = await import('../services/DialogueService');
      provider.register('DialogueService', new DialogueService());
      logger.info('✅ DialogueService registered');
    } catch (error) {
      logger.error('❌ Failed to register DialogueService:', error);
    }
    
    try {
      logger.info('Registering real SpawnService...');
      const { SpawnService } = await import('../services/SpawnService');
      provider.register('SpawnService', new SpawnService());
      logger.info('✅ SpawnService registered');
    } catch (error) {
      logger.error('❌ Failed to register SpawnService:', error);
    }
    
    // Continue loading remaining real services
    try {
      logger.info('Registering real ZoneService...');
      const { ZoneService } = await import('../services/ZoneService');
      provider.register('ZoneService', new ZoneService());
      logger.info('✅ ZoneService registered');
    } catch (error) {
      logger.error('❌ Failed to register ZoneService:', error);
    }

    try {
      logger.info('Registering real MovementService...');
      const { MovementService } = await import('../services/MovementService');
      provider.register('MovementService', new MovementService());
      logger.info('✅ MovementService registered');
    } catch (error) {
      logger.error('❌ Failed to register MovementService:', error);
    }

    try {
      logger.info('Registering real ProgressionService...');
      const { ProgressionService } = await import('../services/ProgressionService');
      provider.register('ProgressionService', new ProgressionService());
      logger.info('✅ ProgressionService registered');
    } catch (error) {
      logger.error('❌ Failed to register ProgressionService:', error);
    }

    try {
      logger.info('Registering real TutorialService...');
      const { TutorialService } = await import('../services/TutorialService');
      provider.register('TutorialService', new TutorialService());
      logger.info('✅ TutorialService registered');
    } catch (error) {
      logger.error('❌ Failed to register TutorialService:', error);
    }

    try {
      logger.info('Registering real AffinityService...');
      const { AffinityService } = await import('../services/AffinityService');
      provider.register('AffinityService', new AffinityService());
      logger.info('✅ AffinityService registered');
    } catch (error) {
      logger.error('❌ Failed to register AffinityService:', error);
    }
    
    const registeredServices = provider.getRegisteredServices();
    logger.info(`Service Provider initialized with ${registeredServices.length} REAL services: ${registeredServices.join(', ')}`);
  }
}