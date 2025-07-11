import { BaseHttpService } from '../base/BaseHttpService';
import { ServiceResponse } from '../base/BaseService';
import { ExperienceGainData, StatsAllocation } from '../provider/interfaces/ICharacterService';
import { Character, Position, Stats } from '@aeturnis/shared';

export class CharacterHttpService extends BaseHttpService {
  public async getCharacter(characterId: string): Promise<ServiceResponse<Character>> {
    return this.get<Character>(`/api/v1/characters/${characterId}`, {
      useCache: true,
      cacheTTL: 30000 // 30 seconds
    });
  }

  public async getCharacters(): Promise<ServiceResponse<Character[]>> {
    return this.get<Character[]>('/api/v1/characters/', {
      useCache: true,
      cacheTTL: 30000 // 30 seconds
    });
  }

  public async updatePosition(characterId: string, position: Position): Promise<ServiceResponse<Character>> {
    return this.patch<Character>(`/api/v1/characters/${characterId}/position`, position);
  }

  public async addExperience(characterId: string, amount: number): Promise<ServiceResponse<ExperienceGainData>> {
    return this.post<ExperienceGainData>(`/api/v1/characters/${characterId}/experience`, { amount });
  }

  public async allocateStats(characterId: string, stats: StatsAllocation): Promise<ServiceResponse<Stats>> {
    return this.post<Stats>(`/api/v1/characters/${characterId}/stats`, stats);
  }

  public async getStats(characterId: string): Promise<ServiceResponse<Stats>> {
    return this.get<Stats>(`/api/v1/characters/${characterId}/stats`, {
      useCache: true,
      cacheTTL: 60000 // 1 minute
    });
  }
}