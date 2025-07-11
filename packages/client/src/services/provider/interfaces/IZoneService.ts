/**
 * Zone service interface for managing world zones and character movement
 */

import { Zone, Direction, CharacterPosition, ZoneListResponse, ZoneDetailsResponse } from '@aeturnis/shared';
import { IService } from './IService';

export interface IZoneService extends IService {
  // Zone data management
  getZones(): Promise<Zone[]>;
  getZone(zoneId: string): Promise<Zone | null>;
  getCurrentZone(): Promise<Zone | null>;
  
  // Character position tracking
  getCharacterPosition(characterId: string): Promise<CharacterPosition | null>;
  updateCharacterPosition(characterId: string, x: number, y: number): Promise<CharacterPosition>;
  
  // Zone navigation
  moveToZone(characterId: string, zoneId: string): Promise<CharacterPosition>;
  moveInDirection(characterId: string, direction: Direction): Promise<CharacterPosition>;
  canMoveToZone(characterId: string, targetZoneId: string): Promise<boolean>;
  
  // Zone features
  getZoneFeatures(zoneId: string): Promise<string[]>;
  isZoneLocked(zoneId: string): Promise<boolean>;
  
  // Real-time subscriptions
  subscribeToZoneUpdates(zoneId: string, handler: (zone: Zone) => void): () => void;
  subscribeToPositionUpdates(characterId: string, handler: (position: CharacterPosition) => void): () => void;
  subscribeToZoneActivity(zoneId: string, handler: (activity: any) => void): () => void;
}