# ErrorFixingRoadmap.md

**Generated: 2025-07-07 · Based on ErrorCatalog.md analysis**

---

## Overview

This roadmap organizes all critical, recurring, and configuration errors in the Aeturnis Monorepo into realistic "chunks" or batches, designed for stepwise resolution in Replit. Each chunk includes explicit objectives and a file/task checklist. **Chunks should be tackled sequentially—never batch-commit more than one chunk without a green CI self-audit.**

---

## 📦 CHUNK 1: RETURN STATEMENT & CONTROL FLOW ERRORS (Highest Priority)

**Objective:**  
Fix all "Not All Code Paths Return Value" (TS7030) errors in controllers and app entrypoints, ensuring every function with a return type actually returns.

**Checklist:**
- [ ] `src/app.ts` (line 175:16): Arrow function missing return
- [ ] `src/controllers/combat.controller.simple.ts` (line 110:32): Missing return
- [ ] Any other updated locations from TS error logs

---

## 📦 CHUNK 2: CACHE SERVICE & TYPE MISMATCH ERRORS

**Objective:**  
Standardize all usage of `CacheService`—correct interface mismatches (`setex` vs `set` vs `del`), add missing/null checks, and fix all property name typos in service and controller usage.

**Checklist:**
- [ ] `src/services/CharacterService.ts`: update all `.setex` and `.del` to correct, implemented methods
- [ ] `src/services/EquipmentService.ts`: same as above (lines 59:24, 224:24, etc)
- [ ] `src/services/death.service.ts`, `src/controllers/death.controller.ts`: ensure correct usage and null checks
- [ ] `src/services/CacheService.ts`: Add null checks for all `this.redis` usage, fix type assertions

---

## 📦 CHUNK 3: TYPE SAFETY (NO 'any', PROPERTY ERRORS, ASSIGNMENT ERRORS)

**Objective:**  
Remove all `any` usages, fix all type mismatches, and resolve property access errors in services and controllers (TS2339, TS2345, TS18046, etc). Add missing/duplicate type definitions as needed.

**Checklist:**
- [ ] All files: replace `any` with explicit types (see ErrorCatalog for line numbers)
- [ ] `src/controllers/combat.controller.ts`: fix property access on CombatSession, Combatant, CombatResult, etc.
- [ ] `src/services/EquipmentService.ts`: correct object assignments, fill all required properties
- [ ] Add or merge type definitions for missing/duplicated domain objects
- [ ] Test/validate all type assignments in affected files

---

## 📦 CHUNK 4: UNUSED VARIABLES, UNUSED IMPORTS, LINT ERRORS

**Objective:**  
Remove or use all declared variables/imports as flagged by TypeScript/ESLint. Sweep for variables marked as unused or never read (TS6133, @typescript-eslint/no-unused-vars, TS6138).

**Checklist:**
- [ ] All controllers/services flagged in ErrorCatalog (see list, especially combat, death, NPC, equipment)
- [ ] Remove/replace variables/imports in test files
- [ ] Ensure no code removal breaks logic—add linter exceptions only where unavoidable

---

## 📦 CHUNK 5: MODULE IMPORTS, CONFIGURATION, MISSING FILES

**Objective:**  
Fix all module import and configuration issues, especially those blocking the build or breaking the monorepo. Create missing type files, update tsconfig, and resolve test-related import issues.

**Checklist:**
- [ ] Add missing imports (CombatService, testMonsterService, etc.)
- [ ] Create missing type files (e.g., `tutorial.types.ts`, `affinity.types.ts`)
- [ ] Export missing types (`Direction` from movement.types.ts, etc.)
- [ ] Update TypeScript and ESLint config to include all d.ts/type files (see config errors)
- [ ] Install missing Jest/ts-jest/@types/jest dependencies
- [ ] Resolve all inconsistent export patterns in routes

---

## 📦 CHUNK 6: TEST CLIENT ERRORS

**Objective:**  
Clean up the test-client/src folder—remove unused variables, ensure all imports are required, and fix type or usage errors in React components.

**Checklist:**
- [ ] `test-client/src/App.tsx`, `combat/CombatPanel.tsx`, `logs/LogsPanel.tsx`, `monsters/MonsterList.tsx`, etc.: remove or use unused imports/variables
- [ ] Fix any resulting TS/ESLint errors after cleanup

---

## 📦 CHUNK 7: CONSOLE STATEMENTS, LOGGER STANDARDIZATION

**Objective:**  
Replace all `console.log`/`console.error` calls with the project logger, as required by lint rules and code standards. Remove stray debugging statements in services, controllers, and sockets.

**Checklist:**
- [ ] Sweep all controllers and services for console usage (see ErrorCatalog line lists)
- [ ] Refactor to use Winston/logger utility
- [ ] Remove any obsolete debug output

---

## 📦 CHUNK 8: ADVANCED & LONG-TERM IMPROVEMENTS

**Objective:**  
Tackle the less urgent but architecturally important improvements, such as error handling types, runtime validation, and BigInt/Number safety.

**Checklist:**
- [ ] Implement proper error handling types and guards in all services/controllers
- [ ] Standardize mock/real service interfaces
- [ ] Add runtime JSON validation for type assertions
- [ ] Ensure safe BigInt → Number conversions throughout codebase
- [ ] Refactor and document as needed for long-term maintainability

---

## 📝 Chunks in Action: Sample Workflow

> 1. **Pick one chunk** (start with Chunk 1) and create a Replit branch: `fix/chunk-1-return-flow`.
> 2. **Fix every error/warning** listed for that chunk, commit with clear messages.
> 3. **Run lint and tests** (audit using `npm run lint:ts --max-warnings=0` and `npm test --coverage`).
> 4. **Paste self-audit footer** in commit or PR notes.
> 5. When CI is green, **merge**. Proceed to next chunk.

---

## 🏁 Completion Criteria

- Each chunk must pass lint, tests, and build with 0 new errors.
- No chunk merges without a green self-audit footer.
- After all chunks, perform a project-wide regression check.

---

**This roadmap is dynamic—update it as new errors appear or are fixed.**  
**Reference:** See [ErrorCatalog.md] for full error lists, line numbers, and context.
