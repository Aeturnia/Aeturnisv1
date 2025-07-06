// Test setup for Service Provider tests

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.USE_MOCKS = 'true';

// Mock logger to reduce noise in tests
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Ensure ServiceProvider is cleared between tests
afterEach(() => {
  const { ServiceProvider } = require('../ServiceProvider');
  (ServiceProvider as any).instance = undefined;
});