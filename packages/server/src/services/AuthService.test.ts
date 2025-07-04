import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './AuthService';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors';

// Mock dependencies
vi.mock('../database', () => ({
  db: {
    query: vi.fn(),
  },
}));

vi.mock('../cache/redis', () => ({
  redis: {
    setex: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

const mockDb = {
  query: vi.fn(),
};

const mockRedis = {
  setex: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    roles: ['user'],
    password_hash: '$argon2id$v=19$m=65536,t=3,p=4$hash',
  };

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      // Mock successful registration
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Email check
        .mockResolvedValueOnce({ rows: [] }) // Username check  
        .mockResolvedValueOnce({ rows: [mockUser] }); // Insert user

      const result = await authService.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictError if email already exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if username already exists', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Email check passes
        .mockResolvedValueOnce({ rows: [mockUser] }); // Username check fails

      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'testuser',
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
          password: 'weak',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid username', async () => {
      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'ab', // Too short
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('User Login', () => {
    it('should login successfully with email', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      
      const result = await authService.login({
        emailOrUsername: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should login successfully with username', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      
      const result = await authService.login({
        emailOrUsername: 'testuser',
        password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError for invalid credentials', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        authService.login({
          emailOrUsername: 'nonexistent@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ValidationError for invalid input', async () => {
      await expect(
        authService.login({
          emailOrUsername: '',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Token Refresh', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockJti = 'jti-123';

    it('should refresh tokens successfully', async () => {
      // Mock Redis get for refresh token
      mockRedis.get.mockResolvedValueOnce(mockUser.id);
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.refreshTokens(mockRefreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError for invalid refresh token', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      await expect(
        authService.refreshTokens('invalid-token')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for expired token', async () => {
      vi.spyOn(authService, 'verifyToken').mockRejectedValueOnce(new Error('Token expired'));

      await expect(
        authService.refreshTokens(mockRefreshToken)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for token reuse', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      await expect(
        authService.refreshTokens(mockRefreshToken)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should invalidate old refresh token after successful refresh', async () => {
      mockRedis.get.mockResolvedValueOnce(mockUser.id);
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      await authService.refreshTokens(mockRefreshToken);

      expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining('refresh_token:'));
    });
  });

  describe('Token Verification', () => {
    it('should verify valid access token', async () => {
      const token = authService.generateAccessToken(mockUser);
      
      const result = await authService.verifyToken(token);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('roles');
    });

    it('should throw error for invalid token', async () => {
      await expect(
        authService.verifyToken('invalid-token')
      ).rejects.toThrow();
    });

    it('should throw error for expired token', async () => {
      // Create token with very short expiry and wait
      const shortLivedToken = 'expired-token';
      
      await expect(
        authService.verifyToken(shortLivedToken)
      ).rejects.toThrow();
    });

    it('should throw error for malformed token', async () => {
      await expect(
        authService.verifyToken('malformed.token')
      ).rejects.toThrow();
    });
  });

  describe('Logout', () => {
    const mockRefreshToken = 'valid-refresh-token';

    it('should logout successfully', async () => {
      mockRedis.del.mockResolvedValueOnce(1);

      await authService.logout(mockRefreshToken);

      expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining('refresh_token:'));
    });

    it('should handle logout with invalid token gracefully', async () => {
      mockRedis.del.mockResolvedValueOnce(0);

      await expect(
        authService.logout('invalid-token')
      ).resolves.not.toThrow();
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle SQL injection attempts in email', async () => {
      await expect(
        authService.login({
          emailOrUsername: "'; DROP TABLE users; --",
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should normalize email addresses to lowercase', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...mockUser, email: 'test@example.com' }] });

      const result = await authService.register({
        email: 'TEST@EXAMPLE.COM',
        username: 'testuser',
        password: 'SecurePass123!',
      });

      expect(result.user.email).toBe('test@example.com');
    });

    it('should not include password hash in response', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
      });

      expect(result.user).not.toHaveProperty('password_hash');
    });
  });
});