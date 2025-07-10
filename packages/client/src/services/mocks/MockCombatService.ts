import { MockService } from './base/MockService';
import { ICombatService } from '../provider/interfaces/ICombatService';
import { StateManager } from '../state/StateManager';
import { ServiceLayerConfig } from '../index';
import { 
  mockCombatSession, 
  mockCombatStats, 
  mockProcessedAction,
  mockCharacter,
  mockMonster
} from '../__tests__/mocks/mockData';

export class MockCombatService extends MockService implements ICombatService {
  private stateManager: StateManager;
  private currentSession: any = null;

  constructor(
    dependencies: {
      stateManager: StateManager;
    },
    config?: ServiceLayerConfig['mockConfig']
  ) {
    super(config);
    this.stateManager = dependencies.stateManager;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize combat state slice
    this.stateManager.createSlice('combat', {
      session: null,
      stats: null,
      isLoading: false,
      error: null
    });
  }

  async startCombat(params: {
    targetId: string;
    targetType: 'monster' | 'player';
    initiatorId: string;
    initiatorPosition?: { x: number; y: number; z: number };
  }): Promise<any> {
    this.stateManager.updateSlice('combat', { isLoading: true });

    try {
      const session = await this.getMockData({
        ...mockCombatSession,
        id: `combat-${Date.now()}`,
        startedAt: new Date().toISOString(),
        participants: [
          {
            id: params.initiatorId,
            type: 'player',
            character: mockCharacter,
            position: params.initiatorPosition || { x: 0, y: 0, z: 0 }
          },
          {
            id: params.targetId,
            type: params.targetType,
            character: params.targetType === 'monster' ? mockMonster : mockCharacter,
            position: { x: 10, y: 10, z: 0 }
          }
        ]
      });

      this.currentSession = session;
      this.stateManager.updateSlice('combat', { 
        session, 
        isLoading: false,
        error: null 
      });

      this.emit('combat:started', session);
      return session;
    } catch (error) {
      this.stateManager.updateSlice('combat', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async performAction(params: {
    sessionId: string;
    action: 'attack' | 'defend' | 'flee' | 'ability';
    targetId?: string;
    abilityId?: string;
  }): Promise<any> {
    this.stateManager.updateSlice('combat', { isLoading: true });

    try {
      if (!this.currentSession || this.currentSession.id !== params.sessionId) {
        throw new Error('Invalid combat session');
      }

      const action = await this.getMockData({
        ...mockProcessedAction,
        sessionId: params.sessionId,
        action: params.action,
        targetId: params.targetId,
        timestamp: new Date().toISOString()
      });

      // Update mock session state
      if (params.action === 'flee') {
        this.currentSession.status = 'completed';
        this.currentSession.endedAt = new Date().toISOString();
      }

      this.stateManager.updateSlice('combat', { 
        session: this.currentSession,
        isLoading: false 
      });

      this.emit('combat:action', action);
      return action;
    } catch (error) {
      this.stateManager.updateSlice('combat', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getCombatSession(sessionId: string): Promise<any> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      throw new Error('Combat session not found');
    }
    return this.getMockData(this.currentSession);
  }

  async getCombatStats(sessionId: string): Promise<any> {
    return this.getMockData({
      ...mockCombatStats,
      sessionId
    });
  }

  async fleeCombat(sessionId: string): Promise<any> {
    return this.performAction({
      sessionId,
      action: 'flee'
    });
  }

  onCombatUpdate(callback: (data: any) => void): () => void {
    const handleUpdate = (data: any) => callback(data);
    this.on('combat:update', handleUpdate);
    return () => this.off('combat:update', handleUpdate);
  }

  onCombatEnd(callback: (data: any) => void): () => void {
    const handleEnd = (data: any) => callback(data);
    this.on('combat:ended', handleEnd);
    return () => this.off('combat:ended', handleEnd);
  }

  // Simulate combat updates
  public simulateCombatUpdate(update: any): void {
    if (this.currentSession) {
      this.currentSession = { ...this.currentSession, ...update };
      this.stateManager.updateSlice('combat', { session: this.currentSession });
      this.emit('combat:update', this.currentSession);
    }
  }

  // Simulate combat end
  public simulateCombatEnd(): void {
    if (this.currentSession) {
      this.currentSession.status = 'completed';
      this.currentSession.endedAt = new Date().toISOString();
      this.stateManager.updateSlice('combat', { session: this.currentSession });
      this.emit('combat:ended', this.currentSession);
      this.currentSession = null;
    }
  }

  destroy(): void {
    this.currentSession = null;
    super.destroy();
  }
}