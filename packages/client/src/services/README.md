# Frontend Service Integration Layer

This directory contains the frontend service integration layer that provides a clean, type-safe interface for communicating with backend services.

## Architecture Overview

The service layer follows a modular architecture with these key components:

### Core Components

1. **Base Classes**
   - `BaseService` - Abstract base for all services with retry logic and offline support
   - `BaseHttpService` - HTTP-specific base with caching and request queuing
   - `BaseRealtimeService` - WebSocket-specific base with subscription management

2. **Core Services**
   - `ApiClient` - Axios wrapper with interceptors for auth and error handling
   - `WebSocketManager` - Socket.io connection management with auto-reconnect
   - `ServiceRegistry` - Service instance management and lifecycle
   - `StateManager` - Centralized state management with persistence

3. **Service Provider**
   - Singleton pattern matching the backend ServiceProvider
   - Static methods for backward compatibility
   - Type-safe service retrieval

### Service Implementation Pattern

Each game service follows this pattern:

```typescript
export class GameService implements IGameService {
  private httpService: GameHttpService;      // HTTP operations
  private realtimeService: GameRealtimeService; // WebSocket operations
  private stateManager: StateManager;        // State management

  // Public API methods that combine HTTP/WS as needed
  // State synchronization between HTTP and WebSocket
  // Subscription management for real-time updates
}
```

## Usage

### 1. Initialize Services in Your App

```typescript
import { ServiceProvider } from './providers/ServiceProvider';
import { ServiceLayerConfig } from './services';

const config: ServiceLayerConfig = {
  apiBaseUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  cacheConfig: {
    storage: 'localStorage',
    maxSize: 1000,
    defaultTTL: 300000 // 5 minutes
  }
};

function App() {
  return (
    <ServiceProvider config={config}>
      {/* Your app components */}
    </ServiceProvider>
  );
}
```

### 2. Use Services in Components

```typescript
import { useCombat } from '../hooks/useServices';

function CombatComponent() {
  const { 
    activeCombat,      // Current combat session
    startCombat,       // Start new combat
    processAction,     // Send combat action
    fleeCombat        // Attempt to flee
  } = useCombat();

  // Use the service methods and state
}
```

### 3. Direct Service Access

```typescript
import { ServiceProvider } from '../services';

// Get a specific service
const combatService = ServiceProvider.get('CombatService');

// Check if service exists
if (ServiceProvider.has('CombatService')) {
  // Use service
}
```

## Features

### Offline Support

- Automatic request queuing when offline
- Optimistic updates with rollback
- Background sync when connection restored

```typescript
// Actions are automatically queued when offline
await combatService.processAction(sessionId, actorId, action);
// Returns optimistic response if configured
```

### Caching

- Configurable TTL per request
- Multiple storage backends (memory, localStorage, IndexedDB)
- Automatic cache invalidation

```typescript
// Cached for 5 minutes by default
const stats = await combatService.getCharacterStats(characterId);
```

### Real-time Updates

- Automatic WebSocket subscriptions
- State synchronization between HTTP and WS
- Event-based updates

```typescript
// Subscribe to combat updates
const unsubscribe = combatService.subscribeToCombatUpdates(
  sessionId,
  (update) => console.log('Combat updated:', update)
);

// Clean up when done
unsubscribe();
```

### Error Handling

- Automatic retry with exponential backoff
- Custom error types for different scenarios
- Global error handling

```typescript
try {
  await combatService.startCombat(initiatorId, request);
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network errors
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  }
}
```

## State Management

The service layer includes a built-in state manager:

```typescript
// In a component
const combatState = useServiceState('combat:active');

if (combatState?.loading) {
  return <LoadingSpinner />;
}

if (combatState?.error) {
  return <ErrorMessage error={combatState.error} />;
}

const combat = combatState?.data;
```

## Adding New Services

1. Create the service interface in `provider/interfaces/`
2. Create the service implementation in `game/`
3. Register in `index.ts`
4. Create React hook in `hooks/useServices.ts`

Example:

```typescript
// 1. Interface
export interface IInventoryService extends IService {
  getInventory(characterId: string): Promise<Inventory>;
  equipItem(characterId: string, itemId: string): Promise<boolean>;
}

// 2. Implementation
export class InventoryService implements IInventoryService {
  // Implementation
}

// 3. Register
ServiceProvider.register('InventoryService', new InventoryService(deps));

// 4. Hook
export function useInventory() {
  const services = useServices();
  const inventory = useServiceData('inventory');
  
  return {
    inventory,
    equipItem: services.inventory.equipItem,
    // etc
  };
}
```

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Service Configuration

```typescript
const config: ServiceLayerConfig = {
  apiBaseUrl: process.env.VITE_API_URL,
  wsUrl: process.env.VITE_WS_URL,
  timeout: 30000, // 30 seconds
  cacheConfig: {
    storage: 'indexeddb',     // or 'localStorage', 'memory'
    maxSize: 1000,           // max cached items
    defaultTTL: 300000       // 5 minutes
  },
  offlineConfig: {
    storage: 'indexeddb',
    maxSize: 100,            // max queued operations
    maxRetries: 3            // retry attempts
  }
};
```

## Testing

The service layer is designed for easy testing:

```typescript
// Mock services
const mockCombatService = {
  startCombat: jest.fn(),
  getCharacterStats: jest.fn()
};

ServiceProvider.register('CombatService', mockCombatService);

// Test component
render(
  <ServiceProvider config={mockConfig}>
    <CombatComponent />
  </ServiceProvider>
);
```

## Performance Considerations

1. **Request Deduplication** - Multiple identical requests are automatically deduplicated
2. **Lazy Loading** - Services are initialized only when first used
3. **Memory Management** - Automatic cleanup of subscriptions and cached data
4. **Batch Operations** - Support for batching multiple operations

## Troubleshooting

### WebSocket Connection Issues

Check the WebSocket status:
```typescript
const wsStatus = useWebSocketStatus();
console.log('Connected:', wsStatus.connected);
console.log('Error:', wsStatus.error);
```

### Offline Queue

Monitor offline queue:
```typescript
const { queueSize, processQueue } = useOfflineQueue();
console.log('Queued operations:', queueSize);

// Manually process queue
await processQueue();
```

### State Debugging

Enable state debugging in development:
```typescript
if (process.env.NODE_ENV === 'development') {
  stateManager.use((key, prev, next) => {
    console.log('State change:', { key, prev, next });
    return next;
  });
}
```