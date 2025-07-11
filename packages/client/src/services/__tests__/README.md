# Service Layer Tests

This directory contains comprehensive tests for the frontend service integration layer.

## Test Structure

```
__tests__/
├── base/                 # Unit tests for base service classes
│   ├── BaseService.test.ts
│   ├── BaseHttpService.test.ts
│   ├── BaseRealtimeService.test.ts
│   └── ServiceError.test.ts
├── cache/               # Cache service tests
│   ├── CacheService.test.ts
│   └── OfflineQueue.test.ts
├── core/                # Core service tests (if needed)
├── game/                # Game service implementation tests
│   └── CombatService.test.ts
├── state/               # State management tests
│   └── StateManager.test.ts
├── integration/         # Integration tests
│   ├── hooks.test.tsx
│   ├── ServiceProvider.test.tsx
│   └── e2e.test.tsx
├── mocks/               # Mock data and utilities
│   └── mockData.ts
├── utils/               # Test utilities
│   └── testHelpers.ts
└── setup.ts            # Test setup and global mocks
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test BaseService.test.ts

# Run tests matching pattern
npm test -- --grep "combat"
```

## Test Coverage

The test suite covers:

### Unit Tests (base/)
- **BaseService**: Network state management, retry logic, offline handling
- **BaseHttpService**: HTTP operations, caching, request queuing
- **BaseRealtimeService**: WebSocket subscriptions, message handling, reconnection
- **ServiceError**: Error types and error handling utilities

### Cache Tests (cache/)
- **CacheService**: Memory and localStorage implementations, TTL, eviction
- **OfflineQueue**: Operation queuing, persistence, retry management

### State Management (state/)
- **StateManager**: State slices, subscriptions, middleware, persistence

### Service Implementation (game/)
- **CombatService**: Complete service implementation including HTTP, WebSocket, and state sync

### Integration Tests (integration/)
- **React Hooks**: useServices, useServiceState, useCombat, etc.
- **ServiceProvider**: Context provider, initialization, cleanup
- **E2E Tests**: Full service layer integration scenarios

## Writing Tests

### Test Utilities

Use the provided test helpers for consistency:

```typescript
import { 
  createMockServiceDependencies,
  createMockApiClient,
  createMockWebSocketManager,
  waitFor,
  mockApiError
} from '../utils/testHelpers';
```

### Testing Services

```typescript
describe('MyService', () => {
  let service: MyService;
  let mockDependencies: MockServiceDependencies;

  beforeEach(() => {
    mockDependencies = createMockServiceDependencies();
    service = new MyService(mockDependencies);
  });

  afterEach(() => {
    service.destroy();
  });

  it('should perform operation', async () => {
    // Test implementation
  });
});
```

### Testing React Hooks

```typescript
import { renderHook } from '@testing-library/react';

describe('useMyHook', () => {
  it('should return data', () => {
    const wrapper = ({ children }) => (
      <ServiceProvider config={config}>
        {children}
      </ServiceProvider>
    );

    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    expect(result.current).toBeDefined();
  });
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    
    render(
      <ServiceProvider config={config}>
        <MyComponent />
      </ServiceProvider>
    );

    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

## Mock Data

Use consistent mock data from `mocks/mockData.ts`:

```typescript
import { 
  mockCombatSession,
  mockCharacter,
  mockMonster,
  mockCurrencyBalance 
} from '../mocks/mockData';
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Cleanup**: Always clean up resources (subscriptions, timers, etc.)
3. **Mocking**: Mock external dependencies, not the system under test
4. **Async Testing**: Use proper async patterns with waitFor and act
5. **Error Cases**: Test both success and failure scenarios
6. **Edge Cases**: Test boundary conditions and edge cases

## Common Patterns

### Testing Async Operations

```typescript
it('should handle async operation', async () => {
  const result = await service.fetchData();
  expect(result).toBeDefined();
});
```

### Testing Event Handlers

```typescript
it('should handle events', () => {
  const handler = vi.fn();
  service.on('event', handler);
  
  service.emit('event', data);
  
  expect(handler).toHaveBeenCalledWith(data);
});
```

### Testing State Updates

```typescript
it('should update state', async () => {
  const { result, rerender } = renderHook(() => useServiceState('key'));
  
  act(() => {
    stateManager.update('key', newValue);
  });
  
  expect(result.current.data).toEqual(newValue);
});
```

### Testing Network Failures

```typescript
it('should handle network errors', async () => {
  mockApiClient.get.mockRejectedValue(new NetworkError('Failed'));
  
  await expect(service.getData()).rejects.toThrow(NetworkError);
});
```

## Debugging Tests

1. Use `console.log` or debugger statements
2. Run single test with `.only`: `it.only('test name', ...)`
3. Skip tests with `.skip`: `it.skip('test name', ...)`
4. Use `--reporter=verbose` for detailed output
5. Check test coverage gaps with `npm test:coverage`

## CI/CD Integration

Tests are run automatically on:
- Pull requests
- Main branch commits
- Pre-commit hooks (if configured)

Ensure all tests pass before merging!