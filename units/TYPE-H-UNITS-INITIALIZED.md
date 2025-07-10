# TYPE-H Units Initialization

**Created:** 2025-07-08
**Purpose:** Service Implementation fixes - Align service methods with expected return types

## Overview

TYPE-H units focus on fixing service implementation issues where methods return incorrect types or are missing required properties. This includes missing methods, wrong return types, and incomplete mock implementations.

## TYPE-H Units Definition

### TYPE-H-001: Tutorial Service Type Mismatches
**Target Files:**
- `src/services/mock/MockTutorialService.ts`

**Issues to Fix:**
- TutorialQuestDifficulty vs TutorialDifficulty import
- TutorialReward missing 'amount' property (6 instances)
- Lines 272, 276, 311, 315, 352, 356

**Error Pattern:**
```typescript
// Current (incorrect)
rewards: [
  { type: 'experience' } // Missing amount
]

// Fixed
rewards: [
  { type: 'experience', value: 100 } // Or whatever property name is correct
]
```

**Expected Impact:** 7 errors

---

### TYPE-H-002: Test Helper Type Issues
**Target Files:**
- `src/__tests__/helpers/database-helpers.ts`
- `src/__tests__/helpers/mocks.ts`

**Issues to Fix:**
- Database insert parameter type mismatches
- Drizzle ORM overload issues
- Property assignment problems

**Expected Impact:** 2-3 errors

---

### TYPE-H-003: Real Service Implementation Gaps
**Target Files:**
- `src/providers/real/RealCombatService.ts`
- `src/providers/real/RealSpawnService.ts`

**Issues to Fix:**
- Unused method implementations
- Missing interface methods
- Incorrect return types

**Expected Impact:** 2 errors

---

### TYPE-H-004: Repository Type Mismatches
**Target Files:**
- `src/repositories/CharacterRepository.ts`

**Issues to Fix:**
- Insert operation type mismatches
- Property name inconsistencies (accountId issues)
- Drizzle ORM typing problems

**Expected Impact:** 1-2 errors

---

### TYPE-H-005: Socket Handler Issues
**Target Files:**
- `src/sockets/combat.socket.ts`

**Issues to Fix:**
- Unused error parameter in catch blocks
- Event handler type issues

**Expected Impact:** 1 error

---

## Common Service Fix Patterns

### 1. Check Interface Definitions
```typescript
// Always verify against interface
interface ITutorialService {
  getRewards(): TutorialReward[];
}

// Ensure implementation matches
class MockTutorialService implements ITutorialService {
  getRewards(): TutorialReward[] {
    // Return must match interface exactly
  }
}
```

### 2. Mock Service Alignment
- Ensure mock services implement all interface methods
- Return types must match exactly
- Use proper property names from type definitions

### 3. Repository Pattern Fixes
- Verify Drizzle schema matches entity types
- Use correct property names in queries
- Handle nullable fields properly

## Success Criteria

- All service methods return correct types
- Mock services fully implement interfaces
- No type mismatches in method signatures
- Repository operations type-safe
- Test helpers properly typed

## Assignment Guidelines

Service implementation fixes should be assigned to agents with:
- Strong TypeScript interface knowledge
- Understanding of mock patterns
- Experience with ORMs (Drizzle)
- Ability to trace type definitions

---

*TYPE-H units focus on aligning service implementations with their interfaces, ensuring type safety across the service layer.*