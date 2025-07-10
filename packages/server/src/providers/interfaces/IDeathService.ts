// Import types from the actual service
import { 
  IDeathRequest,
  IDeathResponse,
  IRespawnResponse,
  IDeathStatus,
  IPenaltyBreakdown,
  DeathReason,
  ReviveType
} from '../../types/death';
import { IService } from './IService';

// Re-export types for convenience
export { 
  IDeathRequest,
  IDeathResponse,
  IRespawnResponse,
  IDeathStatus,
  IPenaltyBreakdown,
  DeathReason,
  ReviveType
};

/**
 * Interface for Death-related operations
 * Handles character death, respawning, and penalties
 */
export interface IDeathService extends IService {
  /**
   * Process character death with penalties and event logging
   * @param characterId - The character who died
   * @param deathRequest - Death request with reason and context
   * @returns Death response with penalties
   */
  processCharacterDeath(characterId: string, deathRequest: IDeathRequest): Promise<IDeathResponse>;

  /**
   * Process character respawn
   * @param characterId - The character to respawn
   * @returns Respawn response with location
   */
  processCharacterRespawn(characterId: string): Promise<IRespawnResponse>;

  /**
   * Get current death status of a character
   * @param characterId - The character to check
   * @returns Death status
   */
  getCharacterDeathStatus(characterId: string): Promise<IDeathStatus>;
}