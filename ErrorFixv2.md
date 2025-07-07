# ErrorFixv2.md - Systematic Error Resolution Strategy Using Subagents

**Version:** 2.0  
**Status:** Strategy Document  
**Generated:** 2025-07-07  
**Based on:** ErrorCatalog.md v1.2.0  

---

## Executive Summary

This document provides a comprehensive strategy for systematically resolving the 453 TypeScript errors and 179 ESLint issues identified in ErrorCatalog.md v1.2.0. The strategy employs specialized subagents working on micro-units, following API-first/contract-driven development principles per the Aeturnis Coding SOP.

---

## 1. Subagent Roles and Responsibilities

### 1.1 Type Definition Agent (Priority: HIGH)
**Responsibility:** Fix missing type properties, interface mismatches, and type definitions  
**Scope:** All `.types.ts` files and interface definitions  
**Skills:** TypeScript type system expertise, interface design  

### 1.2 Service Implementation Agent (Priority: HIGH)
**Responsibility:** Align service implementations with their interfaces  
**Scope:** All service files in `src/services/`  
**Skills:** Service pattern implementation, dependency injection  

### 1.3 Controller Cleanup Agent (Priority: MEDIUM)
**Responsibility:** Fix controller errors, remove unused parameters, clean up any usage  
**Scope:** All controller files in `src/controllers/`  
**Skills:** Express.js patterns, request/response handling  

### 1.4 Repository Agent (Priority: MEDIUM)
**Responsibility:** Fix database access patterns, BigInt conversions  
**Scope:** All repository files in `src/repositories/`  
**Skills:** Drizzle ORM, database operations  

### 1.5 Route Handler Agent (Priority: LOW)
**Responsibility:** Fix route handler return statements and type safety  
**Scope:** All route files in `src/routes/`  
**Skills:** Express routing, middleware patterns  

### 1.6 Test Infrastructure Agent (Priority: LOW)
**Responsibility:** Fix test setup and configuration issues  
**Scope:** All test files and test infrastructure  
**Skills:** Jest, testing patterns  

---

## 2. Micro-Unit Classification

### Unit Type A: Type Definition Units
- **Characteristics:** No dependencies, foundational fixes
- **Examples:** Missing properties in interfaces, type exports
- **Verification:** TypeScript compilation of dependent files

### Unit Type B: Interface-Implementation Pairs
- **Characteristics:** Service interface and implementation must match
- **Examples:** MonsterService missing return properties
- **Verification:** Interface compliance tests

### Unit Type C: Controller-Service Integration
- **Characteristics:** Controller uses service correctly with proper types
- **Examples:** Combat controller using combat service
- **Verification:** Integration tests

### Unit Type D: Database Operations
- **Characteristics:** Repository patterns, BigInt handling
- **Examples:** Character repository BigInt conversions
- **Verification:** Database operation tests

### Unit Type E: Route Handlers
- **Characteristics:** Proper request/response handling
- **Examples:** Missing return statements in routes
- **Verification:** Route tests with supertest

---

## 3. Verification Protocol

### 3.1 Pre-Fix Verification
```bash
# 1. Capture current error state
npm run typecheck 2>&1 > pre-fix-errors.txt

# 2. Run existing tests
npm test --coverage 2>&1 > pre-fix-tests.txt

# 3. Check dependencies
npm ls 2>&1 > pre-fix-deps.txt
```

### 3.2 Post-Fix Verification
```bash
# 1. Compare error count
npm run typecheck 2>&1 > post-fix-errors.txt
diff pre-fix-errors.txt post-fix-errors.txt

# 2. Ensure tests still pass
npm test --coverage 2>&1 > post-fix-tests.txt
diff pre-fix-tests.txt post-fix-tests.txt

# 3. Run integration tests for affected area
npm run test:integration -- --testPathPattern=<affected-area>
```

---

## 4. Subagent Prompt Templates

### 4.1 Type Definition Agent Template
```markdown
## Task: Fix Type Definition Errors in [FILE_NAME]

### Context
- File: [FILE_PATH]
- Error Count: [NUMBER]
- Dependencies: [LIST_DEPENDENCIES]

### Requirements
1. Add all missing properties to interfaces
2. Ensure all types are exported correctly
3. Follow existing naming conventions
4. No use of 'any' type

### Current Errors
[PASTE_SPECIFIC_ERRORS]

### Implementation Steps
1. Read the file and understand current types
2. Analyze error messages for missing properties
3. Check dependent files for usage patterns
4. Add missing properties with proper types
5. Export any types that need to be shared

### Verification
- Run: npm run typecheck -- [FILE_PATH]
- Ensure no new errors introduced
- Check dependent files compile
```

### 4.2 Service Implementation Agent Template
```markdown
## Task: Fix Service Implementation in [SERVICE_NAME]

### Context
- Service: [SERVICE_PATH]
- Interface: [INTERFACE_PATH]
- Error Count: [NUMBER]

### Requirements
1. Service must implement all interface methods
2. Return types must match interface exactly
3. Follow repository pattern for data access
4. No business logic in repositories

### Current Mismatches
[LIST_INTERFACE_VS_IMPLEMENTATION_DIFFERENCES]

### Implementation Steps
1. Compare interface definition with implementation
2. Add missing methods
3. Fix return type mismatches
4. Ensure proper error handling
5. Add unit tests for new/modified methods

### Verification
- Run: npm test -- [SERVICE_TEST_PATH]
- Run: npm run typecheck -- [SERVICE_PATH]
- Verify interface compliance
```

### 4.3 Controller Cleanup Agent Template
```markdown
## Task: Clean Up Controller in [CONTROLLER_NAME]

### Context
- Controller: [CONTROLLER_PATH]
- Services Used: [LIST_SERVICES]
- Error Count: [NUMBER]

### Requirements
1. Remove all 'any' types
2. Fix unused parameters (prefix with _)
3. Ensure proper error handling
4. No business logic in controller
5. Use proper request/response types

### Current Issues
[LIST_SPECIFIC_ISSUES]

### Implementation Steps
1. Review controller methods
2. Add proper types to all parameters
3. Prefix unused params with underscore
4. Move business logic to services
5. Add proper error responses

### Verification
- Run: npm run lint -- [CONTROLLER_PATH]
- Run: npm run typecheck -- [CONTROLLER_PATH]
- Test endpoints manually
```

---

## 5. API Contract Specifications

### 5.1 Combat System Types
```typescript
// Required additions to combat.types.ts
export interface CombatSession {
  id: string;
  status: 'active' | 'completed' | 'abandoned';
  roundNumber: number;
  currentTurn: number;
  combatants: Combatant[];
  startTime: Date;
  endTime?: Date;
}

export interface Combatant {
  charId: string;
  charName: string;
  type: 'player' | 'monster' | 'npc';
  stats: CombatStats;
  currentHealth: number;
  maxHealth: number;
  isAlive: boolean;
}

export interface CombatResult {
  success: boolean;
  action?: CombatAction;
  damage?: number;
  effects?: CombatEffect[];
  error?: {
    code: string;
    message: string;
  };
}
```

### 5.2 Monster Types
```typescript
// Required additions to monster.types.ts
export interface Monster {
  id: string;
  name: string;
  displayName?: string;
  level: number;
  hp: number;
  currentHealth?: number;
  baseHealth: number;
  baseStats: MonsterStats;
  abilities: string[];
  lootTableId?: string;
}
```

### 5.3 Bank Types
```typescript
// Required for bank operations
export interface BankSlot {
  slotNumber: number;
  itemId: string | null;
  quantity: number;
  metadata?: Record<string, unknown>;
}
```

### 5.4 Service Method Contracts
```typescript
// Cache service methods
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Monster service methods
export interface IMonsterService {
  getMonsterById(id: string): Promise<Monster | null>;
  spawnMonster(config: SpawnConfig): Promise<SpawnedMonster>;
  updateMonsterState(id: string, state: Partial<MonsterState>): Promise<void>;
}
```

---

## 6. Self-Audit Requirements

### 6.1 Per Micro-Unit Audit
```markdown
### 🔐 Self-Audit Checklist
- [ ] TypeScript strict mode passes
- [ ] No 'any' types introduced
- [ ] All tests pass
- [ ] Coverage ≥80% maintained
- [ ] ESLint passes with 0 errors
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] API contracts followed
- [ ] No business logic in controllers
- [ ] Repository pattern maintained

### Audit Commands
```bash
npm run typecheck -- --strict
npm run lint -- --max-warnings=0
npm test -- --coverage --testPathPattern=[affected]
```

### Results
- TypeScript Errors: [BEFORE] → [AFTER]
- ESLint Warnings: [BEFORE] → [AFTER]
- Test Coverage: [PERCENTAGE]%
- Tests Passing: [X/Y]
```

### 6.2 Audit Report Template
```markdown
## Micro-Unit Audit Report

**Unit ID:** [UNIT_ID]  
**Agent:** [AGENT_NAME]  
**Date:** [DATE]  
**Files Modified:** [COUNT]  

### Summary
- Errors Fixed: [COUNT]
- New Errors: [COUNT]
- Tests Added: [COUNT]
- Coverage Delta: [+/-X%]

### Quality Checks
- [ ] No TypeScript errors in modified files
- [ ] No new ESLint violations
- [ ] All existing tests still pass
- [ ] New tests for modified code
- [ ] Documentation updated
- [ ] Self-audit footer included

### Sign-off
Agent: [SIGNATURE]
Reviewer: [SIGNATURE]
```

---

## 7. Rollback Procedures

### 7.1 Automated Rollback
```bash
#!/bin/bash
# rollback-unit.sh

UNIT_ID=$1
BACKUP_DIR="./backups/$UNIT_ID"

if [ -d "$BACKUP_DIR" ]; then
  echo "Rolling back Unit $UNIT_ID..."
  cp -r "$BACKUP_DIR"/* ./
  git checkout -- .
  echo "Rollback complete"
else
  echo "No backup found for Unit $UNIT_ID"
  exit 1
fi
```

### 7.2 Manual Rollback Steps
1. Identify the commit before unit implementation
2. Create a rollback branch: `git checkout -b rollback/unit-[ID]`
3. Revert changes: `git revert [COMMIT_HASH]`
4. Run full test suite
5. Create rollback report

### 7.3 Rollback Report Template
```markdown
## Rollback Report

**Unit ID:** [UNIT_ID]  
**Reason:** [DESCRIPTION]  
**Rolled Back At:** [TIMESTAMP]  

### Issues Encountered
- [Issue 1]
- [Issue 2]

### Next Steps
- [Action 1]
- [Action 2]
```

---

## 8. Progress Tracking

### 8.1 Master Progress Dashboard
```markdown
# Error Resolution Progress Dashboard

**Last Updated:** [DATE]  
**Total Errors:** 453 TypeScript + 179 ESLint = 632  
**Resolved:** [COUNT] ([PERCENTAGE]%)  

## By Priority
- 🔴 CRITICAL: [X/Y] units complete
- 🟡 HIGH: [X/Y] units complete
- 🔵 MEDIUM: [X/Y] units complete
- ⚪ LOW: [X/Y] units complete

## By Agent
- Type Definition Agent: [X/Y] units
- Service Implementation Agent: [X/Y] units
- Controller Cleanup Agent: [X/Y] units
- Repository Agent: [X/Y] units
- Route Handler Agent: [X/Y] units
- Test Infrastructure Agent: [X/Y] units

## Recent Activity
- [DATE]: Unit [ID] completed by [AGENT]
- [DATE]: Unit [ID] rolled back due to [REASON]
```

### 8.2 Unit Assignment Template
```markdown
## Unit Assignment

**Unit ID:** [TYPE]-[NUMBER]  
**Assigned To:** [AGENT_NAME]  
**Priority:** [CRITICAL|HIGH|MEDIUM|LOW]  
**Estimated Hours:** [NUMBER]  

### Scope
- Files: [LIST]
- Error Count: [NUMBER]
- Dependencies: [LIST]

### Deadline
- Start: [DATE]
- End: [DATE]

### Status Updates
- [DATE]: Started
- [DATE]: [UPDATE]
```

### 8.3 Daily Progress Report
```markdown
## Daily Progress Report - [DATE]

### Completed Today
- Unit [ID]: [DESCRIPTION] ([ERRORS_FIXED] errors)
- Unit [ID]: [DESCRIPTION] ([ERRORS_FIXED] errors)

### In Progress
- Unit [ID]: [DESCRIPTION] ([PERCENT]% complete)

### Blockers
- [BLOCKER_DESCRIPTION]

### Tomorrow's Plan
- Complete Unit [ID]
- Start Unit [ID]

### Metrics
- Errors Fixed Today: [COUNT]
- Total Errors Remaining: [COUNT]
- Velocity: [ERRORS_PER_DAY] errors/day
- ETA: [DATE]
```

---

## 9. Implementation Examples

### Example 1: Fixing CombatSession Type Definition

**Agent:** Type Definition Agent  
**Unit:** TYPE-A-001  
**File:** `src/types/combat.types.ts`  

```typescript
// BEFORE (missing properties)
export interface CombatSession {
  id: string;
  combatants: Combatant[];
}

// AFTER (complete definition)
export interface CombatSession {
  id: string;
  status: 'active' | 'completed' | 'abandoned';
  roundNumber: number;
  currentTurn: number; // Note: not currentTurnIndex
  combatants: Combatant[];
  startTime: Date;
  endTime?: Date;
  logs: CombatLog[];
}

export interface Combatant {
  charId: string; // Note: not characterId
  charName: string; // Note: not name
  type: 'player' | 'monster' | 'npc';
  // ... rest of properties
}
```

### Example 2: Fixing BankService Implementation

**Agent:** Service Implementation Agent  
**Unit:** SERVICE-B-003  
**File:** `src/services/BankService.ts`  

```typescript
// BEFORE (BigInt issues)
async function getBalance(charId: string): Promise<number> {
  const result = await this.repo.getBalance(charId);
  return result.balance; // Error: BigInt to number
}

// AFTER (safe conversion)
async function getBalance(charId: string): Promise<number> {
  const result = await this.repo.getBalance(charId);
  return safeBigIntToNumber(result.balance, 'Bank balance');
}

// Helper function added
function safeBigIntToNumber(value: bigint, context: string): number {
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${context} exceeds safe integer range`);
  }
  return Number(value);
}
```

---

## 10. Success Criteria

### 10.1 Unit Success
- All TypeScript errors in unit scope resolved
- No new errors introduced
- All tests pass
- Coverage maintained or improved
- Self-audit complete

### 10.2 Phase Success
- All units in phase complete
- Integration tests pass
- No regressions detected
- Performance benchmarks maintained

### 10.3 Project Success
- Zero TypeScript errors in strict mode
- Zero ESLint errors
- 100% of tests passing
- ≥80% code coverage
- All services follow consistent patterns
- Clear separation of concerns
- Production-ready code

---

## Appendix A: Error Priority Matrix

| Error Type | Priority | Impact | Effort |
|------------|----------|--------|--------|
| Missing exports/imports | CRITICAL | Build fails | Low |
| Service interface mismatch | CRITICAL | Runtime errors | Medium |
| BigInt conversions | HIGH | Data corruption | Medium |
| Cache method names | HIGH | Runtime errors | Low |
| Combat type errors | HIGH | Feature broken | High |
| Any type usage | MEDIUM | Type safety | Medium |
| Console statements | MEDIUM | Production logs | Low |
| Unused variables | LOW | Code quality | Low |

---

## Appendix B: Dependency Graph

```
Type Definitions (no deps)
    ↓
Service Interfaces (depends on types)
    ↓
Service Implementations (depends on interfaces)
    ↓
Controllers (depends on services)
    ↓
Routes (depends on controllers)
    ↓
Tests (depends on all above)
```

---

## Appendix C: Automation Scripts

### Unit Start Script
```bash
#!/bin/bash
# start-unit.sh

UNIT_ID=$1
AGENT=$2

echo "Starting Unit $UNIT_ID for $AGENT"
mkdir -p "./units/$UNIT_ID"
cd "./units/$UNIT_ID"

# Create tracking file
cat > unit.json << EOF
{
  "id": "$UNIT_ID",
  "agent": "$AGENT",
  "startTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "in-progress"
}
EOF

# Capture baseline
npm run typecheck 2>&1 > baseline-errors.txt
npm test 2>&1 > baseline-tests.txt

echo "Unit $UNIT_ID initialized"
```

### Unit Complete Script
```bash
#!/bin/bash
# complete-unit.sh

UNIT_ID=$1

cd "./units/$UNIT_ID"

# Run verification
npm run typecheck 2>&1 > final-errors.txt
npm test 2>&1 > final-tests.txt
npm run lint 2>&1 > final-lint.txt

# Update tracking
jq '.endTime = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'" | .status = "complete"' unit.json > tmp.json
mv tmp.json unit.json

# Generate report
echo "## Unit $UNIT_ID Completion Report" > report.md
echo "### Error Reduction" >> report.md
echo '```' >> report.md
diff baseline-errors.txt final-errors.txt | grep "^<" | wc -l >> report.md
echo '```' >> report.md

echo "Unit $UNIT_ID completed"
```

---

*This strategy document provides the framework for systematic error resolution. Each subagent should follow their specific templates and verify fixes according to the protocols defined here.*