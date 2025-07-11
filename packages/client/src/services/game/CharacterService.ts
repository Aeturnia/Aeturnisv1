import { StateManager } from '../state/StateManager';
import { ICharacterService, CharacterUpdateData, ExperienceGainData, StatsAllocation } from '../provider/interfaces/ICharacterService';
import { ApiClient } from '../core/ApiClient';
import { WebSocketManager } from '../core/WebSocketManager';
import { CacheService } from '../cache/CacheService';
import { OfflineQueue } from '../cache/OfflineQueue';
import { CharacterHttpService } from './CharacterHttpService';
import { CharacterRealtimeService } from './CharacterRealtimeService';
import {
  Character,
  Position,
  Stats
} from '@aeturnis/shared';

export interface CharacterServiceDependencies {
  apiClient: ApiClient;
  wsManager: WebSocketManager;
  stateManager: StateManager;
  cacheService?: CacheService;
  offlineQueue?: OfflineQueue;
}

export class CharacterService implements ICharacterService {
  private httpService: CharacterHttpService;
  private realtimeService: CharacterRealtimeService;
  private stateManager: StateManager;
  private subscriptions: Map<string, () => void> = new Map();

  constructor(dependencies: CharacterServiceDependencies) {
    this.httpService = new CharacterHttpService(dependencies);
    this.realtimeService = new CharacterRealtimeService(dependencies);
    this.stateManager = dependencies.stateManager;

    this.initializeState();
    this.setupRealtimeSync();
  }

  private initializeState(): void {
    this.stateManager.register('character:current', null, { persist: true });
    this.stateManager.register('character:list', new Map<string, Character>(), { persist: true });
    this.stateManager.register('character:stats', new Map<string, Stats>(), { persist: true });
  }

  private setupRealtimeSync(): void {
    // Subscribe to character updates
    this.realtimeService.on('character:update', (data: CharacterUpdateData) => {
      const characters = this.stateManager.select<Map<string, Character>>('character:list');
      if (characters && characters.has(data.characterId)) {
        const updatedCharacters = new Map(characters);
        const existingCharacter = characters.get(data.characterId)!;
        updatedCharacters.set(data.characterId, { ...existingCharacter, ...data.updates });
        this.stateManager.update('character:list', updatedCharacters);

        // Update current character if it matches
        const currentCharacter = this.stateManager.select<Character>('character:current');
        if (currentCharacter && currentCharacter.id === data.characterId) {
          this.stateManager.update('character:current', { ...currentCharacter, ...data.updates });
        }
      }
    });

    // Subscribe to position updates
    this.realtimeService.on('character:position', (data: { characterId: string; position: Position }) => {
      const characters = this.stateManager.select<Map<string, Character>>('character:list');
      if (characters && characters.has(data.characterId)) {
        const updatedCharacters = new Map(characters);
        const character = characters.get(data.characterId)!;
        updatedCharacters.set(data.characterId, { ...character, position: data.position });
        this.stateManager.update('character:list', updatedCharacters);

        // Update current character if it matches
        const currentCharacter = this.stateManager.select<Character>('character:current');
        if (currentCharacter && currentCharacter.id === data.characterId) {
          this.stateManager.update('character:current', { ...currentCharacter, position: data.position });
        }
      }
    });

    // Subscribe to experience updates
    this.realtimeService.on('character:experience', (data: ExperienceGainData) => {
      const characters = this.stateManager.select<Map<string, Character>>('character:list');
      if (characters && characters.has(data.characterId)) {
        const updatedCharacters = new Map(characters);
        const character = characters.get(data.characterId)!;
        const updates: Partial<Character> = { experience: data.totalExperience };
        if (data.leveledUp && data.newLevel) {
          updates.level = data.newLevel;
        }
        updatedCharacters.set(data.characterId, { ...character, ...updates });
        this.stateManager.update('character:list', updatedCharacters);

        // Update current character if it matches
        const currentCharacter = this.stateManager.select<Character>('character:current');
        if (currentCharacter && currentCharacter.id === data.characterId) {
          this.stateManager.update('character:current', { ...currentCharacter, ...updates });
        }
      }
    });

    // Subscribe to stats updates
    this.realtimeService.on('character:stats', (data: { characterId: string; stats: Stats }) => {
      const statsMap = this.stateManager.select<Map<string, Stats>>('character:stats') || new Map();
      const updatedStats = new Map(statsMap);
      updatedStats.set(data.characterId, data.stats);
      this.stateManager.update('character:stats', updatedStats);

      // Update character in list
      const characters = this.stateManager.select<Map<string, Character>>('character:list');
      if (characters && characters.has(data.characterId)) {
        const updatedCharacters = new Map(characters);
        const character = characters.get(data.characterId)!;
        updatedCharacters.set(data.characterId, { ...character, stats: data.stats });
        this.stateManager.update('character:list', updatedCharacters);

        // Update current character if it matches
        const currentCharacter = this.stateManager.select<Character>('character:current');
        if (currentCharacter && currentCharacter.id === data.characterId) {
          this.stateManager.update('character:current', { ...currentCharacter, stats: data.stats });
        }
      }
    });
  }

  public async getCharacter(characterId: string): Promise<Character> {
    const characters = this.stateManager.select<Map<string, Character>>('character:list');
    const cached = characters?.get(characterId);
    
    if (cached) {
      return cached;
    }

    const response = await this.httpService.getCharacter(characterId);
    const character = response.data;

    // Update state
    const updatedCharacters = new Map(characters || []);
    updatedCharacters.set(characterId, character);
    this.stateManager.update('character:list', updatedCharacters);

    // Subscribe to this character's updates
    this.realtimeService.subscribeToCharacter(characterId);

    return character;
  }

  public async getCharacters(): Promise<Character[]> {
    const response = await this.httpService.getCharacters();
    const characters = response.data;

    // Update state
    const characterMap = new Map<string, Character>();
    characters.forEach(char => {
      characterMap.set(char.id, char);
      // Subscribe to each character's updates
      this.realtimeService.subscribeToCharacter(char.id);
    });
    this.stateManager.update('character:list', characterMap);

    return characters;
  }

  public async updatePosition(characterId: string, position: Position): Promise<Character> {
    // Send via realtime for faster response
    const character = await this.realtimeService.updatePosition(characterId, position);
    
    // Update local state immediately
    const characters = this.stateManager.select<Map<string, Character>>('character:list');
    if (characters && characters.has(characterId)) {
      const updatedCharacters = new Map(characters);
      const existingCharacter = characters.get(characterId)!;
      updatedCharacters.set(characterId, { ...existingCharacter, position });
      this.stateManager.update('character:list', updatedCharacters);

      // Update current character if it matches
      const currentCharacter = this.stateManager.select<Character>('character:current');
      if (currentCharacter && currentCharacter.id === characterId) {
        this.stateManager.update('character:current', { ...currentCharacter, position });
      }
    }

    return character;
  }

  public async addExperience(characterId: string, amount: number): Promise<ExperienceGainData> {
    const response = await this.httpService.addExperience(characterId, amount);
    return response.data;
  }

  public async allocateStats(characterId: string, stats: StatsAllocation): Promise<Stats> {
    const response = await this.httpService.allocateStats(characterId, stats);
    const newStats = response.data;

    // Update state
    const statsMap = this.stateManager.select<Map<string, Stats>>('character:stats') || new Map();
    const updatedStats = new Map(statsMap);
    updatedStats.set(characterId, newStats);
    this.stateManager.update('character:stats', updatedStats);

    // Update character in list
    const characters = this.stateManager.select<Map<string, Character>>('character:list');
    if (characters && characters.has(characterId)) {
      const updatedCharacters = new Map(characters);
      const character = characters.get(characterId)!;
      updatedCharacters.set(characterId, { ...character, stats: newStats });
      this.stateManager.update('character:list', updatedCharacters);

      // Update current character if it matches
      const currentCharacter = this.stateManager.select<Character>('character:current');
      if (currentCharacter && currentCharacter.id === characterId) {
        this.stateManager.update('character:current', { ...currentCharacter, stats: newStats });
      }
    }

    return newStats;
  }

  public async getStats(characterId: string): Promise<Stats> {
    const statsMap = this.stateManager.select<Map<string, Stats>>('character:stats');
    const cached = statsMap?.get(characterId);

    if (cached) {
      return cached;
    }

    const response = await this.httpService.getStats(characterId);
    const stats = response.data;

    // Cache the stats
    const updatedStats = new Map(statsMap || []);
    updatedStats.set(characterId, stats);
    this.stateManager.update('character:stats', updatedStats);

    return stats;
  }

  public subscribeToCharacterUpdates(characterId: string, handler: (update: CharacterUpdateData) => void): () => void {
    const subscriptionId = this.realtimeService.subscribeToCharacter(characterId);
    
    const unsubscribe = this.stateManager.subscribe('character:list', (slice) => {
      const character = slice.data.get(characterId);
      if (character) {
        handler({ characterId, updates: character });
      }
    });

    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      this.realtimeService.unsubscribeCharacter(subscriptionId);
      this.subscriptions.delete(subscriptionId);
    };
  }

  public subscribeToAllCharacters(handler: (update: CharacterUpdateData) => void): () => void {
    const subscriptionId = this.realtimeService.subscribeToAllCharacters();
    
    const unsubscribe = this.stateManager.subscribe('character:list', (slice) => {
      // Notify handler of all character updates
      slice.data.forEach((character, characterId) => {
        handler({ characterId, updates: character });
      });
    });

    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      this.realtimeService.unsubscribeAllCharacters(subscriptionId);
      this.subscriptions.delete(subscriptionId);
    };
  }

  public async initialize(): Promise<void> {
    // Service initialization if needed
  }

  public getName(): string {
    return 'CharacterService';
  }

  public destroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
    
    this.httpService.destroy();
    this.realtimeService.destroy();
  }
}