/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

// Enhanced database mocking utilities for reliable testing
export const createMockDatabaseQueries = () => {
  const mockQueries = {
    // Mock user insertion for registration
    insertUser: vi.fn().mockImplementation((userData) => {
      return Promise.resolve({
        rows: [{
          id: 'mock-user-id',
          email: userData.email,
          username: userData.username,
          roles: ['user'],
          created_at: new Date(),
        }],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      });
    }),

    // Mock user lookup for login
    findUser: vi.fn().mockImplementation(() => {
      // Simulate existing user for login tests
      return Promise.resolve({
        rows: [{
          id: 'mock-user-id',
          email: 'test@example.com',
          username: 'testuser',
          password_hash: 'mock-hashed-password',
          roles: ['user'],
        }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });
    }),

    // Mock user update for last login
    updateLastLogin: vi.fn().mockResolvedValue({
      rows: [],
      rowCount: 1,
      command: 'UPDATE',
      oid: 0,
      fields: [],
    }),

    // Mock empty result for non-existing users
    findNoUser: vi.fn().mockResolvedValue({
      rows: [],
      rowCount: 0,
      command: 'SELECT',
      oid: 0,
      fields: [],
    }),
  };

  return mockQueries;
};

// Database response builder for consistent test data
export const createDbResponse = (data: any[], command = 'SELECT') => ({
  rows: data,
  rowCount: data.length,
  command,
  oid: 0,
  fields: [],
});

// Enhanced timing utilities for database operations
export const dbTestUtils = {
  // Simulate realistic database operation timing
  simulateDbDelay: async (operation: 'fast' | 'normal' | 'slow' = 'normal') => {
    const delays = { fast: 10, normal: 50, slow: 200 };
    await new Promise(resolve => setTimeout(resolve, delays[operation]));
  },

  // Create unique test data to avoid conflicts
  createUniqueUserData: () => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    
    return {
      id: `test-user-${timestamp}-${randomSuffix}`,
      email: `test.${timestamp}.${randomSuffix}@example.com`,
      username: `user${timestamp}${randomSuffix}`.substring(0, 20),
      password: 'TestPassword123!',
    };
  },

  // Enhanced cleanup utilities
  waitForDbOperation: async () => {
    // Simulate waiting for database operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  },
};