# ErrorFixv2: Systematic Error Resolution Strategy

## Executive Summary

This document provides a comprehensive strategy for systematically fixing the 453 TypeScript errors across 75+ files using independent subagents. Each subagent will work on micro-units with clear boundaries, verification protocols, and rollback procedures.

## Table of Contents

1. [Subagent Roles and Responsibilities](#subagent-roles-and-responsibilities)
2. [Micro-Unit Classification](#micro-unit-classification)
3. [Verification Protocols](#verification-protocols)
4. [Prompt Templates](#prompt-templates)
5. [API Contract Specifications](#api-contract-specifications)
6. [Self-Audit Requirements](#self-audit-requirements)
7. [Rollback Procedures](#rollback-procedures)
8. [Progress Tracking](#progress-tracking)

## Subagent Roles and Responsibilities

### 1. Type Definition Agent
**Responsibility**: Fix missing type properties and interface mismatches
**Scope**: Type definition files, interfaces, and type exports
**Priority**: HIGH - Other fixes depend on correct types

### 2. Service Implementation Agent
**Responsibility**: Align service implementations with interfaces
**Scope**: Service files in `/services` and `/providers`
**Priority**: HIGH - Core functionality

### 3. Controller Cleanup Agent
**Responsibility**: Fix controller errors, unused parameters, type safety
**Scope**: Controller files in `/controllers`
**Priority**: MEDIUM - Depends on types and services

### 4. Repository Agent
**Responsibility**: Fix database access patterns and type issues
**Scope**: Repository files in `/repositories`
**Priority**: MEDIUM - Database layer

### 5. Route Handler Agent
**Responsibility**: Fix route handler issues and middleware problems
**Scope**: Route files in `/routes`
**Priority**: LOW - Depends on all other fixes

### 6. Test Infrastructure Agent
**Responsibility**: Fix test setup and mock service issues
**Scope**: Test files and mock implementations
**Priority**: LOW - Non-blocking for production code

## Micro-Unit Classification

### Unit Type A: Type Definition Units
**Size**: 1-5 related type definitions
**Example**: CombatSession, Combatant, CombatResult types
**Dependencies**: None (foundational)
**Verification**: Type compilation only

### Unit Type B: Interface-Implementation Pairs
**Size**: 1 interface + 1 implementation
**Example**: ICombatService + MockCombatService
**Dependencies**: Type definitions
**Verification**: Interface compliance + unit tests

### Unit Type C: Controller-Service Integration
**Size**: 1 controller method + service calls
**Example**: Combat controller action handler
**Dependencies**: Types + Services
**Verification**: Integration test

### Unit Type D: Database Operations
**Size**: 1-3 related repository methods
**Example**: Equipment repository CRUD operations
**Dependencies**: Database schema + types
**Verification**: Database integration test

### Unit Type E: Route Handlers
**Size**: 1 route file (all endpoints)
**Example**: Bank routes
**Dependencies**: Controllers + middleware
**Verification**: API endpoint test

## Verification Protocols

### Pre-Fix Verification
```bash
# 1. Capture current error state
npm run type-check 2>&1 | grep -A 2 "path/to/file" > pre-fix-errors.log

# 2. Run existing tests
npm test -- path/to/file.test.ts > pre-fix-tests.log

# 3. Check dependencies
npm run check-deps path/to/file
```

### Post-Fix Verification
```bash
# 1. Verify error reduction
npm run type-check 2>&1 | grep -A 2 "path/to/file" > post-fix-errors.log
diff pre-fix-errors.log post-fix-errors.log

# 2. Run tests again
npm test -- path/to/file.test.ts > post-fix-tests.log
diff pre-fix-tests.log post-fix-tests.log

# 3. Run integration tests
npm run test:integration -- --grep "affected-feature"
```

## Prompt Templates

### Type Definition Agent Prompt
```
You are a Type Definition Agent working on the Aeturnis project. Your task is to fix type definition errors in micro-unit [UNIT_ID].

Context:
- Error count: [ERROR_COUNT]
- Files: [FILE_LIST]
- Specific errors: [ERROR_LIST]

Requirements:
1. Only modify type definitions, interfaces, and type exports
2. Ensure backward compatibility
3. Add JSDoc comments for new properties
4. Follow existing naming conventions
5. Export all types that are used externally

Type Definition Guidelines:
- Use strict typing (no 'any' unless absolutely necessary)
- Prefer interfaces over type aliases for objects
- Use enums for fixed sets of values
- Include all required properties based on usage

Verification Steps:
1. Run: npm run type-check [FILE_PATH]
2. Ensure no new errors introduced
3. Check all imports/exports work correctly

Please fix the following type errors:
[SPECIFIC_ERROR_DETAILS]
```

### Service Implementation Agent Prompt
```
You are a Service Implementation Agent working on the Aeturnis project. Your task is to align service implementations with their interfaces in micro-unit [UNIT_ID].

Context:
- Service: [SERVICE_NAME]
- Interface: [INTERFACE_PATH]
- Implementation: [IMPLEMENTATION_PATH]
- Error count: [ERROR_COUNT]

Requirements:
1. Implement all missing methods from interface
2. Fix method signatures to match interface exactly
3. Ensure proper error handling
4. Add logging for debugging
5. Maintain existing functionality

Implementation Guidelines:
- Follow dependency injection patterns
- Use proper TypeScript types (no implicit any)
- Handle edge cases and null checks
- Return appropriate error responses
- Add method documentation

Verification Steps:
1. Run: npm run type-check [FILE_PATH]
2. Run: npm test [SERVICE_NAME].test.ts
3. Verify interface compliance

Please fix the following service errors:
[SPECIFIC_ERROR_DETAILS]
```

### Controller Cleanup Agent Prompt
```
You are a Controller Cleanup Agent working on the Aeturnis project. Your task is to fix controller errors in micro-unit [UNIT_ID].

Context:
- Controller: [CONTROLLER_NAME]
- Routes: [ROUTE_PATHS]
- Dependencies: [SERVICE_LIST]
- Error count: [ERROR_COUNT]

Requirements:
1. Remove unused parameters (prefix with _ if needed by Express)
2. Fix service method calls
3. Add proper type annotations
4. Ensure error responses follow standard format
5. Validate request inputs

Controller Guidelines:
- Use asyncHandler wrapper for all routes
- Return consistent response formats
- Log important operations
- Handle service errors gracefully
- Validate and sanitize inputs

Verification Steps:
1. Run: npm run type-check [FILE_PATH]
2. Test endpoints: npm run test:api [CONTROLLER_NAME]
3. Check response formats

Please fix the following controller errors:
[SPECIFIC_ERROR_DETAILS]
```

### Repository Agent Prompt
```
You are a Repository Agent working on the Aeturnis project. Your task is to fix repository and database access errors in micro-unit [UNIT_ID].

Context:
- Repository: [REPOSITORY_NAME]
- Database: Drizzle ORM with PostgreSQL
- Schema: [SCHEMA_IMPORTS]
- Error count: [ERROR_COUNT]

Requirements:
1. Fix Pool/database client usage for Drizzle
2. Add proper type annotations for queries
3. Handle database errors appropriately
4. Use transactions where needed
5. Optimize queries for performance

Repository Guidelines:
- Use Drizzle query builder methods
- Return typed results
- Handle connection errors
- Use prepared statements
- Add query logging in development

Verification Steps:
1. Run: npm run type-check [FILE_PATH]
2. Run: npm run test:db [REPOSITORY_NAME]
3. Verify query performance

Please fix the following repository errors:
[SPECIFIC_ERROR_DETAILS]
```

## API Contract Specifications

### Type Definition Contracts

```typescript
// Combat System Types
interface CombatSession {
  id: string;
  status: CombatStatus;
  roundNumber: number;
  currentTurn: number;
  combatants: Combatant[];
  startedAt: Date;
  endedAt?: Date;
}

interface Combatant {
  charId: string;
  charName: string;
  type: 'player' | 'monster' | 'npc';
  stats: CombatStats;
  resources: ResourcePool;
  isActive: boolean;
}

interface CombatResult {
  success: boolean;
  code?: string;
  error?: Error;
  data?: any;
  message?: string;
}

// Monster Types
interface Monster {
  id: string;
  name: string;
  displayName: string;
  level: number;
  currentHealth: number;
  baseHealth: number;
  maxHealth: number;
  stats: MonsterStats;
}

// Bank Types
interface BankSlot {
  slotIndex: number;
  itemId?: string;
  quantity: number;
  isEmpty: boolean;
  metadata?: Record<string, any>;
}

interface BankTransferRequest {
  itemId: string;
  quantity: number;
  fromSlot?: number;
  toSlot?: number;
  fromType: BankType;
  toType: BankType;
}
```

### Service Method Contracts

```typescript
// ICombatService
interface ICombatService {
  initiateCombat(characterId: string, targetId: string, targetType: 'monster' | 'player'): Promise<CombatResult>;
  getActiveCombat(characterId: string): Promise<CombatSession | null>;
  processCombatAction(sessionId: string, action: CombatAction): Promise<CombatResult>;
  endCombat(sessionId: string, outcome: CombatOutcome): Promise<CombatResult>;
}

// IDialogueService
interface IDialogueService {
  startDialogue(characterId: string, npcId: string): Promise<DialogueSession>;
  advanceDialogue(sessionId: string, choiceId: string): Promise<DialogueNode>;
  endDialogue(sessionId: string): Promise<void>;
  createDialogueTree(npcId: string, tree: DialogueTree): Promise<void>;
}

// ISpawnService
interface ISpawnService {
  getSpawnPointsByZone(zoneId: string): Promise<SpawnPoint[]>;
  getActiveMonstersAtSpawnPoint(spawnPointId: string): Promise<Monster[]>;
  spawnMonster(spawnPointId: string): Promise<Monster>;
  despawnMonster(monsterId: string): Promise<void>;
  resetSpawnTimer(spawnPointId: string): Promise<void>;
  updateSpawnPoint(spawnPointId: string, updates: Partial<SpawnPoint>): Promise<SpawnPoint>;
  getZoneSpawnStats(zoneId: string): Promise<SpawnStats>;
  getSpawnPointById(spawnPointId: string): Promise<SpawnPoint | null>;
}
```

## Self-Audit Requirements

### Per Micro-Unit Audit Checklist

```markdown
## Micro-Unit [UNIT_ID] Self-Audit

### Pre-Implementation
- [ ] Identified all errors in scope (count: ___)
- [ ] Checked dependencies are available
- [ ] Reviewed existing tests
- [ ] Created backup of original files

### Implementation
- [ ] Fixed all identified errors
- [ ] No new errors introduced
- [ ] Added missing type annotations
- [ ] Followed naming conventions
- [ ] Added necessary documentation

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] No regression in other files
- [ ] Performance impact assessed

### Code Quality
- [ ] No use of 'any' without justification
- [ ] Proper error handling added
- [ ] Logging added where appropriate
- [ ] Code is readable and maintainable

### Documentation
- [ ] JSDoc comments added for public APIs
- [ ] Complex logic explained
- [ ] Breaking changes documented
- [ ] Update examples if needed
```

### Audit Report Template

```markdown
## Audit Report: Micro-Unit [UNIT_ID]

**Date**: [DATE]
**Agent**: [AGENT_TYPE]
**Files Modified**: [FILE_LIST]

### Summary
- Errors fixed: [COUNT]
- New errors: [COUNT]
- Tests affected: [COUNT]
- Breaking changes: [YES/NO]

### Changes Made
1. [Change description]
2. [Change description]

### Verification Results
- Type check: [PASS/FAIL]
- Unit tests: [PASS/FAIL]
- Integration tests: [PASS/FAIL]

### Rollback Instructions
[If needed, specific steps to rollback]

### Notes
[Any additional context or warnings]
```

## Rollback Procedures

### Automated Rollback Script

```bash
#!/bin/bash
# rollback-unit.sh

UNIT_ID=$1
BACKUP_DIR=".backups/unit-${UNIT_ID}"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: No backup found for unit ${UNIT_ID}"
    exit 1
fi

echo "Rolling back unit ${UNIT_ID}..."

# Restore files
while IFS= read -r file; do
    cp "${BACKUP_DIR}/${file}" "${file}"
    echo "Restored: ${file}"
done < "${BACKUP_DIR}/manifest.txt"

# Run verification
npm run type-check
npm test

echo "Rollback complete for unit ${UNIT_ID}"
```

### Manual Rollback Steps

1. **Identify Regression**
   - Check error logs
   - Identify failing tests
   - Determine affected unit

2. **Restore from Backup**
   ```bash
   # List available backups
   ls -la .backups/
   
   # Restore specific unit
   ./scripts/rollback-unit.sh [UNIT_ID]
   ```

3. **Verify Restoration**
   ```bash
   # Check types
   npm run type-check
   
   # Run tests
   npm test
   ```

4. **Document Issue**
   - Create rollback report
   - Update unit status
   - Plan alternative fix

### Rollback Report Template

```markdown
## Rollback Report: Unit [UNIT_ID]

**Date**: [DATE]
**Reason**: [Brief description]
**Rolled back by**: [Agent/Developer]

### Issue Description
[What went wrong]

### Impact
- Broken functionality: [Description]
- Failed tests: [List]
- New errors: [Count and types]

### Root Cause
[Analysis of why the fix failed]

### Next Steps
1. [Proposed alternative approach]
2. [Additional testing needed]
3. [Dependencies to address first]
```

## Progress Tracking

### Master Progress Dashboard

```markdown
# Error Fix Progress Dashboard

**Last Updated**: [DATE]
**Total Errors**: 453
**Errors Fixed**: [COUNT]
**Success Rate**: [PERCENTAGE]

## Status by Agent

### Type Definition Agent
- Units Assigned: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Success Rate: [PERCENTAGE]

### Service Implementation Agent
- Units Assigned: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Success Rate: [PERCENTAGE]

### Controller Cleanup Agent
- Units Assigned: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Success Rate: [PERCENTAGE]

### Repository Agent
- Units Assigned: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Success Rate: [PERCENTAGE]

### Route Handler Agent
- Units Assigned: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Success Rate: [PERCENTAGE]

### Test Infrastructure Agent
- Units Assigned: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Success Rate: [PERCENTAGE]

## Micro-Unit Status

| Unit ID | Type | Agent | Status | Errors Fixed | Rollbacks | Notes |
|---------|------|-------|--------|--------------|-----------|-------|
| A001 | Type Definition | Type Agent | Complete | 15 | 0 | |
| A002 | Type Definition | Type Agent | In Progress | - | 0 | |
| B001 | Interface-Implementation | Service Agent | Pending | - | 0 | |
| ... | ... | ... | ... | ... | ... | ... |
```

### Unit Assignment Template

```markdown
## Micro-Unit Assignment: [UNIT_ID]

**Type**: [Unit Type A-E]
**Agent**: [Agent Type]
**Priority**: [HIGH/MEDIUM/LOW]
**Created**: [DATE]

### Scope
**Files**:
- [file1.ts]
- [file2.ts]

**Error Count**: [COUNT]
**Specific Errors**:
```
[Error listings from typescript-error-catalog.md]
```

### Dependencies
- Depends on: [Other unit IDs]
- Blocks: [Other unit IDs]

### Estimated Effort
- Complexity: [LOW/MEDIUM/HIGH]
- Time Estimate: [HOURS]

### Special Instructions
[Any specific requirements or warnings]
```

### Daily Progress Report Template

```markdown
## Daily Progress Report: [DATE]

### Summary
- Units Started: [COUNT]
- Units Completed: [COUNT]
- Errors Fixed: [COUNT]
- Rollbacks Required: [COUNT]

### Completed Units
| Unit ID | Agent | Errors Fixed | Time Taken |
|---------|-------|--------------|------------|
| [ID] | [Agent] | [Count] | [Hours] |

### In Progress
| Unit ID | Agent | Progress | Blockers |
|---------|-------|----------|----------|
| [ID] | [Agent] | [%] | [Description] |

### Blocked Units
| Unit ID | Reason | Required Action |
|---------|--------|-----------------|
| [ID] | [Description] | [Action needed] |

### Tomorrow's Plan
1. [Unit assignments]
2. [Priority changes]
3. [Dependency resolutions]
```

## Implementation Examples

### Example 1: Fixing CombatSession Type (Unit A001)

**Assignment**:
```markdown
## Micro-Unit Assignment: A001

**Type**: Type Definition
**Agent**: Type Definition Agent
**Priority**: HIGH
**Files**: 
- src/types/combat.types.ts

**Errors to Fix**:
- Property 'status' does not exist on type 'CombatSession'
- Property 'roundNumber' does not exist on type 'CombatSession'
- Property 'currentTurnIndex' does not exist on type 'CombatSession'
```

**Implementation**:
```typescript
// src/types/combat.types.ts

// Before
export interface CombatSession {
  id: string;
  combatants: Combatant[];
  startedAt: Date;
  endedAt?: Date;
}

// After
export interface CombatSession {
  id: string;
  combatants: Combatant[];
  startedAt: Date;
  endedAt?: Date;
  /** Current status of the combat session */
  status: CombatStatus;
  /** Current round number, starts at 1 */
  roundNumber: number;
  /** Index of the current turn in the combatants array */
  currentTurn: number; // renamed from currentTurnIndex for consistency
}

export enum CombatStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}
```

**Audit Report**:
```markdown
## Audit Report: Micro-Unit A001

**Date**: 2024-01-15
**Agent**: Type Definition Agent
**Files Modified**: src/types/combat.types.ts

### Summary
- Errors fixed: 3
- New errors: 0
- Tests affected: 0
- Breaking changes: NO (only additions)

### Changes Made
1. Added status property with CombatStatus enum
2. Added roundNumber property
3. Added currentTurn property (renamed from currentTurnIndex)
4. Created CombatStatus enum

### Verification Results
- Type check: PASS
- Unit tests: PASS
- Integration tests: PASS
```

### Example 2: Fixing BankService Implementation (Unit B003)

**Assignment**:
```markdown
## Micro-Unit Assignment: B003

**Type**: Interface-Implementation Pair
**Agent**: Service Implementation Agent
**Priority**: HIGH
**Files**:
- src/providers/interfaces/IBankService.ts
- src/providers/real/RealBankService.ts

**Errors to Fix**:
- Type 'BankSlot' is not assignable to type 'BankSlot'
- Property 'slotIndex' is missing in type
- Property 'isEmpty' is missing in type
```

**Implementation**:
```typescript
// src/providers/real/RealBankService.ts

// Before
private mapToProviderBankSlot(slot: any): BankSlot {
  return {
    itemId: slot.itemId,
    quantity: slot.quantity
  };
}

// After
private mapToProviderBankSlot(slot: any, index: number): BankSlot {
  return {
    slotIndex: index,
    itemId: slot.itemId || undefined,
    quantity: slot.quantity || 0,
    isEmpty: !slot.itemId,
    metadata: slot.metadata || {}
  };
}
```

## Conclusion

This strategy provides a systematic approach to fixing all TypeScript errors through:

1. **Clear Organization**: Micro-units with defined boundaries
2. **Independent Work**: Subagents can work in parallel
3. **Quality Assurance**: Self-audit and verification protocols
4. **Risk Management**: Rollback procedures for safety
5. **Progress Visibility**: Comprehensive tracking system

By following this strategy, subagents can efficiently resolve all 453 errors while maintaining code quality and system stability.