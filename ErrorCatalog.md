# Error Catalog - Aeturnis Monorepo

**Version: v1.0.1**  
**Generated on: 2025-07-07**  
**Last Updated: 2025-07-07 (Enhanced Versioning Control System)**

---

## 🤖 Replit Update Prompt

When updating this catalog, use the following prompt:

```
Please update the Error Catalog following these rules:
1. Change error state from 🔴 to appropriate state (🟢 for resolved, 🟡 for in-progress, etc.)
2. Update the "Fixed" column with the current version when resolving
3. If an error reappears after being fixed, change state to 🔄 and add version to "Regressed" column
4. Increment version number: patch (X.X.Z) for documentation updates, minor (X.Y.0) for chunk completions
5. Update the version history table with date and changes
6. Recalculate summary statistics (total errors, resolved count, regression count)
7. For new errors found, add with 🆕 state and current version in "First" column
8. Update "Last" column to current version for any error still present
9. Add any relevant notes about the fix or regression cause
```

---

## 📋 Multi-Dimensional Version Tracking System

### Version Schema: X.Y.Z-BUILD

- **X** = Major Version (Production milestones)
- **Y** = Minor Version (Chunk completions)  
- **Z** = Patch Version (Documentation updates)
- **BUILD** = CI/CD build number (optional)

**Example**: 1.1.0-2547

### Version Progression Guidelines
- **Patch versions** (v1.0.x): Documentation updates, catalog maintenance
- **Minor versions** (v1.x.0): Completion of error resolution chunks (CHUNK 7, 8, 9, etc.)
- **Major versions** (v2.0.0): All errors resolved, production-ready state achieved

---

## 🎯 Error Lifecycle States

| State | Symbol | Description | Action Required |
|-------|--------|-------------|-----------------|
| NEW | 🆕 | First appearance of error | Needs triage and priority assignment |
| UNRESOLVED | 🔴 | Known error, not yet fixed | Needs to be resolved |
| IN_PROGRESS | 🟡 | Currently being worked on | Resolution in progress |
| RESOLVED | 🟢 | Error has been fixed | Monitor for regressions |
| REGRESSION | 🔄 | Error reappeared after fix | Investigate root cause |
| WONTFIX | ⚫ | Intentional/accepted error | Document reasoning |
| DEFERRED | 🔵 | Postponed to future release | Track for future work |

---

## 📊 Enhanced Error Tracking Structure

### Column Definitions
- **State**: Current lifecycle state of the error
- **Ver**: Version when error was first detected
- **File**: Source file containing the error
- **Line**: Line number(s) where error occurs
- **Error**: Error code and description
- **First**: Version where error first appeared
- **Last**: Version where error was last seen
- **Fixed**: Version where error was resolved (if applicable)
- **Regressed**: Version(s) where error reappeared after fix
- **Count**: Number of occurrences of this specific error
- **Priority**: CRITICAL, HIGH, MEDIUM, LOW
- **Owner**: Team member assigned to fix
- **Notes**: Additional context or fix information

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| v1.0.1 | 2025-07-07 | Added comprehensive versioning control system and enhanced tracking structure | Current |
| v1.0.0 | 2025-07-07 | Initial comprehensive error analysis with 195+ TypeScript and 160+ ESLint errors | Archived |

**Next Version**: v1.1.0 will be released after first error resolution chunk completion (CHUNK 7: Console Statements & Logger Standardization)

---

## Summary (v1.0.1)

- **TypeScript Errors**: 195+ total (13+ new errors found) 🔴
- **ESLint Errors**: 160+ errors + 130+ warnings (14+ new errors, 8+ new warnings) 🔴
- **New Issues**: Missing type exports, configuration problems, test client errors 🔴
- **Resolved**: 0
- **Regressions**: 0
- **In Progress**: 0

**Resolution Progress**: 0% complete (0 of 195+ TypeScript errors resolved)  
**Target**: Next version v1.1.0 after CHUNK 7 completion

---

## Error Priority Matrix

| Priority | Criteria | Resolution SLA | Example Errors |
|----------|----------|----------------|----------------|
| CRITICAL | Blocks build/deploy | 24 hours | Missing return statements, broken imports |
| HIGH | Type safety violations | 48 hours | any usage, type mismatches |
| MEDIUM | Code quality issues | 1 week | Unused variables, console.logs |
| LOW | Style/convention | Next release | Naming conventions, formatting |

---

## TypeScript Errors by Category

### 1. Not All Code Paths Return Value (TS7030)
| State | Ver | File | Line | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/app.ts` | 175:16 | Arrow function missing return statement | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | Updated line number |
| 🔴 | v1.0 | `src/controllers/combat.controller.simple.ts` | 110:32 | Function missing return value | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | - |

### 2. Unused Parameters/Variables (TS6133)
| State | Ver | File | Line | Variable | Context | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|---------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.simple.ts` | 6:40 | `req` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.simple.ts` | 29:37 | `req` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.simple.ts` | 58:39 | `req` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 19:38 | `req` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 484:24 | `battleType` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 26:14 | `characterId` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 29:20 | `locationData` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 29:34 | `killer` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 29:42 | `deathTime` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/loot.controller.ts` | 125:19 | `item` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 233:30 | `distance` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/zone.controller.ts` | 89:13 | `query` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/mock/MockCombatService.ts` | 186:20 | `sourceType` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/mock/MockCombatService.ts` | 250:23 | `opponentType` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/mock/MockMonsterService.ts` | 108:28 | `distance` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/mock/MockNPCService.ts` | 108:28 | `distance` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 60:11 | `existingChar` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 141:18 | `updates` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 171:12 | `character` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 123:12 | `characterId` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 127:12 | `characterId` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 161:21 | `monsterId` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 267:12 | `characterId` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 305:24 | `target` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 502:23 | `opponentType` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 566:20 | `sourceType` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 19:3 | `Equipment` | Import never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 25:42 | `ConflictError` | Import never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/ResourceService.ts` | 162:29 | `charId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/ResourceService.ts` | 179:31 | `charId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/SpawnService.ts` | 62:25 | `spawnPointId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/SpawnService.ts` | 75:18 | `spawnPointId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/SpawnService.ts` | 119:20 | `spawnPointId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/StatsService.ts` | 393:5 | `character` | Variable declared but never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/TestMonsterService.ts` | 1:1 | `uuidv4` | Import never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/death.service.ts` | 21:27 | `DURABILITY_DAMAGE_PERCENTAGE` | Constant never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/death.service.ts` | 185:41 | `characterId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/loot.service.ts` | 150:19 | `event` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/loot.service.ts` | 200:34 | `characterId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/mock/MockProgressionService.ts` | 12:3 | `CharacterStats` | Import never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/mock/MockProgressionService.ts` | 16:3 | `StatType` | Import never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/mock/MockZoneService.ts` | 225:31 | `characterId` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/sockets/combat.socket.ts` | 3:24 | `CombatResult` | Import never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/sockets/monster.events.ts` | 9:39 | `io` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/sockets/npc.events.ts` | 9:35 | `io` | Parameter never used | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🆕 | v1.0 | `src/controllers/movement.controller.ts` | 340:39 | `req` | Parameter never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🆕 | v1.0 | `src/controllers/progression.controller.ts` | 364:42 | `req` | Parameter never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🆕 | v1.0 | `src/controllers/tutorial.controller.ts` | 26:25 | `req` | Parameter never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🆕 | v1.0 | `src/controllers/tutorial.controller.ts` | 82:22 | `req` | Parameter never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🆕 | v1.0 | `src/controllers/affinity.controller.ts` | Various | `req` | Multiple unused parameters | v1.0.1 | v1.0.1 | - | - | 5 | LOW | - | NEW |

### 3. Property Does Not Exist (TS2339)
| State | Ver | File | Line | Property | On Type | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|---------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 105:46 | `status` | `CombatSession` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 105:100 | `roundNumber` | `CombatSession` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 105:169 | `charId` | `Combatant` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 105:233 | `charName` | `Combatant` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 201:24 | `status` | `CombatSession` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 225:83 | `code` | `CombatResult & Record<"error", unknown>` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 231:22 | `code` | `CombatResult & Record<"error", unknown>` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 272:27 | `code` | `CombatResult & Record<"error", unknown>` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 336:22 | `code` | `CombatResult & Record<"error", unknown>` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 359:27 | `code` | `CombatResult & Record<"error", unknown>` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 36:45 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 44:37 | `getCharacterByUsername` | `any` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 51:40 | `set` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 97:46 | `set` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 152:42 | `lootItems` | Response object | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/loot.controller.ts` | 202:17 | `characterId` | Request body | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/monster.controller.ts` | 33:38 | `getNearbyMonsters` | `MockMonsterService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/monster.controller.ts` | 40:38 | `getMonsterById` | `MockMonsterService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/monster.controller.ts` | 135:43 | `isAlive` | `SpawnedMonster` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/progression.controller.ts` | 54:46 | `getStatsByCharacterNameFromDB` | `StatsService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/progression.controller.ts` | 90:47 | `stats` | Object type | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/middleware/auth.ts` | 84:25 | `charname` | Decoded token | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/middleware/auth.ts` | 113:25 | `charname` | Decoded token | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 66:18 | `setex` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 178:18 | `setex` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 301:22 | `setex` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 335:22 | `setex` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 400:20 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 415:22 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 439:20 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 465:18 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 466:18 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 467:18 | `del` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/death.service.ts` | 258:41 | `getTTL` | `CacheService` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🆕 | v1.0 | `src/controllers/npc.controller.ts` | 91:47 | `getAvailableInteractions` | `MockNPCService` | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |

### 4. Cannot Invoke Possibly Undefined (TS2722/TS18048)
| State | Ver | File | Line | Method | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|--------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 90:27 | `combatService.getActiveCombat` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 197:27 | `combatService.getActiveCombat` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 218:26 | `combatService.processCombatAction` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 329:26 | `combatService.processCombatAction` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 408:27 | `combatService.initiateCombat` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 126:20 | `realDeathService.respawnCharacter` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 160:43 | `lootResult.lootItems` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/mock/MockCombatService.ts` | 171:21 | `target.takeDamage` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/mock/MockCombatService.ts` | 175:21 | `source.takeDamage` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |

### 5. Wrong Number of Arguments (TS2554)
| State | Ver | File | Line | Expected | Got | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|-----|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 218:80 | 2 | 3 | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 329:80 | 2 | 3 | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 82:62 | 1 | 2 | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |

### 6. Property Name Typos (TS2551)
| State | Ver | File | Line | Wrong | Correct | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|--------|---------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 105:208 | `currentTurnIndex` | `currentTurn` | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 59:24 | `setex` | `set` | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 224:24 | `setex` | `set` | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |

### 7. Type 'unknown' Errors (TS18046)
| State | Ver | File | Line | Context | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|---------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 233:15 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 236:22 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 239:22 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 251:15 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 254:22 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 338:15 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 341:22 | `result.error` | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |

### 8. Type Assignment Errors (TS2345/TS2740/TS2739)
| State | Ver | File | Line | Error Description | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------------------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 43:25 | Argument type '{}' not assignable to 'string' | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 205:25 | Argument type '{}' not assignable to 'string' | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 315:11 | Missing properties: min_damage, max_damage | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 380:11 | Missing 17 properties from Record<StatType, number> | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 397:11 | Missing 17 properties from Record<StatType, number> | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |

### 9. Duplicate Property in Object (TS2783)
| State | Ver | File | Line | Property | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 279:7 | `success` | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 364:7 | `success` | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |

### 10. Module Import Errors
| State | Ver | File | Line | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 25:10 | Module has no exported member 'BadRequestError' | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | - |
| 🔴 | v1.0 | `src/services/mock/MockMovementService.ts` | 11:3 | 'Direction' not exported from module | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | - |
| 🔴 | v1.0 | `../shared/src/types/npc.types.ts` | 1:28 | File not under 'rootDir' | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | - |
| 🆕 | v1.0 | `src/controllers/movement.controller.ts` | 7:37 | Module declares 'Direction' locally, but it is not exported | v1.0.1 | v1.0.1 | - | - | 1 | CRITICAL | - | NEW |
| 🆕 | v1.0 | `src/routes/tutorial.routes.ts` | 9-12 | Missing module '../../../shared/types/tutorial.types' | v1.0.1 | v1.0.1 | - | - | 1 | CRITICAL | - | NEW |
| 🆕 | v1.0 | `src/routes/affinity.routes.ts` | 9-15 | Missing module '../../../shared/types/affinity.types' | v1.0.1 | v1.0.1 | - | - | 1 | CRITICAL | - | NEW |

### 11. Property Never Read (TS6138)
| State | Ver | File | Line | Property | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 31:13 | `statsService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 33:13 | `sessionManager` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/SpawnService.ts` | 23:13 | `spawnPointRepository` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/SpawnService.ts` | 24:13 | `monsterService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |

---

## ESLint Errors by Category

### 1. Unused Variables (@typescript-eslint/no-unused-vars)
| State | Ver | File | Line | Variable | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/__tests__/monster.service.test.ts` | 5:7 | `monsterService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/__tests__/npc.service.test.ts` | 5:7 | `npcService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 484:24 | `battleType` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 686:13 | `charId` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 714:13 | `charId` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 3:25 | `IDeathStatusResponse` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 199:11 | `mockDeathRequest` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 168:11 | `currentMode` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 349:5 | `MockMonsterService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 350:5 | `MockNPCService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 369:5 | `RealMonsterService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 370:5 | `RealNPCService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockCurrencyService.test.ts` | 2:10 | `CurrencyType` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:3 | `describe` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:13 | `it` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:17 | `expect` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:25 | `beforeEach` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:3 | `describe` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:13 | `it` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:17 | `expect` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:25 | `beforeEach` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/providers/real/RealBankService.ts` | 2:10 | `BankTransaction` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.simple.ts` | 5:10 | `CharacterService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.ts` | 8:10 | `CharacterService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/routes/equipment.routes.simple.ts` | 5:10 | `EquipmentService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/routes/equipment.routes.ts` | 5:10 | `EquipmentService` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 8:32 | `Character` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 18:3 | `EquipmentItemWithDetails` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 1:10 | `Socket` | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |

### 2. Unexpected 'any' Type (@typescript-eslint/no-explicit-any)
| State | Ver | File | Line | Context | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|---------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 687:77 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 717:85 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 783:75 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/death.controller.ts` | 200:27 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/loot.controller.ts` | 298:26 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/loot.controller.ts` | 392:42 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/movement.controller.ts` | 88:36 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/movement.controller.ts` | 300:41 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 37:49 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 125:52 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 127:85 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 181:52 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 183:85 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 215:54 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 233:36 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 257:78 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/progression.controller.ts` | 105:50 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/progression.controller.ts` | 107:84 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/zone.controller.ts` | 96:76 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/zone.controller.ts` | 117:47 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/zone.controller.ts` | 119:81 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/zone.controller.ts` | 211:47 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/zone.controller.ts` | 213:81 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/database/index.ts` | 34:64 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/middleware/auth.ts` | 48:30 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/middleware/auth.ts` | 49:14 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/middleware/auth.ts` | 55:19 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/middleware/auth.ts` | 82:15 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 117:26 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 235:47 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 236:53 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 239:48 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 240:52 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 430:59 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 431:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 432:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/bank.routes.ts` | 107:23 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/bank.routes.ts` | 108:29 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/bank.routes.ts` | 110:63 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.simple.ts` | 143:44 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.simple.ts` | 146:78 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.ts` | 170:62 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.ts` | 171:62 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.ts` | 199:44 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/character.routes.ts` | 202:78 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/combat.routes.ts` | 22:65 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/combat.routes.ts` | 23:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/combat.routes.ts` | 38:68 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/combat.routes.ts` | 39:61 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/combat.routes.ts` | 54:64 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/combat.routes.ts` | 55:57 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/currency.routes.ts` | 150:39 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/currency.routes.ts` | 154:67 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 24:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 25:53 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 44:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 45:53 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 62:57 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 63:52 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 80:61 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/death.routes.ts` | 81:56 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/equipment.routes.simple.ts` | 131:45 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/equipment.routes.simple.ts` | 134:79 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/equipment.routes.ts` | 123:45 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/equipment.routes.ts` | 126:79 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 20:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 21:53 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 36:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 37:53 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 52:62 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 53:57 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 68:57 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 69:52 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 84:63 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/loot.routes.ts` | 85:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/monster.routes.ts` | 24:65 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/monster.routes.ts` | 25:60 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/monster.routes.ts` | 40:62 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/monster.routes.ts` | 41:57 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/monster.routes.ts` | 56:61 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/monster.routes.ts` | 57:56 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 20:58 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 21:53 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 36:56 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 37:51 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 52:60 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 53:55 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 68:60 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/npc.routes.ts` | 69:55 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/session.routes.ts` | 36:66 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/routes/session.routes.ts` | 37:48 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CharacterService.ts` | 144:7 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 268:17 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 306:29 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 87:63 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 246:14 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 262:12 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/death.events.ts` | 78:16 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/FixedChatHandler.ts` | 59:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 30:54 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 31:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 67:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 108:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 146:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/handlers/combatHandler.ts` | 189:21 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/loot.events.ts` | 106:60 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/monster.events.ts` | 83:77 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/npc.events.ts` | 147:17 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/npc.events.ts` | 230:14 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/sockets/npc.events.ts` | 284:12 | Type annotation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🆕 | v1.0 | `src/routes/bank.routes.ts` | 195 | Type annotation - `(req as any).user?.id` | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |
| 🆕 | v1.0 | `src/routes/character.stats.routes.ts` | 24, 83, 130, 131, 180, 233 | Multiple uses of `(req as any)` | v1.0.1 | v1.0.1 | - | - | 6 | HIGH | - | NEW |
| 🆕 | v1.0 | `src/routes/equipment.routes.ts` | 363 | Type annotation - `slot as any` | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |
| 🆕 | v1.0 | `src/services/BankService.ts` | 334 | Use of 'any' type for rawSlots | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |
| 🆕 | v1.0 | `src/services/CharacterService.ts` | 202 | `updates` variable typed as 'any' | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |
| 🆕 | v1.0 | `src/services/CombatService.ts` | 946 | Use of 'any' type for buff object | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |
| 🆕 | v1.0 | `src/services/ResourceService.ts` | 89 | Type assertion with `as any` | v1.0.1 | v1.0.1 | - | - | 1 | HIGH | - | NEW |

### 3. Console Statements (no-console)
| State | Ver | File | Line Count | Lines | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 40+ | 88, 91, 121-122, 128-130, 132-133, 142, 152, 156-162, 177-180, 188-189, 198-202, 205, 217-221, 226, 264, 283-290, 380-382, 388, 392-393, 399-400, 409-417, 429, 432-439 | v1.0 | v1.0.1 | - | - | 40 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/controllers/monster.controller.ts` | 10 | 30, 63, 86, 138, 171, 211, 218, 263, 270, 302 | v1.0 | v1.0.1 | - | - | 10 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.simple.ts` | 4 | 18, 47, 99, 143 | v1.0 | v1.0.1 | - | - | 4 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/controllers/npc.controller.ts` | 5 | 24, 52, 75, 101, 133 | v1.0 | v1.0.1 | - | - | 5 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/providers/ServiceProvider.ts` | 9 | 126, 173, 190, 194, 197, 318, 320, 461, 465 | v1.0 | v1.0.1 | - | - | 9 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 2 | 223, 238 | v1.0 | v1.0.1 | - | - | 2 | MEDIUM | - | - |
| 🆕 | v1.0 | `src/services/CombatService.ts` | Multiple | 113-127, 139-145, 163-165, and more throughout file | v1.0.1 | v1.0.1 | - | - | 30+ | MEDIUM | - | NEW |

### 4. Function Type Usage (@typescript-eslint/ban-types)
| State | Ver | File | Line | Context | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|---------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 80:76 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 81:70 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 82:75 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 154:77 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 161:86 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 183:82 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/sockets/SocketServer.ts` | 192:83 | Using `Function` type | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |

### 5. ESLint Configuration Errors
| State | Ver | File | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `/packages/shared/src/types/monster.types.d.ts` | Not included in TSConfig | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |
| 🔴 | v1.0 | `/packages/shared/src/types/npc.types.d.ts` | Not included in TSConfig | v1.0 | v1.0.1 | - | - | 1 | LOW | - | - |

---

## Error Summary by File

### Most Problematic Files (by error count)
1. **src/controllers/combat.controller.ts** - 68 total errors (41 TS + 27 ESLint)
2. **src/controllers/death.controller.ts** - 44 total errors (34 TS + 10 ESLint)
3. **src/services/CharacterService.ts** - 33 total errors (24 TS + 9 ESLint)
4. **src/services/EquipmentService.ts** - 13 total errors (11 TS + 2 ESLint)
5. **src/controllers/npc.controller.ts** - 10 total errors (2 TS + 8 ESLint)

### Critical Issues to Address First
1. **Missing return statements** in route handlers
2. **Cache service method mismatches** (`setex` vs `set`, `del` missing)
3. **Type safety issues** with excessive `any` usage
4. **Missing type definitions** for combat and character properties
5. **Configuration issues** with TypeScript paths and ESLint

---

## New Issues Added in Latest Analysis

### 12. Missing Implementations
| State | Ver | File | Line | Issue | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 811, 904 | `CombatService` used but not imported | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 869 | `testMonsterService` used but not declared | v1.0 | v1.0.1 | - | - | 1 | CRITICAL | - | - |
| 🔴 | v1.0 | `src/controllers/combat.controller.ts` | 687, 717, 783 | Methods not in ICombatService interface | v1.0 | v1.0.1 | - | - | 3 | HIGH | - | - |
| 🔴 | v1.0 | `src/controllers/loot.controller.ts` | 295 | TODO: `getAllLootTables` not in ILootService | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/routes/bank.routes.ts` | 146 | TODO: Missing itemId implementation | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |
| 🔴 | v1.0 | `src/routes/bank.routes.ts` | 198-204 | `transferItem` not in IBankService | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |

### 13. Type Safety Issues in Services
| State | Ver | File | Line | Issue | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `src/services/CacheService.ts` | 97, 107, 115 | Accessing `this.redis` without null checks | v1.0 | v1.0.1 | - | - | 3 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CacheService.ts` | 39-46 | Type assertion on JSON.parse without validation | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/BankService.ts` | 241 | BigInt to Number conversion without overflow check | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CurrencyService.ts` | 241 | BigInt to Number conversion without overflow check | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/CombatService.ts` | 89 | Type assertion on error without type guard | v1.0 | v1.0.1 | - | - | 1 | HIGH | - | - |
| 🔴 | v1.0 | `src/services/EquipmentService.ts` | 532-534 | Silent error handling without propagation | v1.0 | v1.0.1 | - | - | 1 | MEDIUM | - | - |

### 14. Test Client Errors (New)
| State | Ver | File | Line | Variable | Issue | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | `test-client/src/App.tsx` | - | `React` | Imported but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/combat/CombatPanel.tsx` | - | `isAuthenticated` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/logs/LogsPanel.tsx` | - | `isAuthenticated` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/monsters/MonsterList.tsx` | - | `isAuthenticated` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/monsters/SpawnControl.tsx` | - | `isAuthenticated` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/npcs/DialogueViewer.tsx` | - | `DialogueNode` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/npcs/NPCList.tsx` | - | `isAuthenticated` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | `test-client/src/components/zones/ZonePanel.tsx` | - | `Zone` | Declared but never used | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |

### 15. Configuration Issues
| State | Ver | Issue | Description | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|-------|-------------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.0 | Missing Jest Dependencies | @types/jest@^29.5.0, jest@^29.7.0, ts-jest@^29.1.0 | v1.0.1 | v1.0.1 | - | - | 3 | MEDIUM | - | NEW |
| 🔴 | v1.0 | Inconsistent Export Patterns | Some routes use default export, others use named exports | v1.0.1 | v1.0.1 | - | - | 1 | LOW | - | NEW |
| 🔴 | v1.0 | Duplicate Type Definitions | ItemRarity defined in both server and shared packages | v1.0.1 | v1.0.1 | - | - | 1 | MEDIUM | - | NEW |

---

## Recommendations

1. **Immediate Actions** (CRITICAL Priority):
   - Fix missing return statements in `app.ts` (line 175) and `combat.controller.simple.ts`
   - Update CacheService interface to match actual implementation
   - Add missing imports for CombatService and testMonsterService
   - Create missing type files: tutorial.types.ts and affinity.types.ts
   - Export Direction type from movement.types.ts

2. **Short-term Fixes** (HIGH Priority):
   - Remove or properly type all `any` usages
   - Fix property access errors in combat and death controllers
   - Add null checks for redis operations in CacheService
   - Implement proper BigInt to Number conversion with overflow checks
   - Fix cache service method names (setex → set)

3. **Medium-term Improvements** (MEDIUM Priority):
   - Clean up unused variables and imports
   - Replace all console.log statements with proper logger
   - Update TypeScript configuration to include .d.ts files
   - Standardize route export patterns
   - Add runtime validation for JSON parsing and type assertions

4. **Long-term Improvements** (LOW Priority):
   - Implement proper error handling types
   - Standardize service interfaces across mock and real implementations
   - Add comprehensive type definitions for all domain objects
   - Clean up test client unused imports
   - Resolve duplicate type definitions between packages