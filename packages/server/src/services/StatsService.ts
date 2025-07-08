import { Character, BaseStats, DerivedStats, CharacterClass, CharacterRace } from '../types/character.types';

export class StatsService {
  // Race stat modifiers
  private static readonly RACE_MODIFIERS: Record<CharacterRace, Partial<BaseStats>> = {
    [CharacterRace.HUMAN]: { /* balanced, no modifiers */ },
    [CharacterRace.ELF]: { dexterity: 2, intelligence: 1, constitution: -1 },
    [CharacterRace.DWARF]: { constitution: 2, strength: 1, dexterity: -1 },
    [CharacterRace.ORC]: { strength: 2, constitution: 1, intelligence: -1 },
    [CharacterRace.HALFLING]: { dexterity: 2, charisma: 1, strength: -1 },
    [CharacterRace.DRAGONBORN]: { strength: 1, charisma: 2, wisdom: -1 }
  };

  // Class stat priorities (affects scaling)
  private static readonly CLASS_SCALING: Record<CharacterClass, Record<keyof BaseStats, number>> = {
    [CharacterClass.WARRIOR]: { strength: 1.5, constitution: 1.3, dexterity: 0.8, intelligence: 0.5, wisdom: 0.7, charisma: 0.6 },
    [CharacterClass.RANGER]: { dexterity: 1.5, wisdom: 1.2, strength: 0.9, constitution: 0.8, intelligence: 0.7, charisma: 0.7 },
    [CharacterClass.MAGE]: { intelligence: 1.5, wisdom: 1.2, charisma: 0.8, constitution: 0.6, strength: 0.5, dexterity: 0.7 },
    [CharacterClass.CLERIC]: { wisdom: 1.5, intelligence: 1.1, constitution: 0.9, charisma: 1.0, strength: 0.7, dexterity: 0.6 },
    [CharacterClass.ROGUE]: { dexterity: 1.5, intelligence: 1.1, strength: 0.8, charisma: 0.9, wisdom: 0.6, constitution: 0.7 },
    [CharacterClass.PALADIN]: { strength: 1.3, wisdom: 1.3, constitution: 1.1, charisma: 0.9, dexterity: 0.7, intelligence: 0.6 }
  };

  // Progression thresholds
  private static readonly TIER_THRESHOLD = 100; // Base stat points before gaining a tier
  private static readonly PARAGON_UNLOCK_LEVEL = 100;
  private static readonly PRESTIGE_UNLOCK_LEVEL = 500;

  /**
   * Calculate effective stat value with infinite scaling
   * This is the core formula for infinite progression
   * SECURITY: Always clamp negative values to ensure positive stats
   */
  private static calculateEffectiveStat(
    base: number,
    tier: number,
    bonus: bigint,
    paragonPoints: bigint,
    prestigeLevel: number,
    classScaling: number = 1.0
  ): number {
    // SECURITY: Clamp negative base stats to 1 minimum
    const clampedBase = Math.max(1, Math.min(base, 100));
    
    // SECURITY: Clamp negative tier to 0 minimum
    const clampedTier = Math.max(0, tier);
    
    // Each tier provides significant power increase (50 effective points)
    const tierBonus = clampedTier * 50;
    
    // Bonus stats from gear/buffs with logarithmic scaling
    // SECURITY: Ensure bonus is non-negative
    const safeBonusPoints = bonus > BigInt(0) ? Number(bonus) : 0;
    const bonusEffect = safeBonusPoints > 0 
      ? Math.log10(safeBonusPoints + 1) * 20 
      : 0;
    
    // Paragon points provide smaller but stackable benefits
    // SECURITY: Ensure paragon points are non-negative
    const safeParagonPoints = paragonPoints > BigInt(0) ? Number(paragonPoints) : 0;
    const paragonEffect = safeParagonPoints > 0
      ? Math.log10(safeParagonPoints + 1) * 10
      : 0;
    
    // SECURITY: Clamp class scaling to reasonable bounds (0.1 to 3.0)
    const safeClassScaling = Math.max(0.1, Math.min(classScaling, 3.0));
    
    // Apply class scaling
    const scaledValue = (clampedBase + tierBonus + bonusEffect + paragonEffect) * safeClassScaling;
    
    // SECURITY: Clamp prestige level to reasonable bounds (0 to 10000)
    const safePrestigeLevel = Math.max(0, Math.min(prestigeLevel, 10000));
    
    // Prestige multiplier (10% per prestige level)
    const prestigeMultiplier = 1 + (safePrestigeLevel * 0.1);
    
    const rawValue = scaledValue * prestigeMultiplier;
    
    // Apply final soft cap for extreme values (starts at 1000)
    if (rawValue > 1000) {
      // Logarithmic scaling after 1000
      const softCappedValue = 1000 + Math.log10(rawValue - 999) * 100;
      // SECURITY: Final safety check for extreme values
      return Math.max(1, Math.min(softCappedValue, 1000000));
    }
    
    // SECURITY: Always return positive value
    return Math.max(1, rawValue);
  }

  /**
   * Calculate total base stats including race modifiers
   */
  static calculateTotalBaseStats(character: Character): BaseStats {
    const raceModifiers = this.RACE_MODIFIERS[character.race] || {};
    
    return {
      strength: Math.min(100, character.baseStrength + (raceModifiers.strength || 0)),
      dexterity: Math.min(100, character.baseDexterity + (raceModifiers.dexterity || 0)),
      intelligence: Math.min(100, character.baseIntelligence + (raceModifiers.intelligence || 0)),
      wisdom: Math.min(100, character.baseWisdom + (raceModifiers.wisdom || 0)),
      constitution: Math.min(100, character.baseConstitution + (raceModifiers.constitution || 0)),
      charisma: Math.min(100, character.baseCharisma + (raceModifiers.charisma || 0))
    };
  }

  /**
   * Calculate all derived stats from base stats with infinite scaling
   */
  static calculateDerivedStats(character: Character): DerivedStats {
    const baseStats = this.calculateTotalBaseStats(character);
    const classScaling = this.CLASS_SCALING[character.class];
    const level = character.level;
    
    // Get paragon point allocations
    const paragonDist = character.paragonDistribution;
    
    // Calculate effective stats with infinite scaling
    const effectiveStr = this.calculateEffectiveStat(
      baseStats.strength,
      character.strengthTier,
      BigInt(character.bonusStrength),
      paragonDist.strength || BigInt(0),
      character.prestigeLevel,
      classScaling.strength
    );
    
    const effectiveDex = this.calculateEffectiveStat(
      baseStats.dexterity,
      character.dexterityTier,
      BigInt(character.bonusDexterity),
      paragonDist.dexterity || BigInt(0),
      character.prestigeLevel,
      classScaling.dexterity
    );
    
    const effectiveInt = this.calculateEffectiveStat(
      baseStats.intelligence,
      character.intelligenceTier,
      BigInt(character.bonusIntelligence),
      paragonDist.intelligence || BigInt(0),
      character.prestigeLevel,
      classScaling.intelligence
    );
    
    const effectiveWis = this.calculateEffectiveStat(
      baseStats.wisdom,
      character.wisdomTier,
      BigInt(character.bonusWisdom),
      paragonDist.wisdom || BigInt(0),
      character.prestigeLevel,
      classScaling.wisdom
    );
    
    const effectiveCon = this.calculateEffectiveStat(
      baseStats.constitution,
      character.constitutionTier,
      BigInt(character.bonusConstitution),
      paragonDist.constitution || BigInt(0),
      character.prestigeLevel,
      classScaling.constitution
    );
    
    const effectiveCha = this.calculateEffectiveStat(
      baseStats.charisma,
      character.charismaTier,
      BigInt(character.bonusCharisma),
      paragonDist.charisma || BigInt(0),
      character.prestigeLevel,
      classScaling.charisma
    );

    // Combat stats with infinite scaling
    const physicalDamage = effectiveStr * 2 + effectiveDex * 0.5 + level * 3;
    const magicalDamage = effectiveInt * 2 + effectiveWis * 0.5 + level * 3;
    const physicalDefense = effectiveCon * 1.5 + effectiveStr * 0.5 + level * 2;
    const magicalDefense = effectiveWis * 1.5 + effectiveInt * 0.5 + level * 2;

    // Percentage stats with reasonable caps
    const criticalChance = Math.min(
      5 + (effectiveDex * 0.02) + (effectiveInt * 0.01),
      75 // 75% hard cap for crit
    );
    
    const criticalDamage = 150 + Math.min(effectiveStr * 0.1, 350); // 150-500%
    
    const dodgeChance = Math.min(
      (effectiveDex * 0.03) + (level * 0.01),
      50 // 50% hard cap for dodge
    );
    
    const blockChance = Math.min(
      (effectiveStr * 0.02) + (effectiveCon * 0.01),
      40 // 40% hard cap for block
    );

    // Resource pools with infinite scaling
    // SECURITY: Ensure resource pools are always ≥1
    const maxHp = BigInt(Math.max(1, Math.floor(
      100 + (effectiveCon * 20) + (level * 50) + (effectiveStr * 5)
    ))) * BigInt(Math.max(1, character.prestigeLevel + 1));
    
    const maxMp = BigInt(Math.max(1, Math.floor(
      50 + (effectiveInt * 15) + (level * 20) + (effectiveWis * 10)
    ))) * BigInt(Math.max(1, character.prestigeLevel + 1));
    
    const maxStamina = BigInt(Math.max(1, Math.floor(
      100 + (effectiveCon * 10) + (level * 15) + (effectiveDex * 5)
    ))) * BigInt(Math.max(1, character.prestigeLevel + 1));

    // Regeneration rates scale with stats but cap at reasonable values
    const hpRegen = Math.min(
      1 + (effectiveCon * 0.02) + (level * 0.01),
      100 // Cap at 100 HP/sec
    );
    
    const mpRegen = Math.min(
      1 + (effectiveWis * 0.03) + (effectiveInt * 0.01),
      50 // Cap at 50 MP/sec
    );
    
    const staminaRegen = Math.min(
      2 + (effectiveCon * 0.02) + (effectiveDex * 0.01),
      100 // Cap at 100 stamina/sec
    );

    // Movement and utility with soft caps
    const moveSpeed = 100 + Math.min(effectiveDex * 0.05, 100); // 100-200%
    const attackSpeed = 100 + Math.min(effectiveDex * 0.03, 80); // 100-180%
    const castSpeed = 100 + Math.min(effectiveInt * 0.03, 80); // 100-180%
    const itemFindBonus = Math.min(effectiveCha * 0.05, 200); // 0-200%
    const expBonus = Math.min(
      (effectiveWis * 0.03 + effectiveCha * 0.02) * (1 + character.prestigeLevel * 0.1),
      500 // 0-500% with prestige scaling
    );
    
    // Calculate overall power rating
    const powerRating = BigInt(Math.floor(
      effectiveStr + effectiveDex + effectiveInt + 
      effectiveWis + effectiveCon + effectiveCha +
      (level * 10) + (character.prestigeLevel * 1000)
    ));

    return {
      // Effective Stats
      effectiveStrength: Math.round(effectiveStr * 10) / 10,
      effectiveDexterity: Math.round(effectiveDex * 10) / 10,
      effectiveIntelligence: Math.round(effectiveInt * 10) / 10,
      effectiveWisdom: Math.round(effectiveWis * 10) / 10,
      effectiveConstitution: Math.round(effectiveCon * 10) / 10,
      effectiveCharisma: Math.round(effectiveCha * 10) / 10,
      // Combat Stats
      physicalDamage: Math.round(physicalDamage),
      magicalDamage: Math.round(magicalDamage),
      physicalDefense: Math.round(physicalDefense),
      magicalDefense: Math.round(magicalDefense),
      criticalChance: Math.round(criticalChance * 10) / 10,
      criticalDamage: Math.round(criticalDamage),
      dodgeChance: Math.round(dodgeChance * 10) / 10,
      blockChance: Math.round(blockChance * 10) / 10,
      maxHp,
      maxMp,
      maxStamina,
      hpRegen: Math.round(hpRegen * 10) / 10,
      mpRegen: Math.round(mpRegen * 10) / 10,
      staminaRegen: Math.round(staminaRegen * 10) / 10,
      moveSpeed: Math.round(moveSpeed),
      attackSpeed: Math.round(attackSpeed),
      castSpeed: Math.round(castSpeed),
      itemFindBonus: Math.round(itemFindBonus),
      expBonus: Math.round(expBonus),
      powerRating
    };
  }

  /**
   * Get starting stats for a new character
   */
  static getStartingStats(characterClass: CharacterClass): BaseStats {
    // Base stats before race modifiers
    const baseStats: BaseStats = {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      wisdom: 10,
      constitution: 10,
      charisma: 10
    };

    // Add small class bonuses for starting characters
    const classBonus: Partial<BaseStats> = {
      [CharacterClass.WARRIOR]: { strength: 2, constitution: 1 },
      [CharacterClass.RANGER]: { dexterity: 2, wisdom: 1 },
      [CharacterClass.MAGE]: { intelligence: 2, wisdom: 1 },
      [CharacterClass.CLERIC]: { wisdom: 2, constitution: 1 },
      [CharacterClass.ROGUE]: { dexterity: 2, intelligence: 1 },
      [CharacterClass.PALADIN]: { strength: 1, wisdom: 1, constitution: 1 }
    }[characterClass] || {};

    return {
      strength: baseStats.strength + (classBonus.strength || 0),
      dexterity: baseStats.dexterity + (classBonus.dexterity || 0),
      intelligence: baseStats.intelligence + (classBonus.intelligence || 0),
      wisdom: baseStats.wisdom + (classBonus.wisdom || 0),
      constitution: baseStats.constitution + (classBonus.constitution || 0),
      charisma: baseStats.charisma + (classBonus.charisma || 0)
    };
  }
  
  /**
   * Calculate if a character should gain a stat tier
   */
  static calculateStatTierProgress(currentBase: number, totalStatPoints: number): {
    shouldUpgrade: boolean;
    newBase: number;
    newTier: number;
  } {
    if (currentBase >= 100 && totalStatPoints >= this.TIER_THRESHOLD) {
      return {
        shouldUpgrade: true,
        newBase: 10, // Reset to 10 when gaining a tier
        newTier: 1
      };
    }
    
    return {
      shouldUpgrade: false,
      newBase: Math.min(currentBase + totalStatPoints, 100),
      newTier: 0
    };
  }
  
  /**
   * Check if character can prestige
   */
  static canPrestige(character: Character): boolean {
    return character.level >= this.PRESTIGE_UNLOCK_LEVEL && 
           character.prestigeLevel < Math.floor(character.level / this.PRESTIGE_UNLOCK_LEVEL);
  }
  
  /**
   * Check if character has unlocked paragon system
   */
  static hasParagonUnlocked(character: Character): boolean {
    return character.level >= this.PARAGON_UNLOCK_LEVEL;
  }

  /**
   * Get effective stat breakdown for UI transparency
   * This method provides detailed breakdown of how each effective stat is calculated
   */
  static getStatBreakdown(character: Character, statName: keyof BaseStats): {
    baseStat: number;
    tierBonus: number;
    equipmentBonus: number;
    paragonBonus: number;
    classScaling: number;
    prestigeMultiplier: number;
    effectiveValue: number;
    formula: string;
  } {
    const baseStats = this.calculateTotalBaseStats(character);
    const classScaling = this.CLASS_SCALING[character.class];
    const paragonDist = character.paragonDistribution;
    
    // Get stat-specific values
    const baseStat = baseStats[statName];
    const tier = character[`${statName}Tier` as keyof Character] as number;
    const bonusStat = BigInt(character[`bonus${statName.charAt(0).toUpperCase() + statName.slice(1)}` as keyof Character] as number);
    const paragonPoints = paragonDist[statName] || BigInt(0);
    const scaling = classScaling[statName];
    
    // Calculate components
    const clampedBase = Math.max(1, Math.min(baseStat, 100));
    const tierBonus = Math.max(0, tier) * 50;
    const equipmentBonus = bonusStat > BigInt(0) ? Math.log10(Number(bonusStat) + 1) * 20 : 0;
    const paragonBonus = paragonPoints > BigInt(0) ? Math.log10(Number(paragonPoints) + 1) * 10 : 0;
    const prestigeMultiplier = 1 + (Math.max(0, character.prestigeLevel) * 0.1);
    
    const preMultiplier = (clampedBase + tierBonus + equipmentBonus + paragonBonus) * scaling;
    const effectiveValue = preMultiplier * prestigeMultiplier;
    
    const formula = `((${clampedBase} + ${tierBonus} + ${equipmentBonus.toFixed(1)} + ${paragonBonus.toFixed(1)}) × ${scaling}) × ${prestigeMultiplier}`;
    
    return {
      baseStat: clampedBase,
      tierBonus,
      equipmentBonus: Math.round(equipmentBonus * 10) / 10,
      paragonBonus: Math.round(paragonBonus * 10) / 10,
      classScaling: scaling,
      prestigeMultiplier,
      effectiveValue: Math.round(effectiveValue * 10) / 10,
      formula
    };
  }

  /**
   * Validate stat modification request (server-authoritative security)
   */
  static validateStatModification(
    _character: Character, 
    statUpdates: Record<string, number | bigint>,
    requestSource: 'server' | 'client' = 'client'
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // SECURITY: Only server can modify certain stats
    const serverOnlyStats = ['prestigeLevel', 'paragonPoints', 'experiencePoints'];
    
    if (requestSource === 'client') {
      for (const stat of serverOnlyStats) {
        if (stat in statUpdates) {
          errors.push(`Client cannot modify ${stat} - server authoritative only`);
        }
      }
    }
    
    // Validate base stat ranges (1-100)
    const baseStatKeys = ['baseStrength', 'baseDexterity', 'baseIntelligence', 'baseWisdom', 'baseConstitution', 'baseCharisma'];
    for (const key of baseStatKeys) {
      if (key in statUpdates) {
        const value = statUpdates[key];
        if (typeof value !== 'number' || value < 1 || value > 100) {
          errors.push(`${key} must be between 1 and 100`);
        }
      }
    }
    
    // Validate tier values (non-negative)
    const tierKeys = ['strengthTier', 'dexterityTier', 'intelligenceTier', 'wisdomTier', 'constitutionTier', 'charismaTier'];
    for (const key of tierKeys) {
      if (key in statUpdates) {
        const value = statUpdates[key];
        if (typeof value !== 'number' || value < 0) {
          errors.push(`${key} cannot be negative`);
        }
      }
    }
    
    // Validate prestige level
    if ('prestigeLevel' in statUpdates) {
      const value = statUpdates.prestigeLevel;
      if (typeof value !== 'number' || value < 0 || value > 10000) {
        errors.push('Prestige level must be between 0 and 10000');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}