# Critical TypeScript Fixes - Priority Order

## Immediate Fixes Required (Blocking Compilation)

### 1. Combat System Types (80+ errors)
**Files**: `combat.controller.ts`, `MockCombatService.ts`, `RealCombatService.ts`

**Actions**:
- Update `CombatSession` interface to include: `status`, `roundNumber`, `currentTurn`
- Update `Combatant` interface to include: `charId`, `charName`
- Fix `CombatResult` to properly type the `error` property
- Import missing combat types: `CombatStartRequest`, `CharacterCombatStats`, `ResourcePool`
- Rename incorrect type references (e.g., `CombatSessionNew` → `CombatSession`)

### 2. Service Interface Alignment (50+ errors)
**Files**: All service implementations in `providers/real/` and `providers/mock/`

**Actions**:
- Add missing methods to service interfaces or remove calls
- Fix method signatures (especially argument counts)
- Ensure mock and real services implement identical interfaces
- Handle potentially undefined service instances

### 3. Missing Type Imports (30+ errors)
**Files**: Various controllers and services

**Actions**:
- Import `CombatService`, `testMonsterService` where used
- Export `Direction`, `DamageType` from shared types
- Fix module paths for missing repositories
- Resolve cross-package import issues

### 4. Core Type Definitions (40+ errors)
**Files**: Type definition files and interfaces

**Actions**:
- Add missing properties to `Monster` type
- Fix `DerivedStats` to include effective stat properties
- Update `Transaction` type with missing properties
- Fix `BankSlot` type compatibility

## Secondary Fixes (Non-blocking but Important)

### 5. Undefined Safety (31 errors)
- Add null checks before service method calls
- Use optional chaining for potentially undefined services
- Initialize services properly in dependency injection

### 6. Type Safety (24 errors)
- Add explicit types to function parameters
- Handle `unknown` types with proper type guards
- Remove implicit `any` types

### 7. Argument Mismatches (26 errors)
- Update method calls to match expected signatures
- Fix missing required properties in object arguments
- Align mock service methods with interfaces

## Quick Win Fixes (Easy to Implement)

### 8. Unused Parameters (125 errors)
- Prefix unused parameters with underscore (e.g., `_req`)
- Remove truly unused imports and variables
- Configure linter to handle unused parameter warnings

### 9. Module Resolution (8 errors)
- Fix relative import paths
- Ensure all referenced modules exist
- Update tsconfig paths if needed

### 10. Type/Value Issues (10 errors)
- Import enums as both type and value where needed
- Fix jest setup for test files
- Resolve namespace usage issues

## Recommended Implementation Order

1. **Fix type definitions first** - This will resolve the most errors
2. **Align service interfaces** - Ensures consistency across the codebase
3. **Handle imports/exports** - Makes types available where needed
4. **Add safety checks** - Prevents runtime errors
5. **Clean up unused code** - Improves maintainability

## Verification Steps

After each fix category:
1. Run `npm run build` to check remaining errors
2. Run tests to ensure functionality isn't broken
3. Check that mock services still work correctly
4. Verify API endpoints still respond properly