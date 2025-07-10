import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CombatService } from '../../game/CombatService';
import { createMockServiceDependencies } from '../utils/testHelpers';
import { mockCombatSession, mockCombatStats, mockProcessedAction } from '../mocks/mockData';
import { NetworkError } from '../../base/ServiceError';

describe('CombatService', () => {
  let service: CombatService;
  let mockDependencies: ReturnType<typeof createMockServiceDependencies>;

  beforeEach(() => {
    mockDependencies = createMockServiceDependencies();
    service = new CombatService(mockDependencies);
  });

  afterEach(() => {
    service.destroy();
  });

  describe('initialization', () => {
    it('should initialize state slices', () => {
      expect(mockDependencies.stateManager.register).toHaveBeenCalledWith(
        'combat:active',
        null,
        { persist: false }
      );
      expect(mockDependencies.stateManager.register).toHaveBeenCalledWith(
        'combat:sessions',
        expect.any(Map),
        { persist: false }
      );
      expect(mockDependencies.stateManager.register).toHaveBeenCalledWith(
        'combat:stats',
        expect.any(Map),
        { persist: true }
      );
    });

    it('should set up realtime event handlers', () => {
      const onSpy = vi.spyOn(service['realtimeService'], 'on');
      
      // Create new service to trigger setup
      const newService = new CombatService(mockDependencies);
      
      expect(onSpy).toHaveBeenCalledWith('combat:update', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('combat:ended', expect.any(Function));
      
      newService.destroy();
    });
  });

  describe('startCombat', () => {
    it('should start combat successfully', async () => {
      mockDependencies.apiClient.post.mockResolvedValue({ data: mockCombatSession });
      mockDependencies.stateManager.select.mockReturnValue(new Map());

      const result = await service.startCombat('character-123', {
        targetId: 'monster-456',
        targetType: 'monster',
        initiatorPosition: { x: 10, y: 20, z: 0 },
      });

      expect(result).toEqual(mockCombatSession);
      expect(mockDependencies.apiClient.post).toHaveBeenCalledWith(
        '/api/combat/start',
        {
          initiatorId: 'character-123',
          targetId: 'monster-456',
          targetType: 'monster',
          initiatorPosition: { x: 10, y: 20, z: 0 },
        }
      );

      // Should update state
      expect(mockDependencies.stateManager.update).toHaveBeenCalledWith(
        'combat:active',
        mockCombatSession
      );
    });

    it('should update loading state during combat start', async () => {
      mockDependencies.apiClient.post.mockResolvedValue({ data: mockCombatSession });

      await service.startCombat('character-123', {
        targetId: 'monster-456',
        targetType: 'monster',
      });

      // Should set loading true
      expect(mockDependencies.stateManager.updateSlice).toHaveBeenCalledWith(
        'combat:active',
        { loading: true, error: null }
      );
    });

    it('should handle combat start errors', async () => {
      const error = new NetworkError('Failed to start combat');
      mockDependencies.apiClient.post.mockRejectedValue(error);

      await expect(service.startCombat('character-123', {
        targetId: 'monster-456',
        targetType: 'monster',
      })).rejects.toThrow(error);

      // Should update error state
      expect(mockDependencies.stateManager.updateSlice).toHaveBeenCalledWith(
        'combat:active',
        { loading: false, error }
      );
    });

    it('should subscribe to combat session after starting', async () => {
      mockDependencies.apiClient.post.mockResolvedValue({ data: mockCombatSession });
      const subscribeSpy = vi.spyOn(service['realtimeService'], 'subscribeToCombatSession');

      await service.startCombat('character-123', {
        targetId: 'monster-456',
        targetType: 'monster',
      });

      expect(subscribeSpy).toHaveBeenCalledWith(mockCombatSession.sessionId);
    });
  });

  describe('processAction', () => {
    it('should process combat action via realtime', async () => {
      const sendActionSpy = vi.spyOn(service['realtimeService'], 'sendCombatAction')
        .mockResolvedValue(mockProcessedAction);

      const action = {
        action: 'attack',
        targetId: 'monster-456',
      };

      const result = await service.processAction('combat-123', 'character-123', action);

      expect(result).toEqual(mockProcessedAction);
      expect(sendActionSpy).toHaveBeenCalledWith('combat-123', 'character-123', action);
    });
  });

  describe('fleeCombat', () => {
    it('should flee combat successfully', async () => {
      mockDependencies.apiClient.post.mockResolvedValue({ data: true });

      const result = await service.fleeCombat('combat-123', 'user-123');

      expect(result).toBe(true);
      expect(mockDependencies.apiClient.post).toHaveBeenCalledWith(
        '/api/combat/sessions/combat-123/flee',
        { userId: 'user-123' }
      );
    });

    it('should return false on flee failure', async () => {
      mockDependencies.apiClient.post.mockRejectedValue(new Error('Cannot flee'));

      const result = await service.fleeCombat('combat-123', 'user-123');

      expect(result).toBe(false);
    });
  });

  describe('getCombatSession', () => {
    it('should return cached session if available', async () => {
      const sessionsMap = new Map([['combat-123', mockCombatSession]]);
      mockDependencies.stateManager.select.mockReturnValue(sessionsMap);

      const result = await service.getCombatSession('combat-123');

      expect(result).toEqual(mockCombatSession);
      expect(mockDependencies.apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch session from API if not cached', async () => {
      mockDependencies.stateManager.select.mockReturnValue(new Map());
      mockDependencies.apiClient.get.mockResolvedValue({ data: mockCombatSession });

      const result = await service.getCombatSession('combat-123');

      expect(result).toEqual(mockCombatSession);
      expect(mockDependencies.apiClient.get).toHaveBeenCalledWith(
        '/api/combat/sessions/combat-123',
        expect.objectContaining({
          useCache: true,
          cacheTTL: 5000,
        })
      );
    });

    it('should return null if session not found', async () => {
      mockDependencies.stateManager.select.mockReturnValue(new Map());
      mockDependencies.apiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await service.getCombatSession('combat-123');

      expect(result).toBeNull();
    });
  });

  describe('getActiveCombatForCharacter', () => {
    it('should get and subscribe to active combat', async () => {
      mockDependencies.apiClient.get.mockResolvedValue({ data: mockCombatSession });
      const subscribeSpy = vi.spyOn(service['realtimeService'], 'subscribeToCombatSession');

      const result = await service.getActiveCombatForCharacter('character-123');

      expect(result).toEqual(mockCombatSession);
      expect(mockDependencies.stateManager.update).toHaveBeenCalledWith(
        'combat:active',
        mockCombatSession
      );
      expect(subscribeSpy).toHaveBeenCalledWith(mockCombatSession.sessionId);
    });

    it('should return null if no active combat', async () => {
      mockDependencies.apiClient.get.mockResolvedValue({ data: null });

      const result = await service.getActiveCombatForCharacter('character-123');

      expect(result).toBeNull();
      expect(mockDependencies.stateManager.update).not.toHaveBeenCalled();
    });
  });

  describe('getCharacterStats', () => {
    it('should return cached stats if available', async () => {
      const statsMap = new Map([['character-123', mockCombatStats]]);
      mockDependencies.stateManager.select.mockReturnValue(statsMap);

      const result = await service.getCharacterStats('character-123');

      expect(result).toEqual(mockCombatStats);
      expect(mockDependencies.apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache stats from API', async () => {
      mockDependencies.stateManager.select.mockReturnValue(new Map());
      mockDependencies.apiClient.get.mockResolvedValue({ data: mockCombatStats });

      const result = await service.getCharacterStats('character-123');

      expect(result).toEqual(mockCombatStats);
      expect(mockDependencies.apiClient.get).toHaveBeenCalledWith(
        '/api/combat/stats/character-123',
        expect.objectContaining({
          useCache: true,
          cacheTTL: 30000,
        })
      );

      // Should cache the stats
      expect(mockDependencies.stateManager.update).toHaveBeenCalledWith(
        'combat:stats',
        expect.any(Map)
      );
    });
  });

  describe('realtime sync', () => {
    it('should handle combat update events', () => {
      const sessionsMap = new Map([['combat-123', mockCombatSession]]);
      mockDependencies.stateManager.select.mockReturnValue(sessionsMap);

      // Trigger combat update event
      const updateHandler = service['realtimeService'].on.mock.calls
        .find(call => call[0] === 'combat:update')?.[1];
      
      const updatedSession = { ...mockCombatSession, round: 2 };
      updateHandler?.({ sessionId: 'combat-123', session: updatedSession });

      expect(mockDependencies.stateManager.update).toHaveBeenCalledWith(
        'combat:sessions',
        expect.any(Map)
      );
    });

    it('should handle combat ended events', () => {
      const sessionsMap = new Map([['combat-123', mockCombatSession]]);
      mockDependencies.stateManager.select
        .mockReturnValueOnce(sessionsMap) // for sessions
        .mockReturnValueOnce(mockCombatSession); // for active combat

      // Trigger combat ended event
      const endedHandler = service['realtimeService'].on.mock.calls
        .find(call => call[0] === 'combat:ended')?.[1];
      
      endedHandler?.({ sessionId: 'combat-123' });

      // Should remove from sessions
      expect(mockDependencies.stateManager.update).toHaveBeenCalledWith(
        'combat:sessions',
        expect.any(Map)
      );

      // Should clear active combat
      expect(mockDependencies.stateManager.update).toHaveBeenCalledWith(
        'combat:active',
        null
      );
    });
  });

  describe('subscriptions', () => {
    it('should subscribe to combat updates', () => {
      const handler = vi.fn();
      const unsubscribeSpy = vi.fn();
      mockDependencies.stateManager.subscribe.mockReturnValue(unsubscribeSpy);

      const subscribeSpy = vi.spyOn(service['realtimeService'], 'subscribeToCombatSession')
        .mockReturnValue('sub-123');
      const unsubscribeRealtimeSpy = vi.spyOn(service['realtimeService'], 'unsubscribeCombatSession');

      const unsubscribe = service.subscribeToCombatUpdates('combat-123', handler);

      expect(subscribeSpy).toHaveBeenCalledWith('combat-123');
      expect(mockDependencies.stateManager.subscribe).toHaveBeenCalledWith(
        'combat:sessions',
        expect.any(Function)
      );

      // Test unsubscribe
      unsubscribe();
      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(unsubscribeRealtimeSpy).toHaveBeenCalledWith('sub-123');
    });

    it('should notify handler when combat session updates', () => {
      const handler = vi.fn();
      const sessionsMap = new Map([['combat-123', mockCombatSession]]);
      
      let stateSubscriber: any;
      mockDependencies.stateManager.subscribe.mockImplementation((key, subscriber) => {
        stateSubscriber = subscriber;
        return vi.fn();
      });

      service.subscribeToCombatUpdates('combat-123', handler);

      // Simulate state update
      stateSubscriber({ data: sessionsMap });

      expect(handler).toHaveBeenCalledWith(mockCombatSession);
    });

    it('should subscribe to character combat', () => {
      const handler = vi.fn();
      const unsubscribeSpy = vi.fn();
      mockDependencies.stateManager.subscribe.mockReturnValue(unsubscribeSpy);

      const subscribeSpy = vi.spyOn(service['realtimeService'], 'subscribeToCharacterCombat')
        .mockReturnValue('sub-456');

      const unsubscribe = service.subscribeToCharacterCombat('character-123', handler);

      expect(subscribeSpy).toHaveBeenCalledWith('character-123');
      
      unsubscribe();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('should have getName method', () => {
      expect(service.getName()).toBe('CombatService');
    });

    it('should clean up on destroy', () => {
      // Set up some subscriptions
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      service['subscriptions'].set('sub1', unsubscribe1);
      service['subscriptions'].set('sub2', unsubscribe2);

      const httpDestroySpy = vi.spyOn(service['httpService'], 'destroy');
      const realtimeDestroySpy = vi.spyOn(service['realtimeService'], 'destroy');

      service.destroy();

      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
      expect(service['subscriptions'].size).toBe(0);
      expect(httpDestroySpy).toHaveBeenCalled();
      expect(realtimeDestroySpy).toHaveBeenCalled();
    });
  });
});