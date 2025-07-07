# TypeScript Error Catalog

## Summary Statistics
- **Total Errors**: 453
- **Files Affected**: 75+
- **Most Common Error Types**:
  - TS6133: Unused parameters/variables (125 errors, ~28%)
  - TS2339: Property does not exist (107 errors, ~24%)
  - TS7006: Parameter implicitly has 'any' type (17 errors)
  - TS2304: Cannot find name (17 errors)
  - TS2722: Cannot invoke possibly 'undefined' (16 errors)
  - TS18048: Value is possibly 'undefined' (15 errors)

## Error Categories

### 1. Unused Code (TS6133) - 125 errors
**Pattern**: Unused parameters, especially `req` in route handlers and unused imports

**Most Affected Files**:
- Controllers: `combat.controller.ts`, `death.controller.ts`, `loot.controller.ts`
- Routes: Various route files
- Services: Mock services and repositories

**Examples**:
```typescript
// src/controllers/combat.controller.simple.ts(6,40)
'req' is declared but its value is never read.

// src/controllers/death.controller.ts(199,11)
'mockDeathRequest' is declared but its value is never read.

// src/database/schema/index.ts(318,65)
'many' is declared but its value is never read.
```

### 2. Missing Properties (TS2339) - 107 errors
**Pattern**: Accessing properties that don't exist on types, indicating interface mismatches

**Most Affected Areas**:
- Combat system: Missing properties on `CombatSession`, `CombatResult`, `Combatant`
- Monster system: Missing properties on `Monster` type
- Service interfaces: Missing methods on various services
- Currency/Transaction types: Missing properties

**Critical Examples**:
```typescript
// Combat System
src/controllers/combat.controller.ts(105,46): Property 'status' does not exist on type 'CombatSession'
src/controllers/combat.controller.ts(105,100): Property 'roundNumber' does not exist on type 'CombatSession'
src/controllers/combat.controller.ts(105,169): Property 'charId' does not exist on type 'Combatant'

// Monster System
src/controllers/monster.controller.ts(21,23): Property 'currentHealth' does not exist on type 'Monster'
src/controllers/monster.controller.ts(21,48): Property 'baseHealth' does not exist on type 'Monster'

// Service Methods
src/providers/real/RealDialogueService.ts(28,52): Property 'startDialogue' does not exist on type 'DialogueService'
src/providers/real/RealSpawnService.ts(28,49): Property 'getSpawnPointsByZone' does not exist on type 'SpawnService'
```

### 3. Type Safety Issues (TS7006, TS18046) - 24 errors
**Pattern**: Implicit 'any' types and unknown type handling

**Examples**:
```typescript
// Implicit any
src/controllers/combat.controller.ts(872,39): Parameter 'monster' implicitly has an 'any' type
src/repositories/EquipmentRepository.ts(69,21): Parameter 'stat' implicitly has an 'any' type

// Unknown type handling
src/controllers/combat.controller.ts(233,15): 'result.error' is of type 'unknown'
```

### 4. Missing Imports/Names (TS2304) - 17 errors
**Pattern**: References to types or values that aren't imported or don't exist

**Critical Missing Types**:
```typescript
src/controllers/combat.controller.ts(811,25): Cannot find name 'CombatService'
src/controllers/combat.controller.ts(869,22): Cannot find name 'testMonsterService'
src/providers/mock/MockCombatService.ts(453,51): Cannot find name 'CombatStartRequest'
src/providers/mock/MockCombatService.ts(672,52): Cannot find name 'CharacterCombatStats'
```

### 5. Possibly Undefined Values (TS2722, TS18048) - 31 errors
**Pattern**: Calling methods on potentially undefined objects

**Most Affected**:
- Combat controller service calls
- Bank service methods
- Route handlers

**Examples**:
```typescript
src/controllers/combat.controller.ts(90,27): 'combatService.getActiveCombat' is possibly 'undefined'
src/routes/bank.routes.ts(36,26): 'bankService.getBankContents' is possibly 'undefined'
```

### 6. Argument Mismatches (TS2554, TS2345) - 26 errors
**Pattern**: Wrong number of arguments or incompatible argument types

**Examples**:
```typescript
// Wrong argument count
src/controllers/combat.controller.ts(218,80): Expected 2 arguments, but got 3
src/providers/real/RealCombatService.ts(90,45): Expected 3 arguments, but got 1

// Type mismatches
src/controllers/combat.controller.ts(666,61): Argument of type '{ reason: "flee"; survivors: string[]; }' is not assignable to parameter of type 'CombatOutcome'
```

### 7. Module/Import Issues (TS2307, TS2459, TS6059) - 8 errors
**Pattern**: Module resolution and export problems

**Examples**:
```typescript
src/controllers/movement.controller.ts(7,37): Module '"@aeturnis/shared/types/movement.types"' declares 'Direction' locally, but it is not exported
src/providers/real/RealSpawnService.ts(10,38): Cannot find module '../../repositories/spawnPoint.repository'
```

### 8. Type/Value Confusion (TS2693, TS2708) - 10 errors
**Pattern**: Using types as values (common with enums and namespaces)

**Examples**:
```typescript
src/providers/mock/MockLootService.ts(379,76): 'ItemRarity' only refers to a type, but is being used as a value here
src/providers/__tests__/setup.ts(8,1): Cannot use namespace 'jest' as a value
```

## Most Problematic Files

### Controllers (293 errors)
1. **combat.controller.ts** - 65 errors
   - Missing properties on combat types
   - Undefined service methods
   - Unused parameters
   
2. **death.controller.ts** - 6 errors
   - Unused parameters
   
3. **monster.controller.ts** - 7 errors
   - Missing Monster type properties

### Providers/Services (140 errors)
1. **MockCombatService.ts** - 16 errors
   - Missing type imports
   - Type name mismatches
   
2. **RealBankService.ts** - 17 errors
   - Type incompatibilities between interfaces
   
3. **RealCombatService.ts** - 20 errors
   - Missing service dependencies
   - Argument count mismatches

### Repositories (30 errors)
1. **EquipmentRepository.ts** - 28 errors
   - Missing Pool methods
   - Implicit any parameters
   
2. **CharacterRepository.ts** - 1 error
   - Object literal property mismatch

### Routes (35 errors)
1. **bank.routes.ts** - 9 errors
   - Possibly undefined service calls
   
2. **character.stats.routes.ts** - 17 errors
   - Missing properties on DerivedStats
   - Missing service methods

## Systemic Issues

1. **Interface Drift**: Many service implementations don't match their interfaces
2. **Type Definition Gaps**: Core types like `CombatSession`, `Monster`, `DerivedStats` are missing expected properties
3. **Service Initialization**: Services are possibly undefined, suggesting dependency injection issues
4. **Mock/Real Divergence**: Mock services use different type names than real implementations
5. **Cross-Package Dependencies**: Issues with shared types between packages

## Fix Priority Recommendations

### High Priority
1. Fix combat system type definitions (affects 80+ errors)
2. Resolve service interface mismatches (affects 50+ errors)
3. Fix missing imports and type references (affects 30+ errors)

### Medium Priority
1. Handle possibly undefined service calls
2. Fix argument count mismatches
3. Resolve type/value confusion issues

### Low Priority
1. Clean up unused parameters (can be done with linter)
2. Fix implicit any types
3. Resolve module import paths