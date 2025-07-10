import { IService } from './IService';
import { 
  Character,
  Position,
  Stats
} from '@aeturnis/shared';

export interface CharacterUpdateData {
  characterId: string;
  updates: Partial<Character>;
}

export interface ExperienceGainData {
  characterId: string;
  experienceGained: number;
  totalExperience: string; // BigInt as string
  leveledUp: boolean;
  newLevel?: number;
}

export interface StatsAllocation {
  strength?: number;
  intelligence?: number;
  vitality?: number;
  dexterity?: number;
  wisdom?: number;
}

export interface ICharacterService extends IService {
  getCharacter(characterId: string): Promise<Character>;
  getCharacters(): Promise<Character[]>;
  updatePosition(characterId: string, position: Position): Promise<Character>;
  addExperience(characterId: string, amount: number): Promise<ExperienceGainData>;
  allocateStats(characterId: string, stats: StatsAllocation): Promise<Stats>;
  getStats(characterId: string): Promise<Stats>;
  subscribeToCharacterUpdates(characterId: string, handler: (update: CharacterUpdateData) => void): () => void;
  subscribeToAllCharacters(handler: (update: CharacterUpdateData) => void): () => void;
}