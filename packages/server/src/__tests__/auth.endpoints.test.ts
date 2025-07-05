import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { TestServerManager, testHttpUtils } from '../test-utils/testServer';

// API Endpoint Integration Tests
describe('Authentication API Endpoints', () => {
  let testServerManager: TestServerManager;
  let baseUrl: string;
  let testUser: { email: string; username: string; password: string };

  beforeAll(async () => {
    testServerManager = new TestServerManager();
    const serverInfo = await testServerManager.startTestServer();
    
    baseUrl = serverInfo.baseUrl;
    
    // Wait for server to be fully ready
    await testHttpUtils.waitForServerReady(baseUrl);
  });

  afterAll(async () => {
    await testServerManager.stopTestServer();
  });

  beforeEach(async () => {
    // Clear any previous mocks
    vi.clearAllMocks();
    
    // Enhanced timing management for test isolation
    await testHttpUtils.delay(1000);
    
    // Create unique test user for each test
    testUser = testHttpUtils.createTestUser();
    
    // Wait for server stability
    await testHttpUtils.delay(500);
  });

  it('should register a new user successfully', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    // Log response for debugging
    if (response.status !== 201) {
      const errorData = await response.json();
      // eslint-disable-next-line no-console
      console.error('Registration failed:', response.status, errorData);
    }

    expect(response.status).toBe(201);
    const data = await response.json();
    
    expect(data).toHaveProperty('success', true);
    expect(data.data).toHaveProperty('user');
    expect(data.data).toHaveProperty('accessToken');
    expect(data.data).toHaveProperty('refreshToken');
    expect(data.data.user.email).toBe(testUser.email);
    expect(data.data.user.username).toBe(testUser.username);
    expect(data.data.user).not.toHaveProperty('password_hash');
  });

  it('should login successfully', async () => {
    // First register the user
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    // Ensure registration succeeded
    if (registerResponse.status !== 201) {
      const errorData = await registerResponse.json();
      // eslint-disable-next-line no-console
      console.error('Registration before login failed:', registerResponse.status, errorData);
    }
    expect(registerResponse.status).toBe(201);

    // Enhanced wait to ensure database writes are complete in full test suite
    await testHttpUtils.delay(1500);

    // Now login
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: testUser.email,
        password: testUser.password,
      }),
    });

    // Log response for debugging
    if (response.status !== 200) {
      const errorData = await response.json();
      // eslint-disable-next-line no-console
      console.error('Login failed:', response.status, errorData);
      // eslint-disable-next-line no-console
      console.error('Login payload was:', { 
        emailOrUsername: testUser.email, 
        password: testUser.password.substring(0, 3) + '...' 
      });
    } else {
      // eslint-disable-next-line no-console
      console.log('Login successful with status:', response.status);
    }

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty('success', true);
    expect(data.data).toHaveProperty('user');
    expect(data.data).toHaveProperty('accessToken');
    expect(data.data).toHaveProperty('refreshToken');
  });

  it('should handle validation errors', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        username: 'ab',
        password: 'weak',
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
  });

  it('should handle unauthorized access', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: 'nonexistent@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
  });

  it('should return server health status', async () => {
    const response = await fetch(`${baseUrl}/health`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('timestamp');
  });
});