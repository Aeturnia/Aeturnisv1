/**
 * CharacterService Unit Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CharacterService } from '../../../services/CharacterService';
import { CharacterRepository } from '../../../repositories/CharacterRepository';
import { CacheService } from '../../../services/CacheService';
import { StatsService } from '../../../services/StatsService';
import { 
  characterFactory,
  expectShape,
  expectUuid,
  expectAsyncThrows,
  createMockLogger
} from '../../helpers';
import { CharacterRace, CharacterClass, CharacterGender } from '../../../types/character.types';

// Mock dependencies
vi.mock('../../../repositories/CharacterRepository');
vi.mock('../../../services/CacheService');
vi.mock('../../../services/StatsService');
vi.mock('../../../utils/logger', () => ({
  logger: createMockLogger()
}));

describe('CharacterService', () => {
  let characterService: CharacterService;
  let mockCharacterRepository: any;
  let mockCacheService: any;
  let mockStatsService: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockCharacterRepository = {
      findById: vi.fn(),
      findByAccountId: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByAccountId: vi.fn()
    };
    
    mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      setWithTTL: vi.fn()
    };
    
    mockStatsService = {
      calculateStats: vi.fn(),
      calculateBaseStats: vi.fn(),
      applyEquipmentStats: vi.fn()
    };
    
    (CharacterRepository as any).mockImplementation(() => mockCharacterRepository);
    (CacheService as any).mockImplementation(() => mockCacheService);
    (StatsService as any).mockImplementation(() => mockStatsService);
    
    characterService = new CharacterService();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('getCharactersByAccount', () => {
    const accountId = 'test-account-id';
    
    it('should return characters from cache when available', async () => {
      const cachedCharacters = characterFactory.buildMany(2, { accountId });
      mockCacheService.get.mockResolvedValueOnce(JSON.stringify(cachedCharacters));
      
      const result = await characterService.getCharactersByAccount(accountId);
      
      expect(result).toEqual(cachedCharacters);
      expect(mockCacheService.get).toHaveBeenCalledWith(`characters:account:${accountId}`);
      expect(mockCharacterRepository.findByAccountId).not.toHaveBeenCalled();
    });
    
    it('should fetch from repository when not cached', async () => {
      const characters = characterFactory.buildMany(2, { accountId });
      mockCacheService.get.mockResolvedValueOnce(null);
      mockCharacterRepository.findByAccountId.mockResolvedValueOnce(characters);
      
      const result = await characterService.getCharactersByAccount(accountId);
      
      expect(result).toEqual(characters);
      expect(mockCharacterRepository.findByAccountId).toHaveBeenCalledWith(accountId);
      expect(mockCacheService.setWithTTL).toHaveBeenCalledWith(
        `characters:account:${accountId}`,
        JSON.stringify(characters),
        300 // 5 minutes TTL
      );
    });
    
    it('should return empty array when user has no characters', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockCharacterRepository.findByAccountId.mockResolvedValueOnce([]);
      
      const result = await characterService.getCharactersByAccount(accountId);
      
      expect(result).toEqual([]);
      expect(mockCacheService.setWithTTL).toHaveBeenCalled();
    });
    
    it('should handle cache errors gracefully', async () => {
      const characters = characterFactory.buildMany(2, { accountId });
      mockCacheService.get.mockRejectedValueOnce(new Error('Cache error'));
      mockCharacterRepository.findByAccountId.mockResolvedValueOnce(characters);
      
      const result = await characterService.getCharactersByAccount(accountId);
      
      expect(result).toEqual(characters);
      expect(mockCharacterRepository.findByAccountId).toHaveBeenCalled();
    });
  });
  
  describe('getCharacterWithStats', () => {
    const characterId = 'test-character-id';
    
    it('should return character with calculated stats', async () => {
      const character = characterFactory.build({ id: characterId });
      const calculatedStats = {
        totalStrength: 25,
        totalAttackPower: 50,
        totalDefense: 30
      };
      
      mockCharacterRepository.findById.mockResolvedValueOnce(character);
      mockStatsService.calculateStats.mockReturnValueOnce(calculatedStats);
      
      const result = await characterService.getCharacterWithStats(characterId);
      
      expect(result).toEqual({
        character,
        stats: calculatedStats
      });
      expect(mockCharacterRepository.findById).toHaveBeenCalledWith(characterId);
      expect(mockStatsService.calculateStats).toHaveBeenCalledWith(character);
    });
    
    it('should return null when character not found', async () => {
      mockCharacterRepository.findById.mockResolvedValueOnce(null);
      
      const result = await characterService.getCharacterWithStats(characterId);
      
      expect(result).toBeNull();
      expect(mockStatsService.calculateStats).not.toHaveBeenCalled();
    });
    
    it('should cache character data', async () => {
      const character = characterFactory.build({ id: characterId });
      mockCacheService.get.mockResolvedValueOnce(null);
      mockCharacterRepository.findById.mockResolvedValueOnce(character);
      mockStatsService.calculateStats.mockReturnValueOnce({});
      
      await characterService.getCharacterWithStats(characterId);
      
      expect(mockCacheService.setWithTTL).toHaveBeenCalledWith(
        `character:${characterId}`,
        JSON.stringify(character),
        300
      );
    });
  });
  
  describe('createCharacter', () => {
    const accountId = 'test-account-id';
    const characterData = {
      name: 'TestHero',
      race: CharacterRace.HUMAN,
      class: CharacterClass.WARRIOR,
      gender: CharacterGender.MALE,
      appearance: {
        skinTone: 1,
        hairStyle: 1,
        hairColor: '#000000',
        eyeColor: '#0000FF',
        height: 180,
        build: 1,
        skinColor: '#FDBCB4'
      }
    };
    
    it('should create character successfully', async () => {
      const newCharacter = characterFactory.build({ ...characterData, accountId });
      
      mockCharacterRepository.countByAccountId.mockResolvedValueOnce(2);
      mockCharacterRepository.findByName.mockResolvedValueOnce(null);
      mockCharacterRepository.create.mockResolvedValueOnce(newCharacter);
      
      const result = await characterService.createCharacter(accountId, characterData);
      
      expect(result).toEqual(newCharacter);
      expect(mockCharacterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId,
          ...characterData,
          level: 1,
          experience: 0,
          currentZone: 'starter_zone',
          locationX: 0,
          locationY: 0,
          locationZ: 0
        })
      );
      
      // Should invalidate account cache
      expect(mockCacheService.del).toHaveBeenCalledWith(`characters:account:${accountId}`);
    });
    
    it('should throw error when character limit reached', async () => {
      mockCharacterRepository.countByAccountId.mockResolvedValueOnce(10);
      
      await expectAsyncThrows(
        () => characterService.createCharacter(accountId, characterData),
        'Maximum character limit reached'
      );
      
      expect(mockCharacterRepository.create).not.toHaveBeenCalled();
    });
    
    it('should throw error when name already exists', async () => {
      mockCharacterRepository.countByAccountId.mockResolvedValueOnce(1);
      mockCharacterRepository.findByName.mockResolvedValueOnce({ id: 'existing-char' });
      
      await expectAsyncThrows(
        () => characterService.createCharacter(accountId, characterData),
        'Character name already exists'
      );
      
      expect(mockCharacterRepository.create).not.toHaveBeenCalled();
    });
    
    it('should validate character name format', async () => {
      const invalidNames = [
        '12Invalid', // Starts with number
        'a', // Too short
        'Invalid!Name', // Special characters
        'Invalid Name', // Spaces
        'VeryLongCharacterNameThatExceedsTheMaximumAllowedLength' // Too long
      ];
      
      mockCharacterRepository.countByAccountId.mockResolvedValue(1);
      mockCharacterRepository.findByName.mockResolvedValue(null);
      
      for (const name of invalidNames) {
        await expectAsyncThrows(
          () => characterService.createCharacter(accountId, { ...characterData, name }),
          /Invalid character name/
        );
      }
    });
    
    it('should set initial stats based on race and class', async () => {
      const newCharacter = characterFactory.build({ ...characterData, accountId });
      
      mockCharacterRepository.countByAccountId.mockResolvedValueOnce(1);
      mockCharacterRepository.findByName.mockResolvedValueOnce(null);
      mockCharacterRepository.create.mockResolvedValueOnce(newCharacter);
      
      await characterService.createCharacter(accountId, characterData);
      
      expect(mockCharacterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          combatStats: expect.any(Object),
          resourceStats: expect.any(Object)
        })
      );
    });
  });
  
  describe('deleteCharacter', () => {
    const characterId = 'test-character-id';
    const accountId = 'test-account-id';
    
    it('should delete character successfully', async () => {
      const character = characterFactory.build({ id: characterId, accountId });
      
      mockCharacterRepository.findById.mockResolvedValueOnce(character);
      mockCharacterRepository.delete.mockResolvedValueOnce(true);
      
      const result = await characterService.deleteCharacter(characterId, accountId);
      
      expect(result).toBe(true);
      expect(mockCharacterRepository.delete).toHaveBeenCalledWith(characterId);
      
      // Should invalidate caches
      expect(mockCacheService.del).toHaveBeenCalledWith(`character:${characterId}`);
      expect(mockCacheService.del).toHaveBeenCalledWith(`characters:account:${accountId}`);
    });
    
    it('should return false when character not found', async () => {
      mockCharacterRepository.findById.mockResolvedValueOnce(null);
      
      const result = await characterService.deleteCharacter(characterId, accountId);
      
      expect(result).toBe(false);
      expect(mockCharacterRepository.delete).not.toHaveBeenCalled();
    });
    
    it('should return false when user does not own character', async () => {
      const character = characterFactory.build({ 
        id: characterId, 
        accountId: 'different-account' 
      });
      
      mockCharacterRepository.findById.mockResolvedValueOnce(character);
      
      const result = await characterService.deleteCharacter(characterId, accountId);
      
      expect(result).toBe(false);
      expect(mockCharacterRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('updateCharacterPosition', () => {
    const characterId = 'test-character-id';
    const accountId = 'test-account-id';
    const positionData = {
      zone: 'new_zone',
      x: 100,
      y: 50,
      z: 200,
      rotation: 180
    };
    
    it('should update position successfully', async () => {
      const character = characterFactory.build({ id: characterId, accountId });
      const updatedCharacter = { ...character, ...positionData };
      
      mockCharacterRepository.findById.mockResolvedValueOnce(character);
      mockCharacterRepository.update.mockResolvedValueOnce(updatedCharacter);
      
      const result = await characterService.updateCharacterPosition(
        characterId,
        accountId,
        positionData
      );
      
      expect(result).toEqual({ success: true, character: updatedCharacter });
      expect(mockCharacterRepository.update).toHaveBeenCalledWith(characterId, {
        currentZone: positionData.zone,
        locationX: positionData.x,
        locationY: positionData.y,
        locationZ: positionData.z
      });
      
      // Should invalidate cache
      expect(mockCacheService.del).toHaveBeenCalledWith(`character:${characterId}`);
    });
    
    it('should handle character not found', async () => {
      mockCharacterRepository.findById.mockResolvedValueOnce(null);
      
      const result = await characterService.updateCharacterPosition(
        characterId,
        accountId,
        positionData
      );
      
      expect(result).toEqual({ 
        success: false, 
        error: 'Character not found or access denied' 
      });
    });
    
    it('should handle unauthorized access', async () => {
      const character = characterFactory.build({ 
        id: characterId, 
        accountId: 'different-account' 
      });
      
      mockCharacterRepository.findById.mockResolvedValueOnce(character);
      
      const result = await characterService.updateCharacterPosition(
        characterId,
        accountId,
        positionData
      );
      
      expect(result).toEqual({ 
        success: false, 
        error: 'Character not found or access denied' 
      });
      expect(mockCharacterRepository.update).not.toHaveBeenCalled();
    });
  });
});