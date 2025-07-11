import { BaseHttpService } from '../base/BaseHttpService';
import { BaseRealtimeService } from '../base/BaseRealtimeService';
import { ServiceResponse } from '../base/BaseService';
import { StateManager } from '../state/StateManager';
import { ICombatService } from '../provider/interfaces/ICombatService';
import { ApiClient } from '../core/ApiClient';
import { WebSocketManager } from '../core/WebSocketManager';
import { CacheService } from '../cache/CacheService';
import { OfflineQueue } from '../cache/OfflineQueue';
import {
  CombatSessionData,
  CombatActionRequest,
  ProcessedCombatAction,
  CombatStats,
  StartCombatRequest
} from '@aeturnis/shared';

export interface CombatServiceDependencies {
  apiClient: ApiClient;
  wsManager: WebSocketManager;
  stateManager: StateManager;
  cacheService?: CacheService;
  offlineQueue?: OfflineQueue;
}

export class CombatService implements ICombatService {
  private httpService: CombatHttpService;
  private realtimeService: CombatRealtimeService;
  private stateManager: StateManager;
  private subscriptions: Map<string, () => void> = new Map();

  constructor(dependencies: CombatServiceDependencies) {
    this.httpService = new CombatHttpService(dependencies);
    this.realtimeService = new CombatRealtimeService(dependencies);
    this.stateManager = dependencies.stateManager;

    this.initializeState();
    this.setupRealtimeSync();
  }

  private initializeState(): void {
    this.stateManager.register('combat:active', null, { persist: false });
    this.stateManager.register('combat:sessions', new Map<string, CombatSessionData>(), { persist: false });
    this.stateManager.register('combat:stats', new Map<string, CombatStats>(), { persist: true });
  }

  private setupRealtimeSync(): void {
    // Subscribe to combat updates
    this.realtimeService.on('combat:update', (data: any) => {
      const sessions = this.stateManager.select<Map<string, CombatSessionData>>('combat:sessions');
      if (sessions && sessions.has(data.sessionId)) {
        const updatedSessions = new Map(sessions);
        updatedSessions.set(data.sessionId, data.session);
        this.stateManager.update('combat:sessions', updatedSessions);
      }
    });

    // Subscribe to combat end events
    this.realtimeService.on('combat:ended', (data: any) => {
      const sessions = this.stateManager.select<Map<string, CombatSessionData>>('combat:sessions');
      if (sessions) {
        const updatedSessions = new Map(sessions);
        updatedSessions.delete(data.sessionId);
        this.stateManager.update('combat:sessions', updatedSessions);
      }

      // Clear active combat if it matches
      const activeCombat = this.stateManager.select<CombatSessionData>('combat:active');
      if (activeCombat && activeCombat.sessionId === data.sessionId) {
        this.stateManager.update('combat:active', null);
      }
    });
  }

  public async startCombat(initiatorId: string, request: StartCombatRequest): Promise<CombatSessionData> {
    this.stateManager.updateSlice('combat:active', { loading: true, error: null });

    try {
      const response = await this.httpService.startCombat(initiatorId, request);
      const session = response.data;

      // Update state
      this.stateManager.update('combat:active', session);
      const sessions = this.stateManager.select<Map<string, CombatSessionData>>('combat:sessions') || new Map();
      sessions.set(session.sessionId, session);
      this.stateManager.update('combat:sessions', new Map(sessions));

      // Subscribe to this combat session
      this.realtimeService.subscribeToCombatSession(session.sessionId);

      return session;
    } catch (error) {
      this.stateManager.updateSlice('combat:active', { loading: false, error });
      throw error;
    }
  }

  public async processAction(
    sessionId: string,
    actorId: string,
    action: CombatActionRequest
  ): Promise<ProcessedCombatAction> {
    // Send via realtime for faster response
    return this.realtimeService.sendCombatAction(sessionId, actorId, action);
  }

  public async fleeCombat(sessionId: string, userId: string): Promise<boolean> {
    try {
      const response = await this.httpService.fleeCombat(sessionId, userId);
      return response.data;
    } catch (error) {
      // If flee fails, stay in combat
      return false;
    }
  }

  public async getCombatSession(sessionId: string): Promise<CombatSessionData | null> {
    const sessions = this.stateManager.select<Map<string, CombatSessionData>>('combat:sessions');
    const cached = sessions?.get(sessionId);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.httpService.getCombatSession(sessionId);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  public async getActiveCombatForCharacter(characterId: string): Promise<CombatSessionData | null> {
    try {
      const response = await this.httpService.getActiveCombatForCharacter(characterId);
      const session = response.data;

      if (session) {
        this.stateManager.update('combat:active', session);
        this.realtimeService.subscribeToCombatSession(session.sessionId);
      }

      return session;
    } catch (error) {
      return null;
    }
  }

  public async getCharacterStats(characterId: string): Promise<CombatStats> {
    const statsMap = this.stateManager.select<Map<string, CombatStats>>('combat:stats');
    const cached = statsMap?.get(characterId);

    if (cached) {
      return cached;
    }

    const response = await this.httpService.getCharacterStats(characterId);
    const stats = response.data;

    // Cache the stats
    const updatedStats = new Map(statsMap || []);
    updatedStats.set(characterId, stats);
    this.stateManager.update('combat:stats', updatedStats);

    return stats;
  }

  public subscribeToCombatUpdates(sessionId: string, handler: (update: any) => void): () => void {
    const subscriptionId = this.realtimeService.subscribeToCombatSession(sessionId);
    
    const unsubscribe = this.stateManager.subscribe('combat:sessions', (slice) => {
      const session = slice.data.get(sessionId);
      if (session) {
        handler(session);
      }
    });

    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      this.realtimeService.unsubscribeCombatSession(subscriptionId);
      this.subscriptions.delete(subscriptionId);
    };
  }

  public subscribeToCharacterCombat(characterId: string, handler: (update: any) => void): () => void {
    const subscriptionId = this.realtimeService.subscribeToCharacterCombat(characterId);
    
    const unsubscribe = this.stateManager.subscribe('combat:active', (slice) => {
      if (slice.data) {
        handler(slice.data);
      }
    });

    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      this.realtimeService.unsubscribeCharacterCombat(subscriptionId);
      this.subscriptions.delete(subscriptionId);
    };
  }

  public async initialize(): Promise<void> {
    // Service initialization if needed
  }

  public getName(): string {
    return 'CombatService';
  }

  public destroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
    
    this.httpService.destroy();
    this.realtimeService.destroy();
  }
}

// HTTP operations
class CombatHttpService extends BaseHttpService {
  public async startCombat(
    initiatorId: string,
    request: StartCombatRequest
  ): Promise<ServiceResponse<CombatSessionData>> {
    return this.post<CombatSessionData>('/api/v1/combat/start', {
      initiatorId,
      ...request
    });
  }

  public async getCombatSession(sessionId: string): Promise<ServiceResponse<CombatSessionData>> {
    return this.get<CombatSessionData>(`/api/v1/combat/sessions/${sessionId}`, {
      useCache: true,
      cacheTTL: 5000 // 5 seconds
    });
  }

  public async getActiveCombatForCharacter(
    characterId: string
  ): Promise<ServiceResponse<CombatSessionData | null>> {
    return this.get<CombatSessionData | null>(`/api/v1/combat/active/${characterId}`);
  }

  public async fleeCombat(sessionId: string, userId: string): Promise<ServiceResponse<boolean>> {
    return this.post<boolean>(`/api/v1/combat/sessions/${sessionId}/flee`, { userId });
  }

  public async getCharacterStats(characterId: string): Promise<ServiceResponse<CombatStats>> {
    return this.get<CombatStats>(`/api/v1/combat/stats/${characterId}`, {
      useCache: true,
      cacheTTL: 30000 // 30 seconds
    });
  }
}

// Realtime operations
class CombatRealtimeService extends BaseRealtimeService {
  private combatSubscriptions: Map<string, string> = new Map();
  private characterSubscriptions: Map<string, string> = new Map();

  public subscribeToCombatSession(sessionId: string): string {
    const subscriptionId = this.subscribe(`combat:${sessionId}`, (event, data) => {
      this.emit(`combat:${event}`, data);
    });

    this.combatSubscriptions.set(sessionId, subscriptionId);
    return subscriptionId;
  }

  public unsubscribeCombatSession(subscriptionId: string): void {
    this.unsubscribe(subscriptionId);
    
    // Remove from tracking
    for (const [sessionId, subId] of this.combatSubscriptions) {
      if (subId === subscriptionId) {
        this.combatSubscriptions.delete(sessionId);
        break;
      }
    }
  }

  public subscribeToCharacterCombat(characterId: string): string {
    const subscriptionId = this.subscribe(`character:${characterId}:combat`, (event, data) => {
      this.emit(`combat:character:${event}`, data);
    });

    this.characterSubscriptions.set(characterId, subscriptionId);
    return subscriptionId;
  }

  public unsubscribeCharacterCombat(subscriptionId: string): void {
    this.unsubscribe(subscriptionId);
    
    // Remove from tracking
    for (const [charId, subId] of this.characterSubscriptions) {
      if (subId === subscriptionId) {
        this.characterSubscriptions.delete(charId);
        break;
      }
    }
  }

  public async sendCombatAction(
    sessionId: string,
    actorId: string,
    action: CombatActionRequest
  ): Promise<ProcessedCombatAction> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Combat action timeout'));
      }, 5000);

      // Listen for response
      const responseHandler = (data: ProcessedCombatAction) => {
        clearTimeout(timeout);
        this.off(`combat:action:${sessionId}:response`, responseHandler);
        resolve(data);
      };

      this.on(`combat:action:${sessionId}:response`, responseHandler);

      // Send action
      this.send('combat:action', {
        sessionId,
        actorId,
        action
      });
    });
  }

  public destroy(): void {
    this.combatSubscriptions.clear();
    this.characterSubscriptions.clear();
    super.destroy();
  }
}