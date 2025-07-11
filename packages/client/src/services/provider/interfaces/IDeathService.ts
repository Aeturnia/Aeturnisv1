import { IService } from './IService';
import { DeathRequest, DeathStatus, RespawnData } from '@aeturnis/shared';

export interface IDeathService extends IService {
  processCharacterDeath(characterId: string, deathRequest: DeathRequest): Promise<DeathStatus>;
  processCharacterRespawn(characterId: string): Promise<RespawnData>;
  getCharacterDeathStatus(characterId: string): Promise<DeathStatus | null>;
  getDeathPenalties(characterId: string): Promise<any>;
  subscribeToDeathStatus(characterId: string, handler: (status: DeathStatus) => void): () => void;
}