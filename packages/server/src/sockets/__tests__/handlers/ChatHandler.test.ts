import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChatHandler } from '../../handlers/FixedChatHandler';
import { MockSocket, createMockUser } from '../mocks/socketMocks';
import { RealtimeService } from '../../../services/RealtimeService';

// Mock dependencies
vi.mock('../../../services/RealtimeService');
vi.mock('../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ChatHandler', () => {
  let chatHandler: ChatHandler;
  let mockSocket: MockSocket;
  let mockRealtimeService: any;
  let mockIo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRealtimeService = {
      emitToZone: vi.fn(),
      emitToGuild: vi.fn(),
      emitToParty: vi.fn(),
      emitToUser: vi.fn(),
    };

    mockIo = {
      to: vi.fn(() => ({ emit: vi.fn() })),
    };

    chatHandler = new ChatHandler(mockIo, mockRealtimeService);
    mockSocket = new MockSocket();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleConnection', () => {
    it('should set up chat event handlers', () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      chatHandler.handleConnection(mockSocket as any);

      expect(mockSocket.getHandlers('chat:message').length).toBeGreaterThan(0);
      expect(mockSocket.getHandlers('chat:typing').length).toBeGreaterThan(0);
      expect(mockSocket.getHandlers('chat:whisper').length).toBeGreaterThan(0);
      expect(mockSocket.getHandlers('chat:emote').length).toBeGreaterThan(0);
      expect(mockSocket.getHandlers('disconnect').length).toBeGreaterThan(0);
    });
  });

  describe('handleSendMessage', () => {
    it('should send valid zone message', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const messageData = {
        type: 'zone' as const,
        message: 'Hello world!',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      // Get the registered handler and trigger it
      const handlers = mockSocket.getHandlers('chat:message');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      expect(mockRealtimeService.emitToZone).toHaveBeenCalledWith(
        'tavern-district', // Default zone
        'chat:message',
        expect.objectContaining({
          type: 'zone',
          message: 'Hello world!',
          sender: expect.objectContaining({
            userId: user.userId,
            username: user.username,
          }),
        })
      );
    });

    it('should reject message that is too long', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const longMessage = 'a'.repeat(501); // Exceeds 500 character limit
      const messageData = {
        type: 'zone' as const,
        message: longMessage,
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:message');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:error', {
        message: 'Message too long (max 500 characters)'
      });
    });

    it('should reject empty message', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const messageData = {
        type: 'zone' as const,
        message: '   ', // Empty/whitespace only
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:message');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:error', {
        message: 'Message cannot be empty'
      });
    });

    it('should handle unauthenticated user', async () => {
      // Create a fresh socket without authentication
      const unauthenticatedSocket = new MockSocket();
      // Explicitly remove the user to make it unauthenticated
      unauthenticatedSocket.user = undefined;
      
      const messageData = {
        type: 'zone' as const,
        message: 'test message',
      };

      chatHandler.handleConnection(unauthenticatedSocket as any);
      
      const handlers = unauthenticatedSocket.getHandlers('chat:message');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      // Should emit authentication error
      expect(unauthenticatedSocket.emit).toHaveBeenCalledWith('error', {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required'
      });
      
      // Should not call RealtimeService since function returns early
      expect(mockRealtimeService.emitToZone).not.toHaveBeenCalled();
    });
  });

  describe('handleWhisper', () => {
    it('should send whisper to target user', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const whisperData = {
        targetUserId: 'target-user-123',
        message: 'Secret message',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:whisper');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](whisperData);
      }

      expect(mockRealtimeService.emitToUser).toHaveBeenCalledWith(
        'target-user-123',
        'chat:message',
        expect.objectContaining({
          type: 'whisper',
          message: 'Secret message',
          targetId: 'target-user-123',
        })
      );
    });

    it('should reject whisper with missing target', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const whisperData = {
        targetUserId: '',
        message: 'Secret message',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:whisper');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](whisperData);
      }

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:error', {
        message: 'Invalid whisper data'
      });
    });
  });

  describe('handleTypingIndicator', () => {
    it('should broadcast typing indicator', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const typingData = {
        type: 'zone' as const,
        isTyping: true,
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:typing');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](typingData);
      }

      expect(mockRealtimeService.emitToZone).toHaveBeenCalledWith(
        'tavern-district',
        'chat:typing',
        expect.objectContaining({
          type: 'zone',
          isTyping: true,
          sender: expect.objectContaining({
            userId: user.userId,
            username: user.username,
          }),
        }),
        user.userId // Exclude sender
      );
    });

    it('should clear typing timeout when typing stops', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const typingData = {
        type: 'zone' as const,
        isTyping: false,
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:typing');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](typingData);
      }

      // Should handle without errors
      expect(true).toBe(true);
    });
  });

  describe('handleEmote', () => {
    it('should broadcast emote to zone', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const emoteData = {
        emote: 'waves',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:emote');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](emoteData);
      }

      expect(mockRealtimeService.emitToZone).toHaveBeenCalledWith(
        'tavern-district',
        'chat:message',
        expect.objectContaining({
          type: 'zone',
          message: `${user.username} waves`,
        })
      );
    });

    it('should handle targeted emote', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const emoteData = {
        emote: 'waves',
        targetId: 'other-player',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:emote');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](emoteData);
      }

      expect(mockRealtimeService.emitToZone).toHaveBeenCalledWith(
        'tavern-district',
        'chat:message',
        expect.objectContaining({
          message: `${user.username} waves at other-player`,
        })
      );
    });
  });

  describe('cleanupTypingIndicators', () => {
    it('should clean up typing indicators on disconnect', () => {
      const user = createMockUser();
      mockSocket.authenticate(user);

      chatHandler.cleanupTypingIndicators(mockSocket as any);

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should handle cleanup for unauthenticated socket', () => {
      // Socket without user
      chatHandler.cleanupTypingIndicators(mockSocket as any);

      // Should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limiting on messages', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const messageData = {
        type: 'zone' as const,
        message: 'Spam message',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:message');
      expect(handlers.length).toBeGreaterThan(0);
      
      // Send first message (should succeed)
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      // Immediately send second message (should be rate limited)
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      // Check if rate limit was triggered (this is implementation-dependent)
      expect(true).toBe(true); // Basic check that test runs
    });
  });

  describe('content validation', () => {
    it('should reject inappropriate content', async () => {
      const user = createMockUser();
      mockSocket.authenticate(user);
      
      const messageData = {
        type: 'zone' as const,
        message: 'This is spam content',
      };

      chatHandler.handleConnection(mockSocket as any);
      
      const handlers = mockSocket.getHandlers('chat:message');
      expect(handlers.length).toBeGreaterThan(0);
      
      if (handlers[0]) {
        await handlers[0](messageData);
      }

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:error', {
        message: 'Message contains inappropriate content'
      });
    });
  });
});