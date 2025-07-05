import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
  
  // Ensure required environment variables are set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
  }
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Clean up
  vi.restoreAllMocks();
});

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  // Keep error for debugging
  error: originalConsole.error,
  debug: vi.fn(),
};

// Export utilities for tests
export const testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create unique test data to avoid conflicts
  createTestUser: () => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 100000);
    return {
      email: `test${timestamp}${randomId}@example.com`,
      username: `user${timestamp}${randomId}`.substring(0, 20),
      password: 'SecurePass123!',
    };
  },
  
  // Enhanced wait with timeout
  waitForCondition: async (condition: () => boolean, timeout = 5000, interval = 100) => {
    const start = Date.now();
    while (!condition()) {
      if (Date.now() - start > timeout) {
        throw new Error('Timeout waiting for condition');
      }
      await testUtils.delay(interval);
    }
  },
};