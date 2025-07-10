import { IService } from './IService';
import { SpawnPoint, SpawnConfig, SpawnTimer } from '@aeturnis/shared';

export interface ISpawnService extends IService {
  checkSpawnPoints(zoneId: string): Promise<SpawnPoint[]>;
  spawnMonster(spawnPointId: string, config?: SpawnConfig): Promise<string>;
  despawnMonster(monsterId: string, immediate?: boolean): Promise<void>;
  getSpawnTimers(zoneId: string): Promise<SpawnTimer[]>;
  subscribeToSpawnEvents(zoneId: string, handler: (event: any) => void): () => void;
}