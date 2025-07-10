# Subagent Assignments for TYPE-F through TYPE-M Units

**Generated:** 2025-07-08  
**Purpose:** Define specialized subagents for each error resolution unit  
**Current Status:** 145 errors remaining (73 TypeScript, 72 ESLint)

## Executive Summary

This document assigns specialized subagents to handle the remaining error fix units (TYPE-F through TYPE-M). Each subagent is designed with specific expertise to efficiently resolve their assigned unit's errors.

## 🎯 High Priority Units (Blocking Compilation)

### TYPE-F-001: Zone Controller Response Types
- **Subagent Name**: "Express Controller Type Specialist"
- **Required Skills**: 
  - TypeScript async/await patterns
  - Express.js Response type system
  - Controller method signatures
- **Assignment Focus**: Fix 12 void return type errors in zone.controller.ts
- **Expected Outcome**: All zone controller methods properly typed as `Promise<Response>`

### TYPE-L-001: Database and Repository Types  
- **Subagent Name**: "Drizzle ORM Type Expert"
- **Required Skills**:
  - Drizzle ORM API and type system
  - PostgreSQL type mappings
  - TypeScript generics and overloads
- **Assignment Focus**: Fix 3 critical insert operation type errors in CharacterRepository
- **Expected Outcome**: Database operations fully type-safe

### TYPE-G-001: BigInt Arithmetic Operations
- **Subagent Name**: "BigInt Conversion Specialist"
- **Required Skills**:
  - JavaScript BigInt semantics
  - Safe number conversions
  - Arithmetic operation patterns
- **Assignment Focus**: Fix 4 BigInt/number operation errors in controllers
- **Expected Outcome**: All BigInt operations use consistent types

### TYPE-G-002: Test File BigInt Conversions
- **Subagent Name**: "Test Type Conversion Expert"
- **Required Skills**:
  - Jest testing framework
  - TypeScript in test environments
  - BigInt handling in tests
- **Assignment Focus**: Fix 14 BigInt conversion errors in test files
- **Expected Outcome**: Test files handle BigInt conversions safely

### TYPE-G-003: Date Type Conversions
- **Subagent Name**: "Date Type Specialist"
- **Required Skills**:
  - JavaScript Date API
  - Timestamp conversions
  - Type coercion understanding
- **Assignment Focus**: Fix 5 Date to number conversion errors
- **Expected Outcome**: All date operations explicitly typed

## 🔧 Service Implementation Units

### TYPE-H-001: Tutorial Service Type Mismatches
- **Subagent Name**: "Mock Service Implementation Expert"
- **Required Skills**:
  - Service interface patterns
  - Mock implementation strategies
  - Type definition alignment
- **Assignment Focus**: Fix 7 TutorialReward property errors in MockTutorialService
- **Expected Outcome**: Mock service fully implements interface contract

### TYPE-H-002: Test Helper Type Issues
- **Subagent Name**: "Test Infrastructure Specialist"
- **Required Skills**:
  - Test helper patterns
  - Database mock creation
  - Drizzle ORM test utilities
- **Assignment Focus**: Fix 2-3 database helper type mismatches
- **Expected Outcome**: Test helpers properly typed for all operations

### TYPE-H-003: Real Service Implementation Gaps
- **Subagent Name**: "Service Implementation Architect"
- **Required Skills**:
  - Service layer architecture
  - Interface compliance
  - Real vs mock patterns
- **Assignment Focus**: Align 2 real service implementations with interfaces
- **Expected Outcome**: Real services match interface contracts exactly

### TYPE-H-004: Repository Type Mismatches
- **Subagent Name**: "Repository Pattern Expert"
- **Required Skills**:
  - Repository pattern implementation
  - Drizzle ORM operations
  - Entity to database mapping
- **Assignment Focus**: Fix 1-2 repository operation type errors
- **Expected Outcome**: Repository methods fully type-safe

### TYPE-H-005: Socket Handler Issues
- **Subagent Name**: "Socket.IO Type Specialist"
- **Required Skills**:
  - Socket.IO event handling
  - TypeScript error types
  - Event handler patterns
- **Assignment Focus**: Fix 1 unused error parameter in socket handlers
- **Expected Outcome**: Socket handlers properly typed

## 🛡️ Code Quality Units

### TYPE-I-001: Remove Explicit Any Types
- **Subagent Name**: "Type Safety Enforcer"
- **Required Skills**:
  - TypeScript strict mode
  - Express.js type extensions
  - Declaration merging
  - Request augmentation
- **Assignment Focus**: Replace 40 instances of 'any' with proper types
- **Expected Outcome**: Zero explicit 'any' usage in codebase

### TYPE-K-001: Function Types and Requires
- **Subagent Name**: "Modern TypeScript Migration Expert"
- **Required Skills**:
  - ES6 module syntax
  - Function type signatures
  - Dynamic import patterns
  - CommonJS to ESM migration
- **Assignment Focus**: Fix 18 Function type and require() errors
- **Expected Outcome**: Modern import syntax throughout

## 🧹 Cleanup Units

### TYPE-J-001: Unused Variables
- **Subagent Name**: "Code Cleanup Specialist"
- **Required Skills**:
  - ESLint rule understanding
  - Dead code identification
  - Refactoring patterns
  - Variable usage tracing
- **Assignment Focus**: Clean up 34 unused variable warnings
- **Expected Outcome**: No unused variable warnings

### TYPE-M-001: TSConfig and Console Cleanup
- **Subagent Name**: "Configuration and Logging Expert"
- **Required Skills**:
  - TSConfig configuration
  - ESLint rule configuration
  - Logging best practices
  - Build tool configuration
- **Assignment Focus**: Fix .d.ts inclusion and 43 console warnings
- **Expected Outcome**: Clean build with proper logging

## Execution Strategy

### Phase 1: Unblock Compilation (Priority: CRITICAL)
1. TYPE-F-001: Express Controller Type Specialist
2. TYPE-L-001: Drizzle ORM Type Expert
3. TYPE-G-001: BigInt Conversion Specialist
4. TYPE-G-002: Test Type Conversion Expert
5. TYPE-G-003: Date Type Specialist

### Phase 2: Service Layer Fixes (Priority: HIGH)
6. TYPE-H-001: Mock Service Implementation Expert
7. TYPE-H-002: Test Infrastructure Specialist
8. TYPE-H-003: Service Implementation Architect
9. TYPE-H-004: Repository Pattern Expert
10. TYPE-H-005: Socket.IO Type Specialist

### Phase 3: Type Safety (Priority: MEDIUM)
11. TYPE-I-001: Type Safety Enforcer
12. TYPE-K-001: Modern TypeScript Migration Expert

### Phase 4: Final Cleanup (Priority: LOW)
13. TYPE-J-001: Code Cleanup Specialist
14. TYPE-M-001: Configuration and Logging Expert

## Success Metrics

- **Phase 1 Complete**: TypeScript compilation succeeds (0 blocking errors)
- **Phase 2 Complete**: All services properly typed
- **Phase 3 Complete**: No 'any' types or outdated syntax
- **Phase 4 Complete**: 0 TypeScript errors, 0 ESLint errors

## Notes for Subagents

1. Each subagent should focus ONLY on their assigned unit
2. Follow the patterns established in TYPE-A through TYPE-E units
3. Generate comprehensive completion reports
4. Maintain backward compatibility when fixing types
5. Run typecheck after each file modification
6. Document any breaking changes or concerns

---

*This assignment plan ensures each unit receives specialized attention from an expert subagent, maximizing efficiency and quality of fixes.*