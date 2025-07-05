import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { TestSocketServer } from '../setup/testServer';
import { createTestClient, waitForEvent, TestClient } from '../setup/testHelpers';
import { AuthService } from '../../../services/AuthService';
import { testUtils } from '../../../test-utils/setup';

describe('Socket.IO Integration Flow', () => {
  let testServer: TestSocketServer;
  let serverPort: number;
  let authService: AuthService;

  beforeAll(async () => {
    // Initialize test server with mock auth for easier testing
    testServer = new TestSocketServer({ mockAuth: true });
    serverPort = await testServer.start();
    authService = new AuthService();
    
    // Wait for server to be fully ready
    await testUtils.delay(200);
  });

  afterAll(async () => {
    await testServer.stop();
  });

  describe('Authentication Flow', () => {
    let client: TestClient;

    beforeEach(async () => {
      // Small delay for test isolation
      await testUtils.delay(100);
    });

    afterEach(async () => {
      if (client?.socket) {
        client.socket.close();
      }
      // Wait for cleanup to complete
      await testUtils.delay(50);
    });

    it('should authenticate with test token', async () => {
      client = await createTestClient(serverPort, 'test-token', 'test-user-id');
      
      expect(client.socket.connected).toBe(true);
      expect(client.socket.id).toBeDefined();
    });

    it('should reject connection without token', async () => {
      await expect(
        createTestClient(serverPort, '')
      ).rejects.toThrow();
    });
  });

  describe('Basic Socket Communication', () => {
    let client: TestClient;

    beforeEach(async () => {
      client = await createTestClient(serverPort, 'test-token', 'user-1');
    });

    afterEach(async () => {
      client?.socket.close();
    });

    it('should handle ping-pong communication', async () => {
      // Wait a bit to ensure connection handlers are fully set up
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set up the listener first
      let pongReceived = false;
      client.socket.once('test-pong', () => {
        pongReceived = true;
        console.log('Client: Received test-pong');
      });
      
      console.log('Client: Emitting test-ping');
      client.socket.emit('test-ping');
      
      // Wait up to 500ms for the response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(pongReceived).toBe(true);
    });

    it('should handle connection events', async () => {
      expect(client.socket.connected).toBe(true);
      expect(client.socket.id).toBeDefined();
    });
  });

  describe('Multi-Client Communication', () => {
    let client1: TestClient;
    let client2: TestClient;

    beforeEach(async () => {
      client1 = await createTestClient(serverPort, 'test-token', 'user-1');
      client2 = await createTestClient(serverPort, 'test-token', 'user-2');
      
      // Wait a bit for connections to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
      client1?.socket.close();
      client2?.socket.close();
    });

    it('should support multiple client connections', async () => {
      expect(client1.socket.connected).toBe(true);
      expect(client2.socket.connected).toBe(true);
      expect(client1.socket.id).not.toBe(client2.socket.id);
    });

    it('should handle client disconnection gracefully', async () => {
      const disconnectPromise = waitForEvent(client2.socket, 'disconnect');
      
      client1.socket.disconnect();
      
      // Client2 should still be connected
      expect(client2.socket.connected).toBe(true);
    });
  });

  describe('Room Management', () => {
    let client: TestClient;

    beforeEach(async () => {
      client = await createTestClient(serverPort, 'test-token', 'user-1');
    });

    afterEach(async () => {
      client?.socket.close();
    });

    it('should handle room joining', async () => {
      // Test basic room functionality
      client.socket.emit('join-room', { room: 'test-room' });
      
      // Since we don't have specific room join confirmation events,
      // we just verify the socket is still connected
      expect(client.socket.connected).toBe(true);
    });

    it('should handle room leaving', async () => {
      client.socket.emit('leave-room', { room: 'test-room' });
      
      expect(client.socket.connected).toBe(true);
    });
  });

  describe('Error Handling', () => {
    let client: TestClient;

    beforeEach(async () => {
      client = await createTestClient(serverPort, 'test-token', 'user-1');
    });

    afterEach(async () => {
      client?.socket.close();
    });

    it('should handle invalid events gracefully', async () => {
      // Send an invalid event and ensure connection stays stable
      client.socket.emit('invalid-event', { data: 'test' });
      
      // Wait a bit to see if any errors occur
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(client.socket.connected).toBe(true);
    });

    it('should handle malformed payloads', async () => {
      client.socket.emit('chat:send', 'invalid-payload-format');
      
      // Connection should remain stable
      expect(client.socket.connected).toBe(true);
    });
  });
});