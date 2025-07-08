// Test setup for Service Provider tests
import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.USE_MOCKS = 'true';

// Mock logger to reduce noise in tests
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Ensure ServiceProvider is cleared between tests
afterEach(() => {
  const { ServiceProvider } = require('../ServiceProvider');
  (ServiceProvider as any).instance = undefined;
});