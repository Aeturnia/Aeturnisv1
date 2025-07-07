/**
 * Tutorial System Type Definitions
 * Comprehensive types for tutorial zones, quests, and progress tracking
 */
export var TutorialObjectiveType;
(function (TutorialObjectiveType) {
    TutorialObjectiveType["TALK_TO_NPC"] = "talk_to_npc";
    TutorialObjectiveType["MOVE_TO_LOCATION"] = "move_to_location";
    TutorialObjectiveType["OPEN_INVENTORY"] = "open_inventory";
    TutorialObjectiveType["EQUIP_ITEM"] = "equip_item";
    TutorialObjectiveType["ATTACK_TARGET"] = "attack_target";
    TutorialObjectiveType["CAST_SPELL"] = "cast_spell";
    TutorialObjectiveType["COLLECT_ITEM"] = "collect_item";
    TutorialObjectiveType["LEVEL_UP"] = "level_up";
})(TutorialObjectiveType || (TutorialObjectiveType = {}));
export var TutorialRewardType;
(function (TutorialRewardType) {
    TutorialRewardType["EXPERIENCE"] = "experience";
    TutorialRewardType["GOLD"] = "gold";
    TutorialRewardType["ITEM"] = "item";
    TutorialRewardType["SKILL_POINT"] = "skill_point";
})(TutorialRewardType || (TutorialRewardType = {}));
export var TutorialDifficulty;
(function (TutorialDifficulty) {
    TutorialDifficulty["BEGINNER"] = "beginner";
    TutorialDifficulty["EASY"] = "easy";
    TutorialDifficulty["INTERMEDIATE"] = "intermediate";
})(TutorialDifficulty || (TutorialDifficulty = {}));
export var TutorialUrgency;
(function (TutorialUrgency) {
    TutorialUrgency["LOW"] = "low";
    TutorialUrgency["MEDIUM"] = "medium";
    TutorialUrgency["HIGH"] = "high";
    TutorialUrgency["CRITICAL"] = "critical";
})(TutorialUrgency || (TutorialUrgency = {}));
export var TutorialHelpCategory;
(function (TutorialHelpCategory) {
    TutorialHelpCategory["NAVIGATION"] = "navigation";
    TutorialHelpCategory["COMBAT"] = "combat";
    TutorialHelpCategory["INVENTORY"] = "inventory";
    TutorialHelpCategory["MAGIC"] = "magic";
    TutorialHelpCategory["SOCIAL"] = "social";
    TutorialHelpCategory["PROGRESSION"] = "progression";
    TutorialHelpCategory["GENERAL"] = "general";
})(TutorialHelpCategory || (TutorialHelpCategory = {}));
//# sourceMappingURL=tutorial.types.js.map