# TYPE-I Units Initialization

**Created:** 2025-07-08
**Purpose:** Remove Explicit Any Types - Replace with proper type definitions

## Overview

TYPE-I units focus on eliminating all @typescript-eslint/no-explicit-any errors by replacing 'any' types with proper, specific type definitions. This improves type safety and code maintainability.

## TYPE-I Units Definition

### TYPE-I-001: Controller Request/Response Types
**Target Files:**
- `src/controllers/auth.controller.ts` (5 instances)
- `src/controllers/bank.controller.ts` (3 instances)
- `src/controllers/character.controller.ts` (2 instances)
- `src/controllers/character.stats.controller.ts` (3 instances)

**Issues to Fix:**
- Replace `(req as any).user` with properly typed Request
- Define request body types
- Type middleware-injected properties

**Pattern:**
```typescript
// Current (incorrect)
const userId = (req as any).user.id;

// Fixed - extend Request interface
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}
const userId = req.user?.id;
```

**Expected Impact:** 13 errors

---

### TYPE-I-002: Route Handler Types
**Target Files:**
- `src/routes/bank.routes.ts` (3 instances)
- `src/routes/character.routes.ts` (4 instances)
- `src/routes/character.stats.routes.ts` (4 instances)
- `src/routes/combat.routes.ts` (8 instances)

**Issues to Fix:**
- Request body types
- Route parameter types
- Middleware injected properties

**Expected Impact:** 19 errors

---

### TYPE-I-003: Middleware Types
**Target Files:**
- `src/middleware/auth.ts` (4 instances)
- `src/middleware/rateLimiter.ts` (2 instances)
- `src/middleware/combat.middleware.ts` (2 instances)

**Issues to Fix:**
- JWT payload types
- Error types in catch blocks
- Next function parameters

**Pattern:**
```typescript
// Define JWT payload type
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Use in verification
const decoded = jwt.verify(token, secret) as JWTPayload;
```

**Expected Impact:** 8 errors

---

### TYPE-I-004: Service Provider Types
**Target Files:**
- `src/providers/ServiceProvider.ts` (8 instances)

**Issues to Fix:**
- Service registry types
- Constructor parameter types
- Generic service retrieval

**Pattern:**
```typescript
// Current (incorrect)
private services: Map<string, any>;

// Fixed
private services: Map<string, IService>;
// Where IService is a base interface all services implement
```

**Expected Impact:** 8 errors

---

### TYPE-I-005: Test File Types
**Target Files:**
- Various test files in `__tests__` directories

**Issues to Fix:**
- Mock function parameters
- Test data types
- Assertion types

**Expected Impact:** Remaining any instances

---

## Type Definition Strategy

### 1. Create Common Types
Create `src/types/express.d.ts`:
```typescript
import { User } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      characterId?: string;
      sessionId?: string;
    }
  }
}
```

### 2. Request Body Types
Create specific types for each endpoint:
```typescript
interface CreateCharacterBody {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  appearance: CharacterAppearance;
}
```

### 3. Service Base Interface
```typescript
interface IService {
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
}
```

## Success Criteria

- Zero @typescript-eslint/no-explicit-any errors
- All 'any' types replaced with specific types
- Type definitions properly organized
- Request augmentation working correctly
- No loss of functionality

## Assignment Guidelines

Type replacement should be assigned to agents with:
- Strong TypeScript knowledge
- Understanding of Express.js types
- Experience with declaration merging
- Ability to define precise types

---

*TYPE-I units focus exclusively on eliminating 'any' types, significantly improving type safety across the codebase.*