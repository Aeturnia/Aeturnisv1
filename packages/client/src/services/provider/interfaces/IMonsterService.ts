import { IService } from './IService';
import { Monster, MonsterState, ZoneId, Position } from '@aeturnis/shared';

export interface IMonsterService extends IService {
  getMonstersInZone(zoneIdOrName: ZoneId | string): Promise<Monster[]>;
  getMonster(monsterId: string): Promise<Monster | null>;
  spawnMonster(spawnPointId: string): Promise<Monster>;
  updateMonsterState(monsterId: string, state: MonsterState, targetId?: string): Promise<void>;
  processAggro(monsterId: string, characterPosition: Position): Promise<boolean>;
  subscribeToZoneMonsters(zoneId: string, handler: (update: any) => void): () => void;
  subscribeToMonsterUpdates(monsterId: string, handler: (update: any) => void): () => void;
}