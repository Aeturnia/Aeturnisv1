"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIBehavior = exports.MonsterState = void 0;
var MonsterState;
(function (MonsterState) {
    MonsterState["IDLE"] = "idle";
    MonsterState["PATROL"] = "patrol";
    MonsterState["COMBAT"] = "combat";
    MonsterState["FLEE"] = "flee";
})(MonsterState || (exports.MonsterState = MonsterState = {}));
var AIBehavior;
(function (AIBehavior) {
    AIBehavior["AGGRESSIVE"] = "aggressive";
    AIBehavior["DEFENSIVE"] = "defensive";
    AIBehavior["NEUTRAL"] = "neutral";
})(AIBehavior || (exports.AIBehavior = AIBehavior = {}));
//# sourceMappingURL=monster.types.js.map