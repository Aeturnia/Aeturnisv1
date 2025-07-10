import { SpawnPoint, Monster, Position3D } from '@aeturnis/shared';
import { IService } from './IService';

/**
 * Spawn check result for a spawn point
 */
export interface SpawnCheck {
  spawnPointId: string;
  needsSpawn: boolean;
  currentCount: number;
  maxCount: number;
  nextSpawnTime?: Date;
  lastSpawnTime?: Date;
}

/**
 * Active spawn timer
 */
export interface SpawnTimer {
  spawnPointId: string;
  scheduledTime: Date;
  monsterTypeId: string;
  isActive: boolean;
  attempts: number;
}

/**
 * Spawn configuration
 */
export interface SpawnConfig {
  immediateSpawn: boolean; // Skip respawn timer
  overrideMaxSpawns: boolean; // Ignore max spawn limit
  customPosition?: Position3D; // Override spawn point position
  customLevel?: number; // Override monster level
}

/**
 * Spawn event information
 */
export interface SpawnEvent {
  spawnPointId: string;
  monsterId: string;
  monsterType: string;
  position: Position3D;
  timestamp: Date;
  success: boolean;
  error?: string;
}

/**
 * Interface for Spawn-related operations
 * Manages monster spawning and spawn points
 */
export interface ISpawnService extends IService {
  /**
   * Check all spawn points in a zone for needed spawns
   * @param zoneId - The zone to check
   * @returns Array of spawn check results
   */
  checkSpawnPoints(zoneId: string): Promise<SpawnCheck[]>;

  /**
   * Spawn a monster at a spawn point
   * @param spawnPointId - The spawn point to use
   * @param config - Optional spawn configuration
   * @returns The spawned monster
   */
  spawnMonster(spawnPointId: string, config?: SpawnConfig): Promise<Monster>;

  /**
   * Despawn a monster and schedule respawn
   * @param monsterId - The monster to despawn
   * @param immediate - Whether to respawn immediately
   */
  despawnMonster(monsterId: string, immediate?: boolean): Promise<void>;

  /**
   * Get active spawn timers for a zone
   * @param zoneId - The zone to check
   * @returns Array of active timers
   */
  getSpawnTimers(zoneId: string): Promise<SpawnTimer[]>;

  /**
   * Reset a spawn point (clear all spawns)
   * @param spawnPointId - The spawn point to reset
   */
  resetSpawnPoint(spawnPointId: string): Promise<void>;

  /**
   * Force spawn at all spawn points in a zone
   * @param zoneId - The zone to populate
   * @returns Array of spawn events
   */
  forceSpawnZone(zoneId: string): Promise<SpawnEvent[]>;

  /**
   * Update spawn point configuration
   * @param spawnPointId - The spawn point to update
   * @param updates - Configuration updates
   * @returns Updated spawn point
   */
  updateSpawnPoint(spawnPointId: string, updates: Partial<SpawnPoint>): Promise<SpawnPoint>;

  /**
   * Get spawn statistics for a zone
   * @param zoneId - The zone to analyze
   * @returns Spawn statistics
   */
  getSpawnStats(zoneId: string): Promise<{
    totalSpawnPoints: number;
    activeSpawnPoints: number;
    totalMonsters: number;
    spawnRate: number;
    averageRespawnTime: number;
  }>;

  /**
   * Schedule a spawn event
   * @param spawnPointId - The spawn point to schedule
   * @param delay - Delay in milliseconds
   * @returns The scheduled timer
   */
  scheduleSpawn(spawnPointId: string, delay: number): Promise<SpawnTimer>;

  /**
   * Cancel a scheduled spawn
   * @param spawnPointId - The spawn point to cancel
   * @returns Whether a timer was cancelled
   */
  cancelSpawn(spawnPointId: string): Promise<boolean>;
}