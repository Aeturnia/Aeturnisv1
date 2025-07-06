# Service Provider Testing Guide

## Overview

This directory contains comprehensive tests for the Service Provider implementation, ensuring the system can seamlessly switch between mock and real services.

## Test Structure

```
__tests__/
├── mock/                      # Unit tests for mock services
│   ├── MockMonsterService.test.ts
│   ├── MockNPCService.test.ts
│   └── MockCurrencyService.test.ts
├── integration/               # Integration tests
│   ├── ServiceProvider.integration.test.ts
│   └── ErrorScenarios.test.ts
├── performance/               # Performance benchmarks
│   └── ServiceProvider.benchmark.ts
└── setup.ts                  # Jest setup file
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Provider Tests
```bash
npm run test:providers
```

### Run Tests in Watch Mode
```bash
npm run test:providers:watch
```

### Run Tests with Coverage
```bash
npm run test:providers:coverage
```

### Run Performance Benchmarks
```bash
npm run benchmark
```

## Test Categories

### 1. Unit Tests (`mock/`)
Tests individual mock service implementations in isolation.

**Coverage:**
- All service interface methods
- Data persistence within mock services
- Error handling for invalid inputs
- Edge cases and boundary conditions

**Example:**
```typescript
describe('MockMonsterService', () => {
  it('should return monsters for a valid zone', async () => {
    const service = new MockMonsterService();
    const monsters = await service.getMonstersInZone('starter-zone');
    expect(monsters.length).toBeGreaterThan(0);
  });
});
```

### 2. Integration Tests (`integration/`)
Tests the Service Provider system as a whole.

**Coverage:**
- Service registration and retrieval
- Mock vs Real service switching
- Singleton pattern behavior
- Cross-service interactions

**Example:**
```typescript
describe('Service Provider Integration', () => {
  it('should switch between mock and real based on environment', async () => {
    process.env.USE_MOCKS = 'true';
    await initializeProviders(true);
    const service = provider.get('MonsterService');
    expect(service.constructor.name).toBe('MockMonsterService');
  });
});
```

### 3. Error Scenario Tests (`integration/ErrorScenarios.test.ts`)
Tests error handling and edge cases.

**Coverage:**
- Unregistered service access
- Invalid data handling
- Concurrent access scenarios
- Service lifecycle errors
- Resource exhaustion scenarios

### 4. Performance Benchmarks (`performance/`)
Measures performance characteristics of the Service Provider system.

**Metrics:**
- Operation latency (min/avg/max)
- Operations per second
- Memory usage
- Mock vs Real performance comparison

**Running Benchmarks:**
```bash
npm run benchmark
```

**Sample Output:**
```
=== Performance Benchmark Results ===

Benchmark                     Iterations  Total (ms)  Avg (ms)   Min (ms)   Max (ms)   Ops/sec
Mock: getMonstersInZone       1000        45.23       0.0452     0.0234     0.1234     22103
Mock: ServiceProvider.get     10000       12.34       0.0012     0.0008     0.0045     810372
```

## Test Environment

### Environment Variables
Tests use the following environment variables:
- `USE_MOCKS`: Set to 'true' for mock services, 'false' for real
- `NODE_ENV`: Always set to 'test' during testing

### Setup and Teardown
- ServiceProvider instance is cleared between test suites
- Mock data is reset for each test
- Logger is mocked to reduce noise

## Writing New Tests

### Adding a New Mock Service Test
1. Create a new file in `__tests__/mock/`
2. Import the mock service and test it against the interface
3. Cover all interface methods
4. Test error scenarios

### Adding Integration Tests
1. Add tests to existing files or create new ones in `__tests__/integration/`
2. Test interactions between services
3. Verify environment switching behavior

### Adding Performance Tests
1. Use the `PerformanceBenchmark` class
2. Add warmup iterations
3. Measure both latency and throughput
4. Compare mock vs real performance

## Coverage Requirements

Target coverage: 80% for all metrics
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## CI/CD Integration

These tests should be run in CI/CD pipelines:

```yaml
- name: Run Provider Tests
  run: npm run test:providers:coverage
  
- name: Run Benchmarks
  run: npm run benchmark
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

1. **Tests fail with "Service not registered"**
   - Ensure `initializeProviders()` is called in setup
   - Check that ServiceProvider instance is cleared between tests

2. **Mock data persists between tests**
   - Ensure mock services are recreated for each test
   - Clear any static data in beforeEach hooks

3. **Performance tests are inconsistent**
   - Run benchmarks multiple times
   - Ensure no other processes are consuming resources
   - Use dedicated benchmark environment if possible

4. **Coverage is below threshold**
   - Check for untested error paths
   - Add tests for edge cases
   - Verify all service methods are covered

## Future Improvements

1. **Automated Performance Regression Detection**
   - Store benchmark baselines
   - Alert on performance degradation

2. **Chaos Testing**
   - Random failure injection
   - Network delay simulation
   - Resource exhaustion scenarios

3. **Contract Testing**
   - Ensure mock services match real service behavior
   - Automated interface compliance verification

4. **Load Testing**
   - Simulate production-like load
   - Test service provider under stress
   - Identify bottlenecks