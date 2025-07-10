# Service Implementation Regression Report

## Summary

A comprehensive analysis of service-related errors reveals several critical issues that need immediate attention:

## 1. **Critical: performAction vs processAction Method Mismatch**

### Issue
The TEST combat controller functions (`performTestAction` and `fleeTestCombat`) are calling `performAction(sessionId, actorId, action)` with 3 parameters, but the ICombatService interface only defines `processAction(action)` with 1 parameter.

### Affected Files
- `/packages/server/src/controllers/combat.controller.ts` - Lines 220 (performTestAction), 329 (fleeTestCombat)
- `/packages/server/src/providers/interfaces/ICombatService.ts` - Line 192 (processAction definition)
- `/packages/server/src/__tests__/unit/controllers/combat.controller.test.ts` - Lines 38, 290, 294

### Important Note
The authenticated `performAction` function (line 561) correctly calls `processAction(action)`, so this issue only affects the test endpoints.

### Impact
- Combat controller unit tests are failing
- Test endpoints for combat actions are broken
- Type mismatch between test controller expectations and service interface

### Root Cause
The interface was updated to use a simplified `processAction(action)` method, but the TEST controller functions still expect the old signature with sessionId and actorId as separate parameters.

## 2. **Cache Service Method Compatibility**

### Issue
Cache service methods are correctly implemented but some services may be using incorrect method names.

### Current Implementation
- ✅ `set(key, value, ttl?)` - Correctly implemented
- ✅ `delete(key)` - Correctly implemented (not `del`)
- ✅ `ttl(key)` - Correctly implemented
- ✅ `getTTL(key)` - Added as alias for backward compatibility

### Status
No issues found - the CacheService correctly implements all required methods.

## 3. **Service Registration Issues**

### Issue
Test attempting to register "NullService" but it's already registered, causing confusion in error messages.

### Affected Test
- `Service Provider Error Scenarios > Service Registration Errors > should handle null service registration`

### Error Message
```
Service NullService not registered. Available services: MonsterService, NPCService, DeathService, LootService, CombatService, BankService, CurrencyService, DialogueService, SpawnService, ZoneService, MovementService, ProgressionService, TutorialService, AffinityService, NullService
```

### Root Cause
The error message incorrectly states the service is not registered while also listing it in available services.

## 4. **MockMonsterService Implementation Issues**

### Missing Methods
- `getSpawnPoints()` - Method not implemented but tests expect it

### Incorrect Behavior
- `killMonster()` throws error for non-existent monsters instead of gracefully handling
- `getMonsterTypes()` returns objects without `baseStats` property

### Affected Tests
- MockMonsterService > getSpawnPoints tests (2 failures)
- MockMonsterService > killMonster > should not throw error for non-existent monster
- MockMonsterService > getMonsterTypes > should return list of monster types

## 5. **BigInt Handling**

### Status
✅ No BigInt-related errors found in BankService or CharacterService. The implementations appear to handle BigInt values correctly.

## 6. **Service Method Implementation Discrepancies**

### Mock vs Real Service Differences
- RealCombatService's `processAction` returns a stub error instead of proper implementation
- Mock services implement legacy methods that real services don't

## Recommendations

### Immediate Actions Required

1. **Fix Combat Controller Method Calls**
   - Update controller to use `processAction(action)` instead of `performAction(sessionId, actorId, action)`
   - OR update the interface to match the controller's expectations
   - Update all related tests

2. **Fix MockMonsterService**
   - Implement `getSpawnPoints()` method
   - Update `killMonster()` to handle non-existent monsters gracefully
   - Add `baseStats` property to monster type objects

3. **Fix Service Registration Test**
   - Update the test to handle already-registered services correctly
   - Fix the error message logic in ServiceProvider

4. **Standardize Service Interfaces**
   - Ensure mock and real services implement the same interface
   - Remove or properly implement legacy methods

### Code Changes Needed

1. **Option A: Update Controller (Recommended)**
   ```typescript
   // Before
   const result = await combatService.performAction(sessionId, actorId, combatAction);
   
   // After
   combatAction.sessionId = sessionId;
   combatAction.actorId = actorId;
   const result = await combatService.processAction(combatAction);
   ```

2. **Option B: Update Interface**
   ```typescript
   // Add to ICombatService
   performAction(sessionId: string, actorId: string, action: CombatAction): Promise<CombatResult>;
   ```

3. **Fix MockMonsterService**
   ```typescript
   // Add missing method
   async getSpawnPoints(zoneId: string): Promise<SpawnPoint[]> {
     // Implementation
   }
   
   // Fix killMonster
   async killMonster(monsterId: string): Promise<void> {
     if (!this.activeMonsters.has(monsterId)) {
       // Don't throw, just return
       return;
     }
     // ... rest of implementation
   }
   ```

4. **Add Missing TutorialUrgency Enum**
   ```typescript
   // Add to /packages/shared/src/types/tutorial.types.ts
   export enum TutorialUrgency {
     LOW = 'low',
     MEDIUM = 'medium',
     HIGH = 'high',
     CRITICAL = 'critical'
   }
   ```

5. **Fix TutorialReward Interface OR Update Tests**
   ```typescript
   // Option A: Update interface to match test expectations
   export interface TutorialReward {
     type: TutorialRewardType;
     quantity: number;  // Rename from 'amount'
     description: string;  // Add this field
     itemId?: string;
     skillId?: string;
   }
   
   // Option B: Update tests to match current interface
   expect(reward.amount).toBeGreaterThan(0);  // Use 'amount' instead of 'quantity'
   // Remove the description check or make it optional
   ```

## 7. **Missing Type Exports and Property Mismatches**

### Issue 1: Missing TutorialUrgency Enum
`TutorialUrgency` enum is imported in tests but not defined in the shared types.

### Issue 2: TutorialReward Property Mismatch
Test expects `quantity` and `description` properties, but interface defines `amount` and no description.

### Affected Files
- `/packages/server/src/__tests__/unit/services/TutorialService.test.ts` - Lines 11, 209, 235, 351-352
- `/packages/shared/src/types/tutorial.types.ts` - Missing enum definition, incorrect interface

### Impact
- 9 TutorialService tests failing with "Cannot read properties of undefined (reading 'MEDIUM')"
- 1 test failing with "actual value must be number or bigint, received 'undefined'" (accessing reward.quantity)
- Tests cannot access TutorialUrgency.MEDIUM or reward.quantity

### Root Cause
1. The test file imports `TutorialUrgency` from '@aeturnis/shared' but this enum is not defined in the tutorial types
2. Test expects `reward.quantity` but interface has `reward.amount`
3. Test expects `reward.description` but interface doesn't have this property

## 8. **AffinityService Test Issues**

### Issue
Two AffinityService tests are failing, likely related to type mismatches or missing implementations.

### Affected Tests
- MockAffinityService > trackWeaponUse > should track weapon usage for new weapon type
- MockAffinityService > trackMagicUse > should track magic usage for new school

### Impact
- 2 tests failing in AffinityService test suite

## Conclusion

The main issues are:
1. Method signature mismatch between controller and service interface (performAction vs processAction)
2. Missing methods in MockMonsterService
3. Inconsistent error handling in mock services
4. Service registration test logic issues
5. Missing type definitions (TutorialUrgency enum)
6. AffinityService implementation issues

These are all fixable issues that primarily affect the testing infrastructure rather than core functionality. The most critical issue is the performAction/processAction mismatch in the test endpoints.