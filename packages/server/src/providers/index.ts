/**
 * Service Provider exports
 * Central location for all provider-related exports
 */

// Core provider
export { ServiceProvider } from './ServiceProvider';

// Interfaces
export { IMonsterService } from './interfaces/IMonsterService';
export { INPCService } from './interfaces/INPCService';

// Mock implementations
export { MockMonsterService } from './mock/MockMonsterService';
export { MockNPCService } from './mock/MockNPCService';

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
    
    provider.register('MonsterService', new MockMonsterService());
    provider.register('NPCService', new MockNPCService());
    
    console.log('Service Provider initialized with MOCK services');
  } else {
    // Note: Real service registration will be added in Phase 2
    // For now, we'll log that real services would be registered
    console.log('Service Provider initialized for REAL services (to be implemented in Phase 2)');
  }
}