import { SpawnPoint } from '@aeturnis/shared';
import { logger } from '../utils/logger';

interface SpawnTimer {
  timer: NodeJS.Timeout;
  scheduledAt: number;
  spawnPointId: string;
}

interface SpawnPointRepository {
  findById(id: string): Promise<SpawnPoint | null>;
  findByZone(zoneId: string): Promise<SpawnPoint[]>;
  findActive(): Promise<SpawnPoint[]>;
}

interface MonsterService {
  spawnMonster(spawnPointId: string): Promise<void>;
}

export class SpawnService {
  private activeSpawns: Map<string, SpawnTimer> = new Map();

  constructor(
    private spawnPointRepository: SpawnPointRepository,
    private monsterService: MonsterService
  ) {
    // Services will be used for spawn operations
  }

  /**
   * Schedule respawn for a spawn point
   * @param spawnPointId The spawn point ID
   * @param delaySeconds Delay in seconds before respawn
   */
  async scheduleRespawn(spawnPointId: string, delaySeconds: number): Promise<void> {
    // Verify spawn point exists
    const spawnPoint = await this.spawnPointRepository.findById(spawnPointId);
    if (!spawnPoint) {
      logger.warn(`Attempted to schedule respawn for non-existent spawn point: ${spawnPointId}`);
      return;
    }

    // Use setTimeout instead of Redis for in-memory scheduling
    const timer = setTimeout(() => {
      this.handleRespawn(spawnPointId);
    }, delaySeconds * 1000);

    this.activeSpawns.set(spawnPointId, { 
      timer, 
      scheduledAt: Date.now(),
      spawnPointId 
    });
  }

  /**
   * Cancel scheduled respawn for a spawn point
   * @param spawnPointId The spawn point ID
   */
  async cancelRespawn(spawnPointId: string): Promise<void> {
    const spawn = this.activeSpawns.get(spawnPointId);
    if (spawn) {
      clearTimeout(spawn.timer);
      this.activeSpawns.delete(spawnPointId);
    }
  }

  /**
   * Get active spawn count for a spawn point
   * @param spawnPointId The spawn point ID
   * @returns Number of active spawns
   */
  async getActiveSpawns(spawnPointId: string): Promise<number> {
    // TODO: Implement actual count from database
    // 1. Query monsters table for active monsters at spawn point
    // 2. Count non-deleted monsters
    // 3. Return active count
    logger.debug(`Getting active spawns for point: ${spawnPointId}`);
    throw new Error('Not implemented');
  }

  /**
   * Check if spawn point can spawn more monsters
   * @param spawnPointId The spawn point ID
   * @returns Whether spawn point can spawn
   */
  async canSpawn(spawnPointId: string): Promise<boolean> {
    // TODO: Implement spawn capacity check
    // 1. Get spawn point max spawns
    logger.debug(`Checking if spawn point can spawn: ${spawnPointId}`);
    // 2. Get current active spawns
    // 3. Check if spawn point is active
    // 4. Return whether can spawn
    throw new Error('Not implemented');
  }

  /**
   * Get all scheduled respawns
   * @returns Array of scheduled respawn timers
   */
  getScheduledRespawns(): SpawnTimer[] {
    return Array.from(this.activeSpawns.values());
  }

  /**
   * Initialize spawn system - start initial spawns
   */
  async initialize(): Promise<void> {
    // TODO: Implement initialization
    // 1. Get all active spawn points
    // 2. Check current spawn counts
    // 3. Spawn monsters where needed
    // 4. Schedule respawn timers
    throw new Error('Not implemented');
  }

  /**
   * Shutdown spawn system - clear all timers
   */
  async shutdown(): Promise<void> {
    // Clear all active timers
    for (const spawn of this.activeSpawns.values()) {
      clearTimeout(spawn.timer);
    }
    this.activeSpawns.clear();
  }

  /**
   * Force spawn at a specific spawn point
   * @param spawnPointId The spawn point ID
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async forceSpawn(_spawnPointId: string): Promise<void> {
    // TODO: Implement force spawn
    // 1. Validate spawn point exists
    // 2. Check if can spawn (capacity)
    // 3. Spawn monster immediately
    // 4. Emit spawn event
    throw new Error('Not implemented');
  }

  /**
   * Handle respawn timer trigger
   * @param spawnPointId The spawn point ID
   */
  private async handleRespawn(spawnPointId: string): Promise<void> {
    try {
      // Remove from active spawns
      this.activeSpawns.delete(spawnPointId);

      // Check if spawn point is still active
      const spawnPoint = await this.spawnPointRepository.findById(spawnPointId);
      if (!spawnPoint || !spawnPoint.isActive) {
        logger.debug(`Spawn point ${spawnPointId} is no longer active`);
        return;
      }

      // Spawn monster using the monster service
      await this.monsterService.spawnMonster(spawnPointId);
      logger.info(`Spawned monster at spawn point ${spawnPointId}`);
      
    } catch (error) {
      logger.error(`Error handling respawn for spawn point ${spawnPointId}:`, error);
    }
  }

  /**
   * Get spawn statistics
   * @returns Spawn system statistics
   */
  getStatistics(): {
    activeTimers: number;
    scheduledRespawns: SpawnTimer[];
    oldestTimer: number | null;
    newestTimer: number | null;
  } {
    const timers = Array.from(this.activeSpawns.values());
    const scheduledTimes = timers.map(t => t.scheduledAt);
    
    return {
      activeTimers: timers.length,
      scheduledRespawns: timers,
      oldestTimer: scheduledTimes.length > 0 ? Math.min(...scheduledTimes) : null,
      newestTimer: scheduledTimes.length > 0 ? Math.max(...scheduledTimes) : null
    };
  }
}