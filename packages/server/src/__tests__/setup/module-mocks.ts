/**
 * Common module mocks for tests
 * This file sets up mocks that are used across multiple tests
 */
import { vi } from 'vitest';

// Mock auth middleware
vi.mock('../../middleware/auth', () => {
  const mockAuth = vi.fn((req: any, res: any, next: any) => {
    if (req.headers.authorization) {
      req.user = { 
        id: 'test-user-id', 
        userId: 'test-user-id',
        email: 'test@example.com', 
        username: 'testuser',
        roles: ['user']
      };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
  
  return {
    authenticate: mockAuth,
    requireAuth: mockAuth,
    authorize: vi.fn(() => mockAuth),
    AuthRequest: {}
  };
});

// Mock session manager
vi.mock('../../services/index', () => ({
  sessionManager: {
    getSession: vi.fn(),
    extendSession: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn()
  },
  characterService: {
    getCharactersByAccount: vi.fn(),
    getCharacterWithStats: vi.fn(),
    createCharacter: vi.fn(),
    deleteCharacter: vi.fn()
  }
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock rate limiter
vi.mock('../../middleware/rateLimiter', () => ({
  rateLimiter: () => (_req: any, _res: any, next: any) => next()
}));

// Mock async handler
vi.mock('../../middleware/asyncHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  }
}));