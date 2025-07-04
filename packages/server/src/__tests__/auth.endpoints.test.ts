import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { createApp } from '../app';
import { checkDatabaseConnection } from '../database/config';
import type { Server } from 'http';
import type { Application } from 'express';

// Helper to wait between tests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Endpoint Integration Tests
describe('Authentication API Endpoints', () => {
  let app: Application;
  let server: Server;
  let baseUrl: string;
  let testUser: { email: string; username: string; password: string };

  beforeAll(async () => {
    // Ensure database connection is established before tests
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed - tests cannot proceed');
    }
    
    // Wait a bit for database to be fully ready
    await delay(1000);
    
    // Create Express app
    app = createApp();
    
    // Create HTTP server
    server = createServer(app);
    
    // Start server on random port
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server started on ${baseUrl}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Close server
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  });

  beforeEach(async () => {
    // Wait longer between tests to avoid timing issues in full test suite
    await delay(500);
    
    // Create unique test user for each test with timestamp to ensure uniqueness
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 100000);
    testUser = {
      email: `test${timestamp}${randomId}@example.com`,
      username: `user${timestamp}${randomId}`.substring(0, 20), // Ensure max 20 chars
      password: 'SecurePass123!', // Has uppercase, lowercase, number, and special char
    };
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
      console.error('Registration before login failed:', registerResponse.status, errorData);
    }
    expect(registerResponse.status).toBe(201);

    // Wait longer to ensure database writes are complete in full test suite
    await delay(500);

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
      console.error('Login failed:', response.status, errorData);
      console.error('Login payload was:', { 
        emailOrUsername: testUser.email, 
        password: testUser.password.substring(0, 3) + '...' 
      });
    } else {
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