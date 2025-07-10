# Error Catalog - Aeturnis Monorepo

**Version: v1.4.0**  
**Generated on: 2025-07-10**  
**Last Updated: 2025-07-10 (Post TYPE-M units completion)**

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
| v1.4.0 | 2025-07-10 | Completed TYPE-M units; 45 TypeScript errors (↓28 from v1.3.0), 14 ESLint errors (↓52 from v1.3.0); new duplicate identifier regression | Current |
| v1.3.0 | 2025-07-08 | Completed TYPE-A through TYPE-E units; 73 TypeScript errors (↓82.2%), 66 ESLint errors (↓51.8%); massive reduction achieved | Archived |
| v1.2.0 | 2025-07-07 | Completed all 8 fix chunks; 411 TypeScript errors (↑111%), 179 ESLint issues; exposed hidden type incompatibilities | Archived |
| v1.0.1 | 2025-07-07 | Added comprehensive versioning control system and enhanced tracking structure | Archived |
| v1.0.0 | 2025-07-07 | Initial comprehensive error analysis with 195+ TypeScript and 160+ ESLint errors | Archived |

**Next Version**: v1.5.0 will focus on fixing remaining TypeScript errors and the duplicate identifier regression

---

## Summary (v1.4.0)

- **TypeScript Errors**: 45 total (↓28 from v1.3.0, 38.4% reduction) 🟢
- **ESLint Errors**: 14 errors (↓52 from v1.3.0, 78.8% reduction) 🟢
- **Test Failures**: 89 failed, 248 passed (348 total tests)
- **Units Completed**: All TYPE-A through TYPE-M units (TYPE-K-002, TYPE-M-001, TYPE-M-002, TYPE-M-003) ✅
- **Resolved Categories**: 
  - Return statements ✅
  - Cache methods ✅
  - Console logging ✅
  - Error handling ✅
  - Service interface mismatches (mostly) ✅
  - TSConfig .d.ts inclusion ✅
  - Console statements converted to logger ✅
  - ESLint environment-specific rules ✅
- **New Regressions**:
  - Duplicate identifier 'logger' in death.service.ts (lines 3 and 16) 🔄

---

## TypeScript Errors by Category

### 1. Duplicate Identifier (TS2300) 🔄 REGRESSION
| State | Ver | File | Line | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔄 | v1.4 | `src/services/death.service.ts` | 3,16 | Duplicate identifier 'logger' | v1.4.0 | v1.4.0 | - | v1.4.0 | 2 | HIGH | - | Regression from TYPE-M-002 logger implementation |

### 2. Property Does Not Exist (TS2339) - Service Interface Mismatches
| State | Ver | File | Line | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.2 | `src/controllers/combat.controller.ts` | Multiple | Property mismatches on combat service | v1.2.0 | v1.4.0 | - | - | 15 | CRITICAL | - | Remaining combat service mismatches |
| 🔴 | v1.2 | `src/controllers/loot.controller.ts` | Multiple | Property 'distributeGold' missing | v1.2.0 | v1.4.0 | - | - | 1 | HIGH | - | Loot service interface issue |
| 🔴 | v1.2 | `src/routes/tutorial.routes.ts` | 60,75,90,107 | Property 'getTutorialZone' missing | v1.2.0 | v1.4.0 | - | - | 4 | HIGH | - | Tutorial service interface issue |

### 3. Type Incompatibilities (TS2345, TS2322)
| State | Ver | File | Line | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.2 | `src/repositories/CharacterRepository.ts` | 223 | BigInt literal type issue | v1.2.0 | v1.4.0 | - | - | 1 | HIGH | - | BigInt type conversion needed |
| 🔴 | v1.2 | `src/services/StatsService.ts` | 90,120 | Argument type mismatches | v1.2.0 | v1.4.0 | - | - | 2 | MEDIUM | - | Level/XP type issues |

### 4. Cannot Find Module (TS2307)
| State | Ver | File | Line | Error | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|-------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.2 | `src/database/seed.ts` | 13 | Cannot find module './schema' | v1.2.0 | v1.4.0 | - | - | 1 | HIGH | - | Missing schema import |

---

## ESLint Errors by Category

### 1. Unused Variables (@typescript-eslint/no-unused-vars)
| State | Ver | File | Line | Variable | First | Last | Fixed | Regressed | Count | Priority | Owner | Notes |
|-------|-----|------|------|----------|-------|------|-------|-----------|-------|----------|-------|-------|
| 🔴 | v1.4 | `src/repositories/EquipmentRepository.ts` | 530:28 | `_charId` | v1.4.0 | v1.4.0 | - | - | 1 | LOW | - | Parameter with underscore prefix |
| 🔴 | v1.4 | `src/services/DialogueService.ts` | Multiple | Various `_*` parameters | v1.4.0 | v1.4.0 | - | - | 10 | LOW | - | Multiple unused parameters |
| 🔴 | v1.4 | `src/services/EquipmentService.ts` | 15:3 | `EquipmentItemWithDetails` | v1.4.0 | v1.4.0 | - | - | 1 | LOW | - | Unused type import |
| 🔴 | v1.4 | `src/services/SpawnService.ts` | 122:20 | `_spawnPointId` | v1.4.0 | v1.4.0 | - | - | 1 | LOW | - | Unused parameter |
| 🔴 | v1.4 | `src/types/express.d.ts` | 1:10 | `Express` | v1.4.0 | v1.4.0 | - | - | 1 | LOW | - | Unused import in .d.ts |

---

## Progress Metrics

### TypeScript Error Reduction
- v1.0.0: 195 errors (baseline)
- v1.2.0: 411 errors (+111% - exposed hidden issues)
- v1.3.0: 73 errors (↓82.2% from v1.2.0)
- v1.4.0: 45 errors (↓38.4% from v1.3.0) ✅

### ESLint Error Reduction
- v1.0.0: 160+ issues (baseline)
- v1.2.0: 179 issues
- v1.3.0: 66 errors + 43 warnings
- v1.4.0: 14 errors (↓78.8% from v1.3.0) ✅

### Test Suite Status
- Total Tests: 348
- Passing: 248 (71.3%)
- Failing: 89 (25.6%)
- Test Files: 26 (14 failing, 11 passing)

---

## Priority Actions

1. **Fix duplicate logger regression** in death.service.ts (HIGH)
2. **Complete remaining service interface mismatches** (CRITICAL)
3. **Fix BigInt type conversions** (HIGH)
4. **Resolve module import issues** (HIGH)
5. **Clean up ESLint unused variables** (LOW)

---

## Notes

- TYPE-M units successfully completed with significant error reduction
- Logger implementation from TYPE-M-002 caused a regression in death.service.ts
- ESLint configuration now environment-aware with appropriate overrides
- Test failures indicate functional issues beyond type/lint errors