/**
 * Character Routes Unit Tests
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { Express } from 'express';

// Mock auth middleware BEFORE importing anything that uses it
vi.mock('../../../middleware/auth', () => ({
  authenticate: vi.fn((req: any, res: any, next: any) => {
    // Check if authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }
    req.user = { userId: 'test-user-id', email: 'test@example.com', username: 'testuser' };
    next();
  }),
  requireAuth: vi.fn((req: any, res: any, next: any) => {
    // Check if authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }
    req.user = { userId: 'test-user-id', email: 'test@example.com', username: 'testuser' };
    next();
  }),
  AuthRequest: {}
}));

// Mock services BEFORE importing app
vi.mock('../../../services/CharacterService');
vi.mock('../../../services/StatsService');

// Now import everything else
import { createApp } from '../../../app';
import { CharacterService } from '../../../services/CharacterService';
import { StatsService } from '../../../services/StatsService';
import { 
  ApiHelper,
  characterFactory,
  userFactory,
  expectApiError,
  expectApiSuccess,
  expectShape,
  expectUuid,
  DatabaseCleaner
} from '../../helpers';
import { CharacterRace, CharacterClass, CharacterGender } from '../../../types/character.types';

describe('Character Routes', () => {
  let app: Express;
  let apiHelper: ApiHelper;
  let mockCharacterService: any;
  let mockStatsService: any;
  let dbCleaner: DatabaseCleaner;
  
  beforeAll(() => {
    console.log('Creating app in test...');
    app = createApp();
    apiHelper = new ApiHelper(app);
    apiHelper.setAuth('mock-token'); // Since auth is mocked
    dbCleaner = new DatabaseCleaner();
    console.log('App created');
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock services
    mockCharacterService = {
      getCharactersByAccount: vi.fn(),
      getCharacterWithStats: vi.fn(),
      getCharacter: vi.fn(),
      createCharacter: vi.fn(),
      deleteCharacter: vi.fn(),
      updatePosition: vi.fn(),
      validateCharacterName: vi.fn(),
      getRandomStartingAppearance: vi.fn(),
      updateLastPlayed: vi.fn(),
      gainExperience: vi.fn(),
      allocateStatPoint: vi.fn(),
      updateResources: vi.fn(),
      prestigeCharacter: vi.fn(),
      allocateParagonPoints: vi.fn()
    };
    
    mockStatsService = {
      calculateStats: vi.fn(),
      calculateTotalBaseStats: vi.fn(),
      calculateDerivedStats: vi.fn(),
      canPrestige: vi.fn(),
      hasParagonUnlocked: vi.fn()
    };
    
    (CharacterService as any).mockImplementation(() => mockCharacterService);
    (StatsService as any).mockImplementation(() => mockStatsService);
  });
  
  afterAll(async () => {
    await dbCleaner.cleanup();
  });
  
  describe('GET /api/characters', () => {
    it('should return all characters for authenticated user', async () => {
      console.log('Test: Starting test');
      console.log('Mock service setup:', mockCharacterService);
      
      const mockCharacters = characterFactory.buildMany(3, { accountId: 'test-user-id' });
      mockCharacterService.getCharactersByAccount.mockResolvedValueOnce(mockCharacters);
      
      console.log('Making request to /api/v1/characters');
      const response = await apiHelper.get('/api/v1/characters');
      
      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      
      expectApiSuccess(response);
      expect(response.body.data.characters).toEqual(mockCharacters);
      expect(response.body.data.count).toBe(3);
      expect(mockCharacterService.getCharactersByAccount).toHaveBeenCalledWith('test-user-id');
    });
    
    it('should return empty array when user has no characters', async () => {
      mockCharacterService.getCharactersByAccount.mockResolvedValueOnce([]);
      
      const response = await apiHelper.get('/api/v1/characters');
      
      expectApiSuccess(response);
      expect(response.body.data.characters).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });
    
    it('should require authentication', async () => {
      apiHelper.clearAuth();
      
      const response = await apiHelper.get('/api/v1/characters');
      
      expect(response.status).toBe(401);
      
      // Restore auth for other tests
      apiHelper.setAuth('mock-token');
    });
  });
  
  describe('GET /api/characters/:id', () => {
    const characterId = '550e8400-e29b-41d4-a716-446655440000';
    
    it('should return character with stats when owned by user', async () => {
      const mockCharacter = characterFactory.build({ 
        id: characterId, 
        accountId: 'test-user-id' 
      });
      
      const mockResult = {
        character: mockCharacter,
        stats: {
          calculated: true,
          totalStats: {}
        }
      };
      
      mockCharacterService.getCharacterWithStats.mockResolvedValueOnce(mockResult);
      
      const response = await apiHelper.get(`/api/v1/characters/${characterId}`);
      
      expectApiSuccess(response);
      expect(response.body.data).toEqual(mockResult);
      expect(mockCharacterService.getCharacterWithStats).toHaveBeenCalledWith(characterId);
    });
    
    it('should return 404 when character not found', async () => {
      mockCharacterService.getCharacterWithStats.mockResolvedValueOnce(null);
      
      const response = await apiHelper.get(`/api/v1/characters/${characterId}`);
      
      expectApiError(response, 404, 'Character not found');
    });
    
    it('should return 403 when character owned by different user', async () => {
      const mockCharacter = characterFactory.build({ 
        id: characterId, 
        accountId: 'different-user-id' 
      });
      
      mockCharacterService.getCharacterWithStats.mockResolvedValueOnce({
        character: mockCharacter,
        stats: {}
      });
      
      const response = await apiHelper.get(`/api/v1/characters/${characterId}`);
      
      expectApiError(response, 403, 'Access denied');
    });
    
    it('should validate character ID format', async () => {
      const response = await apiHelper.get('/api/v1/characters/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('POST /api/characters', () => {
    const validCharacterData = {
      name: 'TestWarrior',
      race: CharacterRace.HUMAN,
      class: CharacterClass.WARRIOR,
      gender: CharacterGender.MALE,
      appearance: {
        skinTone: 1,
        hairStyle: 1,
        hairColor: '#8B4513',
        eyeColor: '#0000FF',
        height: 180,
        build: 1,
        skinColor: '#FDBCB4'
      }
    };
    
    it('should create character successfully', async () => {
      const mockCharacter = characterFactory.build({
        ...validCharacterData,
        accountId: 'test-user-id'
      });
      
      mockCharacterService.createCharacter.mockResolvedValueOnce(mockCharacter);
      
      const response = await apiHelper.post('/api/v1/characters', validCharacterData);
      
      expectApiSuccess(response, 201);
      expect(response.body.data).toEqual(mockCharacter);
      expect(mockCharacterService.createCharacter).toHaveBeenCalledWith(
        'test-user-id',
        validCharacterData
      );
    });
    
    it('should validate character name', async () => {
      const invalidData = {
        ...validCharacterData,
        name: 'a' // Too short
      };
      
      const response = await apiHelper.post('/api/v1/characters', invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should validate character name format', async () => {
      const invalidData = {
        ...validCharacterData,
        name: '123Invalid' // Starts with number
      };
      
      const response = await apiHelper.post('/api/v1/characters', invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should validate race enum', async () => {
      const invalidData = {
        ...validCharacterData,
        race: 'INVALID_RACE'
      };
      
      const response = await apiHelper.post('/api/v1/characters', invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should handle duplicate name error', async () => {
      mockCharacterService.createCharacter.mockRejectedValueOnce(
        new Error('Character name already exists')
      );
      
      const response = await apiHelper.post('/api/v1/characters', validCharacterData);
      
      expectApiError(response, 400, 'Character name already exists');
    });
    
    it('should handle character limit error', async () => {
      mockCharacterService.createCharacter.mockRejectedValueOnce(
        new Error('Maximum character limit reached')
      );
      
      const response = await apiHelper.post('/api/v1/characters', validCharacterData);
      
      expectApiError(response, 400, 'Maximum character limit reached');
    });
  });
  
  describe('DELETE /api/characters/:id', () => {
    const characterId = '550e8400-e29b-41d4-a716-446655440000';
    
    it('should delete character successfully', async () => {
      mockCharacterService.deleteCharacter.mockResolvedValueOnce(true);
      
      const response = await apiHelper.delete(`/api/v1/characters/${characterId}`);
      
      expectApiSuccess(response);
      expect(response.body.message).toBe('Character deleted successfully');
      expect(mockCharacterService.deleteCharacter).toHaveBeenCalledWith(
        characterId,
        'test-user-id'
      );
    });
    
    it('should return 404 when character not found', async () => {
      mockCharacterService.deleteCharacter.mockResolvedValueOnce(false);
      
      const response = await apiHelper.delete(`/api/v1/characters/${characterId}`);
      
      expectApiError(response, 404, 'Character not found or access denied');
    });
    
    it('should validate character ID format', async () => {
      const response = await apiHelper.delete('/api/v1/characters/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('PATCH /api/characters/:id/position', () => {
    const characterId = '550e8400-e29b-41d4-a716-446655440000';
    const validPositionData = {
      zone: 'starter_zone',
      x: 100,
      y: 0,
      z: 50,
      rotation: 180
    };
    
    it('should update character position successfully', async () => {
      mockCharacterService.updateCharacterPosition = vi.fn().mockResolvedValueOnce({
        success: true,
        character: characterFactory.build({ id: characterId })
      });
      
      const response = await apiHelper.patch(
        `/api/v1/characters/${characterId}/position`,
        validPositionData
      );
      
      expectApiSuccess(response);
      expect(mockCharacterService.updateCharacterPosition).toHaveBeenCalledWith(
        characterId,
        'test-user-id',
        validPositionData
      );
    });
    
    it('should validate position data', async () => {
      const invalidData = {
        zone: 123, // Should be string
        x: 'invalid', // Should be numeric
        y: 0,
        z: 50
      };
      
      const response = await apiHelper.patch(
        `/api/v1/characters/${characterId}/position`,
        invalidData
      );
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should allow optional rotation', async () => {
      const dataWithoutRotation = {
        zone: 'starter_zone',
        x: 100,
        y: 0,
        z: 50
      };
      
      mockCharacterService.updateCharacterPosition = vi.fn().mockResolvedValueOnce({
        success: true
      });
      
      const response = await apiHelper.patch(
        `/api/v1/characters/${characterId}/position`,
        dataWithoutRotation
      );
      
      expectApiSuccess(response);
    });
  });
});