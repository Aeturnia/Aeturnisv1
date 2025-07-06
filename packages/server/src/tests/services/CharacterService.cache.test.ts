import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterService } from '../../services/CharacterService';
import { CacheService } from '../../services/CacheService';

// Mock the dependencies
vi.mock('../../services/CacheService');
vi.mock('../../repositories/CharacterRepository');

describe('AIPE Cache Invalidation Tests', () => {
  let characterService: CharacterService;
  let mockCacheService: any;

  beforeEach(() => {
    // Create mock cache service
    mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      deletePattern: vi.fn()
    };

    // Mock the CacheService constructor to return our mock
    vi.mocked(CacheService).mockImplementation(() => mockCacheService);
    
    characterService = new CharacterService();
  });

  describe('3. Cache Invalidation on Stat Changes', () => {
    it('should invalidate cache when character stats are updated', async () => {
      const characterId = 'test-char-001';
      const accountId = 'test-account-001';
      
      // Mock repository update
      const mockRepo = (characterService as any).characterRepo;
      mockRepo.updateStats = vi.fn().mockResolvedValue({ id: characterId });
      
      // Call stat update method
      await characterService.updateStats(characterId, {
        baseStrength: 75,
        strengthTier: 1
      });
      
      // Verify cache invalidation was called
      expect(mockCacheService.delete).toHaveBeenCalledWith(`character:${characterId}`);
      expect(mockCacheService.deletePattern).toHaveBeenCalledWith(`account:*:characters`);
    });

    it('should invalidate cache when equipment changes affect stats', async () => {
      const characterId = 'test-char-001';
      
      // Mock equipment change that affects stats
      const mockRepo = (characterService as any).characterRepo;
      mockRepo.updateStats = vi.fn().mockResolvedValue({ id: characterId });
      
      await characterService.updateStats(characterId, {
        bonusStrength: 150,
        bonusDexterity: 100
      });
      
      // Verify cache invalidation
      expect(mockCacheService.delete).toHaveBeenCalledWith(`character:${characterId}`);
    });

    it('should invalidate cache when prestige level changes', async () => {
      const characterId = 'test-char-001';
      
      const mockRepo = (characterService as any).characterRepo;
      mockRepo.updatePrestige = vi.fn().mockResolvedValue({ id: characterId });
      
      await characterService.updatePrestige(characterId, 5);
      
      // Verify cache invalidation for prestige changes
      expect(mockCacheService.delete).toHaveBeenCalledWith(`character:${characterId}`);
    });

    it('should invalidate cache when paragon points are redistributed', async () => {
      const characterId = 'test-char-001';
      
      const mockRepo = (characterService as any).characterRepo;
      mockRepo.updateParagonDistribution = vi.fn().mockResolvedValue({ id: characterId });
      
      await characterService.updateParagonDistribution(characterId, {
        strength: BigInt(500),
        dexterity: BigInt(300),
        intelligence: BigInt(200),
        wisdom: BigInt(100),
        constitution: BigInt(400),
        charisma: BigInt(0)
      });
      
      // Verify cache invalidation
      expect(mockCacheService.delete).toHaveBeenCalledWith(`character:${characterId}`);
    });

    it('should recalculate derived stats after cache invalidation', async () => {
      const characterId = 'test-char-001';
      const updatedCharacter = {
        id: characterId,
        baseStrength: 85,
        strengthTier: 1,
        // ... other character properties
      };
      
      const mockRepo = (characterService as any).characterRepo;
      mockRepo.updateStats = vi.fn().mockResolvedValue(updatedCharacter);
      mockRepo.findById = vi.fn().mockResolvedValue(updatedCharacter);
      
      // First call should miss cache, second should trigger recalc
      mockCacheService.get.mockResolvedValue(null);
      
      // Update stats
      await characterService.updateStats(characterId, { baseStrength: 85 });
      
      // Get character with stats (should recalculate)
      await characterService.getCharacterWithStats(characterId);
      
      // Verify cache was invalidated and character was refetched
      expect(mockCacheService.delete).toHaveBeenCalledWith(`character:${characterId}`);
      expect(mockRepo.findById).toHaveBeenCalledWith(characterId);
    });
  });

  describe('Cache Performance Tests', () => {
    it('should use cached character data when available', async () => {
      const characterId = 'test-char-001';
      const cachedCharacter = { id: characterId, name: 'CachedHero' };
      
      mockCacheService.get.mockResolvedValue(cachedCharacter);
      
      const result = await characterService.getCharacter(characterId);
      
      expect(result).toBe(cachedCharacter);
      expect(mockCacheService.get).toHaveBeenCalledWith(`character:${characterId}`);
      
      // Should not hit database when cache is available
      const mockRepo = (characterService as any).characterRepo;
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it('should cache character after database fetch', async () => {
      const characterId = 'test-char-001';
      const dbCharacter = { id: characterId, name: 'DbHero' };
      
      mockCacheService.get.mockResolvedValue(null); // Cache miss
      const mockRepo = (characterService as any).characterRepo;
      mockRepo.findById = vi.fn().mockResolvedValue(dbCharacter);
      
      const result = await characterService.getCharacter(characterId);
      
      expect(result).toBe(dbCharacter);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `character:${characterId}`,
        dbCharacter,
        3600 // 1 hour TTL
      );
    });
  });
});