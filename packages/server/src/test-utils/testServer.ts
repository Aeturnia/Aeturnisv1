/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import { createServer } from 'http';
import { createApp } from '../app';
import { checkDatabaseConnection } from '../database/config';
import type { Server } from 'http';
import type { Application } from 'express';

// Enhanced test server setup for reliable testing
export class TestServerManager {
  private server: Server | null = null;
  private app: Application | null = null;
  private baseUrl: string = '';

  async startTestServer(): Promise<{ server: Server; app: Application; baseUrl: string }> {
    // Ensure database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed - tests cannot proceed');
    }

    // Wait for database to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create Express app
    this.app = createApp();
    
    // Create HTTP server
    this.server = createServer(this.app);
    
    // Start server on random port for isolation
    await new Promise<void>((resolve, reject) => {
      this.server!.listen(0, '127.0.0.1', () => {
        const address = this.server!.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        this.baseUrl = `http://localhost:${port}`;
        console.log(`✅ Test server started on ${this.baseUrl}`);
        resolve();
      });
      
      this.server!.on('error', reject);
    });

    return {
      server: this.server,
      app: this.app,
      baseUrl: this.baseUrl,
    };
  }

  async stopTestServer(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => {
          console.log('✅ Test server closed');
          resolve();
        });
      });
      this.server = null;
      this.app = null;
      this.baseUrl = '';
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Enhanced test utilities for HTTP requests
export const testHttpUtils = {
  // Make authenticated HTTP request
  makeRequest: async (baseUrl: string, options: {
    method: string;
    path: string;
    body?: any;
    headers?: Record<string, string>;
  }) => {
    const url = `${baseUrl}${options.path}`;
    const requestOptions: RequestInit = {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestOptions);
    
    // Enhanced error logging
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`HTTP ${response.status} for ${options.method} ${options.path}:`, errorText);
    }

    return response;
  },

  // Wait for server readiness
  waitForServerReady: async (baseUrl: string, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error('Server failed to become ready');
  },

  // Enhanced timing utilities
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create unique test data
  createTestUser: () => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 100000);
    return {
      email: `test${timestamp}${randomId}@example.com`,
      username: `user${timestamp}${randomId}`.substring(0, 20),
      password: 'SecurePass123!',
    };
  },
};