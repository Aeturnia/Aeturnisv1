import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './AuthService';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors';
import { db } from '../database/config';
import { users, userSessions } from '../database/schema';

// Mock Redis since it's not available in tests
vi.mock('../cache/redis', () => ({
  redis: {
    setex: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'SecurePass123!',
  };

  beforeEach(async () => {
    authService = new AuthService();
    vi.clearAllMocks();
    
    // Clean database before each test
    await db.delete(userSessions);
    await db.delete(users);
  });

  afterEach(async () => {
    // Clean database after each test
    await db.delete(userSessions);
    await db.delete(users);
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register(testUser);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.username).toBe(testUser.username);
      expect(result.user.roles).toEqual(['user']);
    });

    it('should throw ConflictError if email already exists', async () => {
      // First registration
      await authService.register(testUser);

      // Second registration with same email
      await expect(
        authService.register({
          email: testUser.email,
          username: 'different',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if username already exists', async () => {
      // First registration
      await authService.register(testUser);

      // Second registration with same username
      await expect(
        authService.register({
          email: 'different@example.com',
          username: testUser.username,
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError for invalid email format', async () => {
      await expect(
        authService.register({
          email: 'invalid-email',
          username: 'testuser',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for weak password', async () => {
      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'testuser',
          password: '123',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await authService.register(testUser);
    });

    it('should login successfully with email', async () => {
      const result = await authService.login({
        emailOrUsername: testUser.email,
        password: testUser.password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(testUser.email);
    });

    it('should login successfully with username', async () => {
      const result = await authService.login({
        emailOrUsername: testUser.username,
        password: testUser.password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe(testUser.username);
    });

    it('should throw UnauthorizedError for invalid credentials', async () => {
      await expect(
        authService.login({
          emailOrUsername: testUser.email,
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ValidationError for invalid input', async () => {
      await expect(
        authService.login({
          emailOrUsername: '',
          password: testUser.password,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Token Verification', () => {
    let accessToken: string;

    beforeEach(async () => {
      const result = await authService.register(testUser);
      accessToken = result.accessToken;
    });

    it('should verify valid access token', async () => {
      const tokenPayload = await authService.verifyToken(accessToken);

      expect(tokenPayload).toHaveProperty('userId');
      expect(tokenPayload).toHaveProperty('email');
      expect(tokenPayload).toHaveProperty('roles');
      expect(tokenPayload.email).toBe(testUser.email);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        authService.verifyToken('invalid-token')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error for malformed token', async () => {
      await expect(
        authService.verifyToken('malformed.token')
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Security Features', () => {
    it('should normalize email addresses to lowercase', async () => {
      const upperCaseEmail = {
        email: 'TEST@EXAMPLE.COM',
        username: 'testuser',
        password: 'SecurePass123!',
      };

      const result = await authService.register(upperCaseEmail);
      expect(result.user.email).toBe('test@example.com');
    });

    it('should not include password hash in response', async () => {
      const result = await authService.register(testUser);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });
});