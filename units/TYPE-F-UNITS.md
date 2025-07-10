# TYPE-F through TYPE-M Unit Definitions

## TYPE-F: Zone Controller Response Types
**Priority**: HIGH
**Blocking**: Yes - prevents compilation
**Dependencies**: None

### Objective
Fix all zone controller methods that are incorrectly typed as returning `void` when they actually return Express Response objects.

### Files to Fix
- `packages/server/src/controllers/zone.controller.ts`

### Error Pattern
```
Type 'Response<any, Record<string, any>>' is not assignable to type 'void'
```

### Specific Errors (13 total)
- Lines: 114, 117, 134, 168, 191, 194, 236, 239, 255, 269, 285, 294

### Fix Strategy
1. Update method signatures in IZoneController interface
2. Change return type from `void` to `Response` or appropriate type
3. Ensure mock implementation matches

### Success Criteria
- All zone controller TypeScript errors resolved
- Tests still pass
- No new errors introduced

---

## TYPE-G: BigInt and Number Conversions
**Priority**: HIGH
**Blocking**: Yes - causes runtime errors
**Dependencies**: None

### Objective
Fix all BigInt/number type mismatches and conversion issues across the codebase.

### Files to Fix
- `packages/server/src/services/BankService.ts` (line 233)
- `packages/server/src/services/CharacterService.ts` (lines 205, 229-231)
- `packages/server/src/controllers/combat.controller.ts` (lines 224, 338)

### Error Patterns
1. `Operator '*' cannot be applied to types 'number' and 'bigint'`
2. `Type 'bigint' is not assignable to type 'number'`
3. `Type 'Date' is not assignable to type 'number'`

### Fix Strategy
1. For BigInt operations: Convert to same type before operations
2. For Date to number: Use `.getTime()` method
3. For character stats: Ensure consistent BigInt usage

### Success Criteria
- All BigInt/number conversion errors resolved
- Calculations work correctly at runtime
- Type safety maintained

---

## TYPE-H: Service Return Types and Properties
**Priority**: HIGH
**Blocking**: Yes - prevents proper service usage
**Dependencies**: TYPE-G (for some character service fixes)

### Objective
Fix service methods returning wrong types and missing properties in returned objects.

### Files to Fix
- `packages/server/src/services/BankService.ts` (5 errors)
- `packages/server/src/services/EquipmentService.ts` (5 errors)
- `packages/server/src/services/MonsterService.ts` (3 errors)
- `packages/server/src/services/NPCService.ts` (4 errors)
- `packages/server/src/services/ResourceService.ts` (1 error)
- `packages/server/src/services/mock/MockTutorialService.ts` (7 errors)

### Error Patterns
1. Missing properties in returned objects
2. Wrong types for properties (string vs number)
3. Missing required fields
4. Wrong import names

### Fix Strategy
1. Align return types with interface definitions
2. Add missing properties to returned objects
3. Fix property type mismatches
4. Update imports to correct names

### Success Criteria
- All service return type errors resolved
- Services return expected data structures
- Controllers can use services without type errors

---

## TYPE-I: Remove Explicit Any Types
**Priority**: MEDIUM
**Blocking**: No - ESLint errors only
**Dependencies**: None

### Objective
Replace all `any` types with proper, specific types throughout the codebase.

### Files to Fix (40 occurrences)
- Controllers: combat (2), loot (1), npc (1), zone (1)
- Middleware: combat (1), statSecurity (9)
- Providers: ServiceProvider (1)
- Repositories: CharacterRepository (2), EquipmentRepository (4), death.repository (2)
- Routes: character.stats.routes (6)
- Services: MonsterService (3), NPCService (2)
- Types: api.types (4), response.utils (2)

### Fix Strategy
1. Analyze each `any` usage context
2. Define proper interfaces/types
3. Replace `any` with specific types
4. Update related code to match new types

### Success Criteria
- Zero `@typescript-eslint/no-explicit-any` errors
- Type safety improved
- No runtime errors from type changes

---

## TYPE-J: Unused Variables and Parameters
**Priority**: LOW
**Blocking**: No
**Dependencies**: None

### Objective
Clean up all unused variables, parameters, and declarations.

### Files to Fix (34 total errors)
TypeScript errors (19):
- Test helpers and mocks
- App.ts
- Various services
- Socket handlers

ESLint errors (15):
- Repository methods
- Service methods
- Type declarations

### Fix Strategy
1. Remove genuinely unused variables
2. Prefix with underscore if intentionally unused
3. Use variables where they should be used
4. Remove unused imports

### Success Criteria
- No unused variable warnings
- Code is cleaner and more maintainable
- No functionality broken

---

## TYPE-K: Function Types and Requires
**Priority**: MEDIUM
**Blocking**: No
**Dependencies**: None

### Objective
Replace `Function` type with proper function signatures and fix require statements.

### Files to Fix
- `packages/server/src/sockets/combat.socket.ts` (6 Function type errors)
- `packages/server/src/routes/combat.routes.ts` (1 require error)

### Fix Strategy
1. Define proper function signatures for callbacks
2. Convert require to import statement
3. Ensure type safety for function parameters

### Success Criteria
- No `@typescript-eslint/ban-types` errors
- No `@typescript-eslint/no-var-requires` errors
- Improved type safety for callbacks

---

## TYPE-L: Database and Repository Types
**Priority**: HIGH
**Blocking**: Yes - prevents database operations
**Dependencies**: None

### Objective
Fix database insert/update type mismatches in repositories and test helpers.

### Files to Fix
- `packages/server/src/__tests__/helpers/database-helpers.ts` (1 error)
- `packages/server/src/repositories/CharacterRepository.ts` (2 errors)

### Error Patterns
1. Insert parameter type mismatches
2. Unknown properties in update objects
3. Array vs single object confusion

### Fix Strategy
1. Align insert/update types with schema
2. Fix property names to match schema
3. Handle array vs single object properly

### Success Criteria
- Database operations compile without errors
- Tests can create test data properly
- Repository methods work correctly

---

## TYPE-M: TSConfig and Console Cleanup
**Priority**: LOW
**Blocking**: No - warnings only
**Dependencies**: None

### Objective
Fix TSConfig to include all necessary files and remove console statements.

### Files to Fix
- `packages/shared/tsconfig.json` (for .d.ts files)
- Multiple files with console.log statements (43 warnings)

### Fix Strategy
1. Update shared tsconfig to include .d.ts files
2. Replace console.log with proper logger
3. Remove debugging console statements

### Success Criteria
- No TSConfig parsing errors
- No console statement warnings
- Proper logging in place

---

## Recommended Execution Order

1. **TYPE-F** - Zone Controller (blocks compilation)
2. **TYPE-L** - Database Types (blocks tests)
3. **TYPE-G** - BigInt Conversions (runtime errors)
4. **TYPE-H** - Service Return Types (major functionality)
5. **TYPE-I** - Remove Any Types (code quality)
6. **TYPE-K** - Function Types (code quality)
7. **TYPE-J** - Unused Variables (cleanup)
8. **TYPE-M** - TSConfig & Console (cleanup)