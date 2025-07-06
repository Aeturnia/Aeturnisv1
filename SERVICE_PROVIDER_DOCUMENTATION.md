# Service Provider Implementation - Complete Documentation

## Overview

The Service Provider pattern has been fully implemented across the server architecture, providing a unified dependency injection system that enables seamless switching between mock and real service implementations. This pattern is essential for testing, development, and production environments.

## Architecture

### Core Components

```
packages/server/src/providers/
├── ServiceProvider.ts          # Main dependency injection container
├── initializeProviders.ts      # Bootstrap and configuration
├── interfaces/                 # Service contracts
│   ├── IBankService.ts
│   ├── ICombatService.ts
│   ├── ICurrencyService.ts
│   ├── IDeathService.ts
│   ├── IDialogueService.ts
│   ├── ILootService.ts
│   ├── IMonsterService.ts
│   ├── INPCService.ts
│   └── ISpawnService.ts
├── mock/                       # Mock implementations for testing
│   ├── MockBankService.ts
│   ├── MockCombatService.ts
│   ├── MockCurrencyService.ts
│   ├── MockDeathService.ts
│   ├── MockDialogueService.ts
│   ├── MockLootService.ts
│   ├── MockMonsterService.ts
│   ├── MockNPCService.ts
│   └── MockSpawnService.ts
├── real/                       # Production implementations
│   ├── RealBankService.ts
│   ├── RealCombatService.ts
│   ├── RealCurrencyService.ts
│   ├── RealDeathService.ts
│   ├── RealDialogueService.ts
│   ├── RealLootService.ts
│   ├── RealMonsterService.ts
│   ├── RealNPCService.ts
│   └── RealSpawnService.ts
└── __tests__/                  # Comprehensive test suite
    ├── mock/                   # Unit tests for mock services
    ├── integration/            # Integration tests
    ├── performance/            # Performance benchmarks
    └── README.md               # Testing documentation
```

## Usage

### Basic Usage

```typescript
import { ServiceProvider } from './providers/ServiceProvider';
import { initializeProviders } from './providers/initializeProviders';

// Initialize the service provider
await initializeProviders(true); // true = use mock services

// Get services
const combatService = ServiceProvider.get('CombatService');
const lootService = ServiceProvider.get('LootService');
const currencyService = ServiceProvider.get('CurrencyService');
```

### Environment-Based Switching

```typescript
// Set environment variable
process.env.USE_MOCKS = 'true';  // Use mock services
process.env.USE_MOCKS = 'false'; // Use real services

// Services automatically switch based on environment
await initializeProviders();
```

### Service Registration

```typescript
// Register a custom service
ServiceProvider.register('CustomService', new CustomServiceImpl());

// Register with factory function
ServiceProvider.register('DatabaseService', () => new DatabaseService(config));
```

## Service Interfaces

All services implement standardized interfaces that define their contracts:

### ICombatService
```typescript
interface ICombatService {
  startCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession>;
  processAction(action: CombatAction): Promise<CombatResult>;
  getSession(sessionId: string): Promise<CombatSession | null>;
  validateParticipant(sessionId: string, userId: string): Promise<boolean>;
  fleeCombat(sessionId: string, userId: string): Promise<CombatResult>;
  getCharacterStats(charId: string): Promise<CharacterCombatStats>;
  getCharacterResources(charId: string): Promise<ResourcePool | null>;
  simulateCombat(initiatorId: string, targetIds: string[]): Promise<CombatEndResult>;
  forceStartCombat(initiatorId: string, request: CombatStartRequest): Promise<CombatSession>;
}
```

### ICurrencyService
```typescript
interface ICurrencyService {
  getBalance(characterId: string): Promise<number>;
  modifyBalance(characterId: string, amount: number, type: TransactionType, description?: string): Promise<Transaction>;
  transferGold(fromId: string, toId: string, amount: number, description?: string, fee?: number): Promise<Transaction>;
  getTransactionHistory(characterId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionStats(characterId: string): Promise<TransactionStats>;
  rewardGold(characterId: string, amount: number, source: string, description?: string): Promise<Transaction>;
  purchaseItem(characterId: string, itemId: string, cost: number, quantity?: number, vendorId?: string): Promise<Transaction>;
  sellItem(characterId: string, itemId: string, value: number, quantity?: number, vendorId?: string): Promise<Transaction>;
}
```

### ILootService
```typescript
interface ILootService {
  calculateLootDrops(lootTableName: string, modifiers: IDropModifierInput): Promise<ILootDrop[]>;
  claimLoot(sessionId: string, claimRequest: ILootClaimRequest): Promise<ILootClaimResponse>;
  getLootHistory(characterId: string, limit?: number): Promise<LootHistoryEntry[]>;
  createTestLootTable(): Promise<string>;
  getAllLootTables?(): Promise<LootTable[]>;
}
```

## Implementation Details

### Mock Services

Mock services provide complete, in-memory implementations for testing and development:

- **Predictable behavior** for unit tests
- **Rich test data** for realistic scenarios
- **No external dependencies** (database, cache, etc.)
- **Fast execution** for rapid development cycles

Example Mock Service:
```typescript
export class MockCurrencyService implements ICurrencyService {
  private balances: Map<string, number> = new Map();
  private transactions: Transaction[] = [];

  async getBalance(characterId: string): Promise<number> {
    return this.balances.get(characterId) || 0;
  }

  async modifyBalance(characterId: string, amount: number, type: TransactionType): Promise<Transaction> {
    const balanceBefore = this.balances.get(characterId) || 0;
    const balanceAfter = balanceBefore + amount;
    
    if (balanceAfter < 0) {
      throw new Error('Insufficient funds');
    }
    
    this.balances.set(characterId, balanceAfter);
    
    const transaction: Transaction = {
      id: uuidv4(),
      characterId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      createdAt: new Date()
    };
    
    this.transactions.push(transaction);
    return transaction;
  }
}
```

### Real Services

Real services act as adapters that delegate to the actual service implementations:

```typescript
export class RealCurrencyService implements ICurrencyService {
  private currencyService: CurrencyService;

  constructor() {
    this.currencyService = new CurrencyService();
  }

  async getBalance(characterId: string): Promise<number> {
    return await this.currencyService.getBalance(characterId);
  }

  async modifyBalance(characterId: string, amount: number, type: TransactionType): Promise<Transaction> {
    return await this.currencyService.modifyBalance(characterId, amount, type);
  }
}
```

## Interface Updates Made

### Major Interface Alignments

1. **ICurrencyService**: Updated from multi-currency (gold/silver/copper) to single-currency (gold) system to match actual implementation
2. **ICombatService**: Added new methods from actual CombatService (validateParticipant, fleeCombat, getCharacterStats, etc.)
3. **ILootService**: Added calculateLootDrops, getLootHistory, createTestLootTable methods
4. **IBankService**: Added actual BankService methods (getPersonalBank, getSharedBank, addItemToBank, etc.)
5. **IDeathService**: Simplified to match actual implementation (processCharacterDeath, processCharacterRespawn, getCharacterDeathStatus)

### Backwards Compatibility

Where needed, interfaces maintain legacy methods as optional to ensure existing code continues to work:

```typescript
interface ILootService {
  // New methods (required)
  calculateLootDrops(lootTableName: string, modifiers: IDropModifierInput): Promise<ILootDrop[]>;
  
  // Legacy methods (optional)
  generateLoot?(source: LootSource, killer: any): Promise<LootTable>;
}
```

## Testing

### Comprehensive Test Suite

```bash
# Run all provider tests
npm run test:providers

# Run with coverage
npm run test:providers:coverage

# Run performance benchmarks
npm run benchmark
```

### Test Categories

1. **Unit Tests** (`__tests__/mock/`): Test individual mock services
2. **Integration Tests** (`__tests__/integration/`): Test service provider system
3. **Performance Tests** (`__tests__/performance/`): Benchmark mock vs real services
4. **Error Scenarios** (`__tests__/integration/ErrorScenarios.test.ts`): Test error handling

### Coverage Requirements

- Minimum 80% coverage for all metrics
- All service interface methods must be tested
- Error scenarios must be covered

## Configuration

### Environment Variables

```bash
# Use mock services (default for development/testing)
USE_MOCKS=true

# Use real services (production)
USE_MOCKS=false

# Test environment
NODE_ENV=test
```

### Initialization

```typescript
// Initialize with environment detection
await initializeProviders();

// Force mock services
await initializeProviders(true);

// Force real services  
await initializeProviders(false);
```

## Benefits

### For Development
- **Fast iteration** with mock services
- **Predictable test data** for consistent results
- **No external dependencies** during testing
- **Easy debugging** with controlled data

### For Testing
- **Unit test isolation** with mocked dependencies
- **Integration testing** with real service combinations
- **Performance testing** to compare implementations
- **Error scenario testing** with predictable failures

### For Production
- **Seamless deployment** with real services
- **Type safety** through interface contracts
- **Dependency injection** for loose coupling
- **Easy service swapping** for different environments

## Migration Guide

### Updating Existing Code

```typescript
// Old direct service usage
import { CombatService } from './services/CombatService';
const combatService = new CombatService();

// New service provider usage
import { ServiceProvider } from './providers/ServiceProvider';
const combatService = ServiceProvider.get('CombatService');
```

### Adding New Services

1. **Define Interface**: Create interface in `interfaces/`
2. **Implement Mock**: Create mock implementation in `mock/`
3. **Implement Real**: Create real adapter in `real/`
4. **Register Service**: Add to `initializeProviders.ts`
5. **Add Tests**: Create test files in `__tests__/`

## Best Practices

### Service Design
- Keep interfaces focused and cohesive
- Use actual implementation types rather than generic interfaces
- Maintain backwards compatibility when possible
- Document service contracts clearly

### Mock Implementation
- Provide realistic test data
- Implement complete functionality, not just stubs
- Use in-memory storage for fast execution
- Include error scenarios for testing

### Real Implementation
- Keep adapters thin - delegate to actual services
- Handle type mapping between interface and implementation
- Preserve error handling from underlying services
- Document any behavioral differences

### Testing
- Test both mock and real implementations
- Include performance benchmarks
- Test error scenarios thoroughly
- Maintain high test coverage

## Monitoring and Observability

### Service Metrics
- Service registration/retrieval times
- Mock vs real service performance
- Error rates by service type
- Memory usage patterns

### Logging
All service operations are logged with:
- Service name and method
- Execution time
- Success/failure status
- Key parameters (sanitized)

### Performance Monitoring
Regular benchmarks compare:
- Mock service performance
- Real service performance
- Memory usage patterns
- Startup times

## Future Enhancements

### Planned Features
1. **Service Health Checks**: Monitor service availability
2. **Circuit Breaker Pattern**: Handle service failures gracefully
3. **Service Metrics**: Detailed performance and usage analytics
4. **Dynamic Service Loading**: Load services on-demand
5. **Service Versioning**: Support multiple service versions

### Architecture Evolution
- Consider microservice decomposition
- Evaluate gRPC for service communication
- Implement distributed service discovery
- Add service mesh capabilities

## Conclusion

The Service Provider implementation provides a robust, scalable foundation for the game server architecture. It enables rapid development, comprehensive testing, and smooth production deployment while maintaining type safety and clean separation of concerns.

For questions or contributions, refer to the test documentation in `packages/server/src/providers/__tests__/README.md` or contact the development team.