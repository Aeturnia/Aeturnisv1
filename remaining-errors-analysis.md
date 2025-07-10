# Remaining Errors Analysis

## TypeScript Errors Summary (73 total)

### 1. Zone Controller Return Type Issues (13 errors)
**Pattern**: `Type 'Response<any, Record<string, any>>' is not assignable to type 'void'`
- **Files**: src/controllers/zone.controller.ts
- **Lines**: 114, 117, 134, 168, 191, 194, 236, 239, 255, 269, 285, 294
- **Fix**: Update method signatures to return Response type instead of void

### 2. Date/Number Type Mismatches (2 errors)
**Pattern**: `Type 'Date' is not assignable to type 'number'`
- **Files**: src/controllers/combat.controller.ts
- **Lines**: 224, 338
- **Fix**: Convert Date to timestamp using `.getTime()`

### 3. BigInt/Number Conversion Issues (5 errors)
**Pattern**: Various BigInt-related type errors
- **Files**: 
  - src/services/BankService.ts (line 233)
  - src/services/CharacterService.ts (lines 205, 229, 230, 231)
- **Fix**: Proper BigInt conversions and type casting

### 4. Database/Repository Issues (3 errors)
**Pattern**: Insert/update type mismatches
- **Files**:
  - src/__tests__/helpers/database-helpers.ts (line 106)
  - src/repositories/CharacterRepository.ts (lines 42, 342)
- **Fix**: Align database schema types with insert/update operations

### 5. Service Return Type Mismatches (15 errors)
**Pattern**: Service methods returning wrong types
- **Files**:
  - src/services/BankService.ts (lines 20, 42, 66, 337, 346)
  - src/services/CharacterService.ts (lines 98, 202)
  - src/services/EquipmentService.ts (lines 41, 203, 313, 378, 395)
  - src/services/MonsterService.ts (lines 71, 200, 245)

### 6. Unused Variables/Parameters (19 errors)
**Pattern**: `is declared but its value is never read`
- **Files**:
  - src/__tests__/helpers/mocks.ts
  - src/app.ts
  - src/providers/real/RealCombatService.ts
  - src/providers/real/RealSpawnService.ts
  - src/services/DialogueService.ts (multiple)
  - src/services/NPCService.ts
  - src/services/SpawnService.ts
  - src/sockets/combat.socket.ts

### 7. Missing/Wrong Properties (9 errors)
**Pattern**: Object literal property errors
- **Files**:
  - src/services/NPCService.ts (lines 114, 222, 253, 417)
  - src/services/ResourceService.ts (line 89)
  - src/services/mock/MockTutorialService.ts (multiple)

### 8. Type Import/Export Issues (1 error)
- src/services/mock/MockTutorialService.ts: Wrong import name

### 9. Undefined Types (2 errors)
- src/services/EquipmentService.ts: Unused type imports
- src/services/SpawnService.ts: Unused properties

## ESLint Errors Summary (66 total)

### 1. @typescript-eslint/no-explicit-any (40 errors)
**Files affected**:
- Controllers: combat, loot, npc, zone
- Middleware: combat, statSecurity
- Providers: ServiceProvider
- Repositories: Character, Equipment, death
- Routes: character.stats
- Services: Monster, NPC
- Types: api.types, response.utils

### 2. @typescript-eslint/no-unused-vars (15 errors)
**Files affected**:
- src/repositories/EquipmentRepository.ts
- src/services/DialogueService.ts (multiple)
- src/services/EquipmentService.ts
- src/services/NPCService.ts
- src/services/SpawnService.ts
- src/sockets/combat.socket.ts
- src/types/express.d.ts

### 3. @typescript-eslint/ban-types (6 errors)
**Pattern**: Using `Function` as a type
- src/sockets/combat.socket.ts (multiple occurrences)

### 4. @typescript-eslint/no-var-requires (1 error)
- src/routes/combat.routes.ts

### 5. TSConfig Issues (2 errors)
- packages/shared/src/types/monster.types.d.ts
- packages/shared/src/types/npc.types.d.ts

### 6. Console Statements (43 warnings)
**Files affected**:
- src/providers/index.ts (33 occurrences)
- Various service files
- Combat controller

## Proposed Fix Units

### TYPE-F: Zone Controller & Response Types
**Scope**: Fix all zone controller return type issues
**Files**: 
- src/controllers/zone.controller.ts
**Error Count**: 13 TypeScript errors
**Priority**: High (blocks compilation)

### TYPE-G: BigInt & Number Conversions
**Scope**: Fix all BigInt/number type mismatches
**Files**:
- src/services/BankService.ts
- src/services/CharacterService.ts
- src/controllers/combat.controller.ts
**Error Count**: 7 TypeScript errors
**Priority**: High (runtime errors)

### TYPE-H: Service Return Types & Property Mismatches
**Scope**: Fix service method return types and object properties
**Files**:
- src/services/BankService.ts
- src/services/EquipmentService.ts
- src/services/MonsterService.ts
- src/services/NPCService.ts
- src/services/ResourceService.ts
- src/services/mock/MockTutorialService.ts
**Error Count**: 24 TypeScript errors
**Priority**: High

### TYPE-I: Remove Explicit Any Types
**Scope**: Replace all `any` types with proper types
**Files**: 
- All controllers with any types
- All middleware with any types
- All repositories with any types
- Routes and type files
**Error Count**: 40 ESLint errors
**Priority**: Medium (doesn't block compilation)

### TYPE-J: Unused Variables & Parameters
**Scope**: Remove or use all unused variables
**Files**:
- All files with unused variable warnings
**Error Count**: 15 ESLint + 19 TypeScript errors
**Priority**: Low

### TYPE-K: Function Types & Requires
**Scope**: Fix Function type usage and require statements
**Files**:
- src/sockets/combat.socket.ts
- src/routes/combat.routes.ts
**Error Count**: 7 ESLint errors
**Priority**: Medium

### TYPE-L: Database & Repository Types
**Scope**: Fix database insert/update type issues
**Files**:
- src/__tests__/helpers/database-helpers.ts
- src/repositories/CharacterRepository.ts
**Error Count**: 3 TypeScript errors
**Priority**: High

### TYPE-M: TSConfig & Console Cleanup
**Scope**: Fix TSConfig issues and remove console statements
**Files**:
- packages/shared tsconfig
- All files with console warnings
**Error Count**: 2 ESLint errors + 43 warnings
**Priority**: Low