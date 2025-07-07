/**
 * Character Progression Type Definitions
 * Defines all types for experience, leveling, stat allocation, and power scoring
 */
export interface CharacterProgression {
    characterId: string;
    level: number;
    experience: bigint;
    nextLevelExp: bigint;
    statPoints: number;
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
    source: string;
}
export interface AwardXPResponse {
    previousLevel: number;
    newLevel: number;
    previousExp: string;
    newExp: string;
    nextLevelExp: string;
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
        equipmentContribution: number;
    };
    percentile: number;
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
//# sourceMappingURL=progression.types.d.ts.map