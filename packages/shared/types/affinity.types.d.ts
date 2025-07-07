/**
 * Affinity System Type Definitions
 * Comprehensive types for weapon and magic affinity tracking
 */
export declare enum WeaponType {
    SWORD = "sword",
    AXE = "axe",
    MACE = "mace",
    DAGGER = "dagger",
    BOW = "bow",
    CROSSBOW = "crossbow",
    STAFF = "staff",
    WAND = "wand",
    POLEARM = "polearm",
    SHIELD = "shield",
    UNARMED = "unarmed"
}
export declare enum MagicSchool {
    FIRE = "fire",
    ICE = "ice",
    LIGHTNING = "lightning",
    EARTH = "earth",
    ARCANE = "arcane",
    HOLY = "holy",
    SHADOW = "shadow",
    NATURE = "nature",
    ILLUSION = "illusion",
    NECROMANCY = "necromancy"
}
export declare enum AffinityRank {
    NOVICE = "novice",
    APPRENTICE = "apprentice",
    JOURNEYMAN = "journeyman",
    EXPERT = "expert",
    MASTER = "master"
}
export interface AffinityBonus {
    type: AffinityBonusType;
    value: number;
    description: string;
}
export declare enum AffinityBonusType {
    DAMAGE = "damage",
    ACCURACY = "accuracy",
    CRITICAL_CHANCE = "critical_chance",
    CRITICAL_DAMAGE = "critical_damage",
    ATTACK_SPEED = "attack_speed",
    MANA_EFFICIENCY = "mana_efficiency",
    RANGE = "range",
    DURATION = "duration",
    COOLDOWN_REDUCTION = "cooldown_reduction"
}
export interface WeaponAffinity {
    characterId: string;
    weaponType: WeaponType;
    level: number;
    usageCount: number;
    rank: AffinityRank;
    bonuses: AffinityBonus[];
    experienceToNext: number;
    lastUsed: Date;
    favoriteWeapon?: string;
}
export interface MagicAffinity {
    characterId: string;
    school: MagicSchool;
    level: number;
    usageCount: number;
    rank: AffinityRank;
    bonuses: AffinityBonus[];
    experienceToNext: number;
    lastUsed: Date;
    favoriteSpells: string[];
}
export interface AffinityProgression {
    rankThresholds: Record<AffinityRank, number>;
    experienceFormula: {
        baseExperience: number;
        growthFactor: number;
        diminishingReturns: number;
    };
    maxLevel: number;
    rankBonuses: Record<AffinityRank, AffinityBonus[]>;
}
export interface AffinityUsageData {
    sessionId: string;
    timestamp: Date;
    experienceGained: number;
    context: AffinityUsageContext;
    targetType?: string;
    damageDealt?: number;
    criticalHit?: boolean;
    comboCount?: number;
}
export declare enum AffinityUsageContext {
    COMBAT = "combat",
    TRAINING = "training",
    CRAFTING = "crafting",
    EXPLORATION = "exploration",
    QUEST = "quest",
    PVP = "pvp"
}
export interface AffinitySummary {
    characterId: string;
    totalWeaponAffinities: number;
    totalMagicAffinities: number;
    weaponAffinities: WeaponAffinity[];
    magicAffinities: MagicAffinity[];
    overallRank: AffinityRank;
    specializations: string[];
    achievementCount: number;
    lastUpdated: Date;
}
export interface AffinityAchievement {
    id: string;
    name: string;
    description: string;
    requirements: string[];
    rewardType: AffinityRewardType;
    rewardValue: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
}
export declare enum AffinityRewardType {
    EXPERIENCE = "experience",
    GOLD = "gold",
    ITEM = "item",
    TITLE = "title",
    SKILL_POINT = "skill_point"
}
export interface AffinityMilestone {
    level: number;
    rank: AffinityRank;
    bonuses: AffinityBonus[];
    title?: string;
    description: string;
    isReached: boolean;
}
export interface TrackWeaponUseRequest {
    characterId: string;
    weaponType: WeaponType;
    usageData: AffinityUsageData;
    weaponName?: string;
}
export interface TrackWeaponUseResponse {
    success: boolean;
    updatedAffinity: WeaponAffinity;
    levelIncreased: boolean;
    newRank?: AffinityRank;
    bonusesGained: AffinityBonus[];
    experienceGained: number;
    milestone?: AffinityMilestone;
}
export interface TrackMagicUseRequest {
    characterId: string;
    school: MagicSchool;
    usageData: AffinityUsageData;
    spellName?: string;
}
export interface TrackMagicUseResponse {
    success: boolean;
    updatedAffinity: MagicAffinity;
    levelIncreased: boolean;
    newRank?: AffinityRank;
    bonusesGained: AffinityBonus[];
    experienceGained: number;
    milestone?: AffinityMilestone;
}
export interface GetAffinitySummaryRequest {
    characterId: string;
    includeAchievements?: boolean;
    includeMilestones?: boolean;
}
export interface GetAffinitySummaryResponse {
    summary: AffinitySummary;
    achievements?: AffinityAchievement[];
    milestones?: AffinityMilestone[];
    recommendations: string[];
}
export interface AffinityCalculationResult {
    newLevel: number;
    newRank: AffinityRank;
    experienceGained: number;
    bonusesGained: AffinityBonus[];
    rankUp: boolean;
    milestone?: AffinityMilestone;
}
//# sourceMappingURL=affinity.types.d.ts.map