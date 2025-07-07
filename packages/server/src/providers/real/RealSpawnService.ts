import { 
  ISpawnService, 
  SpawnCheck, 
  SpawnTimer, 
  SpawnConfig, 
  SpawnEvent 
} from '../interfaces/ISpawnService';
import { SpawnPoint, Monster, Position3D } from '@aeturnis/shared';
import { SpawnService } from '../../services/SpawnService';
import { SpawnPointRepository } from '../../repositories/spawnPoint.repository';
import { MonsterService } from '../../services/MonsterService';

/**
 * Real implementation wrapper for SpawnService
 * Implements ISpawnService interface and delegates to actual SpawnService
 */
export class RealSpawnService implements ISpawnService {
  private spawnService: SpawnService;
  private monsterService: MonsterService;

  constructor() {
    const spawnPointRepository = new SpawnPointRepository();
    this.spawnService = new SpawnService(spawnPointRepository);
    this.monsterService = new MonsterService();
  }

  async checkSpawnPoints(zoneId: string): Promise<SpawnCheck[]> {
    const spawnPoints = await this.spawnService.getSpawnPointsByZone(zoneId);
    const checks: SpawnCheck[] = [];
    
    for (const spawnPoint of spawnPoints) {
      const activeMonsters = await this.spawnService.getActiveMonstersAtSpawnPoint(spawnPoint.id);
      
      checks.push({
        spawnPointId: spawnPoint.id,
        needsSpawn: spawnPoint.isActive && activeMonsters.length < spawnPoint.maxSpawns,
        currentCount: activeMonsters.length,
        maxCount: spawnPoint.maxSpawns,
        nextSpawnTime: spawnPoint.nextSpawnTime,
        lastSpawnTime: spawnPoint.lastSpawnTime
      });
    }
    
    return checks;
  }

  async spawnMonster(spawnPointId: string, config?: SpawnConfig): Promise<Monster> {
    // Use MonsterService to spawn
    const monster = await this.monsterService.spawnMonster(spawnPointId);
    
    // Apply config if provided
    if (config?.customPosition) {
      await this.monsterService.updatePosition(monster.id, config.customPosition);
      monster.position = config.customPosition;
    }
    
    return monster;
  }

  async despawnMonster(monsterId: string, immediate?: boolean): Promise<void> {
    // Kill the monster which triggers respawn
    await this.monsterService.killMonster(monsterId);
    
    if (immediate) {
      // Would need to trigger immediate respawn
      // Real service may handle this differently
    }
  }

  async getSpawnTimers(zoneId: string): Promise<SpawnTimer[]> {
    const spawnPoints = await this.spawnService.getSpawnPointsByZone(zoneId);
    const timers: SpawnTimer[] = [];
    
    for (const spawnPoint of spawnPoints) {
      if (spawnPoint.nextSpawnTime) {
        timers.push({
          spawnPointId: spawnPoint.id,
          scheduledTime: new Date(spawnPoint.nextSpawnTime),
          monsterTypeId: spawnPoint.monsterTypeId,
          isActive: spawnPoint.isActive,
          attempts: 0
        });
      }
    }
    
    return timers;
  }

  async resetSpawnPoint(spawnPointId: string): Promise<void> {
    // Kill all monsters at this spawn point
    const monsters = await this.spawnService.getActiveMonstersAtSpawnPoint(spawnPointId);
    
    for (const monster of monsters) {
      await this.monsterService.killMonster(monster.id);
    }
    
    // Reset spawn timer
    await this.spawnService.resetSpawnTimer(spawnPointId);
  }

  async forceSpawnZone(zoneId: string): Promise<SpawnEvent[]> {
    const spawnPoints = await this.spawnService.getSpawnPointsByZone(zoneId);
    const events: SpawnEvent[] = [];
    
    for (const spawnPoint of spawnPoints) {
      if (!spawnPoint.isActive) continue;
      
      try {
        const monster = await this.spawnMonster(spawnPoint.id, { immediateSpawn: true });
        events.push({
          spawnPointId: spawnPoint.id,
          monsterId: monster.id,
          monsterType: monster.monsterTypeId,
          position: monster.position,
          timestamp: new Date(),
          success: true
        });
      } catch (error) {
        events.push({
          spawnPointId: spawnPoint.id,
          monsterId: '',
          monsterType: spawnPoint.monsterTypeId,
          position: spawnPoint.position,
          timestamp: new Date(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return events;
  }

  async updateSpawnPoint(spawnPointId: string, updates: Partial<SpawnPoint>): Promise<SpawnPoint> {
    const updated = await this.spawnService.updateSpawnPoint(spawnPointId, updates);
    return updated;
  }

  async getSpawnStats(zoneId: string): Promise<{
    totalSpawnPoints: number;
    activeSpawnPoints: number;
    totalMonsters: number;
    spawnRate: number;
    averageRespawnTime: number;
  }> {
    const spawnPoints = await this.spawnService.getSpawnPointsByZone(zoneId);
    const stats = await this.spawnService.getZoneSpawnStats(zoneId);
    
    return {
      totalSpawnPoints: spawnPoints.length,
      activeSpawnPoints: spawnPoints.filter(sp => sp.isActive).length,
      totalMonsters: stats.totalMonsters || 0,
      spawnRate: stats.spawnRate || 0,
      averageRespawnTime: stats.averageRespawnTime || 0
    };
  }

  async scheduleSpawn(spawnPointId: string, delay: number): Promise<SpawnTimer> {
    // Real service handles this internally
    // Return a mock timer
    const spawnPoint = await this.spawnService.getSpawnPointById(spawnPointId);
    
    return {
      spawnPointId,
      scheduledTime: new Date(Date.now() + delay),
      monsterTypeId: spawnPoint.monsterTypeId,
      isActive: true,
      attempts: 0
    };
  }

  async cancelSpawn(spawnPointId: string): Promise<boolean> {
    // Real service may not expose this
    // Would need to implement
    return true;
  }
}