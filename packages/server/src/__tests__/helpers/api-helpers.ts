/**
 * API test helpers for making authenticated requests
 */
import request from 'supertest';
import { Express } from 'express';
import { expect } from 'vitest';
import { AuthService } from '../../services/AuthService';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Create an authenticated test user
 */
export async function createAuthenticatedUser(
  authService: AuthService,
  overrides?: { email?: string; username?: string; password?: string }
): Promise<TestUser> {
  const userData = {
    email: overrides?.email || `test${Date.now()}@example.com`,
    username: overrides?.username || `user${Date.now()}`,
    password: overrides?.password || 'TestPassword123!'
  };
  
  const result = await authService.register(userData);
  
  return {
    id: result.user.id,
    email: result.user.email,
    username: result.user.username,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  };
}

/**
 * Helper class for making authenticated API requests
 */
export class ApiHelper {
  constructor(
    private app: Express,
    private authToken?: string
  ) {}
  
  /**
   * Set authentication token
   */
  setAuth(token: string): void {
    this.authToken = token;
  }
  
  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.authToken = undefined;
  }
  
  /**
   * Make GET request
   */
  get(url: string) {
    const req = request(this.app).get(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    return req;
  }
  
  /**
   * Make POST request
   */
  post(url: string, data?: any) {
    const req = request(this.app).post(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    if (data) {
      req.send(data);
    }
    return req;
  }
  
  /**
   * Make PUT request
   */
  put(url: string, data?: any) {
    const req = request(this.app).put(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    if (data) {
      req.send(data);
    }
    return req;
  }
  
  /**
   * Make PATCH request
   */
  patch(url: string, data?: any) {
    const req = request(this.app).patch(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    if (data) {
      req.send(data);
    }
    return req;
  }
  
  /**
   * Make DELETE request
   */
  delete(url: string) {
    const req = request(this.app).delete(url);
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    return req;
  }
}

/**
 * Create API helper with authentication
 */
export async function createApiHelper(
  app: Express,
  authService: AuthService
): Promise<{ apiHelper: ApiHelper; testUser: TestUser }> {
  const testUser = await createAuthenticatedUser(authService);
  const apiHelper = new ApiHelper(app, testUser.accessToken);
  
  return { apiHelper, testUser };
}

/**
 * Expect API error response
 */
export function expectApiError(
  response: request.Response,
  statusCode: number,
  errorMessage?: string
): void {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('error');
  
  if (errorMessage) {
    expect(response.body.error).toContain(errorMessage);
  }
}

/**
 * Expect successful API response
 */
export function expectApiSuccess(
  response: request.Response,
  statusCode: number = 200
): void {
  expect(response.status).toBe(statusCode);
  expect(response.body).not.toHaveProperty('error');
}

/**
 * Expect paginated response
 */
export function expectPaginatedResponse(
  response: request.Response,
  expectedFields: string[] = []
): void {
  expectApiSuccess(response);
  
  // Check pagination metadata
  expect(response.body).toHaveProperty('data');
  expect(response.body).toHaveProperty('pagination');
  expect(response.body.pagination).toHaveProperty('page');
  expect(response.body.pagination).toHaveProperty('limit');
  expect(response.body.pagination).toHaveProperty('total');
  expect(response.body.pagination).toHaveProperty('totalPages');
  
  // Check data is array
  expect(Array.isArray(response.body.data)).toBe(true);
  
  // Check expected fields if data exists
  if (response.body.data.length > 0 && expectedFields.length > 0) {
    const item = response.body.data[0];
    expectedFields.forEach(field => {
      expect(item).toHaveProperty(field);
    });
  }
}

/**
 * Wait for async operation with timeout
 */
export async function waitForAsync(
  fn: () => Promise<boolean> | boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const start = Date.now();
  
  while (true) {
    const result = await fn();
    if (result) return;
    
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}