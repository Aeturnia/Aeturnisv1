# Test Infrastructure

This directory contains the comprehensive test suite for the Aeturnis server application.

## Structure

```
__tests__/
├── unit/                    # Unit tests for individual components
│   ├── controllers/         # Controller unit tests
│   ├── services/           # Service unit tests
│   ├── middleware/         # Middleware unit tests
│   ├── repositories/       # Repository unit tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests for API endpoints
├── e2e/                    # End-to-end tests
├── fixtures/               # Test data fixtures
├── helpers/                # Test utilities and helpers
│   ├── factories.ts        # Factory functions for test data
│   ├── api-helpers.ts      # API testing utilities
│   ├── mocks.ts           # Mock generators
│   ├── assertions.ts       # Custom assertions
│   ├── database-helpers.ts # Database test utilities
│   └── index.ts           # Helper exports
└── README.md              # This file
```

## Test Framework

We use **Vitest** as our testing framework. It provides:
- Fast execution with native ESM support
- Jest-compatible API
- Built-in mocking capabilities
- Excellent TypeScript support
- Parallel test execution
- Coverage reporting

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.controller.test.ts

# Run tests matching pattern
npm test -- --grep "CharacterService"
```

## Writing Tests

### Unit Tests

Unit tests focus on testing individual components in isolation:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyService } from '../../../services/MyService';

describe('MyService', () => {
  let service: MyService;
  
  beforeEach(() => {
    service = new MyService();
  });
  
  it('should do something', () => {
    const result = service.doSomething();
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

Integration tests verify API endpoints work correctly:

```typescript
import { ApiHelper, createAuthenticatedUser } from '../helpers';

describe('API Endpoint', () => {
  let apiHelper: ApiHelper;
  let testUser: TestUser;
  
  beforeAll(async () => {
    const app = createApp();
    const authService = new AuthService();
    
    testUser = await createAuthenticatedUser(authService);
    apiHelper = new ApiHelper(app, testUser.accessToken);
  });
  
  it('should return data', async () => {
    const response = await apiHelper.get('/api/endpoint');
    expectApiSuccess(response);
  });
});
```

## Test Helpers

### Factories

Use factories to create test data:

```typescript
import { characterFactory, userFactory } from '@test/helpers';

const testUser = userFactory.build({ email: 'custom@example.com' });
const testCharacters = characterFactory.buildMany(5);
```

### API Helpers

Simplify API testing:

```typescript
const apiHelper = new ApiHelper(app, authToken);

// Make authenticated requests
const response = await apiHelper.get('/api/characters');
const response = await apiHelper.post('/api/characters', characterData);
```

### Mock Generators

Create mock objects easily:

```typescript
import { createMockRequest, createMockResponse, createMockSocket } from '@test/helpers';

const req = createMockRequest({ params: { id: '123' } });
const res = createMockResponse();
const socket = createMockSocket({ id: 'test-socket' });
```

### Custom Assertions

Use custom assertions for common checks:

```typescript
import { expectUuid, expectIsoDate, expectApiSuccess } from '@test/helpers';

expectUuid(character.id);
expectIsoDate(character.createdAt);
expectApiSuccess(response, 201);
```

### Database Helpers

Manage test data lifecycle:

```typescript
import { DatabaseCleaner, seedTestData } from '@test/helpers';

const dbCleaner = new DatabaseCleaner();

// Register entities for cleanup
dbCleaner.addUser(testUser.id);
dbCleaner.addCharacter(character.id);

// Clean up in afterAll
afterAll(async () => {
  await dbCleaner.cleanup();
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Mock databases, APIs, and services to ensure fast, reliable tests
3. **Use Factories**: Create test data using factories for consistency
4. **Clear Test Names**: Use descriptive test names that explain what is being tested
5. **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
6. **Clean Up**: Always clean up test data and restore mocks
7. **Test Edge Cases**: Don't just test happy paths, test error conditions too
8. **Keep Tests Simple**: Each test should verify one specific behavior

## Coverage

We aim for high test coverage:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 70%
- **Statements**: 80%

View coverage reports:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Debugging Tests

```bash
# Run tests with detailed output
npm test -- --reporter=verbose

# Run specific test with debugging
node --inspect-brk ./node_modules/.bin/vitest run auth.controller.test.ts
```

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:
- All tests must pass before merging
- Coverage thresholds are enforced
- Test results are reported in pull requests