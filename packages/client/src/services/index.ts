import { ApiClient } from './core/ApiClient';
import { WebSocketManager } from './core/WebSocketManager';
import { StateManager } from './state/StateManager';
import { CacheService } from './cache/CacheService';
import { OfflineQueue } from './cache/OfflineQueue';
import { ServiceProvider } from './provider/ServiceProvider';

// Import services
import { CombatService } from './game/CombatService';
import { MockCombatService } from './mocks/MockCombatService';
// TODO: Import other services as they are implemented
// import { MonsterService } from './game/MonsterService';
// import { NPCService } from './game/NPCService';
// import { CurrencyService } from './game/CurrencyService';
// import { BankService } from './game/BankService';
// import { LootService } from './game/LootService';
// import { DeathService } from './game/DeathService';
// import { DialogueService } from './game/DialogueService';
// import { SpawnService } from './game/SpawnService';

export interface ServiceLayerConfig {
  apiBaseUrl: string;
  wsUrl: string;
  timeout?: number;
  useMockServices?: boolean;
  mockConfig?: {
    delay?: number; // Simulate network delay in ms
    errorRate?: number; // Probability of random errors (0-1)
    offlineMode?: boolean; // Simulate offline state
  };
  cacheConfig?: {
    storage: 'memory' | 'localStorage' | 'indexeddb';
    maxSize?: number;
    defaultTTL?: number;
  };
  offlineConfig?: {
    storage: 'memory' | 'localStorage' | 'indexeddb';
    maxSize?: number;
    maxRetries?: number;
  };
}

export class ServiceLayer {
  private initialized: boolean = false;

  // Core dependencies
  private apiClient: ApiClient;
  private wsManager: WebSocketManager;
  private stateManager: StateManager;
  private cacheService: CacheService;
  private offlineQueue: OfflineQueue;

  // Service instances
  public combat: CombatService;
  // TODO: Add other services
  // public monster: MonsterService;
  // public npc: NPCService;
  // public currency: CurrencyService;
  // public bank: BankService;
  // public loot: LootService;
  // public death: DeathService;
  // public dialogue: DialogueService;
  // public spawn: SpawnService;

  constructor(private config: ServiceLayerConfig) {
    this.initializeCore();
    this.initializeServices();
    this.setupMiddleware();
  }

  private initializeCore(): void {
    // Initialize core dependencies
    this.apiClient = new ApiClient({
      baseURL: this.config.apiBaseUrl,
      timeout: this.config.timeout || 30000
    });

    this.wsManager = new WebSocketManager({
      url: this.config.wsUrl,
      autoReconnect: true
    });

    this.stateManager = new StateManager();
    
    this.cacheService = new CacheService({
      storage: this.config.cacheConfig?.storage || 'localStorage',
      name: 'aeturnis-cache',
      version: 1,
      ...this.config.cacheConfig
    });

    this.offlineQueue = new OfflineQueue({
      storage: this.config.offlineConfig?.storage || 'localStorage',
      ...this.config.offlineConfig
    });
  }

  private initializeServices(): void {
    const dependencies = {
      apiClient: this.apiClient,
      wsManager: this.wsManager,
      stateManager: this.stateManager,
      cacheService: this.cacheService,
      offlineQueue: this.offlineQueue
    };

    // Check if we should use mock services
    // Priority: localStorage override > config > env variable
    const localStorageOverride = localStorage.getItem('VITE_USE_MOCKS');
    const useMocks = localStorageOverride !== null 
      ? localStorageOverride === 'true'
      : this.config.useMockServices || import.meta.env.VITE_USE_MOCKS === 'true';

    // Initialize services using factory pattern
    this.combat = useMocks 
      ? new MockCombatService({ stateManager: this.stateManager }, this.config.mockConfig)
      : new CombatService(dependencies);
    // TODO: Initialize other services
    // this.monster = new MonsterService(dependencies);
    // this.npc = new NPCService(dependencies);
    // this.currency = new CurrencyService(dependencies);
    // this.bank = new BankService(dependencies);
    // this.loot = new LootService(dependencies);
    // this.death = new DeathService(dependencies);
    // this.dialogue = new DialogueService(dependencies);
    // this.spawn = new SpawnService(dependencies);

    // Register services with ServiceProvider
    ServiceProvider.register('CombatService', this.combat);
    ServiceProvider.register('CharacterService', this.character);
    ServiceProvider.register('InventoryService', this.inventory);
    ServiceProvider.register('LocationService', this.location);
    // TODO: Register other services when implemented
    // ServiceProvider.register('MonsterService', this.monster);
    // ServiceProvider.register('NPCService', this.npc);
    // ServiceProvider.register('CurrencyService', this.currency);
    // ServiceProvider.register('BankService', this.bank);
    // ServiceProvider.register('LootService', this.loot);
    // ServiceProvider.register('DeathService', this.death);
    // ServiceProvider.register('DialogueService', this.dialogue);
    // ServiceProvider.register('SpawnService', this.spawn);
  }

  private setupMiddleware(): void {
    // Add auth interceptor
    this.apiClient.addRequestInterceptor(async (config) => {
      const token = await this.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.apiClient.addResponseInterceptor(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await this.refreshToken();
            return this.apiClient.retry(error.config);
          } catch (refreshError) {
            // Logout user
            this.handleLogout();
            throw refreshError;
          }
        }
        throw error;
      }
    );

    // Add state middleware for debugging
    if (process.env.NODE_ENV === 'development') {
      this.stateManager.use((key, prevState, nextState) => {
        console.log(`State update: ${key}`, {
          previous: prevState,
          next: nextState
        });
        return nextState;
      });
    }

    // Add offline sync middleware
    this.stateManager.use((key, prevState, nextState) => {
      if (!navigator.onLine && nextState.error?.message.includes('Network')) {
        // Mark as offline error
        return {
          ...nextState,
          error: new Error('Offline - changes will sync when connected')
        };
      }
      return nextState;
    });
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize cache service
      await this.cacheService.initialize();

      // Load persisted state
      await this.stateManager.loadPersistedState();

      // Process offline queue
      await this.offlineQueue.process();

      // Initialize all services
      await ServiceProvider.initializeAll();

      // Connect WebSocket if authenticated
      const token = await this.getAccessToken();
      if (token) {
        this.wsManager.connect({ auth: { token } });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize service layer:', error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    // Destroy all services
    await ServiceProvider.destroyAll();

    // Disconnect WebSocket
    this.wsManager.disconnect();

    // Close cache service
    await this.cacheService.close();

    this.initialized = false;
  }

  public getState(): StateManager {
    return this.stateManager;
  }

  public getWebSocketManager(): WebSocketManager {
    return this.wsManager;
  }

  public getApiClient(): ApiClient {
    return this.apiClient;
  }

  public getCacheService(): CacheService {
    return this.cacheService;
  }

  public getOfflineQueue(): OfflineQueue {
    return this.offlineQueue;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  // Auth helpers (to be implemented with auth service)
  private async getAccessToken(): Promise<string | null> {
    // TODO: Implement with AuthService
    return localStorage.getItem('access_token');
  }

  private async refreshToken(): Promise<void> {
    // TODO: Implement with AuthService
    throw new Error('Token refresh not implemented');
  }

  private handleLogout(): void {
    // TODO: Implement with AuthService
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
}

// Export singleton instance
let serviceLayer: ServiceLayer | null = null;

export function initializeServices(config: ServiceLayerConfig): ServiceLayer {
  if (!serviceLayer) {
    serviceLayer = new ServiceLayer(config);
  }
  return serviceLayer;
}

export function getServices(): ServiceLayer {
  if (!serviceLayer) {
    throw new Error('Service layer not initialized. Call initializeServices() first.');
  }
  return serviceLayer;
}

// Export types and classes
export * from './base/BaseService';
export * from './base/BaseHttpService';
export * from './base/BaseRealtimeService';
export * from './base/ServiceError';
export * from './state/StateManager';
export * from './provider/ServiceProvider';
export * from './provider/interfaces/IService';
export * from './provider/interfaces/ICombatService';
export * from './provider/interfaces/IMonsterService';
export * from './provider/interfaces/INPCService';
export * from './provider/interfaces/ICurrencyService';
export * from './provider/interfaces/IBankService';
export * from './provider/interfaces/ILootService';
export * from './provider/interfaces/IDeathService';
export * from './provider/interfaces/IDialogueService';
export * from './provider/interfaces/ISpawnService';