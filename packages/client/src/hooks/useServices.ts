import { useEffect, useState, useCallback, useRef } from 'react';
import { ServiceLayer, getServices } from '../services';
import { StateSlice } from '../services/state/StateManager';

// Hook to access the service layer
export function useServices(): ServiceLayer {
  const services = getServices();
  
  if (!services) {
    throw new Error('Services not initialized. Make sure to call initializeServices() before using this hook.');
  }
  
  return services;
}

// Hook to subscribe to state changes
export function useServiceState<T>(key: string): StateSlice<T> | undefined {
  const services = useServices();
  const [state, setState] = useState<StateSlice<T> | undefined>(() => 
    services.getState().selectSlice<T>(key)
  );

  useEffect(() => {
    const unsubscribe = services.getState().subscribe<T>(key, (slice) => {
      setState(slice);
    });

    return unsubscribe;
  }, [services, key]);

  return state;
}

// Hook to get just the data from state
export function useServiceData<T>(key: string): T | undefined {
  const slice = useServiceState<T>(key);
  return slice?.data;
}

// Hook for combat service
export function useCombat() {
  const services = useServices();
  const combatService = services.combat;
  const combatState = useServiceState<any>('combat');

  const startCombat = useCallback(async (params: {
    targetId: string;
    targetType: 'monster' | 'player';
    initiatorId: string;
    initiatorPosition?: { x: number; y: number; z: number };
  }) => {
    return combatService.startCombat(params);
  }, [combatService]);

  const performAction = useCallback(async (params: {
    sessionId: string;
    action: 'attack' | 'defend' | 'flee' | 'ability';
    targetId?: string;
    abilityId?: string;
  }) => {
    return combatService.performAction(params);
  }, [combatService]);

  const fleeCombat = useCallback(async (sessionId: string) => {
    return combatService.fleeCombat(sessionId);
  }, [combatService]);

  return {
    session: combatState?.data?.session,
    stats: combatState?.data?.stats,
    isLoading: combatState?.isLoading || false,
    error: combatState?.error,
    startCombat,
    performAction,
    fleeCombat,
    service: combatService
  };
}

// Hook for character service
export function useCharacter() {
  const services = useServices();
  const characterService = services.character;
  const characterState = useServiceState<any>('character');

  const getCharacter = useCallback(async () => {
    return characterService.getCharacter();
  }, [characterService]);

  const updateStats = useCallback(async (stats: Partial<any>) => {
    return characterService.updateStats(stats);
  }, [characterService]);

  const levelUp = useCallback(async () => {
    return characterService.levelUp();
  }, [characterService]);

  return {
    character: characterState?.data,
    isLoading: characterState?.isLoading || false,
    error: characterState?.error,
    getCharacter,
    updateStats,
    levelUp,
    service: characterService
  };
}

// Hook for inventory service
export function useInventory() {
  const services = useServices();
  const inventoryService = services.inventory;
  const inventoryState = useServiceState<any>('inventory');

  const getInventory = useCallback(async () => {
    return inventoryService.getInventory();
  }, [inventoryService]);

  const useItem = useCallback(async (itemId: string) => {
    return inventoryService.useItem(itemId);
  }, [inventoryService]);

  const dropItem = useCallback(async (itemId: string, quantity?: number) => {
    return inventoryService.dropItem(itemId, quantity);
  }, [inventoryService]);

  const moveItem = useCallback(async (itemId: string, toSlot: number) => {
    return inventoryService.moveItem(itemId, toSlot);
  }, [inventoryService]);

  return {
    items: inventoryState?.items || [],
    maxSlots: inventoryState?.maxSlots || 50,
    usedSlots: inventoryState?.usedSlots || 0,
    isLoading: inventoryState?.isLoading || false,
    error: inventoryState?.error,
    getInventory,
    useItem,
    dropItem,
    moveItem,
    service: inventoryService
  };
}

// Hook for location service
export function useLocation() {
  const services = useServices();
  const locationService = services.location;
  const locationState = useServiceState<any>('location');

  const getLocations = useCallback(async () => {
    return locationService.getLocations();
  }, [locationService]);

  const moveToLocation = useCallback(async (locationId: string) => {
    return locationService.moveToLocation(locationId);
  }, [locationService]);

  const discoverLocation = useCallback(async (locationId: string) => {
    return locationService.discoverLocation(locationId);
  }, [locationService]);

  return {
    locations: locationState?.locations || [],
    currentLocation: locationState?.currentLocation,
    isLoading: locationState?.isLoading || false,
    error: locationState?.error,
    getLocations,
    moveToLocation,
    discoverLocation,
    service: locationService
  };
}

// Hook for WebSocket connection status
export function useWebSocketStatus() {
  const services = useServices();
  const wsManager = services.getWebSocketManager();
  const [status, setStatus] = useState(() => wsManager.getState());

  useEffect(() => {
    const handleUpdate = () => {
      setStatus(wsManager.getState());
    };

    wsManager.on('connected', handleUpdate);
    wsManager.on('disconnected', handleUpdate);
    wsManager.on('error', handleUpdate);
    wsManager.on('reconnecting', handleUpdate);

    return () => {
      wsManager.off('connected', handleUpdate);
      wsManager.off('disconnected', handleUpdate);
      wsManager.off('error', handleUpdate);
      wsManager.off('reconnecting', handleUpdate);
    };
  }, [wsManager]);

  return status;
}

// Hook for offline queue status
export function useOfflineQueue() {
  const services = useServices();
  const offlineQueue = services.getOfflineQueue();
  const [queueSize, setQueueSize] = useState(() => offlineQueue.size());

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueSize(offlineQueue.size());
    }, 1000);

    return () => clearInterval(interval);
  }, [offlineQueue]);

  const processQueue = useCallback(async () => {
    return offlineQueue.process();
  }, [offlineQueue]);

  return {
    queueSize,
    processQueue
  };
}

// Generic hook for any service
export function useService<T>(serviceName: string): T {
  const services = useServices();
  const serviceRef = useRef<T>();

  if (!serviceRef.current) {
    const ServiceProvider = require('../services/provider/ServiceProvider').ServiceProvider;
    const service = ServiceProvider.get<T>(serviceName);
    
    if (!service) {
      throw new Error(`Service "${serviceName}" not found`);
    }
    
    serviceRef.current = service;
  }

  return serviceRef.current;
}