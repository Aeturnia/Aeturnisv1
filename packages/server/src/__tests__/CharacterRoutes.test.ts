import request from 'supertest';
import { Express } from 'express';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../app';
import { db } from '../database/config';
import { users, characters } from '../database/schema/index';
import { eq } from 'drizzle-orm';
import { AuthService } from '../services/AuthService';
import { CharacterService } from '../services/CharacterService';
import { CharacterRace, CharacterClass, CharacterGender, CharacterAppearance } from '../types/character.types';

describe('Character Routes', () => {
  let app: Express;
  let authService: AuthService;
  let characterService: CharacterService;
  let testUser: { id: string; email: string; username: string };
  let authToken: string;

  // Helper function to create valid appearance object
  const createValidAppearance = (): CharacterAppearance => ({
    skinTone: 'fair',
    hairStyle: 'short',
    hairColor: '#8B4513',
    eyeColor: '#0000FF',
    height: 50,
    build: 50,
    faceType: 'oval',
    features: {}
  });

  beforeAll(async () => {
    app = createApp();
    authService = new AuthService();
    characterService = new CharacterService();

    // Create test user
    const userData = {
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'TestPassword123!'
    };

    const result = await authService.register(userData);
    testUser = result.user;
    authToken = result.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(characters).where(eq(characters.accountId, testUser.id));
    await db.delete(users).where(eq(users.id, testUser.id));
  });

  beforeEach(async () => {
    // Clean up characters before each test
    await db.delete(characters).where(eq(characters.accountId, testUser.id));
  });

  describe('GET /api/v1/characters/test', () => {
    it('should return system operational status', async () => {
      const response = await request(app)
        .get('/api/v1/characters/test')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Character system is operational',
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/v1/characters', () => {
    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          characters: [],
          count: 0
        }
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/characters')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should return user characters after creation', async () => {
      // Create a test character
      const characterData = {
        name: 'TestWarrior',
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      };

      await characterService.createCharacter(testUser.id, characterData);

      const response = await request(app)
        .get('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.characters).toHaveLength(1);
      expect(response.body.data.characters[0].name).toBe('TestWarrior');
      expect(response.body.data.characters[0].race).toBe(CharacterRace.HUMAN);
    });
  });

  describe('POST /api/v1/characters', () => {
    it('should create a new character successfully', async () => {
      const characterData = {
        name: 'TestMage',
        race: CharacterRace.ELF,
        class: CharacterClass.MAGE,
        gender: CharacterGender.FEMALE,
        appearance: createValidAppearance()
      };

      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('TestMage');
      expect(response.body.data.race).toBe(CharacterRace.ELF);
      expect(response.body.data.class).toBe(CharacterClass.MAGE);
      expect(response.body.data.level).toBe(1);
      expect(response.body.data.health).toBeGreaterThan(0);
      expect(response.body.data.mana).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const characterData = {
        name: 'TestCharacter',
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      };

      const response = await request(app)
        .post('/api/v1/characters')
        .send(characterData)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate character name length', async () => {
      const characterData = {
        name: 'A', // Too short
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      };

      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate character race', async () => {
      const characterData = {
        name: 'TestCharacter',
        race: 'INVALID_RACE',
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      };

      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle duplicate character names', async () => {
      const characterData = {
        name: 'DuplicateName',
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: {}
      };

      // Create first character
      await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/v1/characters/:id', () => {
    it('should get character by ID with stats', async () => {
      // Create test character
      const character = await characterService.createCharacter(testUser.id, {
        name: 'StatsTestCharacter',
        race: CharacterRace.DWARF,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      });

      const response = await request(app)
        .get(`/api/v1/characters/${character.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.character.id).toBe(character.id);
      expect(response.body.data.character.name).toBe('StatsTestCharacter');
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalPower).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent character', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/api/v1/characters/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Character not found');
    });

    it('should deny access to other users characters', async () => {
      // Create another user
      const otherUserData = {
        email: 'otheruser@example.com',
        username: 'otheruser',
        password: 'OtherPassword123!'
      };

      const otherUser = await authService.register(otherUserData);
      
      // Create character for other user
      const character = await characterService.createCharacter(otherUser.user.id, {
        name: 'OtherUserCharacter',
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      });

      // Try to access with original user's token
      const response = await request(app)
        .get(`/api/v1/characters/${character.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');

      // Cleanup
      await db.delete(characters).where(eq(characters.id, character.id));
      await db.delete(users).where(eq(users.id, otherUser.user.id));
    });

    it('should require valid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/characters/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/characters/validate-name', () => {
    it('should validate available character name', async () => {
      const response = await request(app)
        .post('/api/v1/characters/validate-name')
        .send({ name: 'AvailableName' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.isAvailable).toBe(true);
    });

    it('should validate unavailable character name', async () => {
      // Create character first
      await characterService.createCharacter(testUser.id, {
        name: 'TakenName',
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: createValidAppearance()
      });

      const response = await request(app)
        .post('/api/v1/characters/validate-name')
        .send({ name: 'TakenName' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.isAvailable).toBe(false);
    });

    it('should validate invalid character name length', async () => {
      const response = await request(app)
        .post('/api/v1/characters/validate-name')
        .send({ name: 'A' }) // Too short
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/characters/appearance/:race', () => {
    it('should generate random appearance for human', async () => {
      const response = await request(app)
        .get('/api/v1/characters/appearance/HUMAN')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hairColor');
      expect(response.body.data).toHaveProperty('skinColor');
      expect(response.body.data).toHaveProperty('eyeColor');
      expect(response.body.data.hairColor).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should generate random appearance for elf', async () => {
      const response = await request(app)
        .get('/api/v1/characters/appearance/ELF')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hairColor');
      expect(response.body.data).toHaveProperty('skinColor');
      expect(response.body.data).toHaveProperty('eyeColor');
    });

    it('should return 400 for invalid race', async () => {
      const response = await request(app)
        .get('/api/v1/characters/appearance/INVALID_RACE')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Character Creation Workflow Integration', () => {
    it('should complete full character creation workflow', async () => {
      // Step 1: Validate name
      const nameValidation = await request(app)
        .post('/api/v1/characters/validate-name')
        .send({ name: 'WorkflowTest' })
        .expect(200);

      expect(nameValidation.body.data.isAvailable).toBe(true);

      // Step 2: Get random appearance
      const appearance = await request(app)
        .get('/api/v1/characters/appearance/HUMAN')
        .expect(200);

      // Step 3: Create character
      const characterData = {
        name: 'WorkflowTest',
        race: CharacterRace.HUMAN,
        class: CharacterClass.WARRIOR,
        gender: CharacterGender.MALE,
        appearance: appearance.body.data
      };

      const character = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(201);

      expect(character.body.data.name).toBe('WorkflowTest');

      // Step 4: Verify character in list
      const characterList = await request(app)
        .get('/api/v1/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(characterList.body.data.count).toBe(1);
      expect(characterList.body.data.characters[0].name).toBe('WorkflowTest');

      // Step 5: Get character details
      const characterDetails = await request(app)
        .get(`/api/v1/characters/${character.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(characterDetails.body.data.character.name).toBe('WorkflowTest');
      expect(characterDetails.body.data.stats).toBeDefined();
    });
  });
});