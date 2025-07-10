# TYPE-G Units Initialization

**Created:** 2025-07-08
**Purpose:** BigInt/Number Conversion fixes - Handle type conversions properly

## Overview

TYPE-G units focus on fixing BigInt to number conversions, arithmetic operations with mixed types, and Date to number conversions. These are causing various type errors that prevent proper compilation.

## TYPE-G Units Definition

### TYPE-G-001: BigInt Arithmetic Operations
**Target Files:**
- `src/controllers/currency.controller.ts`
- `src/controllers/death.controller.ts`

**Issues to Fix:**
- BigInt arithmetic with number literals
- Mixed type operations (BigInt + number)
- Lines 117, 123 in currency.controller.ts
- Lines 157, 164 in death.controller.ts

**Error Pattern:**
```typescript
// Current (incorrect)
const total = bigintValue + 100; // Error: Operator '+' cannot be applied

// Fixed
const total = bigintValue + 100n; // Use BigInt literal
// OR
const total = bigintValue + BigInt(100);
```

**Expected Impact:** 4 errors

---

### TYPE-G-002: Test File BigInt Conversions
**Target Files:**
- `src/controllers/__tests__/CombatController.test.ts`
- `src/services/__tests__/*.test.ts`

**Issues to Fix:**
- BigInt arguments being passed to functions expecting numbers
- Number values being assigned to BigInt properties
- Approximately 14 instances across test files

**Error Pattern:**
```typescript
// Current (incorrect)
functionExpectingNumber(someBigIntValue); // Error

// Fixed
functionExpectingNumber(Number(someBigIntValue));
```

**Expected Impact:** 14 errors

---

### TYPE-G-003: Date Type Conversions
**Target Files:**
- Various test files
- Service files with date operations

**Issues to Fix:**
- Date objects being used where numbers are expected
- Approximately 5 instances

**Error Pattern:**
```typescript
// Current (incorrect)
const timestamp: number = new Date(); // Error

// Fixed
const timestamp: number = new Date().getTime();
// OR
const timestamp: number = Date.now();
```

**Expected Impact:** 5 errors

---

## Utility Module Proposal

Create `src/utils/bigint-helpers.ts`:
```typescript
export const bigIntHelpers = {
  // Safe conversion with bounds checking
  toNumber(value: bigint): number {
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('BigInt value exceeds safe integer range');
    }
    return Number(value);
  },
  
  // Arithmetic helpers
  addBigIntNumber(bigint: bigint, num: number): bigint {
    return bigint + BigInt(num);
  },
  
  // Comparison helpers
  compareBigIntNumber(bigint: bigint, num: number): number {
    const bigNum = BigInt(num);
    if (bigint < bigNum) return -1;
    if (bigint > bigNum) return 1;
    return 0;
  }
};
```

## Success Criteria

- All BigInt arithmetic operations use consistent types
- Safe conversions implemented where necessary
- No mixed type operations
- Utility functions available for common conversions
- All Date to number conversions explicit

## Assignment Guidelines

BigInt conversion fixes should be assigned to agents with:
- Understanding of JavaScript BigInt semantics
- Knowledge of Number.MAX_SAFE_INTEGER limits
- Experience with type conversions
- Ability to identify safe vs unsafe conversions

---

*TYPE-G units focus on proper handling of BigInt/number conversions, a common source of type errors in the codebase.*