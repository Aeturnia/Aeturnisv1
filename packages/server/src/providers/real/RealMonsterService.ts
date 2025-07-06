import { IMonsterService } from '../interfaces/IMonsterService';
import { Monster, MonsterType, SpawnPoint, Position3D } from '@aeturnis/shared';
import { MonsterService } from '../../services/MonsterService';
import { CacheService } from '../../services/CacheService';

/**
 * Real implementation wrapper for MonsterService
 * Implements IMonsterService interface and delegates to actual MonsterService
 */
export class RealMonsterService implements IMonsterService {
  private monsterService: MonsterService;

  constructor(cacheService?: CacheService) {
    // If no cache service provided, MonsterService will create its own
    this.monsterService = new MonsterService();
  }

  async getMonstersInZone(zoneIdOrName: string): Promise<Monster[]> {
    return await this.monsterService.getMonstersInZone(zoneIdOrName);
  }

  async spawnMonster(spawnPointId: string): Promise<Monster> {
    return await this.monsterService.spawnMonster(spawnPointId);
  }

  async updateMonsterState(monsterId: string, newState: string, targetId?: string): Promise<Monster> {
    return await this.monsterService.updateMonsterState(monsterId, newState, targetId);
  }

  async getMonsterTypes(): Promise<MonsterType[]> {
    return await this.monsterService.getMonsterTypes();
  }

  async getSpawnPointsByZone(zoneIdOrName: string): Promise<SpawnPoint[]> {
    return await this.monsterService.getSpawnPointsByZone(zoneIdOrName);
  }

  async processAggro(monsterId: string, characterPosition: Position3D): Promise<boolean> {
    return await this.monsterService.processAggro(monsterId, characterPosition);
  }

  async killMonster(monsterId: string, killedBy?: string): Promise<void> {
    return await this.monsterService.killMonster(monsterId, killedBy);
  }

  async updatePosition(monsterId: string, newPosition: Position3D): Promise<void> {
    return await this.monsterService.updatePosition(monsterId, newPosition);
  }

  async processAI(monsterId: string): Promise<void> {
    return await this.monsterService.processAI(monsterId);
  }
}