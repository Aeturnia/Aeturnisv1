/**
 * Test factories for creating test data
 */
import { v4 as uuidv4 } from 'uuid';
import { 
  CharacterRace, 
  CharacterClass, 
  CharacterGender, 
  CharacterAppearance,
  Character 
} from '../../types/character.types';
import { User } from '../../types/db';

/**
 * Factory for creating test users
 */
export const userFactory = {
  build: (overrides?: Partial<User>): User => {
    const id = uuidv4();
    const timestamp = Date.now();
    
    return {
      id,
      email: `test${timestamp}@example.com`,
      username: `user${timestamp}`,
      passwordHash: 'hashed_password',
      roles: ['user'],
      emailVerified: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      metadata: null,
      ...overrides
    };
  },
  
  buildMany: (count: number, overrides?: Partial<User>): User[] => {
    return Array.from({ length: count }, (_, i) => 
      userFactory.build({ 
        ...overrides, 
        email: `test${Date.now()}_${i}@example.com`,
        username: `user${Date.now()}_${i}`
      })
    );
  }
};

/**
 * Factory for creating test characters
 */
export const characterFactory = {
  build: (overrides?: Partial<Character>): Character => {
    const id = uuidv4();
    const accountId = overrides?.accountId || uuidv4();
    
    return {
      id,
      accountId,
      name: `TestCharacter${Date.now()}`,
      race: CharacterRace.HUMAN,
      class: CharacterClass.WARRIOR,
      gender: CharacterGender.MALE,
      level: 1,
      experience: 0,
      // Base Stats
      baseStrength: 10,
      baseDexterity: 10,
      baseIntelligence: 10,
      baseWisdom: 10,
      baseConstitution: 10,
      baseCharisma: 10,
      // Stat Tiers
      strengthTier: 0,
      dexterityTier: 0,
      intelligenceTier: 0,
      wisdomTier: 0,
      constitutionTier: 0,
      charismaTier: 0,
      // Bonus Stats
      bonusStrength: 0,
      bonusDexterity: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusConstitution: 0,
      bonusCharisma: 0,
      // Progression
      prestigeLevel: 0,
      paragonPoints: 0,
      paragonDistribution: {},
      // Resources
      currentHp: 100,
      maxHp: 100,
      currentMp: 100,
      maxMp: 100,
      currentStamina: 100,
      maxStamina: 100,
      // Economy
      gold: 100,
      bankSlots: 20,
      // Location & Appearance
      appearance: appearanceFactory.build(),
      currentZone: 'starter_zone',
      position: { x: 0, y: 0, z: 0 },
      // Meta
      isDeleted: false,
      lastPlayedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  },
  
  buildMany: (count: number, overrides?: Partial<Character>): Character[] => {
    return Array.from({ length: count }, (_, i) => 
      characterFactory.build({ 
        ...overrides, 
        name: `TestCharacter${Date.now()}_${i}`
      })
    );
  }
};

/**
 * Factory for creating character appearance
 */
export const appearanceFactory = {
  build: (overrides?: Partial<CharacterAppearance>): CharacterAppearance => {
    return {
      skinTone: '1',
      hairStyle: '1',
      hairColor: '#8B4513',
      eyeColor: '#0000FF',
      height: 50,
      build: 50,
      faceType: 'normal',
      features: {},
      ...overrides
    };
  }
};


/**
 * Factory for creating auth tokens
 */
export const authTokenFactory = {
  build: (userId: string): { accessToken: string; refreshToken: string } => {
    // In real tests, these would be actual JWT tokens
    return {
      accessToken: `test_access_token_${userId}`,
      refreshToken: `test_refresh_token_${userId}`
    };
  }
};

/**
 * Factory for creating test monsters
 */
export const monsterFactory = {
  build: (overrides?: any): any => {
    const id = uuidv4();
    
    return {
      id,
      templateId: 'goblin_warrior',
      name: 'Goblin Warrior',
      level: 5,
      currentHealth: 150,
      maxHealth: 150,
      position: { x: 0, y: 0, z: 0 },
      zoneId: 'starter_zone',
      isAlive: true,
      respawnTime: 60,
      ...overrides
    };
  }
};

/**
 * Factory for creating test NPCs
 */
export const npcFactory = {
  build: (overrides?: any): any => {
    const id = uuidv4();
    
    return {
      id,
      templateId: 'merchant_01',
      name: 'Village Merchant',
      position: { x: 100, y: 0, z: 50 },
      zoneId: 'starter_zone',
      dialogueTree: 'merchant_basic',
      ...overrides
    };
  }
};