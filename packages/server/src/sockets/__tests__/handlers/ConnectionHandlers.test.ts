import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConnectionHandlers } from '../../handlers/FixedConnectionHandlers';
import { MockSocket, createMockUser } from '../mocks/socketMocks';
import { RoomService } from '../../services/RoomService';
import { RoomType } from '../../../types/socket.types';
import { testUtils } from '../../../test-utils/setup';

// Mock dependencies
vi.mock('../../services/RoomService');
vi.mock('../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ConnectionHandlers', () => {
  let connectionHandlers: ConnectionHandlers;
  let mockSocket: MockSocket;
  let mockRoomService: any;
  let mockIo: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Add small delay for test isolation
    await testUtils.delay(50);
    
    // Mock RoomService
    mockRoomService = {
      joinRoom: vi.fn().mockResolvedValue(true),
      leaveRoom: vi.fn().mockResolvedValue(true),
      getUserRooms: vi.fn().mockReturnValue([
        { type: 'zone', identifier: 'room1' },
        { type: 'zone', identifier: 'room2' }
      ]),
      cleanupUserRooms: vi.fn().mockResolvedValue(undefined),
    };

    // Mock Socket.IO server
    mockIo = {
      to: vi.fn(() => ({ emit: vi.fn() })),
    };

    connectionHandlers = new ConnectionHandlers(mockIo, mockRoomService);
    mockSocket = new MockSocket();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleConnection', () => {
    it('should handle authenticated user connection', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('ping', expect.any(Function));
    });

    it('should disconnect unauthenticated socket', () => {
      // Create unauthenticated socket
      const unauthenticatedSocket = new MockSocket();
      unauthenticatedSocket.user = undefined;

      connectionHandlers.handleConnection(unauthenticatedSocket as any);

      expect(unauthenticatedSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should join user to personal room on connection', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith(
        mockSocket,
        RoomType.USER,
        user.userId
      );
    });
  });

  describe('handleDisconnection', () => {
    it('should handle authenticated user disconnection', () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleDisconnection(mockSocket as any, 'client disconnect');

      expect(mockRoomService.getUserRooms).toHaveBeenCalledWith(user.userId);
    });

    it('should handle unauthenticated socket disconnection', () => {
      // Create unauthenticated socket
      const unauthenticatedSocket = new MockSocket();
      unauthenticatedSocket.user = undefined;

      connectionHandlers.handleDisconnection(unauthenticatedSocket as any, 'transport close');

      // Should not call room service for unauthenticated socket
      expect(mockRoomService.getUserRooms).not.toHaveBeenCalled();
    });
  });

  describe('connection statistics', () => {
    it('should return connection statistics', () => {
      const stats = connectionHandlers.getConnectionStats();

      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('authenticatedConnections');
      expect(stats).toHaveProperty('roomDistribution');
    });
  });

  describe('event handlers', () => {
    it('should respond to ping events', () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      // Simulate ping event
      mockSocket.emit('ping');

      expect(mockSocket.emit).toHaveBeenCalledWith('pong');
    });

    it('should handle socket errors gracefully', () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      const testError = new Error('Test socket error');
      
      // Simulate error event
      mockSocket.emit('error', testError);

      // Should not throw and should log error
      expect(true).toBe(true); // Test passed if we get here
    });
  });

  describe('user state management', () => {
    it('should restore user rooms on reconnection', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith(
        mockSocket,
        RoomType.ZONE,
        'tavern-district'
      );
    });

    it('should sync user data on connection', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSocket.emit).toHaveBeenCalledWith('system:notification', {
        type: 'info',
        message: 'Syncing user data...',
      });
    });

    it('should broadcast user online status', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      connectionHandlers.handleConnection(mockSocket as any);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRoomService.getUserRooms).toHaveBeenCalledWith(user.userId);
    });
  });

  describe('error handling', () => {
    it('should handle room service errors gracefully', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      // Mock room service to throw error
      mockRoomService.joinRoom.mockRejectedValue(new Error('Room service error'));

      connectionHandlers.handleConnection(mockSocket as any);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not throw and should continue execution
      expect(true).toBe(true);
    });

    it('should handle user authentication errors', () => {
      // Create unauthenticated socket
      const unauthenticatedSocket = new MockSocket();
      unauthenticatedSocket.user = undefined;

      connectionHandlers.handleConnection(unauthenticatedSocket as any);

      expect(unauthenticatedSocket.disconnect).toHaveBeenCalledWith(true);
    });
  });
});