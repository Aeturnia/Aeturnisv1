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