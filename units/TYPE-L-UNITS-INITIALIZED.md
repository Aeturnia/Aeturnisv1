# TYPE-L Units Initialization

**Created:** 2025-07-08
**Purpose:** Database and Repository fixes - Fix Drizzle ORM type issues

## Overview

TYPE-L units focus on fixing database-related type errors, particularly with Drizzle ORM operations, insert/update type mismatches, and schema alignment issues.

## TYPE-L Units Definition

### TYPE-L-001: Character Repository Insert Types
**Target Files:**
- `src/repositories/CharacterRepository.ts`
- `src/__tests__/helpers/database-helpers.ts`

**Issues to Fix:**
- Insert operation expecting single object but receiving array
- Property name mismatches in insert operations
- Drizzle ORM overload resolution

**Error Pattern:**
```typescript
// Current (incorrect)
await db.insert(characters).values([{...}]); // When .values expects single object

// Fixed
await db.insert(characters).values({...}); // Single object
// OR
await db.insert(characters).values([{...}]); // Ensure using correct overload
```

**Expected Impact:** 2-3 errors

---

### TYPE-L-002: Schema Property Alignment
**Target Files:**
- Database schema files
- Repository implementations
- Test helpers

**Issues to Fix:**
- Ensure entity properties match schema exactly
- Handle nullable vs optional fields correctly
- Fix property name case mismatches

**Pattern:**
```typescript
// Schema might have
accountId: varchar('account_id')

// But code uses
account_id: string

// Need to align naming
```

**Expected Impact:** Related type errors

---

### TYPE-L-003: Database Type Conversions
**Target Files:**
- Repository files handling BigInt fields
- Date field conversions

**Issues to Fix:**
- BigInt fields from database to TypeScript types
- Date serialization/deserialization
- Null vs undefined handling

**Pattern:**
```typescript
// Database returns
{ gold: BigInt(1000), created_at: Date }

// Convert for service layer
{ gold: Number(result.gold), createdAt: result.created_at }
```

**Expected Impact:** Indirect fixes

---

## Database Fix Strategies

### 1. Verify Schema Definitions
```typescript
// Check schema file
export const characters = pgTable('characters', {
  id: uuid('id').primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  // ... other fields
});
```

### 2. Match Repository Operations
```typescript
// Ensure insert matches schema
await db.insert(characters).values({
  id: generateId(),
  accountId: accountId, // Not account_id
  // ... matching field names
});
```

### 3. Handle Array vs Single Object
```typescript
// For single insert
const [result] = await db.insert(table).values(data).returning();

// For bulk insert
const results = await db.insert(table).values([...dataArray]).returning();
```

### 4. Type Helper Functions
```typescript
// Create helpers for common conversions
function dbCharacterToEntity(dbChar: DBCharacter): Character {
  return {
    ...dbChar,
    gold: Number(dbChar.gold),
    createdAt: dbChar.created_at,
    // Map all fields
  };
}
```

## Success Criteria

- All database operations type-safe
- No Drizzle ORM overload errors
- Schema and code properties aligned
- Proper null/undefined handling
- Test helpers working correctly

## Assignment Guidelines

Database fixes should be assigned to agents with:
- Drizzle ORM experience
- Understanding of SQL to TypeScript mappings
- Knowledge of PostgreSQL types
- Attention to naming conventions

---

*TYPE-L units focus on ensuring type safety in the database layer, critical for data integrity.*