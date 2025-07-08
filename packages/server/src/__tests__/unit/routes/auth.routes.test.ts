/**
 * Auth Routes Unit Tests
 */
import '../../../test-utils/setup';
import '../../setup/module-mocks';
import request from 'supertest';
import express, { Express } from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import authRoutes from '../../../routes/auth.routes';
import { AuthService } from '../../../services/AuthService';

// Mock AuthService
vi.mock('../../../services/AuthService');

describe('Auth Routes', () => {
  let app: Express;
  let mockAuthService: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Setup mock AuthService
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      refreshTokens: vi.fn(),
      logout: vi.fn(),
      verifyToken: vi.fn()
    };
    
    (AuthService as any).mockImplementation(() => mockAuthService);
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registrationData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'SecurePass123!'
      };
      
      const mockResult = {
        user: {
          id: '123',
          email: registrationData.email,
          username: registrationData.username
        },
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token'
      };
      
      mockAuthService.register.mockResolvedValueOnce(mockResult);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockResult
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(registrationData);
    });
    
    it('should handle registration errors', async () => {
      const registrationData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'weak'
      };
      
      mockAuthService.register.mockRejectedValueOnce(new Error('Password too weak'));
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(registrationData);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const loginData = {
        username: 'testuser',
        password: 'SecurePass123!'
      };
      
      const mockResult = {
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@example.com'
        },
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token'
      };
      
      mockAuthService.login.mockResolvedValueOnce(mockResult);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult
      });
    });
    
    it('should handle invalid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };
      
      mockAuthService.login.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Invalid credentials');
    });
  });
  
  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockResult = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };
      
      mockAuthService.refreshTokens.mockResolvedValueOnce(mockResult);
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'old_refresh_token' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult
      });
    });
    
    it('should require refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Refresh token required'
      });
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      mockAuthService.logout.mockResolvedValueOnce(undefined);
      
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'valid_token' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      });
      expect(mockAuthService.logout).toHaveBeenCalledWith('valid_token');
    });
  });
  
  describe('Protected routes', () => {
    describe('GET /api/auth/profile', () => {
      it('should return profile when authenticated', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer valid_token');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          data: {
            user: {
              id: 'test-user-id',
              userId: 'test-user-id',
              email: 'test@example.com',
              username: 'testuser',
              roles: ['user']
            }
          }
        });
      });
      
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/auth/profile');
        
        expect(response.status).toBe(401);
      });
    });
    
    describe('GET /api/auth/verify', () => {
      it('should verify token', async () => {
        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', 'Bearer valid_token');
        
        expect(response.status).toBe(200);
        expect(response.body.data.valid).toBe(true);
      });
    });
  });
});