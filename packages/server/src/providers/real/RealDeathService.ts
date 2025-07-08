import { 
  IDeathService, 
  IDeathRequest,
  IDeathResponse,
  IRespawnResponse,
  IDeathStatus
} from '../interfaces/IDeathService';
import { DeathService } from '../../services/death.service';
import { DeathRepository } from '../../repositories/death.repository';
import { CacheService } from '../../services/CacheService';

/**
 * Real implementation wrapper for DeathService
 * Implements IDeathService interface and delegates to actual DeathService
 */
export class RealDeathService implements IDeathService {
  private deathService: DeathService;

  constructor(cacheService?: CacheService) {
    const deathRepository = new DeathRepository();
    const cache = cacheService || new CacheService({
      host: 'localhost',
      port: 6379,
      password: undefined
    });
    this.deathService = new DeathService(deathRepository, cache);
  }

  async processCharacterDeath(characterId: string, deathRequest: IDeathRequest): Promise<IDeathResponse> {
    const result = await this.deathService.processCharacterDeath(characterId, deathRequest);
    return result;
  }

  async processCharacterRespawn(characterId: string): Promise<IRespawnResponse> {
    const result = await this.deathService.processCharacterRespawn(characterId);
    return result;
  }

  async getCharacterDeathStatus(characterId: string): Promise<IDeathStatus> {
    const status = await this.deathService.getCharacterDeathStatus(characterId);
    return status;
  }
}