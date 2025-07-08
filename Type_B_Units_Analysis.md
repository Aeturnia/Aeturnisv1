# Type B Units (Interface-Implementation Pairs) Analysis

## Summary
This analysis identifies all Type B units in the codebase where there are mismatches between service interfaces and their implementations (Mock and Real).

## Identified Type B Units with Mismatches

### 1. ICurrencyService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/ICurrencyService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockCurrencyService.ts` ✅ (Fully Implemented)
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealCurrencyService.ts`

**Mismatches Found**:
- Test file calls `addCurrency()` method which doesn't exist in the interface
- Interface defines: `modifyBalance()`, `transferGold()`, `getBalance()`, etc.
- **Error Count**: 1 error in performance benchmark test

### 2. INPCService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/INPCService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockNPCService.ts` ✅ (Has extra method)
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealNPCService.ts`

**Mismatches Found**:
- Controller calls `getAvailableInteractions()` which doesn't exist in interface
- Mock implementation has extra method `interactWithNPC()` not in interface
- **Error Count**: 1 error in npc.controller.ts

### 3. ICombatService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/ICombatService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockCombatService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealCombatService.ts`

**Mismatches Found**:
- `DamageType` is imported but not exported in MockCombatService
- Controller expects properties that don't exist on CombatSession type:
  - `status` (missing)
  - `roundNumber` (missing)
  - `currentTurnIndex` (should be `currentTurn`)
- Controller expects properties on Combatant type:
  - `charId` (missing)
  - `charName` (missing)
- Many optional legacy methods are being called as if they're required
- **Error Count**: ~50+ errors related to combat

### 4. IMonsterService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/IMonsterService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockMonsterService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealMonsterService.ts`

**Mismatches Found**:
- Controller expects properties on Monster type that don't exist:
  - `currentHealth` (missing)
  - `baseHealth` (missing)
  - `displayName` (missing)
  - `name` (missing)
- **Error Count**: 5 errors in monster.controller.ts

### 5. IBankService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/IBankService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockBankService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealBankService.ts`

**Mismatches Found**:
- Interface has mixed method signatures (some required, some optional with '?')
- Two different approaches defined in same interface
- Potential confusion between old and new API methods

### 6. IDeathService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/IDeathService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockDeathService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealDeathService.ts`

**Status**: No direct errors found, but unused imports suggest potential issues

### 7. ILootService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/ILootService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockLootService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealLootService.ts`

**Status**: No direct method mismatches found

### 8. ISpawnService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/ISpawnService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockSpawnService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealSpawnService.ts`

**Status**: No direct errors found

### 9. IDialogueService
**Interface**: `/home/runner/workspace/packages/server/src/providers/interfaces/IDialogueService.ts`
- **Mock Implementation**: `/home/runner/workspace/packages/server/src/providers/mock/MockDialogueService.ts`
- **Real Implementation**: `/home/runner/workspace/packages/server/src/providers/real/RealDialogueService.ts`

**Status**: No direct errors found

## Priority Order for Fixing

1. **ICombatService** - Highest priority (50+ errors)
   - Fix type mismatches in CombatSession and Combatant
   - Update controller to use correct property names
   - Handle optional legacy methods properly

2. **IMonsterService** - High priority (5 errors)
   - Add missing properties to Monster type or update controller

3. **INPCService** - Medium priority (1 error)
   - Add `getAvailableInteractions()` to interface or update controller

4. **ICurrencyService** - Low priority (1 error)
   - Either add `addCurrency()` method or update test to use `modifyBalance()`

5. **IBankService** - Low priority (cleanup needed)
   - Clarify which methods are the primary API
   - Consider splitting into legacy and modern interfaces

## Additional Issues Found

1. **Missing Type Exports**:
   - `Direction` type not exported from movement.types
   - `DamageType` import issues in MockCombatService

2. **Controller Issues**:
   - Many controllers reference services directly instead of through dependency injection
   - Unused parameters in controller methods

3. **Type Safety**:
   - Mix of bigint and number types for currency/gold
   - Optional vs required method confusion in interfaces

## Recommendations

1. Create a strict type checking configuration for service implementations
2. Add unit tests that verify interface compliance
3. Use a code generation tool to ensure Mock and Real implementations match interfaces
4. Consider using abstract base classes instead of interfaces for better type safety
5. Add JSDoc comments to clarify which methods are legacy vs current API