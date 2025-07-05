import { vi } from 'vitest';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

// Enhanced authentication mocking for reliable testing
export const createMockAuthServices = () => {
  const mockAuth = {
    // Mock JWT operations
    jwt: {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn().mockReturnValue({
        userId: 'mock-user-id',
        email: 'test@example.com',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      }),
      decode: vi.fn().mockReturnValue({ userId: 'mock-user-id' }),
    },

    // Mock Argon2 password operations
    argon2: {
      hash: vi.fn().mockResolvedValue('$argon2id$v=19$m=65536,t=3,p=4$mock-salt$mock-hash'),
      verify: vi.fn().mockResolvedValue(true),
    },

    // Mock Redis operations for rate limiting
    redis: {
      setex: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue(null),
      del: vi.fn().mockResolvedValue(1),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
    },
  };

  return mockAuth;
};

// Authentication test data factories
export const authTestData = {
  // Valid user registration data
  validRegistration: () => ({
    email: 'newuser@example.com',
    username: 'newuser123',
    password: 'SecurePassword123!',
  }),

  // Valid login credentials
  validLogin: () => ({
    emailOrUsername: 'test@example.com',
    password: 'TestPassword123!',
  }),

  // Invalid credentials for testing failures
  invalidLogin: () => ({
    emailOrUsername: 'nonexistent@example.com',
    password: 'wrongpassword',
  }),

  // Weak password for validation testing
  weakPassword: () => ({
    email: 'test@example.com',
    username: 'testuser',
    password: 'weak',
  }),

  // Invalid email format
  invalidEmail: () => ({
    email: 'invalid-email',
    username: 'testuser',
    password: 'ValidPassword123!',
  }),

  // Mock JWT payload
  jwtPayload: () => ({
    userId: 'test-user-id',
    email: 'test@example.com',
    roles: ['user'],
    type: 'access',
  }),

  // Mock user response
  userResponse: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    roles: ['user'],
    created_at: new Date(),
    updated_at: new Date(),
  }),
};

// Mock HTTP response helpers for API testing
export const mockHttpResponse = {
  // Success response structure
  success: (data: any, status = 200) => ({
    status,
    json: () => Promise.resolve({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
  }),

  // Error response structure
  error: (message: string, status = 400, code?: string) => ({
    status,
    json: () => Promise.resolve({
      success: false,
      error: {
        message,
        code: code || 'GENERIC_ERROR',
      },
      timestamp: new Date().toISOString(),
    }),
  }),

  // Validation error
  validationError: (errors: string[]) => ({
    status: 400,
    json: () => Promise.resolve({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    }),
  }),
};

// Enhanced rate limiting mock
export const mockRateLimiter = (shouldLimit = false) => {
  return vi.fn().mockImplementation((req: any, res: any, next: any) => {
    if (shouldLimit) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests',
          code: 'RATE_LIMITED',
        },
      });
    }
    next();
  });
};