/**
 * Movement System Type Definitions
 * Defines all types for character movement, validation, and zone transitions
 */

import { Direction, Zone } from './zone.types';

// Re-export Direction for easier importing
export type { Direction } from './zone.types';

export interface MovementValidationResult {
  allowed: boolean;
  reason?: string;
  cooldownRemaining?: number;
}

export interface MoveRequest {
  characterId: string;
  currentZoneId: string;
  direction: Direction;
}

export interface MoveResponse {
  success: boolean;
  newZoneId: string;
  zoneInfo: Zone;
  characterPosition: {
    zoneId: string;
    coordinates: { x: number; y: number };
  };
  message: string;
  timestamp: number;
}

export interface MovementValidation {
  canMove(
    characterId: string, 
    fromZoneId: string, 
    toZoneId: string, 
    direction: Direction
  ): Promise<MovementValidationResult>;
  
  validateZoneRequirements(
    characterId: string, 
    targetZoneId: string
  ): Promise<boolean>;
  
  checkMovementCooldown(characterId: string): Promise<number>; // milliseconds remaining
}

export interface MovementCooldown {
  characterId: string;
  lastMovement: number;
  cooldownMs: number;  // Default 2000ms (2 seconds)
}

export interface ZoneTransition {
  characterId: string;
  fromZoneId: string;
  toZoneId: string;
  direction: Direction;
  timestamp: number;
  successful: boolean;
  reason?: string;
}