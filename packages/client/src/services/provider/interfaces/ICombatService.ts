import { IService } from './IService';
import { 
  CombatSessionData, 
  CombatActionRequest, 
  ProcessedCombatAction,
  CombatStats,
  StartCombatRequest
} from '@aeturnis/shared';

export interface ICombatService extends IService {
  startCombat(initiatorId: string, request: StartCombatRequest): Promise<CombatSessionData>;
  processAction(sessionId: string, actorId: string, action: CombatActionRequest): Promise<ProcessedCombatAction>;
  fleeCombat(sessionId: string, userId: string): Promise<boolean>;
  getCombatSession(sessionId: string): Promise<CombatSessionData | null>;
  getActiveCombatForCharacter(characterId: string): Promise<CombatSessionData | null>;
  getCharacterStats(characterId: string): Promise<CombatStats>;
  subscribeToCombatUpdates(sessionId: string, handler: (update: any) => void): () => void;
  subscribeToCharacterCombat(characterId: string, handler: (update: any) => void): () => void;
}