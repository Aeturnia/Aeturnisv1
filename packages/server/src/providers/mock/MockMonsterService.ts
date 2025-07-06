import { IMonsterService } from '../interfaces/IMonsterService';
import { Monster, MonsterType, SpawnPoint, Position3D, MonsterState } from '@aeturnis/shared';
import { logger } from '../../utils/logger';

/**
 * Mock implementation of MonsterService for testing
 * Uses in-memory data storage
 */
export class MockMonsterService implements IMonsterService {
  // Mock monsters data - copied from routes
  private mockMonsters: any[] = [
    {
      id: 'monster-001',
      name: 'Forest Goblin',
      level: 5,
      position: { x: 110, y: 0, z: 95 },
      state: 'idle',
      spawnPointId: 'spawn-001',
      zoneId: 'test-zone',
      monsterTypeId: 'goblin',
      currentHp: 45,
      maxHp: 45,
      aggroRadius: 10,
      stats: {
        hp: 45,
        maxHp: 45,
        attack: 12,
        defense: 8,
        speed: 10
      }
    },
    {
      id: 'monster-002', 
      name: 'Cave Orc',
      level: 8,
      position: { x: 145, y: 2, z: 80 },
      state: 'patrolling',
      spawnPointId: 'spawn-002',
      zoneId: 'test-zone',
      monsterTypeId: 'orc',
      currentHp: 80,
      maxHp: 80,
      aggroRadius: 15,
      stats: {
        hp: 80,
        maxHp: 80,
        attack: 18,
        defense: 12,
        speed: 8
      }
    }
  ];

  // Mock monster types
  private mockMonsterTypes: any[] = [
    {
      id: 'goblin',
      name: 'goblin',
      displayName: 'Goblin',
      level: 5,
      baseHp: 45,
      baseAttack: 12,
      baseDefense: 8,
      experienceValue: 50,
      aiBehavior: 'aggressive',
      metadata: {
        baseStats: { hp: 45, attack: 12, defense: 8, speed: 10 },
        description: 'Small, aggressive forest creature'
      }
    },
    {
      id: 'orc', 
      name: 'orc',
      displayName: 'Orc',
      level: 8,
      baseHp: 80,
      baseAttack: 18,
      baseDefense: 12,
      experienceValue: 100,
      aiBehavior: 'aggressive',
      metadata: {
        baseStats: { hp: 80, attack: 18, defense: 12, speed: 8 },
        description: 'Large, brutish cave dweller'
      }
    },
    {
      id: 'skeleton',
      name: 'skeleton',
      displayName: 'Skeleton',
      level: 6,
      baseHp: 40,
      baseAttack: 14,
      baseDefense: 6,
      experienceValue: 70,
      aiBehavior: 'aggressive',
      metadata: {
        baseStats: { hp: 40, attack: 14, defense: 6, speed: 12 },
        description: 'Undead bones animated by dark magic'
      }
    }
  ];

  // Mock spawn points
  private mockSpawnPoints: any[] = [
    {
      id: 'spawn-001',
      zoneId: 'test-zone',
      position: { x: 100, y: 0, z: 100 },
      monsterTypeId: 'goblin',
      respawnTime: 30,
      maxSpawns: 3,
      isActive: true,
      metadata: {
        name: 'Forest Clearing',
        currentSpawns: 1
      }
    },
    {
      id: 'spawn-002',
      zoneId: 'test-zone',
      position: { x: 150, y: 5, z: 75 },
      monsterTypeId: 'orc',
      respawnTime: 60,
      maxSpawns: 2,
      isActive: true,
      metadata: {
        name: 'Dark Cave Entrance',
        currentSpawns: 0
      }
    }
  ];

  constructor() {
    logger.info('MockMonsterService initialized');
  }

  async getMonstersInZone(zoneIdOrName: string): Promise<Monster[]> {
    logger.info(`MockMonsterService: Getting monsters for zone ${zoneIdOrName}`);
    
    // Filter monsters by zone
    const monsters = this.mockMonsters.filter(m => 
      m.zoneId === zoneIdOrName || zoneIdOrName === 'test-zone'
    );
    
    // Convert to proper Monster format
    return monsters.map(m => ({
      id: m.id,
      monsterTypeId: m.monsterTypeId,
      zoneId: m.zoneId,
      position: m.position,
      currentHp: m.currentHp,
      maxHp: m.maxHp,
      state: m.state as MonsterState,
      aggroRadius: m.aggroRadius,
      targetId: m.targetId,
      spawnPointId: m.spawnPointId
    }));
  }

  async spawnMonster(spawnPointId: string): Promise<Monster> {
    logger.info(`MockMonsterService: Spawning monster at spawn point ${spawnPointId}`);
    
    const spawnPoint = this.mockSpawnPoints.find(sp => sp.id === spawnPointId);
    if (!spawnPoint) {
      throw new Error(`Spawn point ${spawnPointId} not found`);
    }

    const monsterType = this.mockMonsterTypes.find(mt => mt.id === spawnPoint.monsterTypeId);
    if (!monsterType) {
      throw new Error(`Monster type ${spawnPoint.monsterTypeId} not found`);
    }

    const newMonster = {
      id: `monster-${Date.now()}`,
      monsterTypeId: monsterType.id,
      zoneId: spawnPoint.zoneId,
      position: { ...spawnPoint.position },
      currentHp: monsterType.baseHp,
      maxHp: monsterType.baseHp,
      state: MonsterState.IDLE,
      aggroRadius: 10,
      spawnPointId: spawnPointId,
      name: monsterType.displayName,
      level: monsterType.level,
      stats: monsterType.metadata.baseStats
    };

    // Add to mock data
    this.mockMonsters.push(newMonster);

    return {
      id: newMonster.id,
      monsterTypeId: newMonster.monsterTypeId,
      zoneId: newMonster.zoneId,
      position: newMonster.position,
      currentHp: newMonster.currentHp,
      maxHp: newMonster.maxHp,
      state: newMonster.state,
      aggroRadius: newMonster.aggroRadius,
      spawnPointId: newMonster.spawnPointId
    };
  }

  async updateMonsterState(monsterId: string, newState: string, targetId?: string): Promise<Monster> {
    logger.info(`MockMonsterService: Updating monster ${monsterId} state to ${newState}`);
    
    const monsterIndex = this.mockMonsters.findIndex(m => m.id === monsterId);
    if (monsterIndex === -1) {
      throw new Error(`Monster ${monsterId} not found`);
    }

    this.mockMonsters[monsterIndex] = {
      ...this.mockMonsters[monsterIndex],
      state: newState,
      targetId: targetId
    };

    const updated = this.mockMonsters[monsterIndex];
    return {
      id: updated.id,
      monsterTypeId: updated.monsterTypeId,
      zoneId: updated.zoneId,
      position: updated.position,
      currentHp: updated.currentHp,
      maxHp: updated.maxHp,
      state: updated.state as MonsterState,
      aggroRadius: updated.aggroRadius,
      targetId: updated.targetId,
      spawnPointId: updated.spawnPointId
    };
  }

  async getMonsterTypes(): Promise<MonsterType[]> {
    logger.info('MockMonsterService: Getting monster types');
    return this.mockMonsterTypes;
  }

  async getSpawnPointsByZone(zoneIdOrName: string): Promise<SpawnPoint[]> {
    logger.info(`MockMonsterService: Getting spawn points for zone ${zoneIdOrName}`);
    
    const spawnPoints = this.mockSpawnPoints.filter(sp => 
      sp.zoneId === zoneIdOrName || zoneIdOrName === 'test-zone'
    );

    return spawnPoints.map(sp => ({
      id: sp.id,
      zoneId: sp.zoneId,
      position: sp.position,
      monsterTypeId: sp.monsterTypeId,
      respawnTime: sp.respawnTime,
      maxSpawns: sp.maxSpawns,
      isActive: sp.isActive
    }));
  }

  async processAggro(monsterId: string, characterPosition: Position3D): Promise<boolean> {
    logger.info(`MockMonsterService: Processing aggro for monster ${monsterId}`);
    
    const monster = this.mockMonsters.find(m => m.id === monsterId);
    if (!monster) {
      throw new Error(`Monster ${monsterId} not found`);
    }

    // Simple distance calculation
    const distance = Math.sqrt(
      Math.pow(characterPosition.x - monster.position.x, 2) +
      Math.pow(characterPosition.y - monster.position.y, 2) +
      Math.pow(characterPosition.z - monster.position.z, 2)
    );

    const inAggroRange = distance <= monster.aggroRadius;
    
    if (inAggroRange && monster.state === 'idle') {
      monster.state = 'combat';
      monster.targetId = 'player';
    }

    return inAggroRange;
  }

  async killMonster(monsterId: string, killedBy?: string): Promise<void> {
    logger.info(`MockMonsterService: Killing monster ${monsterId} by ${killedBy}`);
    
    const monsterIndex = this.mockMonsters.findIndex(m => m.id === monsterId);
    if (monsterIndex === -1) {
      throw new Error(`Monster ${monsterId} not found`);
    }

    // Remove from mock data
    this.mockMonsters.splice(monsterIndex, 1);
  }

  async updatePosition(monsterId: string, newPosition: Position3D): Promise<void> {
    logger.info(`MockMonsterService: Updating position for monster ${monsterId}`);
    
    const monster = this.mockMonsters.find(m => m.id === monsterId);
    if (!monster) {
      throw new Error(`Monster ${monsterId} not found`);
    }

    monster.position = { ...newPosition };
  }

  async processAI(monsterId: string): Promise<void> {
    logger.info(`MockMonsterService: Processing AI for monster ${monsterId}`);
    
    const monster = this.mockMonsters.find(m => m.id === monsterId);
    if (!monster) {
      throw new Error(`Monster ${monsterId} not found`);
    }

    // Simple AI simulation
    if (monster.state === 'idle') {
      // Random chance to start patrolling
      if (Math.random() > 0.7) {
        monster.state = 'patrol';
      }
    } else if (monster.state === 'patrol') {
      // Move randomly
      monster.position.x += (Math.random() - 0.5) * 5;
      monster.position.z += (Math.random() - 0.5) * 5;
    }
  }
}