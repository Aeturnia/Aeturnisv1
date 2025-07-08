export enum CharacterRace {
  HUMAN = 'human',
  ELF = 'elf',
  DWARF = 'dwarf',
  ORC = 'orc',
  HALFLING = 'halfling',
  DRAGONBORN = 'dragonborn'
}

export enum CharacterClass {
  WARRIOR = 'warrior',
  RANGER = 'ranger',
  MAGE = 'mage',
  CLERIC = 'cleric',
  ROGUE = 'rogue',
  PALADIN = 'paladin'
}

export enum CharacterGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface BaseStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  constitution: number;
  charisma: number;
}

export interface StatTiers {
  strengthTier: number;
  dexterityTier: number;
  intelligenceTier: number;
  wisdomTier: number;
  constitutionTier: number;
  charismaTier: number;
}

export interface BonusStats {
  bonusStrength: bigint;
  bonusDexterity: bigint;
  bonusIntelligence: bigint;
  bonusWisdom: bigint;
  bonusConstitution: bigint;
  bonusCharisma: bigint;
}

export interface ParagonDistribution {
  strength?: bigint;
  dexterity?: bigint;
  intelligence?: bigint;
  wisdom?: bigint;
  constitution?: bigint;
  charisma?: bigint;
}

export interface DerivedStats {
  // Effective Stats (after all modifiers)
  effectiveStrength: number;
  effectiveDexterity: number;
  effectiveIntelligence: number;
  effectiveWisdom: number;
  effectiveConstitution: number;
  effectiveCharisma: number;
  
  // Combat
  physicalDamage: number;
  magicalDamage: number;
  physicalDefense: number;
  magicalDefense: number;
  criticalChance: number;
  criticalDamage: number;
  dodgeChance: number;
  blockChance: number;
  
  // Resources
  maxHp: bigint;
  maxMp: bigint;
  maxStamina: bigint;
  hpRegen: number;
  mpRegen: number;
  staminaRegen: number;
  
  // Movement & Utility
  moveSpeed: number;
  attackSpeed: number;
  castSpeed: number;
  itemFindBonus: number;
  expBonus: number;
  
  // Power Rating (overall character strength indicator)
  powerRating: bigint;
}

export interface CharacterAppearance {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  height: number; // 0-100 scale
  build: number; // 0-100 scale
  faceType: string;
  features: Record<string, unknown>;
}

export interface CharacterPosition {
  x: number;
  y: number;
  z: number;
  rotation?: number;
}

export interface Character {
  id: string;
  accountId: string;
  name: string;
  level: number;
  experience: number;
  race: CharacterRace;
  class: CharacterClass;
  gender: CharacterGender;
  
  // Base Stats (1-100 soft cap)
  baseStrength: number;
  baseDexterity: number;
  baseIntelligence: number;
  baseWisdom: number;
  baseConstitution: number;
  baseCharisma: number;
  
  // Stat Tiers (0-∞)
  strengthTier: number;
  dexterityTier: number;
  intelligenceTier: number;
  wisdomTier: number;
  constitutionTier: number;
  charismaTier: number;
  
  // Bonus Stats (from gear/buffs)
  bonusStrength: number;
  bonusDexterity: number;
  bonusIntelligence: number;
  bonusWisdom: number;
  bonusConstitution: number;
  bonusCharisma: number;
  
  // Progression Systems
  prestigeLevel: number;
  paragonPoints: number;
  paragonDistribution: ParagonDistribution;
  
  // Resources
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  currentStamina: number;
  maxStamina: number;
  
  // Economy
  gold: number;
  bankSlots: number;
  
  // Location & Appearance
  appearance: CharacterAppearance;
  currentZone: string;
  position: CharacterPosition;
  
  // Meta
  isDeleted: boolean;
  lastPlayedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCharacterDTO {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  gender: CharacterGender;
  appearance: CharacterAppearance;
}

export interface CharacterListItem {
  id: string;
  name: string;
  level: number;
  race: CharacterRace;
  class: CharacterClass;
  lastPlayedAt: Date | null;
}