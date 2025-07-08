import { CharacterRepository } from '../repositories/CharacterRepository';
import { Character, CreateCharacterDTO, CharacterListItem, CharacterRace } from '../types/character.types';
import { StatsService } from './StatsService';
import { CacheService } from './CacheService';

export class CharacterService {
  private characterRepo: CharacterRepository;
  private cacheService: CacheService;

  constructor() {
    this.characterRepo = new CharacterRepository();
    this.cacheService = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  async createCharacter(accountId: string, data: CreateCharacterDTO): Promise<Character> {
    // Validate character name availability
    const isNameTaken = await this.characterRepo.isNameTaken(data.name);
    if (isNameTaken) {
      throw new Error(`Character name "${data.name}" is already taken`);
    }

    // Check character count limits
    const characterCount = await this.characterRepo.getCharacterCount(accountId);
    const maxCharacters = 10; // Configurable limit
    
    if (characterCount >= maxCharacters) {
      throw new Error(`Maximum character limit (${maxCharacters}) reached`);
    }

    // Create the character with initial stats
    const character = await this.characterRepo.create(accountId, data);

    // Cache the new character for quick access
    await this.cacheService.set(
      `character:${character.id}`,
      character,
      3600 // 1 hour
    );

    return character;
  }

  async getCharacter(id: string): Promise<Character | null> {
    // Try cache first
    const cached = await this.cacheService.get<Character>(`character:${id}`);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const character = await this.characterRepo.findById(id);
    if (character) {
      // Cache for future requests
      await this.cacheService.set(
        `character:${id}`,
        character,
        3600
      );
    }

    return character;
  }

  async getCharactersByAccount(accountId: string): Promise<CharacterListItem[]> {
    // Try cache first
    const cacheKey = `account:${accountId}:characters`;
    const cached = await this.cacheService.get<CharacterListItem[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const characters = await this.characterRepo.findByAccountId(accountId);
    
    // Cache for future requests
    await this.cacheService.set(cacheKey, characters, 600); // 10 minutes

    return characters;
  }

  async getCharacterWithStats(id: string): Promise<{
    character: Character;
    derivedStats: Record<string, number>;
  } | null> {
    const character = await this.getCharacter(id);
    if (!character) {
      return null;
    }

    const derivedStats = StatsService.calculateDerivedStats(character);

    return {
      character,
      derivedStats
    };
  }

  async updateLastPlayed(id: string): Promise<void> {
    await this.characterRepo.updateLastPlayed(id);
    
    // Invalidate cache
    await this.cacheService.delete(`character:${id}`);
  }

  async deleteCharacter(id: string, accountId: string): Promise<boolean> {
    // Verify ownership
    const character = await this.characterRepo.findById(id);
    if (!character || character.accountId !== accountId) {
      return false;
    }

    const success = await this.characterRepo.softDelete(id);
    
    if (success) {
      // Clear caches
      await this.cacheService.delete(`character:${id}`);
      await this.cacheService.delete(`account:${accountId}:characters`);
    }

    return success;
  }

  async gainExperience(id: string, expGained: bigint): Promise<Character | null> {
    const character = await this.getCharacter(id);
    if (!character) {
      return null;
    }

    const newExp = character.experience + Number(expGained);
    let newLevel = character.level;

    // Calculate level up - simple exponential scaling
    const expForNextLevel = this.calculateExpForLevel(character.level + 1);
    if (newExp >= Number(expForNextLevel)) {
      newLevel = this.calculateLevelFromExp(BigInt(newExp));
    }

    const updatedCharacter = await this.characterRepo.updateExperience(
      id,
      BigInt(newExp),
      newLevel !== character.level ? newLevel : undefined
    );

    if (updatedCharacter) {
      // Clear cache to force refresh
      await this.cacheService.delete(`character:${id}`);

      // If leveled up, recalculate HP/MP/Stamina
      if (newLevel > character.level) {
        await this.recalculateResources(id);
      }
    }

    return updatedCharacter;
  }

  private calculateExpForLevel(level: number): bigint {
    // Exponential scaling: level^2.5 * 100
    return BigInt(Math.floor(Math.pow(level, 2.5) * 100));
  }

  private calculateLevelFromExp(exp: bigint): number {
    const expNum = Number(exp);
    // Reverse of exponential formula
    return Math.floor(Math.pow(expNum / 100, 1 / 2.5));
  }

  async allocateStatPoint(id: string, stat: keyof Character, points: number): Promise<Character | null> {
    const character = await this.getCharacter(id);
    if (!character) {
      return null;
    }

    // Validate stat allocation
    const validStats = [
      'baseStrength', 'baseDexterity', 'baseIntelligence',
      'baseWisdom', 'baseConstitution', 'baseCharisma'
    ];

    if (!validStats.includes(stat)) {
      throw new Error('Invalid stat for allocation');
    }

    // Calculate tier progression if applicable
    const currentValue = character[stat] as number;
    const newValue = currentValue + points;

    // Check if we should upgrade to a new tier
    const tierProgress = StatsService.calculateStatTierProgress(newValue, points);

    const updates: Partial<Character> = {
      [stat]: tierProgress.newBase
    };

    // Add tier upgrade if applicable
    if (tierProgress.shouldUpgrade) {
      const tierStat = stat.replace('base', '').toLowerCase() + 'Tier';
      updates[tierStat] = character[tierStat as keyof Character] as number + tierProgress.newTier;
    }

    const updatedCharacter = await this.characterRepo.updateStats(id, updates);

    if (updatedCharacter) {
      // Clear cache and recalculate resources
      await this.cacheService.delete(`character:${id}`);
      await this.recalculateResources(id);
    }

    return updatedCharacter;
  }

  async updatePosition(id: string, zone: string, x: number, y: number, z: number, rotation?: number): Promise<Character | null> {
    const position = { x, y, z, rotation };
    const updatedCharacter = await this.characterRepo.updatePosition(id, zone, position);

    if (updatedCharacter) {
      await this.cacheService.delete(`character:${id}`);
    }

    return updatedCharacter;
  }

  async updateResources(id: string, hp?: bigint, mp?: bigint, stamina?: bigint): Promise<Character | null> {
    const resources: Record<string, number> = {};
    if (hp !== undefined) resources.currentHp = hp;
    if (mp !== undefined) resources.currentMp = mp;
    if (stamina !== undefined) resources.currentStamina = stamina;

    const updatedCharacter = await this.characterRepo.updateResources(id, resources);

    if (updatedCharacter) {
      await this.cacheService.delete(`character:${id}`);
    }

    return updatedCharacter;
  }

  async prestigeCharacter(id: string): Promise<Character | null> {
    const character = await this.getCharacter(id);
    if (!character) {
      return null;
    }

    // Check if character can prestige
    if (!StatsService.canPrestige(character)) {
      throw new Error('Character does not meet prestige requirements');
    }

    // Reset character to level 1 with prestige bonus
    const updatedCharacter = await this.characterRepo.updatePrestige(
      id,
      character.prestigeLevel + 1
    );

    if (updatedCharacter) {
      await this.cacheService.delete(`character:${id}`);
      await this.recalculateResources(id);
    }

    return updatedCharacter;
  }

  async allocateParagonPoints(id: string, distribution: Record<string, bigint>): Promise<Character | null> {
    const character = await this.getCharacter(id);
    if (!character) {
      return null;
    }

    // Check if paragon system is unlocked
    if (!StatsService.hasParagonUnlocked(character)) {
      throw new Error('Paragon system not unlocked');
    }

    // Validate point distribution doesn't exceed available points
    const totalAllocated = Object.values(distribution).reduce((sum, points) => sum + points, BigInt(0));
    if (totalAllocated > character.paragonPoints) {
      throw new Error('Not enough paragon points available');
    }

    const updatedCharacter = await this.characterRepo.updateParagon(
      id,
      BigInt(character.paragonPoints - Number(totalAllocated)),
      { ...character.paragonDistribution, ...distribution }
    );

    if (updatedCharacter) {
      await this.cacheService.delete(`character:${id}`);
      await this.recalculateResources(id);
    }

    return updatedCharacter;
  }

  private async recalculateResources(id: string): Promise<void> {
    const character = await this.characterRepo.findById(id);
    if (!character) return;

    const derivedStats = StatsService.calculateDerivedStats(character);

    // Update max resources and heal to full
    await this.characterRepo.updateResources(id, {
      currentHp: derivedStats.maxHp,
      currentMp: derivedStats.maxMp,
      currentStamina: derivedStats.maxStamina
    });

    // Update max resource values in character record
    await this.characterRepo.update(id, {
      maxHp: Number(derivedStats.maxHp),
      maxMp: Number(derivedStats.maxMp),
      maxStamina: Number(derivedStats.maxStamina)
    });
  }

  async validateCharacterName(name: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    // Name validation rules
    if (name.length < 3 || name.length > 32) {
      return { isValid: false, error: 'Name must be between 3 and 32 characters' };
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      return { isValid: false, error: 'Name must start with a letter and contain only letters, numbers, and underscores' };
    }

    // Check profanity filter (basic implementation)
    const bannedWords = ['admin', 'moderator', 'gm', 'test'];
    const lowerName = name.toLowerCase();
    if (bannedWords.some(word => lowerName.includes(word))) {
      return { isValid: false, error: 'Name contains forbidden words' };
    }

    // Check availability
    const isNameTaken = await this.characterRepo.isNameTaken(name);
    if (isNameTaken) {
      return { isValid: false, error: 'Name is already taken' };
    }

    return { isValid: true };
  }

  async getRandomStartingAppearance(race: CharacterRace): Promise<Record<string, string | number>> {
    // Generate random appearance based on race
    const appearances = {
      [CharacterRace.HUMAN]: {
        skinTone: 'fair',
        hairStyle: 'short',
        hairColor: 'brown',
        eyeColor: 'brown',
        height: 50,
        build: 50,
        faceType: 'oval'
      },
      [CharacterRace.ELF]: {
        skinTone: 'pale',
        hairStyle: 'long',
        hairColor: 'blonde',
        eyeColor: 'green',
        height: 60,
        build: 40,
        faceType: 'angular'
      },
      [CharacterRace.DWARF]: {
        skinTone: 'ruddy',
        hairStyle: 'braided',
        hairColor: 'red',
        eyeColor: 'brown',
        height: 30,
        build: 70,
        faceType: 'square'
      },
      [CharacterRace.ORC]: {
        skinTone: 'green',
        hairStyle: 'mohawk',
        hairColor: 'black',
        eyeColor: 'red',
        height: 70,
        build: 80,
        faceType: 'rugged'
      },
      [CharacterRace.HALFLING]: {
        skinTone: 'fair',
        hairStyle: 'curly',
        hairColor: 'brown',
        eyeColor: 'hazel',
        height: 25,
        build: 35,
        faceType: 'round'
      },
      [CharacterRace.DRAGONBORN]: {
        skinTone: 'scaled',
        hairStyle: 'none',
        hairColor: 'none',
        eyeColor: 'gold',
        height: 65,
        build: 60,
        faceType: 'draconic'
      }
    };

    return appearances[race] || appearances[CharacterRace.HUMAN];
  }
}