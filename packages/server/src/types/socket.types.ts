import { Socket } from 'socket.io';

// Extended socket interface with authentication context
export interface SocketWithAuth extends Socket {
  user?: {
    userId: string;
    email: string;
    characterId?: string;
    roles: string[];
  };
}

// Room type enums
export enum RoomType {
  USER = 'user',
  ZONE = 'zone',
  COMBAT = 'combat',
  GUILD = 'guild',
  PARTY = 'party'
}

// Event payload interfaces
export interface ChatMessagePayload {
  type: 'zone' | 'guild' | 'party' | 'whisper';
  message: string;
  targetId?: string; // For whispers
  timestamp: number;
  sender: {
    userId: string;
    username: string;
    characterName?: string;
  };
}

export interface CharacterMovePayload {
  x: number;
  y: number;
  zoneId: string;
  direction?: string;
  speed?: number;
}

export interface CharacterActionPayload {
  actionType: 'emote' | 'interact' | 'cast' | 'use_item';
  targetId?: string;
  itemId?: string;
  skillId?: string;
  params?: Record<string, unknown>;
}

export interface CharacterStatusPayload {
  health: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
  level: number;
  experience: string;
  buffs: Array<{
    id: string;
    name: string;
    duration: number;
    effect: string;
  }>;
}

export interface CombatActionPayload {
  actionType: 'attack' | 'skill' | 'item' | 'defend' | 'flee';
  targetId?: string;
  skillId?: string;
  itemId?: string;
  params?: Record<string, unknown>;
}

export interface CombatResultPayload {
  sessionId: string;
  action: CombatActionPayload;
  results: Array<{
    targetId: string;
    damage?: number;
    healing?: number;
    statusEffects?: Array<{
      id: string;
      name: string;
      duration: number;
    }>;
  }>;
  nextTurn?: string;
}

export interface TypingIndicatorPayload {
  type: 'zone' | 'guild' | 'party';
  isTyping: boolean;
  sender: {
    userId: string;
    username: string;
  };
}

// Server to client events
export interface ServerToClientEvents {
  // Chat events
  'chat:message': (payload: ChatMessagePayload) => void;
  'chat:typing': (payload: TypingIndicatorPayload) => void;
  'chat:emoji': (payload: { messageId: string; emoji: string; userId: string }) => void;

  // Character events
  'character:move': (payload: CharacterMovePayload & { userId: string }) => void;
  'character:action': (payload: CharacterActionPayload & { userId: string }) => void;
  'character:status': (payload: CharacterStatusPayload & { userId: string }) => void;

  // Combat events
  'combat:action': (payload: CombatActionPayload & { userId: string }) => void;
  'combat:result': (payload: CombatResultPayload) => void;
  'combat:turn': (payload: { sessionId: string; currentTurn: string; timeRemaining: number }) => void;

  // System events
  'system:notification': (payload: { type: 'info' | 'warning' | 'error'; message: string }) => void;
  'system:disconnect': (payload: { reason: string }) => void;

  // Room events
  'room:joined': (payload: { roomType: RoomType; roomId: string }) => void;
  'room:left': (payload: { roomType: RoomType; roomId: string }) => void;
  'room:members': (payload: { roomType: RoomType; roomId: string; count: number }) => void;
}

// Client to server events
export interface ClientToServerEvents {
  // Chat events
  'chat:message': (payload: Omit<ChatMessagePayload, 'timestamp' | 'sender'>) => void;
  'chat:typing': (payload: Omit<TypingIndicatorPayload, 'sender'>) => void;
  'chat:emoji': (payload: { messageId: string; emoji: string }) => void;

  // Character events
  'character:move': (payload: CharacterMovePayload) => void;
  'character:action': (payload: CharacterActionPayload) => void;

  // Combat events
  'combat:action': (payload: CombatActionPayload) => void;

  // Room events
  'room:join': (payload: { roomType: RoomType; roomId: string }) => void;
  'room:leave': (payload: { roomType: RoomType; roomId: string }) => void;
}

// Error response formats
export interface SocketErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: number;
}

// Connection state
export interface ConnectionState {
  userId: string;
  characterId?: string;
  currentZone?: string;
  rooms: Array<{
    type: RoomType;
    id: string;
    joinedAt: number;
  }>;
  lastActivity: number;
  connectionId: string;
}