/**
 * Database test helpers
 */
import { db } from '../../database/config';
import { users, characters, userSessions } from '../../database/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Database cleanup utility
 */
export class DatabaseCleaner {
  private cleanupFns: Array<() => Promise<void>> = [];
  
  /**
   * Register a user for cleanup
   */
  addUser(userId: string): void {
    this.cleanupFns.push(async () => {
      await db.delete(characters).where(eq(characters.accountId, userId));
      await db.delete(userSessions).where(eq(userSessions.userId, userId));
      await db.delete(users).where(eq(users.id, userId));
    });
  }
  
  /**
   * Register a character for cleanup
   */
  addCharacter(characterId: string): void {
    this.cleanupFns.push(async () => {
      await db.delete(characters).where(eq(characters.id, characterId));
    });
  }
  
  /**
   * Register custom cleanup function
   */
  addCustom(fn: () => Promise<void>): void {
    this.cleanupFns.push(fn);
  }
  
  /**
   * Clean up all registered entities
   */
  async cleanup(): Promise<void> {
    // Execute cleanup in reverse order (LIFO)
    for (const fn of this.cleanupFns.reverse()) {
      try {
        await fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    
    this.cleanupFns = [];
  }
}

/**
 * Database transaction helper for tests
 */
export async function withTransaction<T>(
  fn: (tx: any) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    try {
      return await fn(tx);
    } catch (error) {
      // Transaction will automatically rollback
      throw error;
    }
  });
}

/**
 * Clear all test data from database
 */
export async function clearTestData(): Promise<void> {
  // Clear in order to respect foreign key constraints
  await db.delete(characters).where(sql`1=1`);
  await db.delete(userSessions).where(sql`1=1`);
  await db.delete(users).where(sql`email LIKE 'test%@example.com'`);
}

/**
 * Seed database with test data
 */
export async function seedTestData(): Promise<{
  users: any[];
  characters: any[];
}> {
  // Create test users
  const testUsers = await db.insert(users).values([
    {
      email: 'test1@example.com',
      username: 'testuser1',
      passwordHash: 'hashed_password_1'
    },
    {
      email: 'test2@example.com',
      username: 'testuser2',
      passwordHash: 'hashed_password_2'
    }
  ] as any).returning();
  
  // Create test characters
  const testCharacters = await db.insert(characters).values([
    {
      accountId: testUsers[0].id,
      name: 'TestWarrior',
      race: 'human' as const,
      class: 'warrior' as const,
      gender: 'male' as const,
      level: 10,
      experience: 5000,
      currentZone: 'starter_zone',
      baseStrength: 15,
      baseDexterity: 10,
      baseIntelligence: 8,
      baseWisdom: 10,
      baseConstitution: 12,
      baseCharisma: 10,
      strengthTier: 0,
      dexterityTier: 0,
      intelligenceTier: 0,
      wisdomTier: 0,
      constitutionTier: 0,
      charismaTier: 0,
      bonusStrength: 0,
      bonusDexterity: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusConstitution: 0,
      bonusCharisma: 0,
      prestigeLevel: 0,
      paragonPoints: 0,
      paragonDistribution: {},
      currentHp: 120,
      maxHp: 120,
      currentMp: 80,
      maxMp: 80,
      currentStamina: 100,
      maxStamina: 100,
      gold: 100,
      bankSlots: 20,
      appearance: { 
        hairColor: '#000000', 
        eyeColor: '#0000FF', 
        skinTone: 1, 
        height: 180, 
        build: 1,
        hairStyle: 1,
        skinColor: '#FDBCB4'
      },
      position: { x: 0, y: 0, z: 0 },
      isDead: false,
      deathCount: 0,
      isDeleted: false
    },
    {
      accountId: testUsers[1].id,
      name: 'TestMage',
      race: 'elf' as const,
      class: 'mage' as const,
      gender: 'female' as const,
      level: 5,
      experience: 1000,
      currentZone: 'starter_zone',
      baseStrength: 8,
      baseDexterity: 12,
      baseIntelligence: 15,
      baseWisdom: 12,
      baseConstitution: 10,
      baseCharisma: 10,
      strengthTier: 0,
      dexterityTier: 0,
      intelligenceTier: 0,
      wisdomTier: 0,
      constitutionTier: 0,
      charismaTier: 0,
      bonusStrength: 0,
      bonusDexterity: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusConstitution: 0,
      bonusCharisma: 0,
      prestigeLevel: 0,
      paragonPoints: 0,
      paragonDistribution: {},
      currentHp: 80,
      maxHp: 80,
      currentMp: 150,
      maxMp: 150,
      currentStamina: 100,
      maxStamina: 100,
      gold: 100,
      bankSlots: 20,
      appearance: { 
        hairColor: '#FFD700', 
        eyeColor: '#00FF00', 
        skinTone: 1, 
        height: 170, 
        build: 1,
        hairStyle: 2,
        skinColor: '#FDBCB4'
      },
      position: { x: 0, y: 0, z: 0 },
      isDead: false,
      deathCount: 0,
      isDeleted: false
    }
  ] as any).returning();
  
  return {
    users: testUsers,
    characters: testCharacters
  };
}

/**
 * Wait for database connection
 */
export async function waitForDatabase(
  maxAttempts: number = 10,
  delay: number = 1000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Try a simple query
      await db.execute(sql`SELECT 1`);
      return;
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw new Error(`Database connection failed after ${maxAttempts} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Get database statistics for debugging
 */
export async function getDatabaseStats(): Promise<{
  userCount: number;
  characterCount: number;
  sessionCount: number;
}> {
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [characterCount] = await db.select({ count: sql<number>`count(*)` }).from(characters);
  const [sessionCount] = await db.select({ count: sql<number>`count(*)` }).from(userSessions);
  
  return {
    userCount: Number(userCount.count),
    characterCount: Number(characterCount.count),
    sessionCount: Number(sessionCount.count)
  };
}

/**
 * Create a test database connection
 */
export function createTestDatabase() {
  // Return the existing db instance for now
  // In a more complex setup, this could create an isolated test database
  return db;
}