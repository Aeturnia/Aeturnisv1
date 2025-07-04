import { Server } from 'socket.io';
import { SocketWithAuth, requireAuth, ChatMessagePayload, TypingIndicatorPayload } from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { RealtimeService } from '../../services/RealtimeService';

interface ChatMessageData {
  type: 'zone' | 'guild' | 'party' | 'whisper';
  message: string;
  targetId?: string;
}

interface TypingData {
  type: 'zone' | 'guild' | 'party';
  isTyping: boolean;
}

interface WhisperData {
  targetUserId: string;
  message: string;
}

interface EmoteData {
  emote: string;
  targetId?: string;
}

export class ChatHandler {
  private realtimeService: RealtimeService;
  private rateLimitMap: Map<string, number> = new Map();
  private typingUsers: Map<string, { userId: string; timeout: NodeJS.Timeout }> = new Map();

  constructor(_io: Server, realtimeService: RealtimeService) {
    this.realtimeService = realtimeService;
  }

  // Set up chat event handlers for a socket
  public handleConnection(socket: SocketWithAuth): void {
    socket.on('chat:message', async (data: ChatMessageData) => {
      await this.handleSendMessage(socket, data);
    });

    socket.on('chat:typing', async (data: TypingData) => {
      await this.handleTypingIndicator(socket, data);
    });

    socket.on('chat:whisper', async (data: WhisperData) => {
      await this.handleWhisper(socket, data);
    });

    socket.on('chat:emote', async (data: EmoteData) => {
      await this.handleEmote(socket, data);
    });

    socket.on('disconnect', () => {
      this.cleanupTypingIndicators(socket);
    });
  }

  // Handle chat messages
  private async handleSendMessage(socket: SocketWithAuth, data: ChatMessageData): Promise<void> {
    try {
      const user = requireAuth(socket);
      
      // Validate input
      const validation = this.validateChatMessage(data);
      if (!validation.isValid) {
        socket.emit('chat:error', { message: validation.error });
        return;
      }

      // Check rate limit
      const rateLimitKey = `chat:${user.userId}`;
      if (!this.checkRateLimit(rateLimitKey, 1000)) {
        socket.emit('chat:error', { message: 'Sending messages too quickly' });
        return;
      }

      // Create message payload
      const messagePayload: ChatMessagePayload = {
        type: data.type,
        message: data.message,
        targetId: data.targetId,
        timestamp: Date.now(),
        sender: {
          userId: user.userId,
          username: user.username,
          characterName: user.characterId || user.username,
        },
      };

      // Broadcast based on message type
      await this.broadcastMessage(socket, messagePayload);

      // Log message
      logger.info('Chat message sent', {
        userId: user.userId,
        type: data.type,
        messageLength: data.message.length,
        targetId: data.targetId,
        service: 'chat-handler',
      });
    } catch (error) {
      logger.error('Chat message error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'chat-handler',
      });
      socket.emit('chat:error', { 
        message: error instanceof Error ? error.message : 'Failed to send message' 
      });
    }
  }

  // Handle typing indicators
  private async handleTypingIndicator(socket: SocketWithAuth, data: TypingData): Promise<void> {
    try {
      const user = requireAuth(socket);
      
      const typingPayload: TypingIndicatorPayload = {
        type: data.type,
        isTyping: data.isTyping,
        sender: {
          userId: user.userId,
          username: user.username,
        },
      };

      // Broadcast typing indicator
      await this.broadcastTypingIndicator(socket, typingPayload);

      // Manage typing timeout
      const typingKey = `${data.type}:${user.userId}`;
      if (data.isTyping) {
        // Set timeout to automatically clear typing indicator
        const timeout = setTimeout(() => {
          this.typingUsers.delete(typingKey);
          // Broadcast stop typing
          const stopTypingPayload = { ...typingPayload, isTyping: false };
          this.broadcastTypingIndicator(socket, stopTypingPayload);
        }, 3000);

        this.typingUsers.set(typingKey, { userId: user.userId, timeout });
      } else {
        // Clear existing timeout
        const existing = this.typingUsers.get(typingKey);
        if (existing) {
          clearTimeout(existing.timeout);
          this.typingUsers.delete(typingKey);
        }
      }
    } catch (error) {
      logger.error('Typing indicator error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'chat-handler',
      });
    }
  }

  // Handle whisper messages
  private async handleWhisper(socket: SocketWithAuth, data: WhisperData): Promise<void> {
    try {
      const user = requireAuth(socket);
      
      // Validate whisper data
      if (!data.targetUserId || !data.message) {
        socket.emit('chat:error', { message: 'Invalid whisper data' });
        return;
      }

      // Check rate limit
      const rateLimitKey = `whisper:${user.userId}`;
      if (!this.checkRateLimit(rateLimitKey, 2000)) {
        socket.emit('chat:error', { message: 'Sending whispers too quickly' });
        return;
      }

      // Create whisper payload
      const whisperPayload: ChatMessagePayload = {
        type: 'whisper',
        message: data.message,
        targetId: data.targetUserId,
        timestamp: Date.now(),
        sender: {
          userId: user.userId,
          username: user.username,
          characterName: user.characterId || user.username,
        },
      };

      // Send to target user
      this.realtimeService.emitToUser(data.targetUserId, 'chat:message', whisperPayload);
      
      // Send confirmation to sender
      socket.emit('chat:message', whisperPayload);

      logger.info('Whisper sent', {
        fromUserId: user.userId,
        toUserId: data.targetUserId,
        messageLength: data.message.length,
        service: 'chat-handler',
      });
    } catch (error) {
      logger.error('Whisper error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'chat-handler',
      });
      socket.emit('chat:error', { message: 'Failed to send whisper' });
    }
  }

  // Handle emotes
  private async handleEmote(socket: SocketWithAuth, data: EmoteData): Promise<void> {
    try {
      const user = requireAuth(socket);
      
      // Validate emote
      if (!this.validateEmote(data.emote)) {
        socket.emit('chat:error', { message: 'Invalid emote' });
        return;
      }

      // Create emote message
      const emoteMessage = data.targetId 
        ? `${user.username} ${data.emote} at ${data.targetId}`
        : `${user.username} ${data.emote}`;

      const emotePayload: ChatMessagePayload = {
        type: 'zone',
        message: emoteMessage,
        timestamp: Date.now(),
        sender: {
          userId: user.userId,
          username: user.username,
          characterName: user.characterId || user.username,
        },
      };

      // Broadcast emote to zone
      await this.broadcastMessage(socket, emotePayload);

      logger.debug('Emote performed', {
        userId: user.userId,
        emote: data.emote,
        targetId: data.targetId,
        service: 'chat-handler',
      });
    } catch (error) {
      logger.error('Emote error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'chat-handler',
      });
    }
  }

  // Broadcast message based on type
  private async broadcastMessage(socket: SocketWithAuth, payload: ChatMessagePayload): Promise<void> {
    const user = requireAuth(socket);
    
    switch (payload.type) {
      case 'zone':
        // Broadcast to current zone
        const currentZone = await this.getCurrentZone(user.userId);
        if (currentZone) {
          this.realtimeService.emitToZone(currentZone, 'chat:message', payload);
        }
        break;
        
      case 'guild':
        // Broadcast to guild
        const guildId = await this.getUserGuild(user.userId);
        if (guildId) {
          this.realtimeService.emitToGuild(guildId, 'chat:message', payload);
        } else {
          socket.emit('chat:error', { message: 'You are not in a guild' });
        }
        break;
        
      case 'party':
        // Broadcast to party
        const partyId = await this.getUserParty(user.userId);
        if (partyId) {
          this.realtimeService.emitToParty(partyId, 'chat:message', payload);
        } else {
          socket.emit('chat:error', { message: 'You are not in a party' });
        }
        break;
        
      case 'whisper':
        // Handled separately in handleWhisper
        break;
    }
  }

  // Broadcast typing indicator
  private async broadcastTypingIndicator(socket: SocketWithAuth, payload: TypingIndicatorPayload): Promise<void> {
    const user = requireAuth(socket);
    
    switch (payload.type) {
      case 'zone':
        const currentZone = await this.getCurrentZone(user.userId);
        if (currentZone) {
          this.realtimeService.emitToZone(currentZone, 'chat:typing', payload, user.userId);
        }
        break;
        
      case 'guild':
        const guildId = await this.getUserGuild(user.userId);
        if (guildId) {
          this.realtimeService.emitToGuild(guildId, 'chat:typing', payload, user.userId);
        }
        break;
        
      case 'party':
        const partyId = await this.getUserParty(user.userId);
        if (partyId) {
          this.realtimeService.emitToParty(partyId, 'chat:typing', payload, user.userId);
        }
        break;
    }
  }

  // Validate chat message
  private validateChatMessage(data: ChatMessageData): { isValid: boolean; error?: string } {
    if (!data.message || typeof data.message !== 'string') {
      return { isValid: false, error: 'Message is required' };
    }

    if (data.message.length > 500) {
      return { isValid: false, error: 'Message too long (max 500 characters)' };
    }

    if (data.message.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    // Basic profanity filter
    if (!this.validateContent(data.message)) {
      return { isValid: false, error: 'Message contains inappropriate content' };
    }

    return { isValid: true };
  }

  // Basic content validation (profanity filter)
  private validateContent(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const forbiddenWords = ['spam', 'hack', 'cheat']; // Basic list
    
    return !forbiddenWords.some(word => lowerMessage.includes(word));
  }

  // Validate emote
  private validateEmote(emote: string): boolean {
    // Basic emoji validation - simplified for compatibility
    return emote.length >= 1 && emote.length <= 10;
  }

  // Rate limiting check
  private checkRateLimit(key: string, cooldownMs: number): boolean {
    const now = Date.now();
    const lastAction = this.rateLimitMap.get(key);
    
    if (lastAction && (now - lastAction) < cooldownMs) {
      return false;
    }
    
    this.rateLimitMap.set(key, now);
    return true;
  }

  // Clean up typing indicators on disconnect
  public cleanupTypingIndicators(socket: SocketWithAuth): void {
    if (!socket.user) return;
    
    const userId = socket.user.userId;
    for (const [key, typing] of this.typingUsers.entries()) {
      if (typing.userId === userId) {
        clearTimeout(typing.timeout);
        this.typingUsers.delete(key);
      }
    }
  }

  // Helper methods (TODO: Implement with actual data sources)
  private async getCurrentZone(_userId: string): Promise<string | null> {
    // TODO: Get user's current zone from database
    return 'tavern-district'; // Default zone
  }

  private async getUserGuild(_userId: string): Promise<string | null> {
    // TODO: Get user's guild from database
    return null;
  }

  private async getUserParty(_userId: string): Promise<string | null> {
    // TODO: Get user's party from database
    return null;
  }
}