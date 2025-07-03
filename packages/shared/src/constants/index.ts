export const GAME_CONSTANTS = {
  MAX_LEVEL: Number.POSITIVE_INFINITY,
  BASE_EXPERIENCE: 100,
  EXPERIENCE_SCALING: 1.15,
  MAX_INVENTORY_SLOTS: 50,
  MAX_CHARACTERS_PER_ACCOUNT: 5,
  COMBAT_TURN_TIMEOUT: 30000, // 30 seconds
  MOVEMENT_COOLDOWN: 1000, // 1 second
  MAX_PLAYERS_PER_ZONE: 100,
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CHARACTERS: '/api/characters',
  GAME: '/api/game',
  COMBAT: '/api/combat',
  SOCIAL: '/api/social',
} as const;

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  GAME_UPDATE: 'gameUpdate',
  CHARACTER_MOVED: 'characterMoved',
  COMBAT_STARTED: 'combatStarted',
  CHAT_MESSAGE: 'chatMessage',
} as const;