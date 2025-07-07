/**
 * Zone System Type Definitions
 * Defines all types for the world zone system, movement validation, and coordinate management
 */
export interface Zone {
    id: string;
    displayName: string;
    description: string;
    coordinates: {
        x: number;
        y: number;
    };
    boundaries: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    exits: {
        north?: string;
        south?: string;
        east?: string;
        west?: string;
    };
    type: 'normal' | 'city' | 'dungeon' | 'pvp';
    features: string[];
    levelRequirement?: number;
    locked?: boolean;
}
export type Direction = 'north' | 'south' | 'east' | 'west';
export interface CharacterPosition {
    characterId: string;
    zoneId: string;
    coordinates: {
        x: number;
        y: number;
    };
    lastMovement: number;
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
//# sourceMappingURL=zone.types.d.ts.map