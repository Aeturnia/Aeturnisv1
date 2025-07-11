import { describe, it, expect, vi } from 'vitest';
import {
  ServiceError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  TimeoutError,
  RateLimitError,
  ErrorHandler,
} from '../../base/ServiceError';

describe('ServiceError classes', () => {
  describe('ServiceError', () => {
    it('should create error with default values', () => {
      const error = new ServiceError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('SERVICE_ERROR');
      expect(error.name).toBe('ServiceError');
      expect(error.retryable).toBe(false);
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with custom values', () => {
      const error = new ServiceError('Custom error', 'CUSTOM_ERROR', {
        statusCode: 400,
        details: { field: 'name' },
        retryable: true,
      });
      
      expect(error.code).toBe('CUSTOM_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'name' });
      expect(error.retryable).toBe(true);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with retry enabled', () => {
      const error = new NetworkError('Connection failed');
      
      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
      expect(error.retryable).toBe(true);
    });

    it('should include details when provided', () => {
      const details = { attempt: 3, lastError: 'timeout' };
      const error = new NetworkError('Connection failed', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field errors', () => {
      const errors = {
        email: ['Invalid email format', 'Email already exists'],
        password: ['Password too short'],
      };
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
      expect(error.retryable).toBe(false);
      expect(error.details).toEqual(errors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.name).toBe('AuthenticationError');
      expect(error.statusCode).toBe(401);
      expect(error.retryable).toBe(false);
    });

    it('should create auth error with custom message', () => {
      const error = new AuthenticationError('Invalid token');
      
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authz error with default message', () => {
      const error = new AuthorizationError();
      
      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe('AUTHZ_ERROR');
      expect(error.name).toBe('AuthorizationError');
      expect(error.statusCode).toBe(403);
      expect(error.retryable).toBe(false);
    });

    it('should create authz error with custom message', () => {
      const error = new AuthorizationError('Admin access required');
      
      expect(error.message).toBe('Admin access required');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError();
      
      expect(error.message).toBe('Request timed out');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.name).toBe('TimeoutError');
      expect(error.retryable).toBe(true);
    });

    it('should create timeout error with custom message', () => {
      const error = new TimeoutError('Operation timed out after 30s');
      
      expect(error.message).toBe('Operation timed out after 30s');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError();
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.name).toBe('RateLimitError');
      expect(error.statusCode).toBe(429);
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBeUndefined();
    });

    it('should create rate limit error with retry after', () => {
      const error = new RateLimitError('Too many requests', 60);
      
      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBe(60);
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear handlers
    ErrorHandler['handlers'].clear();
  });

  describe('register and handle', () => {
    it('should register and call error handlers', () => {
      const authHandler = vi.fn();
      const networkHandler = vi.fn();
      
      ErrorHandler.register('AUTH_ERROR', authHandler);
      ErrorHandler.register('NETWORK_ERROR', networkHandler);
      
      const authError = new AuthenticationError();
      const networkError = new NetworkError('Connection lost');
      
      ErrorHandler.handle(authError);
      expect(authHandler).toHaveBeenCalledWith(authError);
      expect(networkHandler).not.toHaveBeenCalled();
      
      ErrorHandler.handle(networkError);
      expect(networkHandler).toHaveBeenCalledWith(networkError);
    });

    it('should log unhandled service errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const unhandledError = new ServiceError('Unhandled error', 'UNHANDLED_ERROR');
      ErrorHandler.handle(unhandledError);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled service error:', unhandledError);
      
      consoleSpy.mockRestore();
    });

    it('should log non-service errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const genericError = new Error('Generic error');
      ErrorHandler.handle(genericError);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled service error:', genericError);
      
      consoleSpy.mockRestore();
    });
  });

  describe('handleAsync', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await ErrorHandler.handleAsync(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should use fallback for retryable errors', async () => {
      const operation = vi.fn().mockRejectedValue(new NetworkError('Failed'));
      const fallback = vi.fn().mockReturnValue('fallback result');
      
      const result = await ErrorHandler.handleAsync(operation, { fallback });
      
      expect(result).toBe('fallback result');
      expect(fallback).toHaveBeenCalled();
    });

    it('should not use fallback for non-retryable errors', async () => {
      const error = new ValidationError('Invalid', {});
      const operation = vi.fn().mockRejectedValue(error);
      const fallback = vi.fn();
      
      await expect(ErrorHandler.handleAsync(operation, { fallback }))
        .rejects.toThrow(error);
      
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should transform errors', async () => {
      const originalError = new NetworkError('Network failed');
      const transformedError = new ServiceError('Service unavailable');
      
      const operation = vi.fn().mockRejectedValue(originalError);
      const transform = vi.fn().mockReturnValue(transformedError);
      
      await expect(ErrorHandler.handleAsync(operation, { transform }))
        .rejects.toThrow(transformedError);
      
      expect(transform).toHaveBeenCalledWith(originalError);
    });

    it('should apply both fallback and transform', async () => {
      const retryableError = new NetworkError('Network failed');
      const nonRetryableError = new ValidationError('Invalid', {});
      const transformedError = new ServiceError('Transformed');
      
      // Test with retryable error - should use fallback
      const operation1 = vi.fn().mockRejectedValue(retryableError);
      const fallback = vi.fn().mockReturnValue('fallback');
      const transform = vi.fn().mockReturnValue(transformedError);
      
      const result1 = await ErrorHandler.handleAsync(operation1, { fallback, transform });
      expect(result1).toBe('fallback');
      expect(transform).not.toHaveBeenCalled();
      
      // Test with non-retryable error - should transform
      const operation2 = vi.fn().mockRejectedValue(nonRetryableError);
      
      await expect(ErrorHandler.handleAsync(operation2, { fallback, transform }))
        .rejects.toThrow(transformedError);
      
      expect(transform).toHaveBeenCalledWith(nonRetryableError);
    });
  });
});