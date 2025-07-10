import { IService } from './IService';

export interface ICharacterService extends IService {
  /**
   * Get current character data
   */
  getCharacter(): Promise<any>;

  /**
   * Update character stats
   */
  updateStats(stats: Partial<any>): Promise<any>;

  /**
   * Level up character
   */
  levelUp(): Promise<any>;

  /**
   * Get character equipment
   */
  getEquipment(): Promise<any>;

  /**
   * Subscribe to character updates
   */
  onCharacterUpdate(callback: (character: any) => void): () => void;
}