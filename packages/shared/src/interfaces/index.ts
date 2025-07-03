import { Stats, Position, CharacterRace } from '../types';

export interface Character {
  id: string;
  name: string;
  race: CharacterRace;
  level: number;
  experience: string; // BigInt as string
  stats: Stats;
  position: Position;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface GameMessage {
  type: 'info' | 'combat' | 'chat' | 'system';
  content: string;
  timestamp: Date;
  sender?: string;
}

export interface ServerToClientEvents {
  gameUpdate: (data: any) => void;
  characterMoved: (character: Character) => void;
  combatStarted: (data: any) => void;
  chatMessage: (message: GameMessage) => void;
}

export interface ClientToServerEvents {
  moveCharacter: (direction: string) => void;
  sendChatMessage: (message: string) => void;
  performAction: (action: string, target?: string) => void;
}