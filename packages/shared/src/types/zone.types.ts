/**
 * Zone System Type Definitions
 * Defines all types for the world zone system, movement validation, and coordinate management
 */

export interface Zone {
  id: string;                    // Unique identifier (e.g., "starter_zone")
  displayName: string;           // Human-readable name
  description: string;           // Zone flavor text
  coordinates: {                 // World map position
    x: number;
    y: number;
  };
  boundaries: {                  // Zone boundaries for validation
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  exits: {                       // Available exit directions
    north?: string;              // Target zone ID
    south?: string;
    east?: string;
    west?: string;
  };
  type: 'normal' | 'city' | 'dungeon' | 'pvp';
  features: string[];            // ["shops", "trainers", "bank", etc.]
  levelRequirement?: number;     // Minimum level to enter
  locked?: boolean;              // For quest-gated zones
}

export type Direction = 'north' | 'south' | 'east' | 'west';

export interface CharacterPosition {
  characterId: string;
  zoneId: string;
  coordinates: {
    x: number;
    y: number;
  };
  lastMovement: number;  // Timestamp of last movement
}

export interface ZoneListResponse {
  zones: Zone[];
  total: number;
}

export interface ZoneDetailsResponse {
  zone: Zone;
  characterPosition?: CharacterPosition;
  availableExits: string[];
}