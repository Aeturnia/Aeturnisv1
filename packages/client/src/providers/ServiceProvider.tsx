import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ServiceLayer, initializeServices, ServiceLayerConfig } from '../services';

interface ServiceContextValue {
  services: ServiceLayer | null;
  isInitialized: boolean;
  error: Error | null;
}

const ServiceContext = createContext<ServiceContextValue>({
  services: null,
  isInitialized: false,
  error: null
});

interface ServiceProviderProps {
  children: ReactNode;
  config: ServiceLayerConfig;
}

export function ServiceProvider({ children, config }: ServiceProviderProps) {
  const [services, setServices] = useState<ServiceLayer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let serviceLayer: ServiceLayer | null = null;

    async function init() {
      try {
        // Initialize the service layer
        serviceLayer = initializeServices(config);
        
        if (!mounted) return;
        
        setServices(serviceLayer);

        // Initialize all services
        await serviceLayer.initialize();
        
        if (!mounted) return;
        
        setIsInitialized(true);
      } catch (err) {
        if (!mounted) return;
        
        console.error('Failed to initialize services:', err);
        setError(err as Error);
      }
    }

    init();

    return () => {
      mounted = false;
      
      // Cleanup services
      if (serviceLayer) {
        serviceLayer.destroy().catch(err => {
          console.error('Failed to destroy services:', err);
        });
      }
    };
  }, [config]);

  return (
    <ServiceContext.Provider value={{ services, isInitialized, error }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServiceContext() {
  const context = useContext(ServiceContext);
  
  if (!context) {
    throw new Error('useServiceContext must be used within ServiceProvider');
  }
  
  return context;
}

// Export service dependencies interface
export interface ServiceDependencies {
  apiClient?: any;
  wsManager?: any;
  cacheService?: any;
  offlineQueue?: any;
}

// Re-export the useServices hook for convenience
export { useServices, useServiceState, useServiceData, useCombat, useWebSocketStatus, useOfflineQueue } from '../hooks/useServices';