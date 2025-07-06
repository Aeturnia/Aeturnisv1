import { Position3D } from '@aeturnis/shared';

/**
 * Result of handling character death
 */
export interface DeathResult {
  characterId: string;
  deathLocation: Position3D;
  respawnLocation: Position3D;
  respawnGraveyardId: string;
  penalties: DeathPenalties;
  timestamp: Date;
}

/**
 * Death penalties applied to character
 */
export interface DeathPenalties {
  experienceLost: bigint;
  goldLost: bigint;
  durabilityDamage: number;
  buffLoss: string[];
}

/**
 * Result of respawning a character
 */
export interface RespawnResult {
  characterId: string;
  graveyardId: string;
  position: Position3D;
  healthRestored: number;
  manaRestored: number;
  debuffsApplied: string[];
}

/**
 * Current death status of a character
 */
export interface DeathStatus {
  isDead: boolean;
  deathTime?: Date;
  deathLocation?: Position3D;
  respawnTime?: Date;
  respawnLocation?: Position3D;
  canResurrect: boolean;
  resurrectTimeRemaining?: number;
}

/**
 * Graveyard information
 */
export interface Graveyard {
  id: string;
  name: string;
  zoneId: string;
  position: Position3D;
  faction?: string;
  level: number;
}

/**
 * Interface for Death-related operations
 * Handles character death, respawning, and penalties
 */
export interface IDeathService {
  /**
   * Handle character death and apply penalties
   * @param characterId - The character who died
   * @param location - Where the character died
   * @returns Death result with penalties and respawn info
   */
  handleCharacterDeath(characterId: string, location: Position3D): Promise<DeathResult>;

  /**
   * Respawn a dead character at a graveyard
   * @param characterId - The character to respawn
   * @param graveyardId - Optional specific graveyard, otherwise nearest
   * @returns Respawn result with restored stats
   */
  respawnCharacter(characterId: string, graveyardId?: string): Promise<RespawnResult>;

  /**
   * Get current death status of a character
   * @param characterId - The character to check
   * @returns Death status or null if never died
   */
  getDeathStatus(characterId: string): Promise<DeathStatus | null>;

  /**
   * Calculate death penalties for a character
   * @param character - The character data
   * @returns Calculated penalties
   */
  calculateDeathPenalties(character: any): Promise<DeathPenalties>;

  /**
   * Find the nearest graveyard to a location
   * @param zoneId - The zone to search in
   * @param position - The position to search from
   * @returns The nearest graveyard
   */
  findNearestGraveyard(zoneId: string, position: Position3D): Promise<Graveyard>;
}