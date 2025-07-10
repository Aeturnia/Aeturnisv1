import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { 
  useServices, 
  useServiceState, 
  useServiceData, 
  useCombat, 
  useWebSocketStatus,
  useOfflineQueue 
} from '../../../hooks/useServices';
import { ServiceProvider } from '../../../providers/ServiceProvider';
import { initializeServices, ServiceLayer } from '../../../services';
import { mockCombatSession } from '../mocks/mockData';

// Mock the services module
vi.mock('../../../services', () => ({
  initializeServices: vi.fn(),
  getServices: vi.fn(),
  ServiceLayer: vi.fn(),
}));

describe('Service Hooks', () => {
  let mockServiceLayer: Partial<ServiceLayer>;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    // Create mock service layer
    mockServiceLayer = {
      combat: {
        startCombat: vi.fn().mockResolvedValue(mockCombatSession),
        processAction: vi.fn().mockResolvedValue({}),
        fleeCombat: vi.fn().mockResolvedValue(true),
        getCharacterStats: vi.fn().mockResolvedValue({}),
        subscribeToCombatUpdates: vi.fn(),
        subscribeToCharacterCombat: vi.fn(),
        getActiveCombatForCharacter: vi.fn(),
        getCombatSession: vi.fn(),
        initialize: vi.fn(),
        destroy: vi.fn(),
        getName: vi.fn().mockReturnValue('CombatService'),
      },
      getState: vi.fn().mockReturnValue({
        selectSlice: vi.fn(),
        select: vi.fn(),
        subscribe: vi.fn().mockReturnValue(() => {}),
      }),
      getWebSocketManager: vi.fn().mockReturnValue({
        getState: vi.fn().mockReturnValue({
          connected: false,
          connecting: false,
          error: null,
          lastConnectedAt: null,
          reconnectAttempts: 0,
        }),
        on: vi.fn(),
        off: vi.fn(),
      }),
      getOfflineQueue: vi.fn().mockReturnValue({
        size: vi.fn().mockReturnValue(0),
        process: vi.fn().mockResolvedValue({
          successful: [],
          failed: [],
          retrying: [],
        }),
      }),
      initialize: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      isInitialized: vi.fn().mockReturnValue(true),
    } as any;

    (initializeServices as any).mockReturnValue(mockServiceLayer);
    (vi.mocked(getServices) as any).mockReturnValue(mockServiceLayer);

    // Create wrapper with ServiceProvider
    wrapper = ({ children }) => (
      <ServiceProvider config={{
        apiBaseUrl: 'http://localhost:3000',
        wsUrl: 'ws://localhost:3000',
      }}>
        {children}
      </ServiceProvider>
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useServices', () => {
    it('should return service layer instance', () => {
      const { result } = renderHook(() => useServices(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.combat).toBeDefined();
    });

    it('should throw error if services not initialized', () => {
      (vi.mocked(getServices) as any).mockReturnValue(null);

      expect(() => {
        renderHook(() => useServices(), { wrapper });
      }).toThrow('Services not initialized');
    });
  });

  describe('useServiceState', () => {
    it('should return state slice', () => {
      const mockSlice = {
        data: { count: 5 },
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        version: 1,
      };

      mockServiceLayer.getState!().selectSlice = vi.fn().mockReturnValue(mockSlice);

      const { result } = renderHook(() => useServiceState('counter'), { wrapper });

      expect(result.current).toEqual(mockSlice);
    });

    it('should subscribe to state changes', () => {
      const mockSlice = {
        data: { count: 5 },
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        version: 1,
      };

      let subscriber: any;
      mockServiceLayer.getState!().subscribe = vi.fn().mockImplementation((key, sub) => {
        subscriber = sub;
        return () => {};
      });
      mockServiceLayer.getState!().selectSlice = vi.fn().mockReturnValue(mockSlice);

      const { result, rerender } = renderHook(() => useServiceState('counter'), { wrapper });

      // Update state
      const newSlice = { ...mockSlice, data: { count: 10 } };
      act(() => {
        subscriber(newSlice);
      });

      expect(result.current).toEqual(newSlice);
    });

    it('should unsubscribe on unmount', () => {
      const unsubscribe = vi.fn();
      mockServiceLayer.getState!().subscribe = vi.fn().mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useServiceState('counter'), { wrapper });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('useServiceData', () => {
    it('should return only data from state slice', () => {
      const mockSlice = {
        data: { user: { id: 1, name: 'Test' } },
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        version: 1,
      };

      mockServiceLayer.getState!().selectSlice = vi.fn().mockReturnValue(mockSlice);

      const { result } = renderHook(() => useServiceData('user'), { wrapper });

      expect(result.current).toEqual({ user: { id: 1, name: 'Test' } });
    });

    it('should return undefined if no slice', () => {
      mockServiceLayer.getState!().selectSlice = vi.fn().mockReturnValue(undefined);

      const { result } = renderHook(() => useServiceData('nonexistent'), { wrapper });

      expect(result.current).toBeUndefined();
    });
  });

  describe('useCombat', () => {
    beforeEach(() => {
      mockServiceLayer.getState!().selectSlice = vi.fn()
        .mockImplementation((key: string) => {
          switch (key) {
            case 'combat:active':
              return { data: mockCombatSession };
            case 'combat:sessions':
              return { data: new Map([['combat-123', mockCombatSession]]) };
            case 'combat:stats':
              return { data: new Map([['character-123', { attack: 50 }]]) };
            default:
              return undefined;
          }
        });
    });

    it('should provide combat state and methods', () => {
      const { result } = renderHook(() => useCombat(), { wrapper });

      expect(result.current.activeCombat).toEqual(mockCombatSession);
      expect(result.current.combatSessions).toBeInstanceOf(Map);
      expect(result.current.combatStats).toBeInstanceOf(Map);
      expect(result.current.startCombat).toBeInstanceOf(Function);
      expect(result.current.processAction).toBeInstanceOf(Function);
      expect(result.current.fleeCombat).toBeInstanceOf(Function);
      expect(result.current.service).toBeDefined();
    });

    it('should call combat service methods', async () => {
      const { result } = renderHook(() => useCombat(), { wrapper });

      await act(async () => {
        await result.current.startCombat('character-123', { targetId: 'monster-456' });
      });

      expect(mockServiceLayer.combat!.startCombat).toHaveBeenCalledWith(
        'character-123',
        { targetId: 'monster-456' }
      );
    });

    it('should handle method errors', async () => {
      mockServiceLayer.combat!.startCombat = vi.fn().mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useCombat(), { wrapper });

      await expect(
        act(async () => {
          await result.current.startCombat('character-123', { targetId: 'monster-456' });
        })
      ).rejects.toThrow('Failed');
    });
  });

  describe('useWebSocketStatus', () => {
    it('should return WebSocket status', () => {
      const mockStatus = {
        connected: true,
        connecting: false,
        error: null,
        lastConnectedAt: Date.now(),
        reconnectAttempts: 0,
      };

      mockServiceLayer.getWebSocketManager!().getState = vi.fn().mockReturnValue(mockStatus);

      const { result } = renderHook(() => useWebSocketStatus(), { wrapper });

      expect(result.current).toEqual(mockStatus);
    });

    it('should update on WebSocket events', () => {
      let handlers: Record<string, Function> = {};
      const wsManager = mockServiceLayer.getWebSocketManager!();
      
      wsManager.on = vi.fn().mockImplementation((event, handler) => {
        handlers[event] = handler;
      });

      const { result, rerender } = renderHook(() => useWebSocketStatus(), { wrapper });

      // Simulate connection
      const newStatus = {
        connected: true,
        connecting: false,
        error: null,
        lastConnectedAt: Date.now(),
        reconnectAttempts: 0,
      };
      wsManager.getState = vi.fn().mockReturnValue(newStatus);

      act(() => {
        handlers['connected']?.();
      });

      expect(result.current).toEqual(newStatus);
    });

    it('should clean up event listeners on unmount', () => {
      const wsManager = mockServiceLayer.getWebSocketManager!();
      const { unmount } = renderHook(() => useWebSocketStatus(), { wrapper });

      unmount();

      expect(wsManager.off).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(wsManager.off).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(wsManager.off).toHaveBeenCalledWith('error', expect.any(Function));
      expect(wsManager.off).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    });
  });

  describe('useOfflineQueue', () => {
    it('should return queue size and process method', () => {
      mockServiceLayer.getOfflineQueue!().size = vi.fn().mockReturnValue(5);

      const { result } = renderHook(() => useOfflineQueue(), { wrapper });

      expect(result.current.queueSize).toBe(5);
      expect(result.current.processQueue).toBeInstanceOf(Function);
    });

    it('should update queue size periodically', async () => {
      vi.useFakeTimers();
      const offlineQueue = mockServiceLayer.getOfflineQueue!();
      offlineQueue.size = vi.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(3)
        .mockReturnValueOnce(5);

      const { result } = renderHook(() => useOfflineQueue(), { wrapper });

      expect(result.current.queueSize).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.queueSize).toBe(3);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.queueSize).toBe(5);

      vi.useRealTimers();
    });

    it('should process queue when called', async () => {
      const processResult = {
        successful: [{ id: '1' }],
        failed: [],
        retrying: [],
      };
      mockServiceLayer.getOfflineQueue!().process = vi.fn().mockResolvedValue(processResult);

      const { result } = renderHook(() => useOfflineQueue(), { wrapper });

      let processResultActual;
      await act(async () => {
        processResultActual = await result.current.processQueue();
      });

      expect(processResultActual).toEqual(processResult);
      expect(mockServiceLayer.getOfflineQueue!().process).toHaveBeenCalled();
    });

    it('should clear interval on unmount', () => {
      vi.useFakeTimers();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useOfflineQueue(), { wrapper });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});