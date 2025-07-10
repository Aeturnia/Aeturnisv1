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
  
  const activeCombat = useServiceData('combat:active');
  const combatSessions = useServiceData<Map<string, any>>('combat:sessions');
  const combatStats = useServiceData<Map<string, any>>('combat:stats');

  const startCombat = useCallback(async (initiatorId: string, request: any) => {
    return combatService.startCombat(initiatorId, request);
  }, [combatService]);

  const processAction = useCallback(async (sessionId: string, actorId: string, action: any) => {
    return combatService.processAction(sessionId, actorId, action);
  }, [combatService]);

  const fleeCombat = useCallback(async (sessionId: string, userId: string) => {
    return combatService.fleeCombat(sessionId, userId);
  }, [combatService]);

  return {
    activeCombat,
    combatSessions,
    combatStats,
    startCombat,
    processAction,
    fleeCombat,
    service: combatService
  };
}

// Hook for character service
export function useCharacter() {
  const services = useServices();
  const characterService = services.character;
  
  const currentCharacter = useServiceData('character:current');
  const characterList = useServiceData<Map<string, any>>('character:list');
  const characterStats = useServiceData<Map<string, any>>('character:stats');

  const getCharacter = useCallback(async (characterId: string) => {
    return characterService.getCharacter(characterId);
  }, [characterService]);

  const getCharacters = useCallback(async () => {
    return characterService.getCharacters();
  }, [characterService]);

  const updatePosition = useCallback(async (characterId: string, position: any) => {
    return characterService.updatePosition(characterId, position);
  }, [characterService]);

  const addExperience = useCallback(async (characterId: string, amount: number) => {
    return characterService.addExperience(characterId, amount);
  }, [characterService]);

  const allocateStats = useCallback(async (characterId: string, stats: any) => {
    return characterService.allocateStats(characterId, stats);
  }, [characterService]);

  const getStats = useCallback(async (characterId: string) => {
    return characterService.getStats(characterId);
  }, [characterService]);

  return {
    currentCharacter,
    characterList,
    characterStats,
    getCharacter,
    getCharacters,
    selectCharacter: characterService.selectCharacter,
    updatePosition,
    addExperience,
    allocateStats,
    getStats,
    isLoading: false,
    error: null,
    service: characterService
  };
}

// Hook for zone service
export function useZone() {
  const services = useServices();
  const zoneService = services.zone;
  
  const zoneList = useServiceData<Map<string, any>>('zone:list');
  const currentZone = useServiceData('zone:current');
  const characterPositions = useServiceData<Map<string, any>>('zone:positions');

  const getZones = useCallback(async () => {
    return zoneService.getZones();
  }, [zoneService]);

  const getZone = useCallback(async (zoneId: string) => {
    return zoneService.getZone(zoneId);
  }, [zoneService]);

  const getCurrentZone = useCallback(async () => {
    return zoneService.getCurrentZone();
  }, [zoneService]);

  const getCharacterPosition = useCallback(async (characterId: string) => {
    return zoneService.getCharacterPosition(characterId);
  }, [zoneService]);

  const moveToZone = useCallback(async (characterId: string, zoneId: string) => {
    return zoneService.moveToZone(characterId, zoneId);
  }, [zoneService]);

  const moveInDirection = useCallback(async (characterId: string, direction: any) => {
    return zoneService.moveInDirection(characterId, direction);
  }, [zoneService]);

  const canMoveToZone = useCallback(async (characterId: string, targetZoneId: string) => {
    return zoneService.canMoveToZone(characterId, targetZoneId);
  }, [zoneService]);

  return {
    zoneList,
    currentZone,
    characterPositions,
    getZones,
    getZone,
    getCurrentZone,
    getCharacterPosition,
    moveToZone,
    moveInDirection,
    canMoveToZone,
    service: zoneService
  };
}

// Hook for inventory service
export function useInventory() {
  const services = useServices();
  const inventoryService = services.inventory;
  
  const inventoryData = useServiceData<Map<string, any>>('inventory:data');
  const equipmentData = useServiceData<Map<string, any>>('equipment:data');
  const equipmentStats = useServiceData<Map<string, any>>('equipment:stats');

  const getInventory = useCallback(async (characterId: string) => {
    return inventoryService.getInventory(characterId);
  }, [inventoryService]);

  const getEquipment = useCallback(async (characterId: string) => {
    return inventoryService.getEquipment(characterId);
  }, [inventoryService]);

  const equipItem = useCallback(async (characterId: string, inventorySlot: number, equipmentSlot: any) => {
    return inventoryService.equipItem(characterId, inventorySlot, equipmentSlot);
  }, [inventoryService]);

  const unequipItem = useCallback(async (characterId: string, equipmentSlot: any) => {
    return inventoryService.unequipItem(characterId, equipmentSlot);
  }, [inventoryService]);

  const dropItem = useCallback(async (characterId: string, itemId: string, quantity?: number) => {
    return inventoryService.dropItem(characterId, itemId, quantity);
  }, [inventoryService]);

  const moveItem = useCallback(async (characterId: string, itemId: string, toSlot: number) => {
    return inventoryService.moveItem(characterId, itemId, toSlot);
  }, [inventoryService]);

  const getEquipmentStats = useCallback(async (characterId: string) => {
    return inventoryService.getEquipmentStats(characterId);
  }, [inventoryService]);

  return {
    inventoryData,
    equipmentData,
    equipmentStats,
    getInventory,
    getEquipment,
    equipItem,
    unequipItem,
    dropItem,
    moveItem,
    getEquipmentStats,
    service: inventoryService
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