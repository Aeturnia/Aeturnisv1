import { Monster, MonsterType, SpawnPoint, Position3D } from '@aeturnis/shared';

/**
 * Interface for Monster-related operations
 * This interface defines the contract that both mock and real implementations must follow
 */
export interface IMonsterService {
  /**
   * Get all monsters in a specific zone
   * @param zoneIdOrName - Zone UUID or zone name
   * @returns Array of monsters in the zone
   */
  getMonstersInZone(zoneIdOrName: string): Promise<Monster[]>;

  /**
   * Spawn a new monster at a spawn point
   * @param spawnPointId - The spawn point UUID
   * @returns The newly spawned monster
   */
  spawnMonster(spawnPointId: string): Promise<Monster>;

  /**
   * Update a monster's state
   * @param monsterId - The monster UUID
   * @param newState - The new state value
   * @param targetId - Optional target ID for combat states
   * @returns The updated monster
   */
  updateMonsterState(monsterId: string, newState: string, targetId?: string): Promise<Monster>;

  /**
   * Get all available monster types
   * @returns Array of monster type definitions
   */
  getMonsterTypes(): Promise<MonsterType[]>;

  /**
   * Get spawn points for a specific zone
   * @param zoneIdOrName - Zone UUID or zone name
   * @returns Array of spawn points in the zone
   */
  getSpawnPointsByZone(zoneIdOrName: string): Promise<SpawnPoint[]>;

  /**
   * Process aggro detection for a monster
   * @param monsterId - The monster UUID
   * @param characterPosition - The character's current position
   * @returns Whether the monster detected the character
   */
  processAggro(monsterId: string, characterPosition: Position3D): Promise<boolean>;

  /**
   * Kill a monster and handle respawn
   * @param monsterId - The monster UUID
   * @param killedBy - Optional ID of who killed the monster
   */
  killMonster(monsterId: string, killedBy?: string): Promise<void>;

  /**
   * Update a monster's position
   * @param monsterId - The monster UUID
   * @param newPosition - The new position
   */
  updatePosition(monsterId: string, newPosition: Position3D): Promise<void>;

  /**
   * Process AI behavior for a monster
   * @param monsterId - The monster UUID
   */
  processAI(monsterId: string): Promise<void>;
}