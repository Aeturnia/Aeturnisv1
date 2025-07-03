export const GAME_CONSTANTS = {
  MAX_LEVEL: Infinity,
  BASE_EXPERIENCE: 100,
  EXPERIENCE_SCALING: 1.15,
  MAX_INVENTORY_SLOTS: 50,
  MAX_CHARACTERS_PER_ACCOUNT: 5,
  COMBAT_TURN_TIMEOUT: 30000, // 30 seconds
  MOVEMENT_COOLDOWN: 1000, // 1 second
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
  CHARACTER_MOVE: 'character.move',
  COMBAT_ACTION: 'combat.action',
  CHAT_MESSAGE: 'chat.message',
  GAME_UPDATE: 'game.update',
} as const;