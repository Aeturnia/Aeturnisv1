# TYPE-E Units Initialization

**Created:** 2025-07-08
**Purpose:** Route Handler fixes - Proper request/response handling

## Overview

TYPE-E units focus specifically on Route Handlers, ensuring proper request/response handling, fixing missing return statements, and validating route behavior with supertest.

## TYPE-E Units Definition

### TYPE-E-001: Authentication Routes - Response Handling
**Target Files:**
- `src/routes/auth.routes.ts`
- `src/controllers/auth.controller.ts`

**Issues to Fix:**
- Missing return statements in route handlers
- Inconsistent response formats
- Error response handling
- Request type augmentation for `req.user`

**Verification:** Supertest validation for all auth endpoints

**Expected Impact:** ~10 errors

---

### TYPE-E-002: Character Routes - Request/Response Flow
**Target Files:**
- `src/routes/character.routes.ts`
- `src/controllers/character.controller.ts`

**Issues to Fix:**
- Missing return statements after res.json()
- Proper error status codes
- Request validation middleware
- Character ownership checks

**Verification:** Character route integration tests

**Expected Impact:** ~8 errors

---

### TYPE-E-003: Combat Routes - Async Handler Fixes
**Target Files:**
- `src/routes/combat.routes.ts`
- `src/controllers/combat.controller.ts`

**Issues to Fix:**
- Async route handler error handling
- Missing returns in combat action handlers
- WebSocket event emission coordination
- Response format standardization

**Verification:** Combat flow integration tests

**Expected Impact:** ~12 errors

---

### TYPE-E-004: Bank & Currency Routes - Transaction Handling
**Target Files:**
- `src/routes/bank.routes.ts`
- `src/routes/currency.routes.ts`
- Related controllers

**Issues to Fix:**
- Transaction response handling
- Error rollback responses
- Missing return statements
- Consistent error formats

**Verification:** Transaction flow tests

**Expected Impact:** ~6 errors

---

### TYPE-E-005: Equipment Routes - Multi-Step Operations
**Target Files:**
- `src/routes/equipment.routes.ts`
- `src/routes/equipment.routes.simple.ts`
- `src/controllers/equipment.controller.ts`

**Issues to Fix:**
- Complex operation response handling
- Equipment swap transaction responses
- Missing returns in error paths
- Response type consistency

**Verification:** Equipment operation tests

**Expected Impact:** ~8 errors

---

### TYPE-E-006: NPC & Dialogue Routes - Interaction Flows
**Target Files:**
- `src/routes/npc.routes.ts`
- `src/routes/dialogue.routes.ts`
- Related controllers

**Issues to Fix:**
- Dialogue state response handling
- NPC interaction returns
- Quest acceptance responses
- Trade completion handling

**Verification:** NPC interaction tests

**Expected Impact:** ~5 errors

---

### TYPE-E-007: Movement & Zone Routes - State Updates
**Target Files:**
- `src/routes/movement.routes.ts`
- `src/routes/zone.routes.ts`
- Related controllers

**Issues to Fix:**
- Movement validation responses
- Zone transition handling
- Position update returns
- Broadcast coordination

**Verification:** Movement flow tests

**Expected Impact:** ~6 errors

---

### TYPE-E-008: Remaining Routes - Final Pass
**Target Files:**
- `src/routes/tutorial.routes.ts`
- `src/routes/death.routes.ts`
- `src/routes/resource.routes.ts`
- Any other route files

**Issues to Fix:**
- All remaining missing return statements
- Standardize error responses
- Ensure middleware consistency
- Final route handler validation

**Verification:** Full route test suite

**Expected Impact:** Remaining route errors

---

## Common Route Handler Patterns to Apply

### 1. Proper Return After Response
```typescript
// Before
res.json({ success: true });

// After
return res.json({ success: true });
```

### 2. Consistent Error Handling
```typescript
// Before
res.status(500).json({ error: error.message });

// After
return res.status(500).json({ 
  success: false,
  error: error.message 
});
```

### 3. Async Handler Wrapper
```typescript
const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### 4. Request Type Augmentation
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: User;
      characterId?: string;
    }
  }
}
```

## Execution Strategy

1. **Fix Missing Returns** - Add return statements to all res.json/send calls
2. **Standardize Responses** - Use consistent success/error formats
3. **Type Safety** - Ensure Request/Response types are properly typed
4. **Error Handling** - Implement proper async error handling
5. **Test Coverage** - Verify with supertest for each route

## Success Criteria

- All route handlers have proper return statements
- Consistent response format across all endpoints
- No TypeScript errors in route files
- All route tests pass with supertest
- Proper error handling in all async routes
- Request augmentation types properly defined

## Assignment Guidelines

Route handler fixes should be assigned to agents with:
- Express.js expertise
- Understanding of HTTP request/response cycle
- Experience with async/await patterns
- Knowledge of middleware patterns
- Supertest testing experience

## Verification Process

For each unit:
1. Run route-specific tests with supertest
2. Verify all endpoints return responses
3. Check error handling paths
4. Validate response formats
5. Ensure no hanging requests

---

*TYPE-E units focus exclusively on route handlers, ensuring proper request/response handling throughout the application's HTTP layer.*