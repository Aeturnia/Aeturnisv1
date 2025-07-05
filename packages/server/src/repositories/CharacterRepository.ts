import { eq, and, desc } from 'drizzle-orm';
import { characters } from '../database/schema';
import { Character, CreateCharacterDTO, CharacterListItem } from '../types/character.types';
import { StatsService } from '../services/StatsService';
import { db } from '../database/config';

export class CharacterRepository {
  async create(accountId: string, data: CreateCharacterDTO): Promise<Character> {
    const startingStats = StatsService.getStartingStats(data.class);
    
    // Calculate initial derived stats for HP/MP/Stamina
    const tempCharacter = {
      level: 1,
      race: data.race,
      class: data.class,
      baseStrength: startingStats.strength,
      baseDexterity: startingStats.dexterity,
      baseIntelligence: startingStats.intelligence,
      baseWisdom: startingStats.wisdom,
      baseConstitution: startingStats.constitution,
      baseCharisma: startingStats.charisma,
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
    } as Character;
    
    const derivedStats = StatsService.calculateDerivedStats(tempCharacter);
    
    const result = await db.insert(characters).values({
      accountId,
      name: data.name,
      level: 1,
      experience: 0,
      race: data.race,
      class: data.class,
      gender: data.gender,
      
      // Base stats from starting stats
      baseStrength: startingStats.strength,
      baseDexterity: startingStats.dexterity,
      baseIntelligence: startingStats.intelligence,
      baseWisdom: startingStats.wisdom,
      baseConstitution: startingStats.constitution,
      baseCharisma: startingStats.charisma,
      
      // Initialize tiers to 0
      strengthTier: 0,
      dexterityTier: 0,
      intelligenceTier: 0,
      wisdomTier: 0,
      constitutionTier: 0,
      charismaTier: 0,
      
      // Initialize bonus stats to 0
      bonusStrength: 0,
      bonusDexterity: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusConstitution: 0,
      bonusCharisma: 0,
      
      // Initialize progression systems
      prestigeLevel: 0,
      paragonPoints: 0,
      paragonDistribution: {},
      
      // Set initial resource pools
      currentHp: derivedStats.maxHp,
      maxHp: derivedStats.maxHp,
      currentMp: derivedStats.maxMp,
      maxMp: derivedStats.maxMp,
      currentStamina: derivedStats.maxStamina,
      maxStamina: derivedStats.maxStamina,
      
      // Set appearance and location
      appearance: data.appearance,
      currentZone: 'starter_zone',
      position: { x: 0, y: 0, z: 0 },
      
      // Set meta fields
      isDeleted: false,
      lastPlayedAt: null,
    }).returning();
    
    return result[0] as Character;
  }

  async findById(id: string): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .limit(1);
    
    return result[0] as Character || null;
  }

  async findByName(name: string): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(and(eq(characters.name, name), eq(characters.isDeleted, false)))
      .limit(1);
    
    return result[0] as Character || null;
  }

  async findByAccountId(accountId: string): Promise<CharacterListItem[]> {
    const result = await db
      .select({
        id: characters.id,
        name: characters.name,
        level: characters.level,
        race: characters.race,
        class: characters.class,
        lastPlayedAt: characters.lastPlayedAt,
      })
      .from(characters)
      .where(and(eq(characters.accountId, accountId), eq(characters.isDeleted, false)))
      .orderBy(desc(characters.lastPlayedAt));
    
    return result as CharacterListItem[];
  }

  async update(id: string, updates: Partial<Character>): Promise<Character | null> {
    const result = await db
      .update(characters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async updateLastPlayed(id: string): Promise<void> {
    await db
      .update(characters)
      .set({
        lastPlayedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)));
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await db
      .update(characters)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result.length > 0;
  }

  async updateStats(id: string, statUpdates: {
    baseStrength?: number;
    baseDexterity?: number;
    baseIntelligence?: number;
    baseWisdom?: number;
    baseConstitution?: number;
    baseCharisma?: number;
    strengthTier?: number;
    dexterityTier?: number;
    intelligenceTier?: number;
    wisdomTier?: number;
    constitutionTier?: number;
    charismaTier?: number;
    bonusStrength?: bigint;
    bonusDexterity?: bigint;
    bonusIntelligence?: bigint;
    bonusWisdom?: bigint;
    bonusConstitution?: bigint;
    bonusCharisma?: bigint;
  }): Promise<Character | null> {
    // Convert bigint bonus stats to numbers for database
    const updates: any = { ...statUpdates };
    if (updates.bonusStrength !== undefined) updates.bonusStrength = Number(updates.bonusStrength);
    if (updates.bonusDexterity !== undefined) updates.bonusDexterity = Number(updates.bonusDexterity);
    if (updates.bonusIntelligence !== undefined) updates.bonusIntelligence = Number(updates.bonusIntelligence);
    if (updates.bonusWisdom !== undefined) updates.bonusWisdom = Number(updates.bonusWisdom);
    if (updates.bonusConstitution !== undefined) updates.bonusConstitution = Number(updates.bonusConstitution);
    if (updates.bonusCharisma !== undefined) updates.bonusCharisma = Number(updates.bonusCharisma);
    
    const result = await db
      .update(characters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async updateResources(id: string, resources: {
    currentHp?: bigint;
    currentMp?: bigint;
    currentStamina?: bigint;
  }): Promise<Character | null> {
    // Convert bigint resources to numbers for database
    const updates: any = { ...resources };
    if (updates.currentHp !== undefined) updates.currentHp = Number(updates.currentHp);
    if (updates.currentMp !== undefined) updates.currentMp = Number(updates.currentMp);
    if (updates.currentStamina !== undefined) updates.currentStamina = Number(updates.currentStamina);
    
    const result = await db
      .update(characters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async updatePosition(id: string, zone: string, position: { x: number; y: number; z: number; rotation?: number }): Promise<Character | null> {
    const result = await db
      .update(characters)
      .set({
        currentZone: zone,
        position,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async updatePrestige(id: string, prestigeLevel: number): Promise<Character | null> {
    const result = await db
      .update(characters)
      .set({
        prestigeLevel,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async updateParagon(id: string, paragonPoints: bigint, distribution: Record<string, bigint>): Promise<Character | null> {
    const result = await db
      .update(characters)
      .set({
        paragonPoints: Number(paragonPoints),
        paragonDistribution: distribution,
        updatedAt: new Date(),
      })
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async updateExperience(id: string, experience: bigint, level?: number): Promise<Character | null> {
    const updateData: Record<string, unknown> = {
      experience,
      updatedAt: new Date(),
    };

    if (level !== undefined) {
      updateData.level = level;
    }

    const result = await db
      .update(characters)
      .set(updateData)
      .where(and(eq(characters.id, id), eq(characters.isDeleted, false)))
      .returning();
    
    return result[0] as Character || null;
  }

  async getCharacterCount(accountId: string): Promise<number> {
    const result = await db
      .select({ count: characters.id })
      .from(characters)
      .where(and(eq(characters.accountId, accountId), eq(characters.isDeleted, false)));
    
    return result.length;
  }

  async isNameTaken(name: string): Promise<boolean> {
    const result = await db
      .select({ id: characters.id })
      .from(characters)
      .where(and(eq(characters.name, name), eq(characters.isDeleted, false)))
      .limit(1);
    
    return result.length > 0;
  }
}