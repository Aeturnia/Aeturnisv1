"use strict";
/**
 * Tutorial System Type Definitions
 * Comprehensive types for tutorial zones, quests, and progress tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorialHelpCategory = exports.TutorialUrgency = exports.TutorialDifficulty = exports.TutorialRewardType = exports.TutorialObjectiveType = void 0;
var TutorialObjectiveType;
(function (TutorialObjectiveType) {
    TutorialObjectiveType["TALK_TO_NPC"] = "talk_to_npc";
    TutorialObjectiveType["MOVE_TO_LOCATION"] = "move_to_location";
    TutorialObjectiveType["OPEN_INVENTORY"] = "open_inventory";
    TutorialObjectiveType["EQUIP_ITEM"] = "equip_item";
    TutorialObjectiveType["ATTACK_TARGET"] = "attack_target";
    TutorialObjectiveType["CAST_SPELL"] = "cast_spell";
    TutorialObjectiveType["COLLECT_ITEM"] = "collect_item";
    TutorialObjectiveType["LEVEL_UP"] = "level_up";
})(TutorialObjectiveType || (exports.TutorialObjectiveType = TutorialObjectiveType = {}));
var TutorialRewardType;
(function (TutorialRewardType) {
    TutorialRewardType["EXPERIENCE"] = "experience";
    TutorialRewardType["GOLD"] = "gold";
    TutorialRewardType["ITEM"] = "item";
    TutorialRewardType["SKILL_POINT"] = "skill_point";
})(TutorialRewardType || (exports.TutorialRewardType = TutorialRewardType = {}));
var TutorialDifficulty;
(function (TutorialDifficulty) {
    TutorialDifficulty["BEGINNER"] = "beginner";
    TutorialDifficulty["EASY"] = "easy";
    TutorialDifficulty["INTERMEDIATE"] = "intermediate";
})(TutorialDifficulty || (exports.TutorialDifficulty = TutorialDifficulty = {}));
var TutorialUrgency;
(function (TutorialUrgency) {
    TutorialUrgency["LOW"] = "low";
    TutorialUrgency["MEDIUM"] = "medium";
    TutorialUrgency["HIGH"] = "high";
    TutorialUrgency["CRITICAL"] = "critical";
})(TutorialUrgency || (exports.TutorialUrgency = TutorialUrgency = {}));
var TutorialHelpCategory;
(function (TutorialHelpCategory) {
    TutorialHelpCategory["NAVIGATION"] = "navigation";
    TutorialHelpCategory["COMBAT"] = "combat";
    TutorialHelpCategory["INVENTORY"] = "inventory";
    TutorialHelpCategory["MAGIC"] = "magic";
    TutorialHelpCategory["SOCIAL"] = "social";
    TutorialHelpCategory["PROGRESSION"] = "progression";
    TutorialHelpCategory["GENERAL"] = "general";
})(TutorialHelpCategory || (exports.TutorialHelpCategory = TutorialHelpCategory = {}));
//# sourceMappingURL=tutorial.types.js.map