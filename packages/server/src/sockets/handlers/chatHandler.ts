import { Server } from 'socket.io';
import { SocketWithAuth, ChatMessagePayload, TypingIndicatorPayload, RoomType } from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { RoomService } from '../services/RoomService';
import { isAuthenticated } from '../middleware/authMiddleware';

export class ChatHandler {
  private io: Server;
  private roomService: RoomService;
  private typingUsers: Map<string, { userId: string; roomId: string; timeout: NodeJS.Timeout }>;
  private messageCooldowns: Map<string, number>;
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds
  private readonly MESSAGE_COOLDOWN = 1000; // 1 second between messages
  private readonly MAX_MESSAGE_LENGTH = 500;

  constructor(io: Server, roomService: RoomService) {
    this.io = io;
    this.roomService = roomService;
    this.typingUsers = new Map();
    this.messageCooldowns = new Map();
  }

  // Handle chat message
  public handleChatMessage(socket: SocketWithAuth, payload: Omit<ChatMessagePayload, 'timestamp' | 'sender'>): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, email, characterId } = socket.user;

    // Rate limiting
    if (this.isOnCooldown(userId)) {
      socket.emit('system:notification', {
        type: 'warning',
        message: 'Please wait before sending another message',
      });
      return;
    }

    // Validate message
    if (!this.validateMessage(payload.message)) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Invalid message content',
      });
      return;
    }

    // Create message payload
    const messagePayload: ChatMessagePayload = {
      ...payload,
      timestamp: Date.now(),
      sender: {
        userId,
        username: email.split('@')[0], // Use email prefix as username
        characterName: characterId ? `Character-${characterId}` : undefined,
      },
    };

    // Apply message cooldown
    this.applyCooldown(userId);

    // Route message based on type
    switch (payload.type) {
      case 'zone':
        this.handleZoneMessage(socket, messagePayload);
        break;
      case 'guild':
        this.handleGuildMessage(socket, messagePayload);
        break;
      case 'party':
        this.handlePartyMessage(socket, messagePayload);
        break;
      case 'whisper':
        this.handleWhisperMessage(socket, messagePayload);
        break;
      default:
        socket.emit('system:notification', {
          type: 'error',
          message: 'Unknown message type',
        });
    }

    // Log message
    logger.info('Chat message sent', {
      userId,
      messageType: payload.type,
      targetId: payload.targetId,
      messageLength: payload.message.length,
      service: 'chat-handler',
    });
  }

  // Handle typing indicator
  public handleTypingIndicator(socket: SocketWithAuth, payload: Omit<TypingIndicatorPayload, 'sender'>): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, email } = socket.user;

    const typingPayload: TypingIndicatorPayload = {
      ...payload,
      sender: {
        userId,
        username: email.split('@')[0],
      },
    };

    // Clear previous typing timeout
    const typingKey = `${userId}-${payload.type}`;
    const existingTyping = this.typingUsers.get(typingKey);
    if (existingTyping) {
      clearTimeout(existingTyping.timeout);
    }

    if (payload.isTyping) {
      // Set typing timeout
      const timeout = setTimeout(() => {
        this.stopTyping(socket, payload.type);
      }, this.TYPING_TIMEOUT);

      this.typingUsers.set(typingKey, {
        userId,
        roomId: payload.type,
        timeout,
      });

      // Broadcast typing indicator
      this.broadcastTypingIndicator(socket, typingPayload);
    } else {
      // User stopped typing
      this.typingUsers.delete(typingKey);
      this.broadcastTypingIndicator(socket, typingPayload);
    }
  }

  // Handle emoji reaction
  public handleEmojiReaction(socket: SocketWithAuth, payload: { messageId: string; emoji: string }): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId } = socket.user;

    // Validate emoji
    if (!this.validateEmoji(payload.emoji)) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Invalid emoji',
      });
      return;
    }

    // TODO: Store emoji reaction in database
    // For now, just broadcast to relevant rooms

    logger.info('Emoji reaction added', {
      userId,
      messageId: payload.messageId,
      emoji: payload.emoji,
      service: 'chat-handler',
    });
  }

  // Handle zone message
  private handleZoneMessage(socket: SocketWithAuth, payload: ChatMessagePayload): void {
    // Get user's current zone (default to tavern-district)
    const zoneId = 'tavern-district'; // TODO: Get from user's current location
    
    // Check if user is in the zone room
    const members = this.roomService.getRoomMembers(RoomType.ZONE, zoneId);
    const isInZone = members.some(member => member.userId === socket.user.userId);
    
    if (!isInZone) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'You are not in this zone',
      });
      return;
    }

    // Broadcast to zone
    this.roomService.broadcastToRoom(RoomType.ZONE, zoneId, 'chat:message', payload);
  }

  // Handle guild message
  private handleGuildMessage(socket: SocketWithAuth, payload: ChatMessagePayload): void {
    // TODO: Get user's guild ID
    const guildId = 'default-guild'; // Placeholder
    
    // Check guild membership
    // TODO: Implement guild membership validation
    
    // Broadcast to guild
    this.roomService.broadcastToRoom(RoomType.GUILD, guildId, 'chat:message', payload);
  }

  // Handle party message
  private handlePartyMessage(socket: SocketWithAuth, payload: ChatMessagePayload): void {
    // TODO: Get user's party ID
    const partyId = 'default-party'; // Placeholder
    
    // Check party membership
    // TODO: Implement party membership validation
    
    // Broadcast to party
    this.roomService.broadcastToRoom(RoomType.PARTY, partyId, 'chat:message', payload);
  }

  // Handle whisper message
  private handleWhisperMessage(socket: SocketWithAuth, payload: ChatMessagePayload): void {
    if (!payload.targetId) {
      socket.emit('system:notification', {
        type: 'error',
        message: 'Whisper target not specified',
      });
      return;
    }

    // Send to target user's private room
    this.roomService.broadcastToRoom(RoomType.USER, payload.targetId, 'chat:message', payload);
    
    // Send confirmation to sender
    socket.emit('chat:message', {
      ...payload,
      sender: {
        ...payload.sender,
        username: `[To ${payload.targetId}] ${payload.sender.username}`,
      },
    });
  }

  // Stop typing for a user
  private stopTyping(socket: SocketWithAuth, type: 'zone' | 'guild' | 'party'): void {
    if (!isAuthenticated(socket)) {
      return;
    }

    const { userId, email } = socket.user;

    const typingPayload: TypingIndicatorPayload = {
      type,
      isTyping: false,
      sender: {
        userId,
        username: email.split('@')[0],
      },
    };

    this.broadcastTypingIndicator(socket, typingPayload);
  }

  // Broadcast typing indicator
  private broadcastTypingIndicator(socket: SocketWithAuth, payload: TypingIndicatorPayload): void {
    switch (payload.type) {
      case 'zone':
        const zoneId = 'tavern-district'; // TODO: Get from user's current location
        this.roomService.broadcastToRoom(RoomType.ZONE, zoneId, 'chat:typing', payload, payload.sender.userId);
        break;
      case 'guild':
        const guildId = 'default-guild'; // TODO: Get user's guild ID
        this.roomService.broadcastToRoom(RoomType.GUILD, guildId, 'chat:typing', payload, payload.sender.userId);
        break;
      case 'party':
        const partyId = 'default-party'; // TODO: Get user's party ID
        this.roomService.broadcastToRoom(RoomType.PARTY, partyId, 'chat:typing', payload, payload.sender.userId);
        break;
    }
  }

  // Check if user is on message cooldown
  private isOnCooldown(userId: string): boolean {
    const lastMessage = this.messageCooldowns.get(userId);
    if (!lastMessage) {
      return false;
    }
    return Date.now() - lastMessage < this.MESSAGE_COOLDOWN;
  }

  // Apply message cooldown
  private applyCooldown(userId: string): void {
    this.messageCooldowns.set(userId, Date.now());
  }

  // Validate message content
  private validateMessage(message: string): boolean {
    if (!message || typeof message !== 'string') {
      return false;
    }

    if (message.length > this.MAX_MESSAGE_LENGTH) {
      return false;
    }

    // Basic profanity filter (very simple implementation)
    const forbiddenWords = ['spam', 'hack', 'cheat']; // Expand as needed
    const lowerMessage = message.toLowerCase();
    
    return !forbiddenWords.some(word => lowerMessage.includes(word));
  }

  // Validate emoji
  private validateEmoji(emoji: string): boolean {
    // Basic emoji validation
    const emojiRegex = /^[\\u{1F600}-\\u{1F64F}]|[\u{1F300}-\\u{1F5FF}]|[\u{1F680}-\\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\\u{2700}-\\u{27BF}]$/u;
    return emojiRegex.test(emoji);
  

  // Clean up typing indicators on disconnect
  public cleanupTypingIndicators(userId: string): void {
    for (const [key, typing] of this.typingUsers.entries()) {
      if (typing.userId === userId) {
        clearTimeout(typing.timeout);
        this.typingUsers.delete(key);
      }
    }
  }

  // Get chat statistics
  public getChatStats(): {
    activeTypingUsers: number;
    totalCooldowns: number;
  } {
    return {
      activeTypingUsers: this.typingUsers.size,
      totalCooldowns: this.messageCooldowns.size,
    };
  }
}

// Factory function to create chat handler
export function createChatHandler(io: Server, roomService: RoomService): ChatHandler {
  return new ChatHandler(io, roomService);
}