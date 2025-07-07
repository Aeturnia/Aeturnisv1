/**
 * Affinity System Type Definitions
 * Comprehensive types for weapon and magic affinity tracking
 */
export var WeaponType;
(function (WeaponType) {
    WeaponType["SWORD"] = "sword";
    WeaponType["AXE"] = "axe";
    WeaponType["MACE"] = "mace";
    WeaponType["DAGGER"] = "dagger";
    WeaponType["BOW"] = "bow";
    WeaponType["CROSSBOW"] = "crossbow";
    WeaponType["STAFF"] = "staff";
    WeaponType["WAND"] = "wand";
    WeaponType["POLEARM"] = "polearm";
    WeaponType["SHIELD"] = "shield";
    WeaponType["UNARMED"] = "unarmed";
})(WeaponType || (WeaponType = {}));
export var MagicSchool;
(function (MagicSchool) {
    MagicSchool["FIRE"] = "fire";
    MagicSchool["ICE"] = "ice";
    MagicSchool["LIGHTNING"] = "lightning";
    MagicSchool["EARTH"] = "earth";
    MagicSchool["ARCANE"] = "arcane";
    MagicSchool["HOLY"] = "holy";
    MagicSchool["SHADOW"] = "shadow";
    MagicSchool["NATURE"] = "nature";
    MagicSchool["ILLUSION"] = "illusion";
    MagicSchool["NECROMANCY"] = "necromancy";
})(MagicSchool || (MagicSchool = {}));
export var AffinityRank;
(function (AffinityRank) {
    AffinityRank["NOVICE"] = "novice";
    AffinityRank["APPRENTICE"] = "apprentice";
    AffinityRank["JOURNEYMAN"] = "journeyman";
    AffinityRank["EXPERT"] = "expert";
    AffinityRank["MASTER"] = "master";
})(AffinityRank || (AffinityRank = {}));
export var AffinityBonusType;
(function (AffinityBonusType) {
    AffinityBonusType["DAMAGE"] = "damage";
    AffinityBonusType["ACCURACY"] = "accuracy";
    AffinityBonusType["CRITICAL_CHANCE"] = "critical_chance";
    AffinityBonusType["CRITICAL_DAMAGE"] = "critical_damage";
    AffinityBonusType["ATTACK_SPEED"] = "attack_speed";
    AffinityBonusType["MANA_EFFICIENCY"] = "mana_efficiency";
    AffinityBonusType["RANGE"] = "range";
    AffinityBonusType["DURATION"] = "duration";
    AffinityBonusType["COOLDOWN_REDUCTION"] = "cooldown_reduction";
})(AffinityBonusType || (AffinityBonusType = {}));
export var AffinityUsageContext;
(function (AffinityUsageContext) {
    AffinityUsageContext["COMBAT"] = "combat";
    AffinityUsageContext["TRAINING"] = "training";
    AffinityUsageContext["CRAFTING"] = "crafting";
    AffinityUsageContext["EXPLORATION"] = "exploration";
    AffinityUsageContext["QUEST"] = "quest";
    AffinityUsageContext["PVP"] = "pvp";
})(AffinityUsageContext || (AffinityUsageContext = {}));
export var AffinityRewardType;
(function (AffinityRewardType) {
    AffinityRewardType["EXPERIENCE"] = "experience";
    AffinityRewardType["GOLD"] = "gold";
    AffinityRewardType["ITEM"] = "item";
    AffinityRewardType["TITLE"] = "title";
    AffinityRewardType["SKILL_POINT"] = "skill_point";
})(AffinityRewardType || (AffinityRewardType = {}));
//# sourceMappingURL=affinity.types.js.map