/**
 * Character Progression Type Definitions
 * Defines all types for experience, leveling, stat allocation, and power scoring
 */

export interface CharacterProgression {
  characterId: string;
  level: number;
  experience: bigint;          // Use BigInt for infinite progression
  nextLevelExp: bigint;        // Experience required for next level
  statPoints: number;          // Unallocated stat points
  allocatedStats: {
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
  };
}

export interface AwardXPRequest {
  characterId: string;
  amount: bigint;
  source: string; // "quest", "combat", "exploration", etc.
}

export interface AwardXPResponse {
  previousLevel: number;
  newLevel: number;
  previousExp: string;    // BigInt as string
  newExp: string;         // BigInt as string
  nextLevelExp: string;   // BigInt as string
  leveledUp: boolean;
  statPointsGained: number;
  message: string;
}

export interface AllocateStatRequest {
  characterId: string;
  stat: 'strength' | 'agility' | 'intelligence' | 'stamina';
  amount: number;
}

export interface AllocateStatResponse {
  success: boolean;
  newStats: CharacterStats;
  remainingPoints: number;
  message: string;
}

export interface CharacterStats {
  strength: number;
  agility: number;
  intelligence: number;
  stamina: number;
}

export interface PowerScoreResponse {
  characterId: string;
  powerScore: number;
  breakdown: {
    levelContribution: number;
    statContribution: number;
    equipmentContribution: number; // Mock value for now
  };
  percentile: number; // Character's power percentile (0-100)
}

export interface ExperienceGain {
  characterId: string;
  amount: bigint;
  source: string;
  timestamp: number;
  levelBefore: number;
  levelAfter: number;
}

export type StatType = 'strength' | 'agility' | 'intelligence' | 'stamina';

export interface StatAllocation {
  characterId: string;
  stat: StatType;
  amount: number;
  timestamp: number;
  pointsBefore: number;
  pointsAfter: number;
}