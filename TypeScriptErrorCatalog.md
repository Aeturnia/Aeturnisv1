# TypeScript Error Catalog - Aeturnis Monorepo

**Generated:** July 07, 2025  
**Total Errors:** 441 errors  
**Baseline Comparison:** Increased from 195+ to 441 errors (+126% increase)

---

## Summary Statistics

| Error Code | Count | Description | Severity |
|------------|-------|-------------|----------|
| TS6133 | 125 | Unused parameters/variables | Low |
| TS2339 | 107 | Property does not exist | High |
| TS7006 | 17 | Parameter implicitly has 'any' type | Medium |
| TS2304 | 17 | Cannot find name | High |
| TS2722 | 16 | Cannot invoke possibly 'undefined' | High |
| TS18048 | 15 | Value is possibly 'undefined' | High |
| TS2345 | 14 | Argument type not assignable | High |
| TS2554 | 12 | Wrong number of arguments | High |
| TS2322 | 7 | Type not assignable | High |
| TS18046 | 7 | Value is of type 'unknown' | Medium |
| TS6196 | 6 | File not included in project | Medium |
| TS2708 | 6 | Cannot use namespace as value | Medium |
| TS2552 | 6 | Cannot find name (did you mean) | Medium |
| Others | 86 | Various | Mixed |

---

## Error Categories

### 1. TS6133 - Unused Parameters/Variables (125 errors) 🟡

**Most Affected Files:**
- `controllers/combat.controller.ts` (6 instances)
- `providers/real/RealBankService.ts` (7 instances)
- All controller files with route handlers

**Common Patterns:**
```typescript
// Unused 'req' parameter in route handlers
async (req: Request, res: Response) => { // 'req' is declared but never read
  // ... only uses res
}

// Unused variables from destructuring
const { characterId, locationData, killer, deathTime } = deathData; // multiple unused
```

**Examples:**
- `combat.controller.simple.ts(6,40)`: 'req' is declared but never read
- `combat.controller.ts(484,24)`: 'battleType' is declared but never read
- `death.controller.ts(199,11)`: 'mockDeathRequest' is declared but never read

---

### 2. TS2339 - Property Does Not Exist (107 errors) 🔴

**Most Affected Types:**
- `CombatSession` - Missing: status, roundNumber, currentTurnIndex
- `Combatant` - Missing: charId, charName
- `Monster` - Missing: currentHealth, baseHealth, displayName
- `CombatResult` - Missing: code property

**Critical Examples:**
```typescript
// CombatSession missing properties
session.status // Property 'status' does not exist on type 'CombatSession'
session.roundNumber // Property 'roundNumber' does not exist on type 'CombatSession'
session.currentTurnIndex // Should be 'currentTurn'

// Monster missing properties
monster.currentHealth // Property 'currentHealth' does not exist on type 'Monster'
monster.baseHealth // Property 'baseHealth' does not exist on type 'Monster'
```

**Service Method Mismatches:**
- `MockNPCService` missing `getAvailableInteractions`
- `DialogueService` missing multiple methods
- `LootService` missing `getAllLootTables`
- `SpawnService` missing several repository methods

---

### 3. TS2304 - Cannot Find Name (17 errors) 🔴

**Missing Types/Classes:**
- `CombatService` - Not imported in combat.controller.ts
- `testMonsterService` - Not declared
- `CombatStartRequest` - Type not found
- `CombatSessionNew` - Should be `CombatSession`
- `CharacterCombatStats` - Type not found
- `ResourcePool` - Type not found
- `DialogueRepository` - Not found

**Example:**
```typescript
// combat.controller.ts(811,25)
const combatService = new CombatService(); // Cannot find name 'CombatService'

// MockCombatService.ts(453,51)
async initiateCombat(request: CombatStartRequest): Promise<CombatSessionNew> {
  // Cannot find name 'CombatStartRequest' or 'CombatSessionNew'
}
```

---

### 4. TS2722/TS18048 - Possibly Undefined (31 errors) 🔴

**Pattern:** Service methods might be undefined
```typescript
// All combat service method calls
combatService.getActiveCombat // possibly 'undefined'
combatService.processCombatAction // possibly 'undefined'
combatService.initiateCombat // possibly 'undefined'
combatService.endCombat // possibly 'undefined'
```

**Root Cause:** Service initialization or interface issues

---

### 5. TS2554 - Wrong Number of Arguments (12 errors) 🔴

**Examples:**
```typescript
// Expected 2 arguments, but got 3
combatService.processCombatAction(sessionId, action, charId); // Extra argument

// Expected 1 argument, but got 0
new BankService(); // Missing required dependency

// Expected 3 arguments, but got 1
this.combatService.processCombatAction(action); // Missing sessionId and actorId
```

---

### 6. TS2345 - Type Assignment Errors (14 errors) 🔴

**Bank System Issues:**
```typescript
// BankSlot type mismatch
Type 'BankSlot' is missing properties: slotIndex, isEmpty

// BankTransferRequest mismatch
Type missing properties: fromType, toType
```

**Combat System Issues:**
```typescript
// Missing 'casualties' property
{ reason: "flee", survivors: string[] } // Missing required 'casualties'
```

---

### 7. TS7006 - Implicit 'any' Type (17 errors) 🟡

**Examples:**
```typescript
// Route handlers
.filter((monster: any) => { // Parameter implicitly has 'any' type

// Callback parameters
.map(sp => { // 'sp' implicitly has 'any' type
```

---

### 8. TS18046 - Type 'unknown' (7 errors) 🟡

**Pattern:** Error handling with unknown types
```typescript
if (result.error) {
  return res.status(400).json({ error: result.error }); 
  // 'result.error' is of type 'unknown'
}
```

---

## Most Problematic Files

### By Error Count:
1. **`combat.controller.ts`** - 68 errors
   - Property access errors (23)
   - Possibly undefined invocations (20)
   - Unknown type errors (7)
   - Unused variables (6)

2. **`providers/mock/MockCombatService.ts`** - 15 errors
   - Cannot find name errors (10)
   - Type mismatches (5)

3. **`providers/real/RealBankService.ts`** - 13 errors
   - Type incompatibilities (6)
   - Unused parameters (7)

4. **`providers/real/RealDialogueService.ts`** - 12 errors
   - Missing methods (8)
   - Property access errors (4)

5. **`providers/real/RealCombatService.ts`** - 11 errors
   - Property access on union types (6)
   - Unused imports (4)

---

## Systemic Issues Identified

### 1. **Interface Drift**
Mock and real service implementations have diverged from their interfaces, causing method signature mismatches and missing properties.

### 2. **Type Definition Gaps**
Core game types (Monster, CombatSession, etc.) are missing properties that the code expects, suggesting incomplete type definitions.

### 3. **Cross-Package Dependencies**
Files trying to import from incorrect paths or missing exports from shared packages.

### 4. **Service Initialization**
Services accessed through providers might be undefined, suggesting initialization or dependency injection issues.

### 5. **Test Configuration**
Jest namespace issues indicate missing or incorrect test setup configuration.

---

## Priority Recommendations

### 🔴 Critical (Blocking Compilation)
1. Fix missing type imports and definitions (TS2304)
2. Add missing properties to core types (TS2339)
3. Resolve service method signature mismatches (TS2554)
4. Fix type assignment errors (TS2345)

### 🟡 Important (Type Safety)
1. Handle possibly undefined service methods (TS2722/TS18048)
2. Add explicit types to implicit 'any' parameters (TS7006)
3. Properly type error handling (TS18046)

### 🟢 Clean-up (Code Quality)
1. Remove or use unused parameters (TS6133)
2. Fix property name typos (TS2551)
3. Update deprecated type names (TS2552)

---

## Fix Strategy

### Phase 1: Type Definitions (Resolves ~200 errors)
1. Update `CombatSession` interface with missing properties
2. Update `Monster` interface with health/display properties
3. Create missing type definitions (CombatStartRequest, etc.)
4. Export missing types from shared packages

### Phase 2: Service Alignment (Resolves ~100 errors)
1. Align mock service implementations with interfaces
2. Fix service method signatures
3. Update bank types to match across services
4. Add missing service methods

### Phase 3: Safety & Clean-up (Resolves ~141 errors)
1. Add null checks for service access
2. Remove unused parameters
3. Add explicit types where needed
4. Fix import paths

---

## Verification Command
```bash
cd /home/runner/workspace/packages/server && npx tsc --noEmit
```

Current Status: **441 total TypeScript errors** preventing successful compilation.