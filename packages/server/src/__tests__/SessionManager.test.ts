import { SessionManager } from '../services/SessionManager';
import { CacheService } from '../services/CacheService';
import { Session, SessionMetadata } from '../types/session.types';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock CacheService
vi.mock('../services/CacheService');

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockCacheService: any;

  beforeEach(() => {
    // Create mock CacheService
    mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      ttl: vi.fn(),
      exists: vi.fn(),
      disconnect: vi.fn()
    };
    
    sessionManager = new SessionManager(mockCacheService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    test('should create and store session', async () => {
      const userId = 'user123';
      const metadata: SessionMetadata = {
        platform: 'ios',
        deviceId: 'device123',
        gameVersion: '1.0.0'
      };

      mockCacheService.get.mockResolvedValue([]); // Empty user sessions array
      mockCacheService.set.mockResolvedValue(undefined);

      const sessionId = await sessionManager.createSession(userId, metadata);

      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      
      // Verify session was stored
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.objectContaining({
          sessionId,
          userId,
          metadata,
          createdAt: expect.any(String),
          lastActive: expect.any(String),
          expiresAt: expect.any(String)
        }),
        30 * 24 * 60 * 60 // 30 days TTL
      );
      
      // Verify user sessions were updated
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `user:${userId}:sessions`,
        [sessionId],
        30 * 24 * 60 * 60
      );
    });

    test('should add to existing user sessions', async () => {
      const userId = 'user456';
      const metadata: SessionMetadata = { platform: 'web' };
      const existingSessions = ['session1', 'session2'];

      mockCacheService.get.mockResolvedValue(existingSessions);
      mockCacheService.set.mockResolvedValue(undefined);

      const sessionId = await sessionManager.createSession(userId, metadata);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        `user:${userId}:sessions`,
        [...existingSessions, sessionId],
        30 * 24 * 60 * 60
      );
    });
  });

  describe('getSession', () => {
    test('should return valid session', async () => {
      const sessionId = 'session123';
      const mockSession: Session = {
        sessionId,
        userId: 'user123',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        metadata: { platform: 'web' }
      };

      mockCacheService.get.mockResolvedValue(mockSession);

      const result = await sessionManager.getSession(sessionId);

      expect(result).toEqual(mockSession);
      expect(mockCacheService.get).toHaveBeenCalledWith(`session:${sessionId}`);
    });

    test('should return null for non-existent session', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const result = await sessionManager.getSession('nonexistent');

      expect(result).toBeNull();
    });

    test('should destroy expired session and return null', async () => {
      const sessionId = 'expired123';
      const expiredSession: Session = {
        sessionId,
        userId: 'user123',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired 24 hours ago
        metadata: { platform: 'web' }
      };

      mockCacheService.get.mockResolvedValueOnce(expiredSession).mockResolvedValueOnce(null);
      mockCacheService.delete.mockResolvedValue(undefined);

      const result = await sessionManager.getSession(sessionId);

      expect(result).toBeNull();
      expect(mockCacheService.delete).toHaveBeenCalledWith(`session:${sessionId}`);
    });
  });

  describe('updateSession', () => {
    test('should update existing session', async () => {
      const sessionId = 'session456';
      const existingSession: Session = {
        sessionId,
        userId: 'user456',
        createdAt: '2025-01-01T00:00:00Z',
        lastActive: '2025-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: { platform: 'web' }
      };

      const updateData = { metadata: { platform: 'ios' as const } };

      mockCacheService.get.mockResolvedValue(existingSession);
      mockCacheService.set.mockResolvedValue(undefined);

      await sessionManager.updateSession(sessionId, updateData);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.objectContaining({
          ...existingSession,
          ...updateData,
          lastActive: expect.any(String)
        }),
        30 * 24 * 60 * 60
      );
    });

    test('should throw error for non-existent session', async () => {
      mockCacheService.get.mockResolvedValue(null);

      await expect(sessionManager.updateSession('nonexistent', {}))
        .rejects.toThrow('Session not found');
    });
  });

  describe('extendSession', () => {
    test('should extend session expiry', async () => {
      const sessionId = 'session789';
      const existingSession: Session = {
        sessionId,
        userId: 'user789',
        createdAt: '2025-01-01T00:00:00Z',
        lastActive: '2025-01-01T00:00:00Z',
        expiresAt: '2025-01-02T00:00:00Z',
        metadata: { platform: 'web' }
      };

      mockCacheService.get.mockResolvedValue(existingSession);
      mockCacheService.set.mockResolvedValue(undefined);

      await sessionManager.extendSession(sessionId);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.objectContaining({
          lastActive: expect.any(String),
          expiresAt: expect.any(String)
        }),
        30 * 24 * 60 * 60
      );
    });

    test('should throw error for non-existent session', async () => {
      mockCacheService.get.mockResolvedValue(null);

      await expect(sessionManager.extendSession('nonexistent'))
        .rejects.toThrow('Session not found');
    });
  });

  describe('destroySession', () => {
    test('should destroy session and remove from user sessions', async () => {
      const sessionId = 'session999';
      const userId = 'user999';
      const session: Session = {
        sessionId,
        userId,
        createdAt: '2025-01-01T00:00:00Z',
        lastActive: '2025-01-01T00:00:00Z',
        expiresAt: '2025-01-02T00:00:00Z',
        metadata: { platform: 'web' }
      };

      const userSessions = ['session888', sessionId, 'session777'];

      mockCacheService.get
        .mockResolvedValueOnce(session) // First call to get session
        .mockResolvedValueOnce(userSessions); // Second call to get user sessions
      mockCacheService.delete.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);

      await sessionManager.destroySession(sessionId);

      expect(mockCacheService.delete).toHaveBeenCalledWith(`session:${sessionId}`);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `user:${userId}:sessions`,
        ['session888', 'session777'],
        30 * 24 * 60 * 60
      );
    });

    test('should delete user sessions key if no sessions remain', async () => {
      const sessionId = 'session999';
      const userId = 'user999';
      const session: Session = {
        sessionId,
        userId,
        createdAt: '2025-01-01T00:00:00Z',
        lastActive: '2025-01-01T00:00:00Z',
        expiresAt: '2025-01-02T00:00:00Z',
        metadata: { platform: 'web' }
      };

      const userSessions = [sessionId]; // Only one session

      mockCacheService.get
        .mockResolvedValueOnce(session)
        .mockResolvedValueOnce(userSessions);
      mockCacheService.delete.mockResolvedValue(undefined);

      await sessionManager.destroySession(sessionId);

      expect(mockCacheService.delete).toHaveBeenCalledWith(`session:${sessionId}`);
      expect(mockCacheService.delete).toHaveBeenCalledWith(`user:${userId}:sessions`);
    });

    test('should handle non-existent session gracefully', async () => {
      mockCacheService.get.mockResolvedValue(null);

      await expect(sessionManager.destroySession('nonexistent'))
        .resolves.not.toThrow();
    });
  });

  describe('getUserSessions', () => {
    test('should return all valid user sessions', async () => {
      const userId = 'user123';
      const sessionIds = ['session1', 'session2', 'session3'];
      const sessions: Session[] = sessionIds.map(id => ({
        sessionId: id,
        userId,
        createdAt: '2025-01-01T00:00:00Z',
        lastActive: '2025-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: { platform: 'web' }
      }));

      mockCacheService.get
        .mockResolvedValueOnce(sessionIds) // User sessions list
        .mockResolvedValueOnce(sessions[0]) // First session
        .mockResolvedValueOnce(sessions[1]) // Second session
        .mockResolvedValueOnce(sessions[2]); // Third session

      const result = await sessionManager.getUserSessions(userId);

      expect(result).toEqual(sessions);
      expect(mockCacheService.get).toHaveBeenCalledWith(`user:${userId}:sessions`);
    });

    test('should filter out null sessions', async () => {
      const userId = 'user456';
      const sessionIds = ['session1', 'session2', 'session3'];
      const validSession: Session = {
        sessionId: 'session1',
        userId,
        createdAt: '2025-01-01T00:00:00Z',
        lastActive: '2025-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: { platform: 'web' }
      };

      mockCacheService.get
        .mockResolvedValueOnce(sessionIds)
        .mockResolvedValueOnce(validSession) // Valid session
        .mockResolvedValueOnce(null) // Expired/invalid session
        .mockResolvedValueOnce(null); // Another expired/invalid session

      const result = await sessionManager.getUserSessions(userId);

      expect(result).toEqual([validSession]);
    });

    test('should return empty array for user with no sessions', async () => {
      mockCacheService.get.mockResolvedValue([]);

      const result = await sessionManager.getUserSessions('user_no_sessions');

      expect(result).toEqual([]);
    });
  });
});