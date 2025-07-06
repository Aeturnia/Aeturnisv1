import { 
  ISpawnService, 
  SpawnCheck, 
  SpawnTimer, 
  SpawnConfig, 
  SpawnEvent 
} from '../interfaces/ISpawnService';
import { SpawnPoint, Monster, Position3D, MonsterState } from '@aeturnis/shared';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock implementation of SpawnService for testing
 * Uses in-memory spawn management with instant spawning options
 */
export class MockSpawnService implements ISpawnService {
  // Mock spawn points
  private spawnPoints: Map<string, SpawnPoint> = new Map();
  
  // Active monsters by spawn point
  private activeMonsters: Map<string, Monster[]> = new Map();
  
  // Spawn timers
  private spawnTimers: Map<string, SpawnTimer> = new Map();
  
  // Spawn event history
  private spawnEvents: SpawnEvent[] = [];

  constructor() {
    logger.info('MockSpawnService initialized');
    this.initializeMockSpawnPoints();
  }

  private initializeMockSpawnPoints(): void {
    // Create test spawn points
    const testSpawnPoints: SpawnPoint[] = [
      {
        id: 'spawn-001',
        zoneId: 'test-zone',
        position: { x: 100, y: 0, z: 100 },
        monsterTypeId: 'goblin',
        respawnTime: 30,
        maxSpawns: 3,
        isActive: true
      },
      {
        id: 'spawn-002',
        zoneId: 'test-zone',
        position: { x: 150, y: 5, z: 75 },
        monsterTypeId: 'orc',
        respawnTime: 60,
        maxSpawns: 2,
        isActive: true
      },
      {
        id: 'spawn-003',
        zoneId: 'forest-zone',
        position: { x: 200, y: 0, z: 200 },
        monsterTypeId: 'wolf',
        respawnTime: 45,
        maxSpawns: 4,
        isActive: true
      },
      {
        id: 'spawn-004',
        zoneId: 'forest-zone',
        position: { x: 250, y: 0, z: 150 },
        monsterTypeId: 'bear',
        respawnTime: 120,
        maxSpawns: 1,
        isActive: false // Inactive spawn point
      }
    ];
    
    testSpawnPoints.forEach(sp => {
      this.spawnPoints.set(sp.id, sp);
      this.activeMonsters.set(sp.id, []);
    });
    
    // Spawn some initial monsters
    this.spawnInitialMonsters();
  }

  private spawnInitialMonsters(): void {
    // Spawn one monster at each active spawn point
    this.spawnPoints.forEach((spawnPoint, spawnPointId) => {
      if (spawnPoint.isActive) {
        this.spawnMonsterInternal(spawnPointId);
      }
    });
  }

  async checkSpawnPoints(zoneId: string): Promise<SpawnCheck[]> {
    logger.info(`MockSpawnService: Checking spawn points in zone ${zoneId}`);
    
    const checks: SpawnCheck[] = [];
    
    for (const [spawnPointId, spawnPoint] of this.spawnPoints) {
      if (spawnPoint.zoneId !== zoneId) continue;
      
      const currentMonsters = this.activeMonsters.get(spawnPointId) || [];
      const needsSpawn = spawnPoint.isActive && currentMonsters.length < spawnPoint.maxSpawns;
      
      const timer = this.spawnTimers.get(spawnPointId);
      
      checks.push({
        spawnPointId,
        needsSpawn,
        currentCount: currentMonsters.length,
        maxCount: spawnPoint.maxSpawns,
        nextSpawnTime: timer?.scheduledTime,
        lastSpawnTime: this.getLastSpawnTime(spawnPointId)
      });
    }
    
    return checks;
  }

  async spawnMonster(spawnPointId: string, config?: SpawnConfig): Promise<Monster> {
    logger.info(`MockSpawnService: Spawning monster at ${spawnPointId}`, config);
    
    const spawnPoint = this.spawnPoints.get(spawnPointId);
    if (!spawnPoint) {
      throw new Error(`Spawn point ${spawnPointId} not found`);
    }
    
    if (!spawnPoint.isActive && !config?.overrideMaxSpawns) {
      throw new Error(`Spawn point ${spawnPointId} is not active`);
    }
    
    const currentMonsters = this.activeMonsters.get(spawnPointId) || [];
    if (currentMonsters.length >= spawnPoint.maxSpawns && !config?.overrideMaxSpawns) {
      throw new Error(`Spawn point ${spawnPointId} has reached max spawns`);
    }
    
    const monster = this.createMonster(spawnPoint, config);
    currentMonsters.push(monster);
    this.activeMonsters.set(spawnPointId, currentMonsters);
    
    // Record spawn event
    this.spawnEvents.push({
      spawnPointId,
      monsterId: monster.id,
      monsterType: monster.monsterTypeId,
      position: monster.position,
      timestamp: new Date(),
      success: true
    });
    
    // Cancel any existing timer if immediate spawn
    if (config?.immediateSpawn && this.spawnTimers.has(spawnPointId)) {
      this.spawnTimers.delete(spawnPointId);
    }
    
    return monster;
  }

  async despawnMonster(monsterId: string, immediate: boolean = false): Promise<void> {
    logger.info(`MockSpawnService: Despawning monster ${monsterId}, immediate: ${immediate}`);
    
    let foundSpawnPoint: string | null = null;
    let foundMonster: Monster | null = null;
    
    // Find the monster and its spawn point
    for (const [spawnPointId, monsters] of this.activeMonsters) {
      const index = monsters.findIndex(m => m.id === monsterId);
      if (index !== -1) {
        foundSpawnPoint = spawnPointId;
        foundMonster = monsters[index];
        monsters.splice(index, 1);
        break;
      }
    }
    
    if (!foundSpawnPoint || !foundMonster) {
      throw new Error(`Monster ${monsterId} not found`);
    }
    
    const spawnPoint = this.spawnPoints.get(foundSpawnPoint);
    if (!spawnPoint) return;
    
    // Schedule respawn if spawn point is active
    if (spawnPoint.isActive) {
      const delay = immediate ? 0 : spawnPoint.respawnTime * 1000;
      await this.scheduleSpawn(foundSpawnPoint, delay);
    }
  }

  async getSpawnTimers(zoneId: string): Promise<SpawnTimer[]> {
    logger.info(`MockSpawnService: Getting spawn timers for zone ${zoneId}`);
    
    const timers: SpawnTimer[] = [];
    
    for (const [spawnPointId, timer] of this.spawnTimers) {
      const spawnPoint = this.spawnPoints.get(spawnPointId);
      if (spawnPoint && spawnPoint.zoneId === zoneId) {
        timers.push(timer);
      }
    }
    
    return timers;
  }

  async resetSpawnPoint(spawnPointId: string): Promise<void> {
    logger.info(`MockSpawnService: Resetting spawn point ${spawnPointId}`);
    
    const spawnPoint = this.spawnPoints.get(spawnPointId);
    if (!spawnPoint) {
      throw new Error(`Spawn point ${spawnPointId} not found`);
    }
    
    // Clear all monsters at this spawn point
    this.activeMonsters.set(spawnPointId, []);
    
    // Cancel any timers
    this.spawnTimers.delete(spawnPointId);
    
    // If active, schedule immediate spawn
    if (spawnPoint.isActive) {
      await this.scheduleSpawn(spawnPointId, 0);
    }
  }

  async forceSpawnZone(zoneId: string): Promise<SpawnEvent[]> {
    logger.info(`MockSpawnService: Force spawning all points in zone ${zoneId}`);
    
    const events: SpawnEvent[] = [];
    
    for (const [spawnPointId, spawnPoint] of this.spawnPoints) {
      if (spawnPoint.zoneId !== zoneId || !spawnPoint.isActive) continue;
      
      const currentMonsters = this.activeMonsters.get(spawnPointId) || [];
      const spawnCount = spawnPoint.maxSpawns - currentMonsters.length;
      
      for (let i = 0; i < spawnCount; i++) {
        try {
          const monster = await this.spawnMonster(spawnPointId, { immediateSpawn: true });
          events.push({
            spawnPointId,
            monsterId: monster.id,
            monsterType: monster.monsterTypeId,
            position: monster.position,
            timestamp: new Date(),
            success: true
          });
        } catch (error) {
          events.push({
            spawnPointId,
            monsterId: '',
            monsterType: spawnPoint.monsterTypeId,
            position: spawnPoint.position,
            timestamp: new Date(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    return events;
  }

  async updateSpawnPoint(spawnPointId: string, updates: Partial<SpawnPoint>): Promise<SpawnPoint> {
    logger.info(`MockSpawnService: Updating spawn point ${spawnPointId}`, updates);
    
    const spawnPoint = this.spawnPoints.get(spawnPointId);
    if (!spawnPoint) {
      throw new Error(`Spawn point ${spawnPointId} not found`);
    }
    
    // Apply updates
    Object.assign(spawnPoint, updates);
    
    // Handle activation/deactivation
    if (updates.isActive !== undefined) {
      if (updates.isActive && (this.activeMonsters.get(spawnPointId) || []).length === 0) {
        // Activate and spawn
        await this.scheduleSpawn(spawnPointId, 0);
      } else if (!updates.isActive) {
        // Deactivate and clear timers
        this.spawnTimers.delete(spawnPointId);
      }
    }
    
    return spawnPoint;
  }

  async getSpawnStats(zoneId: string): Promise<{
    totalSpawnPoints: number;
    activeSpawnPoints: number;
    totalMonsters: number;
    spawnRate: number;
    averageRespawnTime: number;
  }> {
    logger.info(`MockSpawnService: Getting spawn stats for zone ${zoneId}`);
    
    let totalSpawnPoints = 0;
    let activeSpawnPoints = 0;
    let totalMonsters = 0;
    let totalRespawnTime = 0;
    
    for (const [spawnPointId, spawnPoint] of this.spawnPoints) {
      if (spawnPoint.zoneId !== zoneId) continue;
      
      totalSpawnPoints++;
      if (spawnPoint.isActive) {
        activeSpawnPoints++;
        totalRespawnTime += spawnPoint.respawnTime;
      }
      
      totalMonsters += (this.activeMonsters.get(spawnPointId) || []).length;
    }
    
    return {
      totalSpawnPoints,
      activeSpawnPoints,
      totalMonsters,
      spawnRate: activeSpawnPoints > 0 ? totalMonsters / activeSpawnPoints : 0,
      averageRespawnTime: activeSpawnPoints > 0 ? totalRespawnTime / activeSpawnPoints : 0
    };
  }

  async scheduleSpawn(spawnPointId: string, delay: number): Promise<SpawnTimer> {
    logger.info(`MockSpawnService: Scheduling spawn for ${spawnPointId} in ${delay}ms`);
    
    const spawnPoint = this.spawnPoints.get(spawnPointId);
    if (!spawnPoint) {
      throw new Error(`Spawn point ${spawnPointId} not found`);
    }
    
    // Cancel existing timer
    if (this.spawnTimers.has(spawnPointId)) {
      this.spawnTimers.delete(spawnPointId);
    }
    
    const timer: SpawnTimer = {
      spawnPointId,
      scheduledTime: new Date(Date.now() + delay),
      monsterTypeId: spawnPoint.monsterTypeId,
      isActive: true,
      attempts: 0
    };
    
    this.spawnTimers.set(spawnPointId, timer);
    
    // In a real implementation, this would use setTimeout or a job scheduler
    // For mock, we'll simulate instant spawn if delay is 0
    if (delay === 0) {
      this.spawnMonsterInternal(spawnPointId);
      this.spawnTimers.delete(spawnPointId);
    }
    
    return timer;
  }

  async cancelSpawn(spawnPointId: string): Promise<boolean> {
    logger.info(`MockSpawnService: Cancelling spawn for ${spawnPointId}`);
    
    if (this.spawnTimers.has(spawnPointId)) {
      this.spawnTimers.delete(spawnPointId);
      return true;
    }
    
    return false;
  }

  // Helper methods
  private createMonster(spawnPoint: SpawnPoint, config?: SpawnConfig): Monster {
    const monsterId = `monster_${uuidv4()}`;
    const position = config?.customPosition || { ...spawnPoint.position };
    
    // Add some random position variance
    if (!config?.customPosition) {
      position.x += (Math.random() - 0.5) * 10;
      position.z += (Math.random() - 0.5) * 10;
    }
    
    return {
      id: monsterId,
      monsterTypeId: spawnPoint.monsterTypeId,
      zoneId: spawnPoint.zoneId,
      position,
      currentHp: 100, // Mock values
      maxHp: 100,
      state: MonsterState.IDLE,
      aggroRadius: 15,
      spawnPointId: spawnPoint.id
    };
  }

  private spawnMonsterInternal(spawnPointId: string): void {
    try {
      const spawnPoint = this.spawnPoints.get(spawnPointId);
      if (!spawnPoint || !spawnPoint.isActive) return;
      
      const currentMonsters = this.activeMonsters.get(spawnPointId) || [];
      if (currentMonsters.length >= spawnPoint.maxSpawns) return;
      
      const monster = this.createMonster(spawnPoint);
      currentMonsters.push(monster);
      this.activeMonsters.set(spawnPointId, currentMonsters);
      
      this.spawnEvents.push({
        spawnPointId,
        monsterId: monster.id,
        monsterType: monster.monsterTypeId,
        position: monster.position,
        timestamp: new Date(),
        success: true
      });
    } catch (error) {
      logger.error(`Failed to spawn monster at ${spawnPointId}`, error);
    }
  }

  private getLastSpawnTime(spawnPointId: string): Date | undefined {
    const events = this.spawnEvents
      .filter(e => e.spawnPointId === spawnPointId && e.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return events[0]?.timestamp;
  }
}