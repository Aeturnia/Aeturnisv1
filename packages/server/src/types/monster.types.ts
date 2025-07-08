import { Monster as SharedMonster } from '@aeturnis/shared';

/**
 * Extended Monster interface for server-side usage
 * Adds properties needed by the controller for backwards compatibility
 */
export interface Monster extends SharedMonster {
  // Health properties (aliases for compatibility)
  currentHealth: number;  // Alias for currentHp
  baseHealth: number;     // Alias for maxHp
  
  // Display properties
  name: string;           // Monster identifier/name
  displayName: string;    // UI display name
}

/**
 * Re-export shared monster types for convenience
 */
export { 
  MonsterState,
  AIBehavior,
  Position3D,
  MonsterType,
  SpawnPoint,
  MonsterSpawnRequest,
  MonsterStateUpdateRequest,
  Zone
} from '@aeturnis/shared';